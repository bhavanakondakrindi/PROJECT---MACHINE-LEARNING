import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { TRAFFIC_COLORS } from '../../utils/constants';

export default function DistributionChart({ distribution = {}, totalRows = 0 }) {
  const data = Object.keys(distribution).map((label) => {
    const count = distribution[label];
    const percent = totalRows > 0 ? ((count / totalRows) * 100).toFixed(1) : 0;
    return {
      name: label,
      count,
      percent: Number(percent),
      color: TRAFFIC_COLORS[label] || TRAFFIC_COLORS.Unlabeled
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-navy-800 text-white p-2.5 rounded-lg text-xs shadow-lg border border-navy-700">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
          </div>
          <div className="text-slate-300">
            Count: <span className="font-mono text-white font-semibold">{item.count.toLocaleString()}</span>
          </div>
          <div className="text-slate-300">
            Proportion: <span className="font-mono text-cyan-300 font-semibold">{item.percent}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-5">
      <div className="flex items-center justify-between pb-3 border-b border-borderSubtle">
        <div>
          <h3 className="text-sm font-bold text-navy-800">Traffic Condition Distribution</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Class proportions across {totalRows.toLocaleString()} observations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-4">
        {/* Donut Chart */}
        <div className="h-60 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={88}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400 font-medium">Total</span>
            <span className="text-base font-bold text-navy-800">{totalRows.toLocaleString()}</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-800">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-600 font-medium">{item.count.toLocaleString()}</span>
                  <span className="text-xs font-bold text-navy-800 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.percent}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
