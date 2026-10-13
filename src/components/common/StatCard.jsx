import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, badge, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    navy: 'bg-slate-100 text-navy-800'
  };

  return (
    <div className="bg-white rounded-xl border border-borderSubtle p-5 shadow-subtle hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-navy-800">{value}</span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
