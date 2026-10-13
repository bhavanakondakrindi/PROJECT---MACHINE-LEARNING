import React from 'react';
import { Cpu, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

export default function EngineToggle() {
  const { engineMode, setEngineMode, backendHealth } = useDataset();

  return (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium">
      <button
        onClick={() => setEngineMode('browser')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
          engineMode === 'browser'
            ? 'bg-white text-navy-800 shadow-sm font-semibold'
            : 'text-slate-600 hover:text-navy-800'
        }`}
        title="Executes PCA and t-SNE mathematically in browser Web Workers"
      >
        <Cpu className="w-3.5 h-3.5 text-blue-600" />
        <span>In-Browser Worker</span>
      </button>

      <button
        onClick={() => setEngineMode('fastapi')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
          engineMode === 'fastapi'
            ? 'bg-white text-navy-800 shadow-sm font-semibold'
            : 'text-slate-600 hover:text-navy-800'
        }`}
        title="Executes PCA and t-SNE via Python FastAPI & scikit-learn"
      >
        <Server className="w-3.5 h-3.5 text-purple-600" />
        <span>Python FastAPI</span>
        {backendHealth.online ? (
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Backend Online" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-slate-300" title="Backend Offline (run python backend/app.py)" />
        )}
      </button>
    </div>
  );
}
