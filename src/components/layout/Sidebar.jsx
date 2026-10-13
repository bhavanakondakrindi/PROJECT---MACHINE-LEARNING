import React from 'react';
import {
  LayoutDashboard,
  Database,
  SlidersHorizontal,
  ScatterChart,
  Binary,
  Columns2,
  GitBranch,
  Info,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'explorer', label: 'Dataset Explorer', icon: Database },
  { id: 'preparation', label: 'Data Preparation', icon: SlidersHorizontal },
  { id: 'pca', label: 'PCA Analysis', icon: ScatterChart },
  { id: 'tsne', label: 't-SNE Analysis', icon: Binary },
  { id: 'comparison', label: 'PCA vs t-SNE', icon: Columns2 },
  { id: 'methodology', label: 'Methodology', icon: GitBranch },
  { id: 'about', label: 'About Project', icon: Info },
  { id: 'export', label: 'Export Results', icon: Download },
  { id: 'minimal', label: 'Minimal Single-Page', icon: FileText },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }) {
  const { dataset, resetDataset } = useDataset();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-800 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Header */}
        <div className="p-5 border-b border-navy-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <ScatterChart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                StudyForge Analytics
              </span>
              <h1 className="text-sm font-bold text-white truncate leading-tight">
                Traffic Flow Visualizer
              </h1>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 leading-snug">
            Dimensionality Reduction with PCA & t-SNE
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-navy-700 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dataset Status Area */}
        <div className="p-4 border-t border-navy-700 bg-navy-900/60 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Dataset Status
            </span>
            {dataset.isLoaded ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                None
              </span>
            )}
          </div>

          {dataset.isLoaded ? (
            <div className="space-y-1.5 text-slate-300">
              <div className="truncate text-white font-medium" title={dataset.filename}>
                {dataset.filename}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Observations:</span>
                <span className="font-mono text-slate-200">{dataset.totalRows.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Features:</span>
                <span className="font-mono text-slate-200">{dataset.numericalFeatures.length} dims</span>
              </div>
              {dataset.isDemoMode && (
                <div className="mt-1 text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  Reference Study Baseline
                </div>
              )}
              <button
                onClick={resetDataset}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-red-400 hover:bg-navy-700/60 rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Dataset
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400">
              Upload a CSV file or load the demo study to begin exploration.
            </p>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full mt-3 pt-2.5 border-t border-navy-700/80 inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out to Login</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
