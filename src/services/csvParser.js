import Papa from 'papaparse';
import { EXCLUDED_COLUMNS } from '../utils/constants';

/**
 * Client-side CSV Parser and Statistical Profiler using PapaParse
 */
export async function parseAndProfileCSV(file, onProgress) {
  return new Promise((resolve, reject) => {
    const previewRows = [];
    let rowCount = 0;
    let headers = [];
    const labelDistribution = {};
    const columnStats = {};
    let missingCount = 0;
    const seenHashes = new Set();
    let duplicateCount = 0;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      chunk: (results, parser) => {
        const rows = results.data;
        if (headers.length === 0 && results.meta.fields) {
          headers = results.meta.fields;
          headers.forEach(h => {
            columnStats[h] = {
              count: 0,
              numericCount: 0,
              min: Infinity,
              max: -Infinity,
              sum: 0,
              sumSq: 0,
              missing: 0,
              hasNegatives: false
            };
          });
        }

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          rowCount++;

          // Keep up to 200 preview rows
          if (previewRows.length < 200) {
            previewRows.push(row);
          }

          // Duplicate sample check (sampling first 20,000 for client memory safety)
          if (rowCount <= 20000) {
            const hash = headers.map(h => row[h]).join('|');
            if (seenHashes.has(hash)) {
              duplicateCount++;
            } else {
              seenHashes.add(hash);
            }
          }

          // Check traffic label
          if (row.label !== undefined && row.label !== null) {
            const lbl = String(row.label);
            labelDistribution[lbl] = (labelDistribution[lbl] || 0) + 1;
          }

          // Profile columns
          for (let j = 0; j < headers.length; j++) {
            const col = headers[j];
            const val = row[col];
            const stats = columnStats[col];

            if (val === null || val === undefined || val === '') {
              stats.missing++;
              missingCount++;
            } else if (typeof val === 'number' && !isNaN(val)) {
              stats.numericCount++;
              stats.sum += val;
              stats.sumSq += val * val;
              if (val < stats.min) stats.min = val;
              if (val > stats.max) stats.max = val;
              if (val < 0) stats.hasNegatives = true;
            } else {
              stats.count++;
            }
          }
        }

        if (onProgress && file.size > 0) {
          const estimatedProgress = Math.min(95, Math.round((results.meta.cursor / file.size) * 100));
          onProgress(estimatedProgress, rowCount);
        }
      },
      complete: () => {
        // Classify columns
        const numericalFeatures = [];
        const nonNumericalColumns = [];

        headers.forEach(col => {
          const stats = columnStats[col];
          const isNumeric = stats.numericCount > (rowCount * 0.9);
          if (isNumeric && !EXCLUDED_COLUMNS.includes(col)) {
            numericalFeatures.push(col);
          } else if (!isNumeric) {
            nonNumericalColumns.push(col);
          }
        });

        // Compute mean and std for numerical features
        const featureSummaries = {};
        const negativeColumns = [];

        numericalFeatures.forEach(col => {
          const s = columnStats[col];
          const mean = s.numericCount > 0 ? s.sum / s.numericCount : 0;
          const variance = s.numericCount > 1 ? (s.sumSq - (s.sum * s.sum) / s.numericCount) / (s.numericCount - 1) : 0;
          const std = Math.sqrt(Math.max(0, variance));

          featureSummaries[col] = {
            min: Math.round(s.min * 1000) / 1000,
            max: Math.round(s.max * 1000) / 1000,
            mean: Math.round(mean * 1000) / 1000,
            std: Math.round(std * 1000) / 1000,
            hasNegatives: s.hasNegatives
          };

          if (s.hasNegatives) {
            negativeColumns.push({
              column: col,
              min: Math.round(s.min * 1000) / 1000,
              max: Math.round(s.max * 1000) / 1000
            });
          }
        });

        resolve({
          filename: file.name,
          fileSize: file.size,
          rowCount,
          columnCount: headers.length,
          headers,
          numericalFeatures,
          nonNumericalColumns,
          featureSummaries,
          negativeColumns,
          labelDistribution,
          missingCount,
          duplicateCount,
          previewRows
        });
      },
      error: (err) => {
        reject(new Error(`CSV Parsing failed: ${err.message}`));
      }
    });
  });
}
