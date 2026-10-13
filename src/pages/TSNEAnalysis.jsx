import React, { useState } from 'react';
import {
  Binary,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Settings2,
  Layers,
  ArrowRight,
  Info,
  Sliders
} from 'lucide-react';
import ScatterPlot2D from '../components/charts/ScatterPlot2D';
import LoadingOverlay from '../components/common/LoadingOverlay';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { useDataset } from '../context/DatasetContext';
import { REFERENCE_DATASET } from '../utils/constants';

export default function TSNEAnalysis() {
  const { dataset, tsneResult, runTSNE, cancelTSNE } = useDataset();

  // Sampling and algorithm parameters
  const [sampleSize, setSampleSize] = useState(5000);
  const [perplexity, setPerplexity] = useState(30);
  const [randomSeed, setRandomSeed] = useState(42);
  const [stratified, setStratified] = useState(true);

  const handleRunTSNE = async () => {
    try {
      await runTSNE({
        sampleSize: Number(sampleSize),
        perplexity: Number(perplexity),
        randomState: Number(randomSeed),
        stratified: Boolean(stratified)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isLargeSample = sampleSize > 3000;

  return (
    <div className="space-y-6">
      {/* Mathematical & Theoretical Header */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderSubtle">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
              <Binary className="w-3.5 h-3.5" />
              <span>Non-Linear Manifold Learning</span>
            </div>
            <h3 className="text-base font-bold text-navy-800">
              t-Distributed Stochastic Neighbor Embedding (t-SNE)
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              t-SNE is a non-linear dimensionality reduction algorithm that converts pairwise Euclidean distances between high-dimensional vehicular vectors into conditional probabilities, minimizing Kullback-Leibler (KL) divergence in 2D space with a heavy-tailed Student-t distribution to resolve crowding.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRunTSNE}
              disabled={tsneResult.isComputing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{tsneResult.isComputing ? 'Optimizing Embedding...' : 'Run t-SNE Analysis'}</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Flow */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-navy-800 font-semibold">
            24 Standardized Features
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-navy-800 font-semibold">
            Stratified Sampling ({sampleSize.toLocaleString()} rows)
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-navy-800 font-semibold">
            Gaussian Joint Probabilities (p_ij)
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-md font-bold">
            t-SNE 2D Coordinates
          </span>
        </div>
      </div>

      {/* Sampling & Hyperparameter Controls */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-5">
        <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-4">
          <Settings2 className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
            Sampling & Optimization Parameters
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sample Size */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sample Size (Observations)
            </label>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              disabled={tsneResult.isComputing}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-navy-800 bg-slate-50 focus:ring-2 focus:ring-blue-500"
            >
              <option value={1000}>1,000 observations (Fastest)</option>
              <option value={2500}>2,500 observations (Balanced)</option>
              <option value={5000}>5,000 observations (Reference Standard)</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Reduces computational complexity from O(N²)
            </span>
          </div>

          {/* Perplexity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Perplexity: <strong className="text-blue-600">{perplexity}</strong>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={perplexity}
              onChange={(e) => setPerplexity(Number(e.target.value))}
              disabled={tsneResult.isComputing}
              className="w-full accent-blue-600 mt-2"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Balances local vs global manifold sensitivity
            </span>
          </div>

          {/* Random Seed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Random Seed (Reproducibility)
            </label>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(Number(e.target.value))}
              disabled={tsneResult.isComputing}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-navy-800 bg-slate-50 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Deterministic stochastic initialization
            </span>
          </div>

          {/* Stratified Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Class Stratification
            </label>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stratified}
                onChange={(e) => setStratified(e.target.checked)}
                disabled={tsneResult.isComputing}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600"
              />
              <span className="text-xs font-medium text-slate-700">Preserve label proportions</span>
            </label>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Guarantees representative vehicular classes
            </span>
          </div>
        </div>

        {/* Large sample performance warning */}
        {isLargeSample && (
          <div className="mt-4 flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note on computational scale:</strong> An exact t-SNE run on {sampleSize.toLocaleString()} records computes ~{(sampleSize * sampleSize).toLocaleString()} pairwise relationships. Dedicated Web Worker execution keeps the interface responsive while optimizing.
            </span>
          </div>
        )}
      </div>

      {/* Loading state with live progress bar and cancellation */}
      {tsneResult.isComputing && (
        <LoadingOverlay
          title="Executing t-SNE Optimization"
          subtitle={tsneResult.stage || 'Computing Student-t probabilities in dedicated Web Worker...'}
          progress={tsneResult.progress}
          onCancel={cancelTSNE}
        />
      )}

      {/* KPI Cards */}
      {tsneResult.isComputed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Sample Size"
            value={tsneResult.sampleSize.toLocaleString()}
            subtitle="Stratified vehicular observations"
            color="purple"
          />
          <StatCard
            title="Perplexity Parameter"
            value={tsneResult.perplexity}
            subtitle="Effective neighborhood radius"
            color="blue"
          />
          <StatCard
            title="Random Seed"
            value={tsneResult.randomState}
            subtitle="Deterministic initialization"
            color="navy"
          />
          <StatCard
            title="Embedding Dimensions"
            value="2D Projection"
            subtitle="tSNE-1 vs tSNE-2"
            color="emerald"
          />
        </div>
      )}

      {/* Stratified class breakdown badges */}
      {tsneResult.isComputed && Object.keys(tsneResult.labelCounts || {}).length > 0 && (
        <div className="p-4 rounded-xl bg-white border border-borderSubtle shadow-subtle flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-600">Sampled Class Distribution:</span>
          {Object.entries(tsneResult.labelCounts).map(([lbl, count]) => (
            <Badge key={lbl} label={lbl} count={count} />
          ))}
        </div>
      )}

      {/* Interactive 2D Scatter Plot */}
      {tsneResult.isComputed && tsneResult.points.length > 0 && (
        <div className="space-y-6">
          <ScatterPlot2D
            points={tsneResult.points}
            xKey="tsne_x"
            yKey="tsne_y"
            xAxisTitle="t-SNE Dimension 1 (Relative Local Metric)"
            yAxisTitle="t-SNE Dimension 2 (Relative Local Metric)"
            title="t-SNE 2D Manifold Embedding"
            height={580}
          />

          {/* Coordinate meaning disclaimer */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-navy-800">Interpretation Warning on t-SNE Coordinates:</span>{' '}
              Unlike physical sensor readings (such as speed in km/h or waiting time in seconds), t-SNE axes have <strong>arbitrary units</strong>. The distance between separated clusters or global orientation is non-metric; only the relative local neighbor proximity reflects true manifold similarity.
            </div>
          </div>
        </div>
      )}

      {/* Reference Findings Card */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <h4 className="font-bold text-navy-800 mb-1">
          Original Project Reference Findings (Verified Study Baseline)
        </h4>
        <p className="text-slate-600 mb-3">
          In the original college project implementation, t-SNE was executed on a stratified 5,000-row sample:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono mb-3">
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 font-sans block">Free-flow</span>
            <strong className="text-emerald-700">1,477 observations</strong>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 font-sans block">Moderate</span>
            <strong className="text-blue-700">1,380 observations</strong>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 font-sans block">Heavy</span>
            <strong className="text-amber-700">1,212 observations</strong>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 font-sans block">Gridlock</span>
            <strong className="text-red-700">931 observations</strong>
          </div>
        </div>
        <div className="p-3 bg-white rounded border border-slate-200 text-slate-700">
          <strong>Key Visual Pattern:</strong> {REFERENCE_DATASET.tsneSample.observationNotes}
        </div>
      </div>
    </div>
  );
}
