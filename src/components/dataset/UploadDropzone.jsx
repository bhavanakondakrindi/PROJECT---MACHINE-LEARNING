import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

export default function UploadDropzone() {
  const { handleClientFileUpload, parseProgress, dataset } = useDataset();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Please provide a valid .csv tabular file.');
      return;
    }
    setError(null);
    try {
      await handleClientFileUpload(file);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
      <div className="flex items-center justify-between pb-3 border-b border-borderSubtle mb-4">
        <div>
          <h3 className="text-sm font-bold text-navy-800">CSV Dataset Loader</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Accepts traffic flow tabular data formatted in CSV with headers
          </p>
        </div>
        {dataset.isLoaded && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {dataset.isDemoMode ? 'Reference Study Loaded' : 'Custom CSV Active'}
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => processFile(e.target.files?.[0])}
      />

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50/60'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          {parseProgress.isParsing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        {parseProgress.isParsing ? (
          <div>
            <h4 className="text-sm font-bold text-navy-800">Streaming & Profiling CSV...</h4>
            <p className="text-xs text-slate-500 mt-1">
              Parsed {parseProgress.rowCount.toLocaleString()} rows ({parseProgress.percent}%)
            </p>
            <div className="w-56 bg-slate-200 h-1.5 rounded-full mx-auto mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-200"
                style={{ width: `${parseProgress.percent}%` }}
              />
            </div>
          </div>
        ) : (
          <div>
            <h4 className="text-sm font-bold text-navy-800">
              Drag and drop traffic dataset here, or <span className="text-blue-600 hover:underline">browse files</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Supports <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">vanet_traffic_data.csv</code> and custom traffic logs (up to 200k+ rows)
            </p>
          </div>
        )}
      </div>

      {/* File Info Bar if loaded */}
      {dataset.isLoaded && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-navy-800">{dataset.filename}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-mono">
            <span>Rows: <strong className="text-navy-800">{dataset.totalRows.toLocaleString()}</strong></span>
            <span>Columns: <strong className="text-navy-800">{dataset.totalColumns}</strong></span>
            <span>Input Features: <strong className="text-blue-600">{dataset.numericalFeatures.length}</strong></span>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
