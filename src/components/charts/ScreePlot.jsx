import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function ScreePlot({ screeVariance = [], maxComponents = 10 }) {
  if (!screeVariance || screeVariance.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-borderSubtle p-6 text-center text-slate-400 text-xs">
        No scree plot variance data available. Run PCA to calculate explained variance.
      </div>
    );
  }

  const subset = screeVariance.slice(0, maxComponents);
  let cumulative = 0;
  const chartData = subset.map((val, idx) => {
    cumulative += val;
    return {
      component: `PC${idx + 1}`,
      individual: Number(val.toFixed(2)),
      cumulative: Number(cumulative.toFixed(2))
    };
  });

  return (
    <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-borderSubtle">
        <div>
          <h3 className="text-sm font-bold text-navy-800">PCA Scree Plot (Explained Variance)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual variance captured per component and cumulative retained variance
          </p>
        </div>
        <div className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100 font-semibold">
          PC1 + PC2 Total: {((chartData[1]?.cumulative) || (chartData[0]?.cumulative) || 0).toFixed(2)}%
        </div>
      </div>

      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 12, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="component" tick={{ fill: '#64748B', fontSize: 11 }} />
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              tick={{ fill: '#64748B', fontSize: 11 }}
              unit="%"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-navy-800 text-white p-2.5 rounded-lg text-xs shadow-lg border border-navy-700">
                      <div className="font-bold text-cyan-400 mb-1">{data.component}</div>
                      <div>Individual: <span className="font-mono font-semibold">{data.individual}%</span></div>
                      <div>Cumulative: <span className="font-mono font-semibold text-emerald-300">{data.cumulative}%</span></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
            />
            <Bar
              yAxisId="left"
              dataKey="individual"
              name="Individual Variance %"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cumulative"
              name="Cumulative Variance %"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ fill: '#10B981', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
