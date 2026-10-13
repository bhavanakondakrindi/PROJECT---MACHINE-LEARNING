import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AlertTriangle, Info } from 'lucide-react';

export default function FeatureHistogram({ features = [], featureStats = {}, previewRows = [] }) {
  const [selectedFeature, setSelectedFeature] = useState(features[0] || 'avg_speed_kmph');

  const stats = featureStats[selectedFeature] || {};
  const hasNegatives = stats.min !== undefined && stats.min < 0;

  // Build 10-bin histogram from available sample records
  const values = previewRows
    .map(r => Number(r[selectedFeature]))
    .filter(v => !isNaN(v));

  const min = stats.min !== undefined ? stats.min : (values.length ? Math.min(...values) : 0);
  const max = stats.max !== undefined ? stats.max : (values.length ? Math.max(...values) : 100);
  const binCount = 10;
  const binWidth = (max - min) / binCount || 1;

  const bins = Array.from({ length: binCount }, (_, i) => {
    const start = min + i * binWidth;
    const end = start + binWidth;
    return {
      bin: `${start.toFixed(1)} - ${end.toFixed(1)}`,
      count: 0
    };
  });

  values.forEach(v => {
    const idx = Math.min(Math.floor((v - min) / binWidth), binCount - 1);
    if (idx >= 0 && idx < binCount) {
      bins[idx].count++;
    }
  });

  return (
    <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-borderSubtle">
        <div>
          <h3 className="text-sm font-bold text-navy-800">Numerical Feature Inspector</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution and empirical parameters for dimensionality reduction inputs
          </p>
        </div>

        {/* Feature Selector */}
        <select
          value={selectedFeature}
          onChange={(e) => setSelectedFeature(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-xs font-semibold text-navy-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {features.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Feature KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Min</span>
          <div className="text-sm font-mono font-bold text-slate-800">{stats.min ?? 'N/A'}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Max</span>
          <div className="text-sm font-mono font-bold text-slate-800">{stats.max ?? 'N/A'}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Mean (μ)</span>
          <div className="text-sm font-mono font-bold text-blue-700">{stats.mean ?? 'N/A'}</div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Std Dev (σ)</span>
          <div className="text-sm font-mono font-bold text-emerald-700">{stats.std ?? 'N/A'}</div>
        </div>
      </div>

      {/* Negative Value Alert */}
      {hasNegatives && (
        <div className="mb-4 flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Negative values detected ({stats.min}):</span>{' '}
            Some physical measurements (e.g., RSSI dBm or deceleration) naturally contain negative values, while others may reflect sensor calibration offsets. The data is retained unchanged and standardized using z-scores.
          </div>
        </div>
      )}

      {/* Histogram Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="bin"
              tick={{ fill: '#64748B', fontSize: 10 }}
              interval={1}
              angle={-20}
              textAnchor="end"
            />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-navy-800 text-white p-2 rounded text-xs">
                      <div>Range: {payload[0].payload.bin}</div>
                      <div>Sample Observations: {payload[0].payload.count}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
