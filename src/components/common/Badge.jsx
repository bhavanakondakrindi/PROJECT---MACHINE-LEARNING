import React from 'react';
import { TRAFFIC_BG_COLORS } from '../../utils/constants';

export default function Badge({ label, count, percent }) {
  const badgeStyle = TRAFFIC_BG_COLORS[label] || TRAFFIC_BG_COLORS['Unlabeled'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}>
      <span className="w-2 h-2 rounded-full bg-current opacity-80" />
      <span>{label}</span>
      {count !== undefined && <span className="opacity-75 font-normal">({count.toLocaleString()})</span>}
      {percent !== undefined && <span className="opacity-75 font-semibold">{percent}%</span>}
    </span>
  );
}
