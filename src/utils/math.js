/**
 * Pure Mathematical & Analytical Utilities for Machine Learning Dashboard
 * Implements genuine StandardScaler, Stratified Sampling, and Jacobi Eigen-decomposition for PCA
 */

/**
 * Deterministic pseudo-random generator (LCG)
 */
export function createRNG(seed = 42) {
  let s = Math.abs(seed) % 2147483647;
  if (s <= 0) s = 1;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Genuine StandardScaler: z = (x - mean) / std
 * Safely guards against constant columns (std == 0)
 */
export function standardScale(matrix) {
  const n = matrix.length;
  if (n === 0) return { scaled: [], means: [], stds: [] };
  const p = matrix[0].length;

  const means = new Float64Array(p);
  const stds = new Float64Array(p);

  // 1. Calculate means
  for (let i = 0; i < n; i++) {
    const row = matrix[i];
    for (let j = 0; j < p; j++) {
      means[j] += row[j];
    }
  }
  for (let j = 0; j < p; j++) {
    means[j] /= n;
  }

  // 2. Calculate sample variance & standard deviation
  for (let i = 0; i < n; i++) {
    const row = matrix[i];
    for (let j = 0; j < p; j++) {
      const diff = row[j] - means[j];
      stds[j] += diff * diff;
    }
  }
  for (let j = 0; j < p; j++) {
    const variance = n > 1 ? stds[j] / (n - 1) : 0;
    stds[j] = Math.sqrt(variance);
    if (stds[j] === 0 || isNaN(stds[j])) {
      stds[j] = 1.0; // avoid divide by zero for constant columns
    }
  }

  // 3. Transform data
  const scaled = new Array(n);
  for (let i = 0; i < n; i++) {
    const row = matrix[i];
    const scaledRow = new Float64Array(p);
    for (let j = 0; j < p; j++) {
      scaledRow[j] = (row[j] - means[j]) / stds[j];
    }
    scaled[i] = scaledRow;
  }

  return { scaled, means: Array.from(means), stds: Array.from(stds) };
}

/**
 * Stratified sampling with deterministic seed
 */
export function stratifiedSample(records, labelKey, sampleSize, seed = 42) {
  if (!records || records.length === 0) return [];
  if (sampleSize >= records.length) return records.map((r, i) => ({ ...r, __orig_index: i }));

  const rng = createRNG(seed);

  // Group by label
  const groups = {};
  records.forEach((row, idx) => {
    const lbl = row[labelKey] !== undefined ? String(row[labelKey]) : 'Unlabeled';
    if (!groups[lbl]) groups[lbl] = [];
    groups[lbl].push({ ...row, __orig_index: idx });
  });

  const total = records.length;
  const sample = [];

  for (const lbl of Object.keys(groups)) {
    const group = groups[lbl];
    // Exact proportional allocation with min 1 point if group exists
    const groupTarget = Math.max(1, Math.round((group.length / total) * sampleSize));
    
    // Fisher-Yates shuffle
    const shuffled = [...group];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, Math.min(groupTarget, shuffled.length));
    sample.push(...selected);
  }

  // If sample size is slightly off due to rounding, adjust
  if (sample.length > sampleSize) {
    return sample.slice(0, sampleSize);
  }
  return sample;
}

/**
 * Compute covariance matrix: (X^T * X) / (N - 1)
 */
export function computeCovarianceMatrix(X) {
  const n = X.length;
  const p = X[0].length;
  const cov = Array.from({ length: p }, () => new Float64Array(p));

  for (let i = 0; i < p; i++) {
    for (let j = i; j < p; j++) {
      let sum = 0.0;
      for (let k = 0; k < n; k++) {
        sum += X[k][i] * X[k][j];
      }
      const val = sum / (n - 1);
      cov[i][j] = val;
      cov[j][i] = val;
    }
  }

  return cov;
}

/**
 * Genuine Jacobi Eigen-decomposition for symmetric matrix A
 * Computes eigenvalues and eigenvectors
 */
export function jacobiEigen(A, maxIter = 150, eps = 1e-12) {
  const n = A.length;
  // Deep copy A
  const D = A.map(row => Float64Array.from(row));
  // Identity matrix for eigenvectors V
  const V = Array.from({ length: n }, (_, i) => {
    const row = new Float64Array(n);
    row[i] = 1.0;
    return row;
  });

  for (let iter = 0; iter < maxIter; iter++) {
    // Find largest off-diagonal element
    let maxOff = 0.0;
    let p = 0, q = 1;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const absVal = Math.abs(D[i][j]);
        if (absVal > maxOff) {
          maxOff = absVal;
          p = i;
          q = j;
        }
      }
    }

    if (maxOff < eps) break;

    const App = D[p][p];
    const Aqq = D[q][q];
    const Apq = D[p][q];

    const theta = (Aqq - App) / (2.0 * Apq);
    const t = Math.sign(theta) / (Math.abs(theta) + Math.sqrt(theta * theta + 1.0));
    const c = 1.0 / Math.sqrt(t * t + 1.0);
    const s = t * c;

    // Update D
    D[p][p] = c * c * App - 2.0 * s * c * Apq + s * s * Aqq;
    D[q][q] = s * s * App + 2.0 * s * c * Apq + c * c * Aqq;
    D[p][q] = 0.0;
    D[q][p] = 0.0;

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const Dip = D[i][p];
        const Diq = D[i][q];
        D[i][p] = c * Dip - s * Diq;
        D[p][i] = D[i][p];
        D[i][q] = s * Dip + c * Diq;
        D[q][i] = D[i][q];
      }
    }

    // Update V
    for (let i = 0; i < n; i++) {
      const Vip = V[i][p];
      const Viq = V[i][q];
      V[i][p] = c * Vip - s * Viq;
      V[i][q] = s * Vip + c * Viq;
    }
  }

  // Extract eigenvalues and eigenvectors
  const eigenvalues = [];
  const eigenvectors = [];

  for (let i = 0; i < n; i++) {
    eigenvalues.push(D[i][i]);
    const vec = new Float64Array(n);
    for (let j = 0; j < n; j++) {
      vec[j] = V[j][i];
    }
    eigenvectors.push(vec);
  }

  // Sort descending by eigenvalue
  const indices = eigenvalues.map((_, i) => i);
  indices.sort((a, b) => eigenvalues[b] - eigenvalues[a]);

  const sortedEvals = indices.map(i => eigenvalues[i]);
  const sortedEvecs = indices.map(i => eigenvectors[i]);

  return { eigenvalues: sortedEvals, eigenvectors: sortedEvecs };
}

/**
 * Execute client-side PCA on standardized matrix X
 */
export function runClientPCA(X, nComponents = 2) {
  const cov = computeCovarianceMatrix(X);
  const { eigenvalues, eigenvectors } = jacobiEigen(cov);

  const totalVar = eigenvalues.reduce((a, b) => a + (b > 0 ? b : 0), 0);
  const explainedVarianceRatio = eigenvalues.map(ev => (ev > 0 ? ev / totalVar : 0));

  // Project data onto the top principal components
  const n = X.length;
  const projected = new Array(n);
  const pc1 = eigenvectors[0];
  const pc2 = eigenvectors[1];

  for (let i = 0; i < n; i++) {
    const row = X[i];
    let score1 = 0.0;
    let score2 = 0.0;
    for (let j = 0; j < row.length; j++) {
      score1 += row[j] * pc1[j];
      score2 += row[j] * pc2[j];
    }
    projected[i] = [score1, score2];
  }

  return {
    coordinates: projected,
    eigenvalues,
    explainedVarianceRatio: explainedVarianceRatio.slice(0, nComponents),
    allExplainedVariance: explainedVarianceRatio,
    components: eigenvectors.slice(0, nComponents)
  };
}
