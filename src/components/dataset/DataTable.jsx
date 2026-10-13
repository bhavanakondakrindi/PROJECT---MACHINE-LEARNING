import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Hash, Tag, Clock } from 'lucide-react';
import Badge from '../common/Badge';

export default function DataTable({ rows = [], features = [], totalRows = 0 }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-borderSubtle p-8 text-center text-slate-400 text-xs">
        No preview rows available in memory.
      </div>
    );
  }

  const columns = Object.keys(rows[0] || {});

  // Simple client search filter on preview rows
  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some(val => String(val).toLowerCase().includes(term));
  });

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  const getColIcon = (col) => {
    if (col === 'timestamp') return <Clock className="w-3 h-3 text-slate-400" />;
    if (col === 'road_segment_id' || col === 'label') return <Tag className="w-3 h-3 text-purple-400" />;
    return <Hash className="w-3 h-3 text-blue-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle overflow-hidden">
      {/* Controls Header */}
      <div className="p-4 border-b border-borderSubtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-navy-800">Dataset Preview Table</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing sample observations (displaying {filteredRows.length} cached rows of {totalRows.toLocaleString()} total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter preview..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
            />
          </div>

          {/* Page size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-700 font-medium"
          >
            <option value={10}>10 rows</option>
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="p-3 w-12 text-slate-400">#</th>
              {columns.map((col) => (
                <th key={col} className="p-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {getColIcon(col)}
                    <span>{col}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {paginatedRows.map((row, idx) => {
              const rowNum = page * pageSize + idx + 1;
              return (
                <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                  <td className="p-3 text-slate-400 font-sans">{rowNum}</td>
                  {columns.map((col) => {
                    const val = row[col];
                    if (col === 'label') {
                      return (
                        <td key={col} className="p-3 whitespace-nowrap font-sans">
                          <Badge label={String(val)} />
                        </td>
                      );
                    }
                    const isNeg = typeof val === 'number' && val < 0;
                    return (
                      <td
                        key={col}
                        className={`p-3 whitespace-nowrap ${
                          isNeg ? 'text-amber-700 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {typeof val === 'number' ? val.toFixed(2) : String(val ?? '')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          Page <strong className="text-navy-800">{page + 1}</strong> of{' '}
          <strong className="text-navy-800">{totalPages}</strong>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
