import React, { useRef } from 'react';
import { Menu, UploadCloud, Cpu, CheckCircle2, LogOut } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

const PAGE_META = {
  overview: {
    title: 'Traffic Flow Overview Dashboard',
    description: 'High-dimensional traffic patterns explored via Principal Component Analysis and t-SNE'
  },
  explorer: {
    title: 'Dataset Explorer & Feature Profiling',
    description: 'Inspect observations, distributions, missing values, and numerical feature summaries'
  },
  preparation: {
    title: 'Data Preparation & Standardization',
    description: 'Feature selection, z-score standardization pipeline, and physical domain validation'
  },
  pca: {
    title: 'Principal Component Analysis (PCA)',
    description: 'Linear variance maximization, orthogonal projections, and explained variance scree plot'
  },
  tsne: {
    title: 't-Distributed Stochastic Neighbor Embedding (t-SNE)',
    description: 'Non-linear manifold learning preserving local neighborhood affinities on representative samples'
  },
  comparison: {
    title: 'PCA vs t-SNE Side-by-Side Comparison',
    description: 'Complementary projections evaluated on identical sampled observations'
  },
  methodology: {
    title: 'Project Methodology & Algorithm Mathematics',
    description: 'End-to-end mathematical data pipeline from 24 features to 2D representations'
  },
  about: {
    title: 'About the Project & Scope',
    description: 'BTech machine learning project details, academic context, technologies, and future scope'
  },
  export: {
    title: 'Export Results & Coordinates',
    description: 'Download 2D coordinate projections, dataset summaries, and analytical reports'
  },
  minimal: {
    title: 'Minimal Traffic Flow Visualizer',
    description: 'Compact single-page summary view of PCA and t-SNE projections'
  }
};

export default function Header({ activeTab, setIsSidebarOpen, onLogout }) {
  const { dataset, handleClientFileUpload, parseProgress } = useDataset();
  const fileInputRef = useRef(null);

  const meta = PAGE_META[activeTab] || PAGE_META.overview;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleClientFileUpload(file).catch(err => {
        alert(err.message);
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-borderSubtle px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
            <span>Traffic Visualizer</span>
            <span>/</span>
            <span className="text-blue-600 font-medium capitalize">{activeTab}</span>
          </nav>
          <h2 className="text-base sm:text-lg font-bold text-navy-800 leading-tight truncate">
            {meta.title}
          </h2>
          <p className="hidden md:block text-xs text-slate-500 truncate max-w-xl">
            {meta.description}
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Engine Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-[11px] font-medium text-blue-700">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>In-Browser Web Worker Engine</span>
        </div>

        {/* Upload Action */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={parseProgress.isParsing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{parseProgress.isParsing ? 'Parsing...' : 'Upload CSV'}</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out to Login Page"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
