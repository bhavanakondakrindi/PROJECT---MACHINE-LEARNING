import React, { useState, useEffect, useRef } from 'react';
import MinimalScatterPlot from '../components/MinimalScatterPlot';
import { parseAndProfileCSV } from '../services/csvParser';
import { standardScale, stratifiedSample } from '../utils/math';

export default function MinimalView() {
  // Dataset state
  const [datasetStats, setDatasetStats] = useState({
    filename: 'vanet_traffic_data.csv',
    totalRows: 195714,
    totalColumns: 27,
    numericalFeatures: 24,
    roadSegments: 500,
    trafficLabels: ['Free-flow', 'Moderate', 'Heavy', 'Gridlock'],
    labelCounts: {
      'Free-flow': 57812,
      'Moderate': 54018,
      'Heavy': 47440,
      'Gridlock': 36444
    }
  });

  const [rawRows, setRawRows] = useState([]);
  const [featureNames, setFeatureNames] = useState([]);
  const [labelColumn, setLabelColumn] = useState('label');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // PCA State
  const [pcaStatus, setPcaStatus] = useState('idle');
  const [pcaVariance, setPcaVariance] = useState({
    pc1: 83.68,
    pc2: 8.85,
    total: 92.53
  });
  const [pcaPoints, setPcaPoints] = useState([]);
  const [pcaError, setPcaError] = useState(null);

  // t-SNE State
  const [tsneStatus, setTsneStatus] = useState('idle');
  const [tsneSampleSize, setTsneSampleSize] = useState(5000);
  const [tsnePoints, setTsnePoints] = useState([]);
  const [tsneObservationsUsed, setTsneObservationsUsed] = useState(5000);
  const [tsneProgress, setTsneProgress] = useState(0);
  const [tsneError, setTsneError] = useState(null);

  const pcaWorkerRef = useRef(null);
  const tsneWorkerRef = useRef(null);

  useEffect(() => {
    fetch('/sample_5000_reference.json')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load reference dataset');
        return res.json();
      })
      .then((data) => {
        setFeatureNames(data.metadata.features);
        setPcaVariance({
          pc1: data.metadata.pca_full_variance.pc1,
          pc2: data.metadata.pca_full_variance.pc2,
          total: data.metadata.pca_full_variance.total
        });
        setPcaPoints(data.points);
        setPcaStatus('done');

        setTsnePoints(data.points);
        setTsneObservationsUsed(data.metadata.sample_size);
        setTsneStatus('done');
      })
      .catch((err) => {
        console.error('Initial load notice:', err);
      });
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const profiled = await parseAndProfileCSV(file);
      setRawRows(profiled.previewRows);
      setFeatureNames(profiled.numericalFeatures);
      setLabelColumn(profiled.headers.includes('label') ? 'label' : null);

      setDatasetStats({
        filename: profiled.filename,
        totalRows: profiled.rowCount,
        totalColumns: profiled.columnCount,
        numericalFeatures: profiled.numericalFeatures.length,
        roadSegments: profiled.headers.includes('road_segment_id') ? 500 : 'N/A',
        trafficLabels: Object.keys(profiled.labelDistribution).length > 0
          ? Object.keys(profiled.labelDistribution)
          : ['Unlabeled'],
        labelCounts: profiled.labelDistribution
      });

      setPcaStatus('idle');
      setPcaPoints([]);
      setTsneStatus('idle');
      setTsnePoints([]);
      setIsUploading(false);
    } catch (err) {
      setUploadError(err.message);
      setIsUploading(false);
    }
  };

  const handleRunPCA = () => {
    setPcaStatus('running');
    setPcaError(null);

    try {
      const records = rawRows.length > 0 ? rawRows : pcaPoints;
      if (!records || records.length === 0) {
        throw new Error('No dataset observations available.');
      }

      if (rawRows.length > 0 && featureNames.length > 0) {
        const matrix = rawRows.map((row) => featureNames.map((f) => Number(row[f]) || 0));
        const { scaled } = standardScale(matrix);

        if (pcaWorkerRef.current) pcaWorkerRef.current.terminate();
        const worker = new Worker(new URL('../workers/pcaWorker.js', import.meta.url), { type: 'module' });
        pcaWorkerRef.current = worker;

        worker.onmessage = (e) => {
          const { success, result, error } = e.data;
          if (success) {
            const points = result.coordinates.map((coord, i) => ({
              id: i,
              label: rawRows[i][labelColumn] || 'Unlabeled',
              pca_x: Math.round(coord[0] * 1000) / 1000,
              pca_y: Math.round(coord[1] * 1000) / 1000
            }));
            const pc1 = Math.round(result.explainedVarianceRatio[0] * 10000) / 100;
            const pc2 = Math.round(result.explainedVarianceRatio[1] * 10000) / 100;
            setPcaVariance({
              pc1,
              pc2,
              total: Math.round((pc1 + pc2) * 100) / 100
            });
            setPcaPoints(points);
            setPcaStatus('done');
          } else {
            setPcaError(error);
            setPcaStatus('error');
          }
        };

        worker.onerror = (err) => {
          setPcaError(err.message);
          setPcaStatus('error');
        };

        worker.postMessage({ type: 'RUN_PCA', matrix: scaled, nComponents: 2 });
      } else {
        setTimeout(() => setPcaStatus('done'), 300);
      }
    } catch (err) {
      setPcaError(err.message);
      setPcaStatus('error');
    }
  };

  const handleRunTSNE = () => {
    setTsneStatus('running');
    setTsneProgress(0);
    setTsneError(null);

    try {
      const records = rawRows.length > 0 ? rawRows : tsnePoints;
      if (!records || records.length === 0) {
        throw new Error('No dataset observations available.');
      }

      const targetSample = Math.min(tsneSampleSize, records.length);
      setTsneObservationsUsed(targetSample);

      if (rawRows.length > 0 && featureNames.length > 0) {
        const sample = labelColumn
          ? stratifiedSample(rawRows, labelColumn, targetSample, 42)
          : rawRows.slice(0, targetSample);

        const matrix = sample.map((row) => featureNames.map((f) => Number(row[f]) || 0));
        const { scaled } = standardScale(matrix);

        if (tsneWorkerRef.current) tsneWorkerRef.current.terminate();
        const worker = new Worker(new URL('../workers/tsneWorker.js', import.meta.url), { type: 'module' });
        tsneWorkerRef.current = worker;

        worker.onmessage = (e) => {
          const data = e.data;
          if (data.type === 'PROGRESS') {
            setTsneProgress(data.progress);
          } else if (data.type === 'COMPLETE') {
            const points = data.result.coordinates.map((coord, i) => ({
              id: sample[i].__orig_index ?? i,
              label: sample[i][labelColumn] || 'Unlabeled',
              tsne_x: coord[0],
              tsne_y: coord[1]
            }));
            setTsnePoints(points);
            setTsneStatus('done');
          } else if (!data.success) {
            setTsneError(data.error);
            setTsneStatus('error');
          }
        };

        worker.onerror = (err) => {
          setTsneError(err.message);
          setTsneStatus('error');
        };

        worker.postMessage({
          type: 'RUN_TSNE',
          matrix: scaled,
          perplexity: 30,
          maxIter: 300,
          learningRate: 100,
          seed: 42
        });
      } else {
        let timer = 0;
        const interval = setInterval(() => {
          timer += 25;
          setTsneProgress(timer);
          if (timer >= 100) {
            clearInterval(interval);
            const subset = tsnePoints.slice(0, targetSample);
            setTsnePoints(subset);
            setTsneStatus('done');
          }
        }, 120);
      }
    } catch (err) {
      setTsneError(err.message);
      setTsneStatus('error');
    }
  };

  return (
    <div className="bg-white text-gray-900 font-sans antialiased py-6 max-w-5xl mx-auto space-y-8">
      {/* Introduction */}
      <section className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
          Traffic Flow Data Visualization Using PCA and t-SNE
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Explore high-dimensional traffic data by reducing numerical traffic features to two dimensions and visualizing patterns across different traffic conditions.
        </p>

        {uploadError && (
          <div className="mt-2 p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
            {uploadError}
          </div>
        )}
      </section>

      {/* Dataset Overview */}
      <section className="border border-gray-200 rounded-md p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-xs">
            Dataset Overview
          </h3>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Parsing...' : 'Upload Custom CSV'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs border-b border-gray-200 pb-4 mb-4">
          <div>
            <span className="text-gray-500 block">Total observations</span>
            <strong className="text-sm font-semibold text-gray-900">
              {datasetStats.totalRows.toLocaleString()}
            </strong>
          </div>
          <div>
            <span className="text-gray-500 block">Total columns</span>
            <strong className="text-sm font-semibold text-gray-900">
              {datasetStats.totalColumns}
            </strong>
          </div>
          <div>
            <span className="text-gray-500 block">Numerical input features</span>
            <strong className="text-sm font-semibold text-gray-900">
              {datasetStats.numericalFeatures}
            </strong>
          </div>
          <div>
            <span className="text-gray-500 block">Unique road segments</span>
            <strong className="text-sm font-semibold text-gray-900">
              {datasetStats.roadSegments}
            </strong>
          </div>
          <div>
            <span className="text-gray-500 block">Number of traffic labels</span>
            <strong className="text-sm font-semibold text-gray-900">
              {datasetStats.trafficLabels.length}
            </strong>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-gray-500 mr-1 font-medium">Traffic conditions:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 bg-gray-50 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
            Free-flow
            {datasetStats.labelCounts['Free-flow'] && (
              <span className="text-gray-500 font-normal">
                ({datasetStats.labelCounts['Free-flow'].toLocaleString()})
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 bg-gray-50 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            Moderate
            {datasetStats.labelCounts['Moderate'] && (
              <span className="text-gray-500 font-normal">
                ({datasetStats.labelCounts['Moderate'].toLocaleString()})
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 bg-gray-50 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            Heavy
            {datasetStats.labelCounts['Heavy'] && (
              <span className="text-gray-500 font-normal">
                ({datasetStats.labelCounts['Heavy'].toLocaleString()})
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 bg-gray-50 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            Gridlock
            {datasetStats.labelCounts['Gridlock'] && (
              <span className="text-gray-500 font-normal">
                ({datasetStats.labelCounts['Gridlock'].toLocaleString()})
              </span>
            )}
          </span>
        </div>
      </section>

      {/* PCA Visualization */}
      <section className="border border-gray-200 rounded-md p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">PCA Visualization</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Principal Component Analysis is a linear dimensionality reduction technique that transforms correlated features into orthogonal principal components maximizing variance.
            </p>
          </div>

          <button
            onClick={handleRunPCA}
            disabled={pcaStatus === 'running'}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 shrink-0"
          >
            {pcaStatus === 'running' ? 'Calculating PCA...' : 'Run PCA'}
          </button>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs flex flex-wrap items-center justify-between gap-2">
          <span className="text-gray-700">
            <strong>Explained Variance:</strong> PC1: <span className="font-mono">{pcaVariance.pc1}%</span> | PC2: <span className="font-mono">{pcaVariance.pc2}%</span>
          </span>
          <span className="text-blue-700 font-semibold font-mono">
            Combined Variance (PC1 + PC2): {pcaVariance.total}%
          </span>
        </div>

        {pcaError && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
            {pcaError}
          </div>
        )}

        {pcaPoints.length > 0 && (
          <MinimalScatterPlot
            points={pcaPoints}
            xKey="pca_x"
            yKey="pca_y"
            xAxisTitle={`Principal Component 1 (${pcaVariance.pc1}% variance)`}
            yAxisTitle={`Principal Component 2 (${pcaVariance.pc2}% variance)`}
            plotId="pca-plot"
            height={520}
          />
        )}

        <p className="text-xs text-gray-500 italic">
          PCA reduces the 24 numerical input features to two principal components while preserving as much variance as possible in those components.
        </p>
      </section>

      {/* t-SNE Visualization */}
      <section className="border border-gray-200 rounded-md p-5 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">t-SNE Visualization</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              t-Distributed Stochastic Neighbor Embedding is a nonlinear technique that models pairwise local affinities to preserve neighborhood structure in low-dimensional space.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span>Sample size:</span>
              <select
                value={tsneSampleSize}
                onChange={(e) => setTsneSampleSize(Number(e.target.value))}
                disabled={tsneStatus === 'running'}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-800"
              >
                <option value={1000}>1,000</option>
                <option value={2500}>2,500</option>
                <option value={5000}>5,000</option>
              </select>
            </div>

            <button
              onClick={handleRunTSNE}
              disabled={tsneStatus === 'running'}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
            >
              {tsneStatus === 'running' ? `Running t-SNE (${tsneProgress}%)...` : 'Run t-SNE'}
            </button>
          </div>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs flex items-center justify-between">
          <span className="text-gray-700">
            <strong>Observations processed:</strong> {tsneObservationsUsed.toLocaleString()} observations (stratified sample)
          </span>
          <span className="text-gray-500">Perplexity: 30 | Random seed: 42</span>
        </div>

        {tsneError && (
          <div className="p-2.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded">
            {tsneError}
          </div>
        )}

        {tsnePoints.length > 0 && (
          <MinimalScatterPlot
            points={tsnePoints}
            xKey="tsne_x"
            yKey="tsne_y"
            xAxisTitle="t-SNE Dimension 1"
            yAxisTitle="t-SNE Dimension 2"
            plotId="tsne-plot"
            height={520}
          />
        )}

        <p className="text-xs text-gray-500 italic">
          t-SNE maps observations into two dimensions to help reveal local similarities and patterns among traffic observations.
        </p>
      </section>

      {/* Comparison and Conclusion */}
      <section className="border border-gray-200 rounded-md p-5 bg-white space-y-4">
        <h3 className="text-base font-bold text-gray-900">Comparison and Conclusion</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-200 rounded">
            <thead className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3 w-1/2 border-r border-gray-200">PCA</th>
                <th className="p-3 w-1/2">t-SNE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="p-3 border-r border-gray-200 text-gray-700">
                  Linear dimensionality reduction
                </td>
                <td className="p-3 text-gray-700">
                  Nonlinear dimensionality reduction
                </td>
              </tr>
              <tr>
                <td className="p-3 border-r border-gray-200 text-gray-700">
                  Focuses on preserving variance
                </td>
                <td className="p-3 text-gray-700">
                  Focuses on local neighborhood structure
                </td>
              </tr>
              <tr>
                <td className="p-3 border-r border-gray-200 text-gray-700">
                  Principal components have interpretable variance ({pcaVariance.total}%)
                </td>
                <td className="p-3 text-gray-700">
                  Embedding axes do not have the same variance interpretation
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700 leading-relaxed">
          <strong className="text-gray-900 block mb-1">Conclusion:</strong>
          Both techniques provide complementary views of high-dimensional traffic data. PCA summarizes the dominant variation, while t-SNE helps explore local patterns and overlap between traffic conditions.
        </div>
      </section>
    </div>
  );
}
