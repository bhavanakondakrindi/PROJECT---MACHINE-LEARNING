import React from 'react';
import {
  GitBranch,
  CheckCircle2,
  Cpu,
  Layers,
  ScatterChart,
  Binary,
  ArrowDown,
  Calculator,
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';

export default function Methodology() {
  const { dataset, pcaResult, tsneResult } = useDataset();

  const pipeline = [
    {
      step: '01',
      title: 'Dataset Ingestion & Tabular Parsing',
      desc: 'Parse CSV in browser using streaming chunks via PapaParse without memory overflow.',
      input: 'vanet_traffic_data.csv (36.5 MB)',
      output: '195,714 records, 27 raw columns',
      status: dataset.isLoaded ? 'Completed' : 'Pending'
    },
    {
      step: '02',
      title: 'Data Profiling & Quality Validation',
      desc: 'Verify zero missing values, check duplicate records, inspect physical ranges, and detect negative sensor values.',
      input: '195,714 tabular records',
      output: 'Verified clean dataset (0 nulls, 0 duplicates)',
      status: dataset.isLoaded ? 'Completed' : 'Pending'
    },
    {
      step: '03',
      title: 'Feature Space Isolation (24 Features)',
      desc: 'Drop timestamp and road_segment_id to eliminate temporal and spatial indexing bias from dimensionality reduction.',
      input: '27 initial columns',
      output: '24 continuous numerical features',
      status: dataset.isLoaded ? 'Completed' : 'Pending'
    },
    {
      step: '04',
      title: 'Ground-Truth Label Segregation',
      desc: 'Isolate target vector y (Free-flow, Moderate, Heavy, Gridlock) solely for visual mapping and interpretation.',
      input: 'DataFrame with label column',
      output: 'Feature matrix X (N×24), Label vector y (N×1)',
      status: dataset.isLoaded ? 'Completed' : 'Pending'
    },
    {
      step: '05',
      title: 'Z-Score Feature Standardization',
      desc: 'Apply StandardScaler: z = (x - μ) / σ. Brings high-variance flow and low-variance acceleration to equal footing.',
      input: 'Raw unscaled matrix X (N×24)',
      output: 'Standardized matrix Z (N×24, μ=0, σ=1)',
      status: dataset.isLoaded ? 'Completed' : 'Pending'
    },
    {
      step: '06',
      title: 'Principal Component Analysis (PCA)',
      desc: 'Compute covariance matrix Σ = (Z^T Z)/(N-1), solve eigen-system, project along top 2 eigenvectors.',
      input: 'Standardized matrix Z (N×24)',
      output: 'PC1, PC2 projections (92.53% retained variance)',
      status: pcaResult.isComputed ? 'Completed' : 'Ready'
    },
    {
      step: '07',
      title: 'Stratified Sample Extraction for t-SNE',
      desc: 'Extract 5,000 observations preserving exact class proportions to respect O(N²) computational boundaries.',
      input: 'Standardized matrix Z and vector y',
      output: 'Representative 5,000-row sample',
      status: tsneResult.isComputed ? 'Completed' : 'Ready'
    },
    {
      step: '08',
      title: 't-SNE Manifold Optimization',
      desc: 'Compute Gaussian affinities with binary search perplexity (30), optimize Student-t embedding with momentum SGD.',
      input: '5,000-row standardized sample',
      output: '2D coordinates (tSNE1, tSNE2)',
      status: tsneResult.isComputed ? 'Completed' : 'Ready'
    },
    {
      step: '09',
      title: 'Dual 2D Visualization & Plotting',
      desc: 'Render interactive WebGL scatter plots with color coding, tooltips, and label isolation.',
      input: 'PCA & t-SNE 2D coordinates',
      output: 'Interactive analytical scatter plots',
      status: (pcaResult.isComputed || tsneResult.isComputed) ? 'Completed' : 'Ready'
    },
    {
      step: '10',
      title: 'Comparative Synthesis & Domain Interpretation',
      desc: 'Synthesize global linear variance vs local non-linear neighborhood structures to understand traffic congestion dynamics.',
      input: 'Synchronized dual projections',
      output: 'Academic project findings & conclusion',
      status: (pcaResult.isComputed && tsneResult.isComputed) ? 'Completed' : 'Ready'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-800">
              Project Methodology & Mathematical Framework
            </h3>
            <p className="text-xs text-slate-500">
              Complete 10-stage processing pipeline from raw vehicular logs to low-dimensional manifold visualizations
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          This project implements an empirical dimensionality reduction pipeline designed specifically for vehicular ad-hoc network (VANET) traffic datasets. The following flowchart outlines each sequential transformation, with inputs, mathematical operations, and current execution verification status.
        </p>
      </div>

      {/* 10-Stage Pipeline Flow */}
      <div className="space-y-3">
        {pipeline.map((p, idx) => (
          <div
            key={p.step}
            className="p-4 rounded-xl bg-white border border-borderSubtle shadow-subtle hover:border-blue-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                {p.step}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-navy-800">{p.title}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    p.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{p.desc}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] font-mono text-slate-600">
                  <span><strong>Input:</strong> {p.input}</span>
                  <span>•</span>
                  <span><strong>Output:</strong> {p.output}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Deep-Dive: PCA Algorithm Mathematics */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-4">
          <ScatterChart className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-navy-800">
            Principal Component Analysis (PCA): Mathematical Foundations
          </h3>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            PCA is an orthogonal linear transformation that converts a set of observations of possibly correlated variables into a set of values of linearly uncorrelated variables called principal components.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-navy-800 text-xs">1. Covariance Matrix Formulation</h5>
              <p className="text-[11px] text-slate-600">
                Given standardized feature matrix <span className="font-mono">Z (N × 24)</span> where each column has mean 0 and variance 1, the sample covariance matrix <span className="font-mono">Σ (24 × 24)</span> is computed as:
              </p>
              <div className="p-2 bg-white rounded font-mono text-center text-blue-700 font-bold border border-slate-200">
                Σ = (1 / (N - 1)) · Z^T · Z
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-navy-800 text-xs">2. Eigen-Decomposition</h5>
              <p className="text-[11px] text-slate-600">
                The symmetric matrix Σ is decomposed into eigenvalues <span className="font-mono">λ_i</span> and orthonormal eigenvectors <span className="font-mono">v_i</span>:
              </p>
              <div className="p-2 bg-white rounded font-mono text-center text-purple-700 font-bold border border-slate-200">
                Σ · v_i = λ_i · v_i
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-navy-800 text-xs">3. Explained Variance Ratio</h5>
              <p className="text-[11px] text-slate-600">
                The proportion of total variance captured by the k-th component is the ratio of its eigenvalue to the trace of Σ:
              </p>
              <div className="p-2 bg-white rounded font-mono text-center text-emerald-700 font-bold border border-slate-200">
                Explained Var(k) = λ_k / (Σ λ_j)
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-navy-800 text-xs">4. 2D Coordinate Projection</h5>
              <p className="text-[11px] text-slate-600">
                Observations are projected onto the top two eigenvectors <span className="font-mono">[v_1, v_2]</span>:
              </p>
              <div className="p-2 bg-white rounded font-mono text-center text-navy-800 font-bold border border-slate-200">
                Y_2D = Z · [v_1, v_2]
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive: t-SNE Algorithm Mathematics */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-4">
          <Binary className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold text-navy-800">
            t-Distributed Stochastic Neighbor Embedding (t-SNE): Mathematical Foundations
          </h3>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <p>
            t-SNE models high-dimensional Euclidean proximity as Gaussian conditional probabilities, and low-dimensional embedding proximity as Student-t joint probabilities, minimizing the Kullback-Leibler (KL) divergence between them.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-navy-800 text-xs">1. High-Dimensional Affinities (Gaussian)</h5>
              <p className="text-[11px] text-slate-600">
                Conditional probability <span className="font-mono">p_j|i</span> that observation <span className="font-mono">x_i</span> chooses <span className="font-mono">x_j</span> as its neighbor:
              </p>
              <div className="p-2 bg-white rounded font-mono text-center text-blue-700 font-bold border border-slate-200 text-[11px]">
                p_j|i = exp(-||x_i - x_j||² / 2σ_i²) / Σ exp(-||x_i - x_k||² / 2σ_i²)
              </div>
              <p className="text-[10px] text-slate-500">
                Symmetrized joint probabilities: <span className="font-mono">p_ij = (p_j|i + p_i|j) / (2N)</span>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-navy-800 text-xs">2. Low-Dimensional Affinities (Student-t)</h5>
              <p className="text-[11px] text-slate-600">
                In 2D space, a heavy-tailed Cauchy (Student-t with 1 DOF) distribution prevents crowding:
              </p>
              <div className="p-2 bg-white rounded font-mono text-center text-purple-700 font-bold border border-slate-200 text-[11px]">
                q_ij = (1 + ||y_i - y_j||²)⁻¹ / Σ (1 + ||y_k - y_l||²)⁻¹
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-navy-800 text-xs">3. Cost Function (KL Divergence)</h5>
              <p className="text-[11px] text-slate-600">
                Minimizes the cross-entropy mismatch between high and low dimensional probability distributions:
              </p>
              <div className="p-2 bg-white rounded font-mono text-center text-emerald-700 font-bold border border-slate-200 text-[11px]">
                KL(P || Q) = Σ Σ p_ij · log(p_ij / q_ij)
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <h5 className="font-bold text-navy-800 text-xs">4. Gradient Descent Optimization</h5>
              <p className="text-[11px] text-slate-600">
                Coordinates are iteratively adjusted using momentum-accelerated gradient updates:
              </p>
              <div className="p-2 bg-white rounded font-mono text-center text-navy-800 font-bold border border-slate-200 text-[11px]">
                ∂C/∂y_i = 4 Σ (p_ij - q_ij) · (y_i - y_j) · (1 + ||y_i - y_j||²)⁻¹
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
