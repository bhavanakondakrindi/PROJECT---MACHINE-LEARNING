import React from 'react';
import {
  Database,
  Columns,
  Hash,
  MapPin,
  Activity,
  AlertOctagon,
  ArrowRight,
  SlidersHorizontal,
  ScatterChart,
  Binary,
  Columns2,
  FileCheck2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import DistributionChart from '../components/charts/DistributionChart';
import { useDataset } from '../context/DatasetContext';

export default function Overview({ setActiveTab }) {
  const { dataset, pcaResult, tsneResult, loadDemoMode } = useDataset();

  const workflowSteps = [
    {
      id: 'explorer',
      title: 'Dataset Ingestion',
      desc: '195,714 raw vehicular observations parsed and profiled across 27 attributes.',
      icon: Database,
      status: dataset.isLoaded ? 'Done' : 'Pending'
    },
    {
      id: 'preparation',
      title: 'Feature Selection & Standardization',
      desc: 'Isolate 24 continuous features; standardize with z-scores: z = (x - μ) / σ.',
      icon: SlidersHorizontal,
      status: dataset.isLoaded ? 'Done' : 'Pending'
    },
    {
      id: 'pca',
      title: 'Principal Component Analysis',
      desc: 'Linear orthogonal projection capturing 92.53% total variance in 2 components.',
      icon: ScatterChart,
      status: pcaResult.isComputed ? 'Completed' : 'Ready'
    },
    {
      id: 'tsne',
      title: 't-SNE Manifold Learning',
      desc: 'Non-linear Student-t neighborhood embedding on representative 5k sample.',
      icon: Binary,
      status: tsneResult.isComputed ? 'Completed' : 'Ready'
    },
    {
      id: 'comparison',
      title: 'Side-by-Side Comparison',
      desc: 'Evaluate complementary linear variance vs local clustering dynamics.',
      icon: Columns2,
      status: (pcaResult.isComputed && tsneResult.isComputed) ? 'Ready' : 'Pending'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 via-navy-900 to-slate-900 text-white p-8 lg:p-10 shadow-card">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-cyan-300 border border-blue-400/30 mb-4">
            <span>BTech Machine Learning Research Project</span>
            <span>•</span>
            <span>Dimensionality Reduction</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Traffic Flow Data Visualization
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-300 font-medium">
            Discover traffic patterns through dimensionality reduction with PCA and t-SNE.
          </p>

          <p className="mt-4 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
            This analytical dashboard transforms high-dimensional vehicular traffic metrics (speeds, densities, wait times, communication latencies, and wireless signal conditions) into interpretable two-dimensional visual representations to explore boundaries and overlaps among <strong className="text-white">Free-flow, Moderate, Heavy, and Gridlock</strong> states.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('explorer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              <span>Explore Dataset</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('pca')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-colors"
            >
              <ScatterChart className="w-4 h-4 text-cyan-400" />
              <span>Start Analysis</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Dataset Summary Notice / Origin Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-borderSubtle text-xs">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-slate-600">
            Active Dataset Context:{' '}
            <strong className="text-navy-800 font-semibold">{dataset.filename || 'None'}</strong>
          </span>
        </div>
        {dataset.isDemoMode ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            Original Project Reference Results (Verified Study)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Dynamically Computed from Uploaded CSV
          </span>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Observations"
          value={dataset.totalRows.toLocaleString()}
          subtitle="Vehicular records"
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Attributes"
          value={dataset.totalColumns}
          subtitle="Total tabular columns"
          icon={Columns}
          color="navy"
        />
        <StatCard
          title="Input Features"
          value={dataset.numericalFeatures.length}
          subtitle="Continuous dimensions"
          icon={Hash}
          color="purple"
        />
        <StatCard
          title="Road Segments"
          value={dataset.roadSegments || '500'}
          subtitle="Distinct corridors"
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title="Traffic Classes"
          value="4 States"
          subtitle="Free-flow to Gridlock"
          icon={Activity}
          color="amber"
        />
        <StatCard
          title="Missing Values"
          value={dataset.missingValues}
          subtitle="Clean dataset profile"
          icon={AlertOctagon}
          color="emerald"
        />
      </div>

      {/* Traffic Label Distribution & Analysis Quick Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DistributionChart
            distribution={dataset.labelDistribution}
            totalRows={dataset.totalRows}
          />
        </div>

        {/* Quick Analysis Execution Status */}
        <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy-800 pb-2 border-b border-borderSubtle">
              Analysis Execution Status
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Real-time pipeline verification state
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">Dataset Loaded</span>
                {dataset.isLoaded ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified ({dataset.totalRows.toLocaleString()})
                  </span>
                ) : (
                  <span className="text-slate-400 font-semibold">Pending</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">Feature Standardization</span>
                {dataset.isLoaded ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    StandardScaler Ready
                  </span>
                ) : (
                  <span className="text-slate-400 font-semibold">Pending</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">PCA Analysis</span>
                {pcaResult.isComputed ? (
                  <span className="inline-flex items-center gap-1 text-blue-600 font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {pcaResult.total_variance}% Var
                  </span>
                ) : (
                  <span className="text-slate-400 font-semibold">Not Run</span>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="font-medium text-slate-700">t-SNE Embedding</span>
                {tsneResult.isComputed ? (
                  <span className="inline-flex items-center gap-1 text-blue-600 font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {tsneResult.sampleSize.toLocaleString()} Pts
                  </span>
                ) : (
                  <span className="text-slate-400 font-semibold">Not Run</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-borderSubtle">
            <button
              onClick={() => setActiveTab('comparison')}
              className="w-full py-2 px-3 text-center rounded-lg bg-slate-100 hover:bg-slate-200 text-navy-800 text-xs font-bold transition-colors"
            >
              Open Comparison View
            </button>
          </div>
        </div>
      </div>

      {/* Project Workflow Visual Stepper */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-5">
        <div className="pb-3 border-b border-borderSubtle mb-4">
          <h3 className="text-sm font-bold text-navy-800">Analytical Pipeline Workflow</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any step to inspect the underlying mathematical stage
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                      {step.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-navy-800 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
