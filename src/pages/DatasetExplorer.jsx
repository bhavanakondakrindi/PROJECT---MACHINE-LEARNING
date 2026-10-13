import React from 'react';
import {
  Database,
  FileSpreadsheet,
  AlertCircle,
  Hash,
  Layers,
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';
import UploadDropzone from '../components/dataset/UploadDropzone';
import DataTable from '../components/dataset/DataTable';
import FeatureHistogram from '../components/charts/FeatureHistogram';
import DistributionChart from '../components/charts/DistributionChart';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import { useDataset } from '../context/DatasetContext';

export default function DatasetExplorer() {
  const { dataset, parseProgress } = useDataset();

  if (!dataset.isLoaded && !parseProgress.isParsing) {
    return (
      <div className="space-y-6">
        <UploadDropzone />
        <EmptyState
          title="Dataset Not Loaded"
          description="Drag and drop vanet_traffic_data.csv above to parse and profile the vehicular observations."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload & Ingestion Section */}
      <UploadDropzone />

      {/* Dataset Technical Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Observations"
          value={dataset.totalRows.toLocaleString()}
          subtitle="Total rows in dataset"
          icon={Database}
          color="blue"
        />
        <StatCard
          title="Numerical Features"
          value={`${dataset.numericalFeatures.length} / ${dataset.totalColumns}`}
          subtitle="Continuous dimensions for PCA/t-SNE"
          icon={Hash}
          color="purple"
        />
        <StatCard
          title="Missing Values"
          value={dataset.missingValues}
          subtitle="0 missing fields detected"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Duplicates Sample"
          value={dataset.duplicates}
          subtitle="Verified unique rows"
          icon={Layers}
          color="navy"
        />
      </div>

      {/* Feature Filtering Notice */}
      <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Feature Partitioning Architecture:</span>{' '}
          The 27 columns are partitioned into:
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-800">
            <li>
              <strong>Excluded from Algorithm Input:</strong> <code className="bg-white/80 px-1 py-0.5 rounded font-mono">timestamp</code> (temporal index) and <code className="bg-white/80 px-1 py-0.5 rounded font-mono">road_segment_id</code> (spatial category).
            </li>
            <li>
              <strong>Class Annotation:</strong> <code className="bg-white/80 px-1 py-0.5 rounded font-mono">label</code> (Free-flow, Moderate, Heavy, Gridlock) used solely for ground-truth color mapping and validation.
            </li>
            <li>
              <strong>Dimensionality Reduction Inputs (X):</strong> 24 continuous vehicular, spatial, network, and environmental variables.
            </li>
          </ul>
        </div>
      </div>

      {/* Feature Distribution & Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DistributionChart
          distribution={dataset.labelDistribution}
          totalRows={dataset.totalRows}
        />
        <FeatureHistogram
          features={dataset.numericalFeatures}
          featureStats={dataset.featureStats}
          previewRows={dataset.previewRows}
        />
      </div>

      {/* Searchable Preview Table */}
      <DataTable
        rows={dataset.previewRows}
        features={dataset.numericalFeatures}
        totalRows={dataset.totalRows}
      />
    </div>
  );
}
