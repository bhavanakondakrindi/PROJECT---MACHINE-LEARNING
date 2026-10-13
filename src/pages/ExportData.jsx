import React from 'react';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  Printer,
  CheckCircle2,
  FileCheck,
  Table
} from 'lucide-react';
import { useDataset } from '../context/DatasetContext';
import {
  exportPCACoordinatesCSV,
  exportTSNECoordinatesCSV,
  exportCombinedCoordinatesCSV,
  exportAnalysisSummaryJSON
} from '../services/exportService';

export default function ExportData() {
  const { dataset, pcaResult, tsneResult } = useDataset();

  const handleExportPCA = () => {
    if (pcaResult.points.length === 0) {
      alert('Please run PCA Analysis first to generate coordinates.');
      return;
    }
    exportPCACoordinatesCSV(pcaResult.points, `${dataset.filename || 'traffic'}_pca_coordinates.csv`);
  };

  const handleExportTSNE = () => {
    if (tsneResult.points.length === 0) {
      alert('Please run t-SNE Analysis first to generate coordinates.');
      return;
    }
    exportTSNECoordinatesCSV(tsneResult.points, `${dataset.filename || 'traffic'}_tsne_coordinates.csv`);
  };

  const handleExportCombined = () => {
    const points = tsneResult.points.length > 0 ? tsneResult.points : pcaResult.points;
    if (points.length === 0) {
      alert('Please run both PCA and t-SNE analyses to generate coordinate sets.');
      return;
    }
    exportCombinedCoordinatesCSV(points, `${dataset.filename || 'traffic'}_pca_vs_tsne_coordinates.csv`);
  };

  const handleExportSummary = () => {
    const summary = {
      project_title: 'Traffic Flow Data Visualization Using PCA and t-SNE',
      dataset: {
        filename: dataset.filename,
        total_rows: dataset.totalRows,
        total_columns: dataset.totalColumns,
        numerical_features_count: dataset.numericalFeatures.length,
        label_distribution: dataset.labelDistribution,
        missing_values: dataset.missingValues,
        duplicates: dataset.duplicates
      },
      pca: {
        is_computed: pcaResult.isComputed,
        sample_size: pcaResult.sampleSize,
        pc1_variance: pcaResult.pc1_variance,
        pc2_variance: pcaResult.pc2_variance,
        total_variance: pcaResult.total_variance,
        scree_variance: pcaResult.scree_variance
      },
      tsne: {
        is_computed: tsneResult.isComputed,
        sample_size: tsneResult.sampleSize,
        perplexity: tsneResult.perplexity,
        random_seed: tsneResult.randomState,
        label_counts: tsneResult.labelCounts
      },
      exported_at: new Date().toISOString()
    };
    exportAnalysisSummaryJSON(summary, `${dataset.filename || 'traffic'}_analysis_summary.json`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-800">Export Analysis Results</h3>
            <p className="text-xs text-slate-500">
              Download clean 2D coordinate projections, empirical variance metrics, and analytical summaries
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          Exported coordinate files maintain exact mathematical correspondence to the original observation row index or record identifier (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">id</code>) alongside the traffic condition ground truth (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono">label</code>), suitable for external verification in Python, R, or presentation slides.
        </p>
      </div>

      {/* Export Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PCA Coordinates Export */}
        <div className="p-5 bg-white rounded-xl border border-borderSubtle shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-navy-800">PCA Coordinates CSV</h4>
                <span className="text-[10px] text-slate-400">id, label, pc1, pc2</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Exports the 2D principal component coordinates for each projected observation along with its verified traffic state.
            </p>
            <div className="mt-3 text-xs font-mono text-slate-600">
              Points available: <strong className="text-navy-800">{pcaResult.points.length.toLocaleString()}</strong>
            </div>
          </div>

          <button
            onClick={handleExportPCA}
            disabled={pcaResult.points.length === 0}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Download PCA CSV
          </button>
        </div>

        {/* t-SNE Coordinates Export */}
        <div className="p-5 bg-white rounded-xl border border-borderSubtle shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-navy-800">t-SNE Coordinates CSV</h4>
                <span className="text-[10px] text-slate-400">id, label, tsne1, tsne2</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Exports the non-linear 2D manifold embedding generated on the representative sample.
            </p>
            <div className="mt-3 text-xs font-mono text-slate-600">
              Points available: <strong className="text-navy-800">{tsneResult.points.length.toLocaleString()}</strong>
            </div>
          </div>

          <button
            onClick={handleExportTSNE}
            disabled={tsneResult.points.length === 0}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Download t-SNE CSV
          </button>
        </div>

        {/* Combined Side-by-Side Coordinates Export */}
        <div className="p-5 bg-white rounded-xl border border-borderSubtle shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Table className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-navy-800">Combined PCA & t-SNE CSV</h4>
                <span className="text-[10px] text-slate-400">id, label, pca_pc1, pca_pc2, tsne_dim1, tsne_dim2</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Single consolidated dataset containing both linear PCA and non-linear t-SNE coordinates matched on the identical observation index.
            </p>
            <div className="mt-3 text-xs font-mono text-slate-600">
              Matched records: <strong className="text-navy-800">{tsneResult.points.length.toLocaleString()}</strong>
            </div>
          </div>

          <button
            onClick={handleExportCombined}
            disabled={tsneResult.points.length === 0}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Download Combined CSV
          </button>
        </div>

        {/* Analytical Report JSON Export */}
        <div className="p-5 bg-white rounded-xl border border-borderSubtle shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-slate-100 text-navy-800">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-navy-800">Analysis Summary Report (JSON)</h4>
                <span className="text-[10px] text-slate-400">variance metrics, parameters, class counts</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Complete machine-readable JSON object documenting all dataset parameters, explained variance ratios, and hyperparameter settings.
            </p>
            <div className="mt-3 text-xs font-mono text-slate-600">
              Format: <strong className="text-navy-800">Structured JSON</strong>
            </div>
          </div>

          <button
            onClick={handleExportSummary}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold text-navy-800 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON Report
          </button>
        </div>
      </div>

      {/* Print Friendly Trigger */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-navy-800">Print or Save Summary as PDF</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Generates a clean, print-formatted page layout suitable for college project reviews and lab submissions.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>
    </div>
  );
}
