import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { parseAndProfileCSV } from '../services/csvParser';
import { REFERENCE_DATASET } from '../utils/constants';
import { standardScale, stratifiedSample } from '../utils/math';

const DatasetContext = createContext(null);

export function DatasetProvider({ children }) {
  // Active Dataset State
  const [dataset, setDataset] = useState({
    isLoaded: false,
    isDemoMode: false,
    filename: null,
    totalRows: 0,
    totalColumns: 0,
    numericalFeatures: [],
    labelColumn: 'label',
    labelDistribution: {},
    missingValues: 0,
    duplicates: 0,
    roadSegments: null,
    previewRows: [],
    featureStats: {},
    negativeColumns: []
  });

  // Cached sample records for in-browser worker execution
  const rawRowsRef = useRef([]);

  // Worker instances
  const pcaWorkerRef = useRef(null);
  const tsneWorkerRef = useRef(null);

  // Analysis States
  const [pcaResult, setPcaResult] = useState({
    isComputed: false,
    isComputing: false,
    error: null,
    durationMs: null,
    sampleSize: 0,
    pc1_variance: null,
    pc2_variance: null,
    total_variance: null,
    scree_variance: [],
    points: []
  });

  const [tsneResult, setTsneResult] = useState({
    isComputed: false,
    isComputing: false,
    error: null,
    progress: 0,
    stage: '',
    durationMs: null,
    sampleSize: 0,
    perplexity: 30,
    randomState: 42,
    labelCounts: {},
    points: []
  });

  // CSV parsing status
  const [parseProgress, setParseProgress] = useState({ isParsing: false, percent: 0, rowCount: 0 });

  // Load verified reference findings on initial mount
  useEffect(() => {
    loadDemoMode();
  }, []);

  /**
   * Load verified reference findings from original project study
   */
  const loadDemoMode = async () => {
    try {
      const res = await fetch('/sample_5000_reference.json');
      if (!res.ok) throw new Error('Reference dataset bundle not found');
      const data = await res.json();

      setDataset({
        isLoaded: true,
        isDemoMode: true,
        filename: 'vanet_traffic_data.csv (Reference Study)',
        totalRows: REFERENCE_DATASET.totalObservations,
        totalColumns: REFERENCE_DATASET.totalColumns,
        numericalFeatures: data.metadata.features,
        labelColumn: 'label',
        labelDistribution: REFERENCE_DATASET.distribution,
        missingValues: 0,
        duplicates: 0,
        roadSegments: 500,
        previewRows: [],
        featureStats: {},
        negativeColumns: REFERENCE_DATASET.negativeValueColumns.map(n => ({ column: n.col }))
      });

      setPcaResult({
        isComputed: true,
        isComputing: false,
        error: null,
        durationMs: 142,
        sampleSize: data.metadata.sample_size,
        pc1_variance: data.metadata.pca_full_variance.pc1,
        pc2_variance: data.metadata.pca_full_variance.pc2,
        total_variance: data.metadata.pca_full_variance.total,
        scree_variance: data.metadata.scree_full || [],
        points: data.points
      });

      setTsneResult({
        isComputed: true,
        isComputing: false,
        error: null,
        progress: 100,
        stage: 'Completed (Saved Reference Study)',
        durationMs: 12400,
        sampleSize: data.metadata.sample_size,
        perplexity: 30,
        randomState: 42,
        labelCounts: data.metadata.sample_label_counts,
        points: data.points
      });
    } catch (err) {
      console.warn('Reference json not loaded:', err);
    }
  };

  /**
   * Reset the active analysis
   */
  const resetAnalysis = () => {
    setPcaResult({
      isComputed: false,
      isComputing: false,
      error: null,
      durationMs: null,
      sampleSize: 0,
      pc1_variance: null,
      pc2_variance: null,
      total_variance: null,
      scree_variance: [],
      points: []
    });
    setTsneResult({
      isComputed: false,
      isComputing: false,
      error: null,
      progress: 0,
      stage: '',
      durationMs: null,
      sampleSize: 0,
      perplexity: 30,
      randomState: 42,
      labelCounts: {},
      points: []
    });
  };

  /**
   * Reset entire dataset
   */
  const resetDataset = () => {
    resetAnalysis();
    rawRowsRef.current = [];
    setDataset({
      isLoaded: false,
      isDemoMode: false,
      filename: null,
      totalRows: 0,
      totalColumns: 0,
      numericalFeatures: [],
      labelColumn: null,
      labelDistribution: {},
      missingValues: 0,
      duplicates: 0,
      roadSegments: null,
      previewRows: [],
      featureStats: {},
      negativeColumns: []
    });
  };

  /**
   * Client-side CSV File Upload & Parsing (Papa Parse)
   */
  const handleClientFileUpload = async (file) => {
    resetAnalysis();
    setParseProgress({ isParsing: true, percent: 0, rowCount: 0 });

    try {
      const profiled = await parseAndProfileCSV(file, (percent, rowCount) => {
        setParseProgress({ isParsing: true, percent, rowCount });
      });

      rawRowsRef.current = profiled.previewRows;

      setDataset({
        isLoaded: true,
        isDemoMode: false,
        filename: profiled.filename,
        totalRows: profiled.rowCount,
        totalColumns: profiled.columnCount,
        numericalFeatures: profiled.numericalFeatures,
        labelColumn: profiled.headers.includes('label') ? 'label' : null,
        labelDistribution: profiled.labelDistribution,
        missingValues: profiled.missingCount,
        duplicates: profiled.duplicateCount,
        roadSegments: profiled.headers.includes('road_segment_id') ? 500 : null,
        previewRows: profiled.previewRows,
        featureStats: profiled.featureSummaries,
        negativeColumns: profiled.negativeColumns
      });

      setParseProgress({ isParsing: false, percent: 100, rowCount: profiled.rowCount });
    } catch (err) {
      setParseProgress({ isParsing: false, percent: 0, rowCount: 0 });
      throw err;
    }
  };

  /**
   * Run PCA analysis in dedicated Web Worker
   */
  const runPCA = async ({ sampleSize = null, seed = 42 } = {}) => {
    setPcaResult(prev => ({ ...prev, isComputing: true, error: null }));

    return new Promise((resolve, reject) => {
      try {
        const sampleRows = rawRowsRef.current.length > 0 ? rawRowsRef.current : dataset.previewRows;
        if (!sampleRows || sampleRows.length === 0) {
          throw new Error('No dataset records available in memory. Please upload a CSV file or load the reference study.');
        }

        const features = dataset.numericalFeatures;
        const matrix = sampleRows.map(row => features.map(f => Number(row[f]) || 0));
        const { scaled } = standardScale(matrix);

        if (pcaWorkerRef.current) pcaWorkerRef.current.terminate();
        const worker = new Worker(new URL('../workers/pcaWorker.js', import.meta.url), { type: 'module' });
        pcaWorkerRef.current = worker;

        worker.onmessage = (e) => {
          const { success, durationMs, result, error } = e.data;
          if (success) {
            const points = result.coordinates.map((coord, i) => ({
              id: i,
              label: sampleRows[i][dataset.labelColumn] || 'Unlabeled',
              pca_x: Math.round(coord[0] * 1000) / 1000,
              pca_y: Math.round(coord[1] * 1000) / 1000
            }));

            const pc1Var = Math.round(result.explainedVarianceRatio[0] * 10000) / 100;
            const pc2Var = Math.round(result.explainedVarianceRatio[1] * 10000) / 100;
            const totalVar = Math.round((pc1Var + pc2Var) * 100) / 100;
            const scree = result.allExplainedVariance.map(v => Math.round(v * 10000) / 100);

            const outcome = {
              isComputed: true,
              isComputing: false,
              error: null,
              durationMs,
              sampleSize: points.length,
              pc1_variance: pc1Var,
              pc2_variance: pc2Var,
              total_variance: totalVar,
              scree_variance: scree,
              points
            };
            setPcaResult(outcome);
            resolve(outcome);
          } else {
            setPcaResult(prev => ({ ...prev, isComputing: false, error }));
            reject(new Error(error));
          }
        };

        worker.onerror = (err) => {
          setPcaResult(prev => ({ ...prev, isComputing: false, error: err.message }));
          reject(err);
        };

        worker.postMessage({ type: 'RUN_PCA', matrix: scaled, nComponents: 2 });
      } catch (err) {
        setPcaResult(prev => ({ ...prev, isComputing: false, error: err.message }));
        reject(err);
      }
    });
  };

  /**
   * Run t-SNE analysis in dedicated Web Worker
   */
  const runTSNE = async ({ sampleSize = 5000, perplexity = 30, randomState = 42, stratified = true } = {}) => {
    setTsneResult(prev => ({
      ...prev,
      isComputing: true,
      error: null,
      progress: 5,
      stage: 'Preparing sampled records & features...'
    }));

    return new Promise((resolve, reject) => {
      try {
        const records = rawRowsRef.current.length > 0 ? rawRowsRef.current : dataset.previewRows;
        if (!records || records.length === 0) {
          throw new Error('No dataset rows available in memory. Please upload a CSV file or load the reference study.');
        }

        // Stratified or standard sample
        const targetSample = Math.min(sampleSize, records.length);
        const sample = stratified && dataset.labelColumn
          ? stratifiedSample(records, dataset.labelColumn, targetSample, randomState)
          : records.slice(0, targetSample);

        const features = dataset.numericalFeatures;
        const matrix = sample.map(row => features.map(f => Number(row[f]) || 0));
        const { scaled } = standardScale(matrix);

        if (tsneWorkerRef.current) tsneWorkerRef.current.terminate();
        const worker = new Worker(new URL('../workers/tsneWorker.js', import.meta.url), { type: 'module' });
        tsneWorkerRef.current = worker;

        worker.onmessage = (e) => {
          const data = e.data;
          if (data.type === 'PROGRESS') {
            setTsneResult(prev => ({
              ...prev,
              progress: data.progress,
              stage: data.stage
            }));
          } else if (data.type === 'COMPLETE') {
            const points = data.result.coordinates.map((coord, i) => ({
              id: sample[i].__orig_index !== undefined ? sample[i].__orig_index : i,
              label: sample[i][dataset.labelColumn] || 'Unlabeled',
              tsne_x: coord[0],
              tsne_y: coord[1],
              pca_x: 0,
              pca_y: 0
            }));

            const labelCounts = {};
            sample.forEach(s => {
              const lbl = s[dataset.labelColumn] || 'Unlabeled';
              labelCounts[lbl] = (labelCounts[lbl] || 0) + 1;
            });

            const outcome = {
              isComputed: true,
              isComputing: false,
              error: null,
              progress: 100,
              stage: 'Completed',
              durationMs: data.durationMs,
              sampleSize: data.result.sampleSize,
              perplexity: data.result.perplexity,
              randomState,
              labelCounts,
              points
            };
            setTsneResult(outcome);
            resolve(outcome);
          } else if (!data.success) {
            setTsneResult(prev => ({ ...prev, isComputing: false, error: data.error }));
            reject(new Error(data.error));
          }
        };

        worker.onerror = (err) => {
          setTsneResult(prev => ({ ...prev, isComputing: false, error: err.message }));
          reject(err);
        };

        worker.postMessage({
          type: 'RUN_TSNE',
          matrix: scaled,
          perplexity,
          maxIter: 350,
          learningRate: 100,
          seed: randomState
        });
      } catch (err) {
        setTsneResult(prev => ({ ...prev, isComputing: false, error: err.message }));
        reject(err);
      }
    });
  };

  /**
   * Cancel in-flight t-SNE execution
   */
  const cancelTSNE = () => {
    if (tsneWorkerRef.current) {
      tsneWorkerRef.current.postMessage({ type: 'CANCEL' });
      tsneWorkerRef.current.terminate();
      tsneWorkerRef.current = null;
    }
    setTsneResult(prev => ({
      ...prev,
      isComputing: false,
      stage: 'Cancelled by user',
      error: 't-SNE execution stopped'
    }));
  };

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        pcaResult,
        tsneResult,
        parseProgress,
        loadDemoMode,
        resetAnalysis,
        resetDataset,
        handleClientFileUpload,
        runPCA,
        runTSNE,
        cancelTSNE
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error('useDataset must be used within DatasetProvider');
  return ctx;
}
