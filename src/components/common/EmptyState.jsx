import React from 'react';
import { Database, UploadCloud, Play } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

export default function EmptyState({ title, description, onUploadClick }) {
  const { loadDemoMode } = useDataset();

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center my-6">
      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4">
        <Database className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-navy-800">{title || 'No Dataset Active'}</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md">
        {description || 'Upload a traffic flow CSV dataset or load the verified project reference study to explore dimensionality reduction.'}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Dataset CSV
          </button>
        )}
        <button
          onClick={loadDemoMode}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Play className="w-4 h-4 text-emerald-600" />
          Load Reference Study (Demo Mode)
        </button>
      </div>
    </div>
  );
}
