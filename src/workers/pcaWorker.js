/**
 * Dedicated Web Worker for client-side PCA computation.
 * Keeps the main UI thread completely responsive during matrix calculations.
 */

self.onmessage = function (e) {
  const { type, matrix, nComponents = 2 } = e.data;
  if (type === 'RUN_PCA') {
    try {
      const startTime = performance.now();
      const n = matrix.length;
      if (n === 0) {
        self.postMessage({ success: false, error: 'Empty matrix supplied to PCA worker.' });
        return;
      }
      const p = matrix[0].length;

      // 1. Compute covariance matrix: (X^T * X) / (N - 1)
      const cov = Array.from({ length: p }, () => new Float64Array(p));
      for (let i = 0; i < p; i++) {
        for (let j = i; j < p; j++) {
          let sum = 0.0;
          for (let k = 0; k < n; k++) {
            sum += matrix[k][i] * matrix[k][j];
          }
          const val = sum / (n - 1);
          cov[i][j] = val;
          cov[j][i] = val;
        }
      }

      // 2. Jacobi Eigen-decomposition
      const D = cov.map(row => Float64Array.from(row));
      const V = Array.from({ length: p }, (_, i) => {
        const row = new Float64Array(p);
        row[i] = 1.0;
        return row;
      });

      const maxIter = 150;
      const eps = 1e-12;

      for (let iter = 0; iter < maxIter; iter++) {
        let maxOff = 0.0;
        let pi = 0, qi = 1;
        for (let i = 0; i < p; i++) {
          for (let j = i + 1; j < p; j++) {
            const absVal = Math.abs(D[i][j]);
            if (absVal > maxOff) {
              maxOff = absVal;
              pi = i;
              qi = j;
            }
          }
        }

        if (maxOff < eps) break;

        const App = D[pi][pi];
        const Aqq = D[qi][qi];
        const Apq = D[pi][qi];

        const theta = (Aqq - App) / (2.0 * Apq);
        const t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1.0));
        const c = 1.0 / Math.sqrt(t * t + 1.0);
        const s = t * c;

        D[pi][pi] = c * c * App - 2.0 * s * c * Apq + s * s * Aqq;
        D[qi][qi] = s * s * App + 2.0 * s * c * Apq + c * c * Aqq;
        D[pi][qi] = 0.0;
        D[qi][pi] = 0.0;

        for (let i = 0; i < p; i++) {
          if (i !== pi && i !== qi) {
            const Dip = D[i][pi];
            const Diq = D[i][qi];
            D[i][pi] = c * Dip - s * Diq;
            D[p][i] = D[i][pi]; // symmetric
            D[i][qi] = s * Dip + c * Diq;
            D[qi][i] = D[i][qi];
          }
        }

        for (let i = 0; i < p; i++) {
          const Vip = V[i][pi];
          const Viq = V[i][qi];
          V[i][pi] = c * Vip - s * Viq;
          V[i][qi] = s * Vip + c * Viq;
        }
      }

      const eigenvalues = [];
      const eigenvectors = [];

      for (let i = 0; i < p; i++) {
        eigenvalues.push(D[i][i]);
        const vec = new Float64Array(p);
        for (let j = 0; j < p; j++) {
          vec[j] = V[j][i];
        }
        eigenvectors.push(vec);
      }

      // Sort descending
      const indices = eigenvalues.map((_, i) => i);
      indices.sort((a, b) => eigenvalues[b] - eigenvalues[a]);

      const sortedEvals = indices.map(i => eigenvalues[i]);
      const sortedEvecs = indices.map(i => eigenvectors[i]);

      const totalVar = sortedEvals.reduce((a, b) => a + (b > 0 ? b : 0), 0);
      const explainedVarianceRatio = sortedEvals.map(ev => (ev > 0 ? ev / totalVar : 0));

      // 3. Project data to PC1, PC2
      const projected = new Array(n);
      const pc1 = sortedEvecs[0];
      const pc2 = sortedEvecs[1];

      for (let i = 0; i < n; i++) {
        const row = matrix[i];
        let score1 = 0.0;
        let score2 = 0.0;
        for (let j = 0; j < p; j++) {
          score1 += row[j] * pc1[j];
          score2 += row[j] * pc2[j];
        }
        projected[i] = [score1, score2];
      }

      const durationMs = Math.round(performance.now() - startTime);

      self.postMessage({
        success: true,
        durationMs,
        result: {
          coordinates: projected,
          explainedVarianceRatio: explainedVarianceRatio.slice(0, nComponents),
          allExplainedVariance: explainedVarianceRatio,
          eigenvalues: sortedEvals,
          components: sortedEvecs.slice(0, nComponents).map(v => Array.from(v))
        }
      });
    } catch (err) {
      self.postMessage({ success: false, error: err.message });
    }
  }
};
