import React from 'react';
import { Loader2, XCircle } from 'lucide-react';

export default function LoadingOverlay({ title, subtitle, progress, onCancel }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/95 backdrop-blur-sm rounded-xl border border-borderSubtle shadow-subtle text-center my-6">
      <div className="relative mb-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        {progress !== undefined && progress > 0 && (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-800">
            {progress}%
          </span>
        )}
      </div>
      <h4 className="text-base font-semibold text-navy-800">{title || 'Processing...'}</h4>
      {subtitle && <p className="text-xs text-slate-500 mt-1 max-w-md">{subtitle}</p>}

      {progress !== undefined && (
        <div className="w-64 bg-slate-100 rounded-full h-2 mt-4 overflow-hidden border border-slate-200">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <XCircle className="w-3.5 h-3.5" />
          Cancel Calculation
        </button>
      )}
    </div>
  );
}
