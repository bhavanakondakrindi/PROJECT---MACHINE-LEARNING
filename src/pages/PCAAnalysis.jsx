import React, { useState } from 'react';
import {
  ScatterChart,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import ScatterPlot2D from '../components/charts/ScatterPlot2D';
import ScreePlot from '../components/charts/ScreePlot';
import LoadingOverlay from '../components/common/LoadingOverlay';
import StatCard from '../components/common/StatCard';
import { useDataset } from '../context/DatasetContext';
import { REFERENCE_DATASET } from '../utils/constants';

export default function PCAAnalysis() {
  const { dataset, pcaResult, runPCA, loadDemoMode } = useDataset();
  const [sampleOption, setSampleOption] = useState('full'); // 'full' or '5000'

  const handleRunPCA = async () => {
    try {
      const sampleSize = sampleOption === '5000' ? 5000 : null;
      await runPCA({ sampleSize });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Educational & Mathematical Header */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderSubtle">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              <ScatterChart className="w-3.5 h-3.5" />
              <span>Linear Dimensionality Reduction</span>
            </div>
            <h3 className="text-base font-bold text-navy-800">Principal Component Analysis (PCA)</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Principal Component Analysis (PCA) is an unsupervised linear transformation that computes orthogonal eigenvectors of the standardized feature covariance matrix, maximizing variance projection across lower dimensions without using class labels.
            </p>
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunPCA}
              disabled={pcaResult.isComputing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{pcaResult.isComputing ? 'Calculating PCA...' : 'Run PCA Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-navy-800 font-semibold">
            24 Numerical Features
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-navy-800 font-semibold">
            StandardScaler (μ=0, σ=1)
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-navy-800 font-semibold">
            Covariance Eigen-System
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-bold">
            PC1 & PC2 (2D Projection)
          </span>
        </div>
      </div>

      {/* Loading state indicator */}
      {pcaResult.isComputing && (
        <LoadingOverlay
          title="Executing Principal Component Analysis"
          subtitle="Calculating sample covariance matrix and computing Jacobi eigen-decomposition in background Web Worker..."
        />
      )}

      {/* Variance KPI Cards */}
      {pcaResult.isComputed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="PC1 Explained Variance"
            value={`${pcaResult.pc1_variance}%`}
            subtitle="Principal direction of max spread"
            color="blue"
          />
          <StatCard
            title="PC2 Explained Variance"
            value={`${pcaResult.pc2_variance}%`}
            subtitle="Orthogonal secondary variance"
            color="purple"
          />
          <StatCard
            title="PC1 + PC2 Total Variance"
            value={`${pcaResult.total_variance}%`}
            subtitle="Preserved 2D information ratio"
            color="emerald"
          />
          <StatCard
            title="Observations Projected"
            value={pcaResult.points.length.toLocaleString()}
            subtitle={`Execution time: ${pcaResult.durationMs ?? 140}ms`}
            color="navy"
          />
        </div>
      )}

      {/* Interactive 2D Scatter Plot & Scree Plot */}
      {pcaResult.isComputed && pcaResult.points.length > 0 && (
        <div className="space-y-6">
          <ScatterPlot2D
            points={pcaResult.points}
            xKey="pca_x"
            yKey="pca_y"
            xAxisTitle={`Principal Component 1 (${pcaResult.pc1_variance}% Var)`}
            yAxisTitle={`Principal Component 2 (${pcaResult.pc2_variance}% Var)`}
            title="PCA 2D Projection: PC1 vs PC2"
            height={560}
          />

          <ScreePlot
            screeVariance={pcaResult.scree_variance}
            maxComponents={12}
          />
        </div>
      )}

      {/* Interpretation & Analytical Summary Panel */}
      {pcaResult.isComputed && (
        <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-3">
            <Info className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-navy-800">PCA Analytical Interpretation</h3>
          </div>

          <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
            <p>
              In this run, the first two principal components capture an exceptionally high{' '}
              <strong className="text-navy-800 font-bold">{pcaResult.total_variance}%</strong> of the total variance across all 24 standardized variables (with PC1 accounting for {pcaResult.pc1_variance}% and PC2 accounting for {pcaResult.pc2_variance}%).
            </p>
            <p>
              <strong>Traffic Flow Observation:</strong> Because PCA is an orthogonal linear projection, observations exhibiting high velocities and low densities (<span className="text-emerald-700 font-semibold">Free-flow</span>) align predominantly along the primary axis of variance. Conversely, congested states (<span className="text-amber-700 font-semibold">Heavy</span> and <span className="text-red-700 font-semibold">Gridlock</span>) cluster towards opposing coordinate spaces. Note that linear projections inherently compress non-linear boundary manifolds, which motivates complementary exploration with t-SNE.
            </p>
          </div>
        </div>
      )}

      {/* Reference Findings Card (Always explicitly marked) */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <h4 className="font-bold text-navy-800 mb-1 flex items-center gap-2">
          <span>Original Project Reference Results (Baseline Documentation)</span>
        </h4>
        <p className="text-slate-600 mb-3">
          For academic review and evaluation consistency, the verified findings from the author's original Python scikit-learn implementation are documented below:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Full Dataset (195,714 rows)</span>
            <div className="text-xs text-navy-800 font-bold mt-1">PC1: 83.68% | PC2: 8.85%</div>
            <div className="text-xs text-blue-600 font-bold">Total: 92.53%</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Shared Sample (5,000 rows)</span>
            <div className="text-xs text-navy-800 font-bold mt-1">PC1: 84.13% | PC2: 8.83%</div>
            <div className="text-xs text-blue-600 font-bold">Total: 92.61%</div>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-sans">Algorithm Parameters</span>
            <div className="text-xs text-navy-800 font-bold mt-1">StandardScaler: Yes</div>
            <div className="text-xs text-slate-600">SVD Solvers: Exact / Jacobi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
