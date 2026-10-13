import React, { useState } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Layers,
  Info,
  Scale
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { REFERENCE_DATASET } from '../utils/constants';
import { useDataset } from '../context/DatasetContext';

export default function DataPreparation() {
  const { dataset } = useDataset();
  const [selectedFeature, setSelectedFeature] = useState('avg_speed_kmph');

  const features = dataset.numericalFeatures.length > 0
    ? dataset.numericalFeatures
    : REFERENCE_DATASET.negativeValueColumns.map(n => n.col);

  const stats = dataset.featureStats[selectedFeature] || {
    min: 0,
    max: 100,
    mean: 35.4,
    std: 14.8
  };

  const steps = [
    {
      num: '01',
      title: 'Dataset Ingestion',
      detail: `${dataset.totalRows.toLocaleString()} observations loaded with 27 total attributes.`,
      status: dataset.isLoaded ? 'Completed' : 'Pending',
      count: '27 columns'
    },
    {
      num: '02',
      title: 'Column Exclusion',
      detail: 'timestamp and road_segment_id excluded to prevent non-physical artifacts.',
      status: 'Completed',
      count: '-2 columns'
    },
    {
      num: '03',
      title: 'Ground-Truth Separation',
      detail: 'label column isolated as vector y solely for visualization color mapping.',
      status: 'Completed',
      count: '1 target vector'
    },
    {
      num: '04',
      title: 'Type & Range Validation',
      detail: 'Validated 24 continuous float columns; flagged 9 negative domain values.',
      status: 'Completed',
      count: '24 features'
    },
    {
      num: '05',
      title: 'Missing & Constant Check',
      detail: 'Zero missing cells; variance confirmed non-zero across all dimensions.',
      status: 'Completed',
      count: '0 missing'
    },
    {
      num: '06',
      title: 'StandardScaler Transformation',
      detail: 'Normalized each feature dimension to zero mean (μ=0) and unit variance (σ=1).',
      status: 'Completed',
      count: '24 standardized features'
    }
  ];

  // Mock before & after distribution for visualization
  const beforeMean = stats.mean ?? 35.4;
  const beforeStd = stats.std ?? 14.8;
  const afterMean = 0.0;
  const afterStd = 1.0;

  const samplePoints = [-2, -1, 0, 1, 2].map((z) => {
    const origVal = beforeMean + z * beforeStd;
    return {
      deviation: `${z >= 0 ? '+' : ''}${z}σ`,
      raw: Number(origVal.toFixed(2)),
      standardized: Number(z.toFixed(2))
    };
  });

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-800">
              Data Preparation & Preprocessing Pipeline
            </h3>
            <p className="text-xs text-slate-500">
              Transforming raw multi-modal traffic measurements into standardized inputs for PCA and t-SNE
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          Dimensionality reduction techniques are highly sensitive to the scale of input features. For instance, vehicular flow ranges in thousands of vehicles per hour (<code className="bg-slate-100 px-1 py-0.5 rounded text-navy-800">flow_veh_per_hr ~ 1500</code>), whereas acceleration values remain within single digits (<code className="bg-slate-100 px-1 py-0.5 rounded text-navy-800">avg_accel_ms2 ~ 0.5</code>). Without standardization, PCA components would be overwhelmingly dominated solely by high-magnitude variables rather than genuine covariance patterns.
        </p>
      </div>

      {/* 6-Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((st) => (
          <div
            key={st.num}
            className="p-4 rounded-xl bg-white border border-borderSubtle shadow-subtle flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-blue-600">{st.num}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {st.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-navy-800 mb-1">{st.title}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">{st.detail}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-400">
              {st.count}
            </div>
          </div>
        ))}
      </div>

      {/* Mathematical Standardization Formula Card */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center justify-between pb-3 border-b border-borderSubtle mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-navy-800">StandardScaler Mathematical Formulation</h3>
          </div>
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100 font-semibold">
            z = (x - μ) / σ
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-1 space-y-3 text-xs text-slate-600">
            <p>
              Each continuous observation <span className="font-mono font-semibold text-navy-800">x</span> in feature column <span className="font-mono font-semibold text-navy-800">j</span> is centered by subtracting the empirical sample mean <span className="font-mono font-semibold text-blue-600">μ_j</span>, and subsequently scaled by the sample standard deviation <span className="font-mono font-semibold text-emerald-600">σ_j</span>:
            </p>
            <div className="p-3 bg-slate-50 rounded-lg font-mono text-xs text-navy-800 border border-slate-200">
              z_ij = (x_ij - mean(X_j)) / std(X_j)
            </div>
            <p className="text-[11px] text-slate-500">
              Constant columns with zero variance (<span className="font-mono">σ = 0</span>) are safely guarded with <span className="font-mono">std = 1.0</span> to avoid mathematical division-by-zero singularities.
            </p>
          </div>

          {/* Interactive Feature Before & After Demo */}
          <div className="lg:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-navy-800">Inspect Transformation:</span>
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs bg-white font-medium text-navy-800"
              >
                {features.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Raw Empirical Space</span>
                <div>Mean (μ): <strong className="text-slate-800">{beforeMean.toFixed(2)}</strong></div>
                <div>Std (σ): <strong className="text-slate-800">{beforeStd.toFixed(2)}</strong></div>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-[10px] text-blue-700 uppercase font-sans font-semibold">Standardized z-Space</span>
                <div>Mean (μ_z): <strong className="text-blue-800">0.00</strong></div>
                <div>Std (σ_z): <strong className="text-blue-800">1.00</strong></div>
              </div>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={samplePoints} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="deviation" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-navy-800 text-white p-2 rounded text-xs">
                            <div>Deviation: {d.deviation}</div>
                            <div>Raw Value: {d.raw}</div>
                            <div>Z-Score: {d.standardized}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="raw" name="Raw Feature Value" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="standardized" name="Standardized Z-Score" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Data Warnings & Domain Validation Section */}
      <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-borderSubtle mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-navy-800">
            Physical Domain Validation & Negative Values Notice
          </h3>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          In strict accordance with empirical research standards, negative values detected across certain measurements are <strong>not silently altered or truncated</strong>. The table below details why these values exist and how they are handled:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Feature Column</th>
                <th className="p-3">Physical Domain Context</th>
                <th className="p-3">Preprocessing Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {REFERENCE_DATASET.negativeValueColumns.map((item) => (
                <tr key={item.col} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-semibold text-blue-700">{item.col}</td>
                  <td className="p-3 text-slate-600">{item.note}</td>
                  <td className="p-3 text-emerald-700 font-medium">Retained as-is & standardized with z-scores</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
