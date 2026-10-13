/**
 * Dedicated Web Worker for genuine client-side t-SNE execution.
 * Implements exact Gaussian conditional probabilities with binary search perplexity,
 * Student-t low-dimensional distribution, early exaggeration, and momentum optimization.
 * Emits progress updates back to the UI thread.
 */

let isCancelled = false;

// Pseudo-random Gaussian generator using Box-Muller
function gaussianRandom(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function lcgRNG(seed = 42) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s = 1;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Compute pairwise squared Euclidean distances
function computeSquaredDistances(X) {
  const n = X.length;
  const p = X[0].length;
  const D = new Float64Array(n * n);

  for (let i = 0; i < n; i++) {
    const rowI = X[i];
    for (let j = i + 1; j < n; j++) {
      const rowJ = X[j];
      let sum = 0.0;
      for (let k = 0; k < p; k++) {
        const diff = rowI[k] - rowJ[k];
        sum += diff * diff;
      }
      D[i * n + j] = sum;
      D[j * n + i] = sum;
    }
  }
  return D;
}

// Binary search for precision (beta = 1 / (2 * sigma^2)) matching target perplexity
function computeJointProbabilities(D, n, targetPerplexity) {
  const logPerp = Math.log(targetPerplexity);
  const P = new Float64Array(n * n);
  const tol = 1e-4;
  const maxTries = 50;

  for (let i = 0; i < n; i++) {
    let betaMin = -Infinity;
    let betaMax = Infinity;
    let beta = 1.0;

    for (let iter = 0; iter < maxTries; iter++) {
      let sumP = 0.0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const d = D[i * n + j];
          const val = Math.exp(-d * beta);
          P[i * n + j] = val;
          sumP += val;
        } else {
          P[i * n + j] = 0.0;
        }
      }

      if (sumP === 0) sumP = 1e-12;

      let H = 0.0;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const d = D[i * n + j];
          H += beta * (d * P[i * n + j]) / sumP;
        }
      }
      H += Math.log(sumP);

      const hDiff = H - logPerp;
      if (Math.abs(hDiff) < tol) break;

      if (hDiff > 0) {
        betaMin = beta;
        if (betaMax === Infinity) beta *= 2;
        else beta = (beta + betaMax) / 2;
      } else {
        betaMax = beta;
        if (betaMin === -Infinity) beta /= 2;
        else beta = (beta + betaMin) / 2;
      }
    }

    let rowSum = 0.0;
    for (let j = 0; j < n; j++) rowSum += P[i * n + j];
    if (rowSum > 0) {
      for (let j = 0; j < n; j++) P[i * n + j] /= rowSum;
    }
  }

  // Symmetrize: p_ij = (p_j|i + p_i|j) / (2 * n)
  const symP = new Float64Array(n * n);
  const factor = 1.0 / (2.0 * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const val = (P[i * n + j] + P[j * n + i]) * factor;
        symP[i * n + j] = Math.max(val, 1e-12);
      }
    }
  }
  return symP;
}

self.onmessage = function (e) {
  const { type } = e.data;

  if (type === 'CANCEL') {
    isCancelled = true;
    return;
  }

  if (type === 'RUN_TSNE') {
    isCancelled = false;
    const {
      matrix,
      perplexity = 30,
      maxIter = 400,
      learningRate = 100,
      seed = 42
    } = e.data;

    try {
      const startTime = performance.now();
      const n = matrix.length;
      if (n < 4) {
        self.postMessage({ success: false, error: 'Dataset sample is too small for t-SNE (minimum 4 points required).' });
        return;
      }

      self.postMessage({
        type: 'PROGRESS',
        stage: 'Computing pairwise high-dimensional distances...',
        progress: 10,
        iteration: 0,
        maxIter
      });

      const D = computeSquaredDistances(matrix);

      if (isCancelled) return;

      self.postMessage({
        type: 'PROGRESS',
        stage: 'Optimizing perplexity distribution affinities...',
        progress: 25,
        iteration: 0,
        maxIter
      });

      const targetPerp = Math.min(perplexity, Math.floor((n - 1) / 3));
      const P = computeJointProbabilities(D, n, targetPerp);

      // Early exaggeration factor
      const earlyExaggeration = 12.0;
      for (let i = 0; i < n * n; i++) {
        P[i] *= earlyExaggeration;
      }

      // Initialize Y ~ N(0, 1e-4)
      const rng = lcgRNG(seed);
      const Y = new Float64Array(n * 2);
      const dY = new Float64Array(n * 2);
      const gains = new Float64Array(n * 2).fill(1.0);

      for (let i = 0; i < n * 2; i++) {
        Y[i] = gaussianRandom(rng) * 1e-4;
      }

      const exaggerationStop = 100;
      const eta = learningRate;

      // Optimization loop
      for (let iter = 1; iter <= maxIter; iter++) {
        if (isCancelled) {
          self.postMessage({ success: false, error: 't-SNE computation was cancelled by user.' });
          return;
        }

        // Remove early exaggeration after exaggerationStop
        if (iter === exaggerationStop) {
          for (let i = 0; i < n * n; i++) {
            P[i] /= earlyExaggeration;
          }
        }

        const momentum = iter < 150 ? 0.5 : 0.8;

        // Compute Student-t kernel affinities in embedding space: q_ij = (1 + ||y_i - y_j||^2)^(-1)
        const num = new Float64Array(n * n);
        let denom = 0.0;

        for (let i = 0; i < n; i++) {
          const yi0 = Y[i * 2];
          const yi1 = Y[i * 2 + 1];
          for (let j = i + 1; j < n; j++) {
            const dy0 = yi0 - Y[j * 2];
            const dy1 = yi1 - Y[j * 2 + 1];
            const distSq = dy0 * dy0 + dy1 * dy1;
            const qVal = 1.0 / (1.0 + distSq);
            num[i * n + j] = qVal;
            num[j * n + i] = qVal;
            denom += 2.0 * qVal;
          }
        }
        if (denom === 0) denom = 1e-12;

        // Compute gradients
        const grads = new Float64Array(n * 2);

        for (let i = 0; i < n; i++) {
          const yi0 = Y[i * 2];
          const yi1 = Y[i * 2 + 1];
          let g0 = 0.0;
          let g1 = 0.0;

          for (let j = 0; j < n; j++) {
            if (i !== j) {
              const qVal = num[i * n + j] / denom;
              const mult = 4.0 * (P[i * n + j] - qVal) * num[i * n + j];
              g0 += mult * (yi0 - Y[j * 2]);
              g1 += mult * (yi1 - Y[j * 2 + 1]);
            }
          }
          grads[i * 2] = g0;
          grads[i * 2 + 1] = g1;
        }

        // Apply adaptive gain update & momentum SGD
        for (let i = 0; i < n * 2; i++) {
          const grad = grads[i];
          const prevDy = dY[i];

          // Adapt gains
          if (Math.sign(grad) !== Math.sign(prevDy)) {
            gains[i] = gains[i] + 0.2;
          } else {
            gains[i] = Math.max(gains[i] * 0.8, 0.01);
          }

          const step = gains[i] * grad;
          dY[i] = momentum * dY[i] - eta * step;
          Y[i] += dY[i];
        }

        // Center embedding Y
        let mean0 = 0.0, mean1 = 0.0;
        for (let i = 0; i < n; i++) {
          mean0 += Y[i * 2];
          mean1 += Y[i * 2 + 1];
        }
        mean0 /= n;
        mean1 /= n;
        for (let i = 0; i < n; i++) {
          Y[i * 2] -= mean0;
          Y[i * 2 + 1] -= mean1;
        }

        // Post progress update periodically
        if (iter % 25 === 0 || iter === maxIter) {
          const pct = Math.round(25 + (iter / maxIter) * 75);
          self.postMessage({
            type: 'PROGRESS',
            stage: `Optimizing t-SNE embedding (Iteration ${iter}/${maxIter})...`,
            progress: pct,
            iteration: iter,
            maxIter
          });
        }
      }

      // Convert Float64Array to array of coordinates [x, y]
      const coordinates = new Array(n);
      for (let i = 0; i < n; i++) {
        coordinates[i] = [
          Math.round(Y[i * 2] * 1000) / 1000,
          Math.round(Y[i * 2 + 1] * 1000) / 1000
        ];
      }

      const durationMs = Math.round(performance.now() - startTime);

      self.postMessage({
        type: 'COMPLETE',
        success: true,
        durationMs,
        result: {
          coordinates,
          sampleSize: n,
          perplexity: targetPerp,
          iterations: maxIter
        }
      });
    } catch (err) {
      self.postMessage({ success: false, error: err.message });
    }
  }
};
