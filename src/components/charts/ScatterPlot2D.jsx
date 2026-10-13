import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-dist-min';
import { TRAFFIC_COLORS } from '../../utils/constants';
import { Maximize2, RotateCcw, Filter } from 'lucide-react';

export default function ScatterPlot2D({
  points = [],
  xKey = 'pca_x',
  yKey = 'pca_y',
  xAxisTitle = 'Component 1',
  yAxisTitle = 'Component 2',
  title = '2D Projection',
  height = 540
}) {
  const containerRef = useRef(null);
  const [selectedLabels, setSelectedLabels] = useState({
    'Free-flow': true,
    'Moderate': true,
    'Heavy': true,
    'Gridlock': true,
    'Unlabeled': true
  });

  const toggleLabel = (label) => {
    setSelectedLabels(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const resetAllFilters = () => {
    setSelectedLabels({
      'Free-flow': true,
      'Moderate': true,
      'Heavy': true,
      'Gridlock': true,
      'Unlabeled': true
    });
  };

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    // Group points by label for distinct Plotly traces
    const groups = {};
    points.forEach((pt) => {
      const lbl = pt.label || 'Unlabeled';
      if (!selectedLabels[lbl]) return; // filtered out

      if (!groups[lbl]) {
        groups[lbl] = { x: [], y: [], text: [], ids: [] };
      }
      groups[lbl].x.push(pt[xKey]);
      groups[lbl].y.push(pt[yKey]);
      groups[lbl].ids.push(pt.id);
      groups[lbl].text.push(
        `<b>${lbl}</b><br>ID: #${pt.id}<br>${xAxisTitle}: ${pt[xKey]}<br>${yAxisTitle}: ${pt[yKey]}`
      );
    });

    const traces = Object.keys(groups).map((label) => {
      const g = groups[label];
      const color = TRAFFIC_COLORS[label] || TRAFFIC_COLORS.Unlabeled;

      return {
        type: 'scattergl', // High-performance WebGL scatter plot
        mode: 'markers',
        name: label,
        x: g.x,
        y: g.y,
        text: g.text,
        hoverinfo: 'text',
        marker: {
          color: color,
          size: points.length > 3000 ? 5 : 6,
          opacity: 0.72,
          line: {
            width: 0.5,
            color: 'rgba(255, 255, 255, 0.4)'
          }
        }
      };
    });

    const layout = {
      margin: { l: 60, r: 24, t: 36, b: 50 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#FAFCFF',
      autosize: true,
      hovermode: 'closest',
      hoverlabel: {
        bgcolor: '#0F172A',
        bordercolor: '#334155',
        font: { family: 'Inter, sans-serif', size: 12, color: '#FFFFFF' }
      },
      showlegend: false, // We render a custom modern analytical legend above the chart
      xaxis: {
        title: { text: xAxisTitle, font: { family: 'Inter, sans-serif', size: 12, color: '#475569' } },
        gridcolor: '#E2E8F0',
        zerolinecolor: '#94A3B8',
        zerolinewidth: 1.2,
        tickfont: { family: 'Inter, sans-serif', size: 11, color: '#64748B' }
      },
      yaxis: {
        title: { text: yAxisTitle, font: { family: 'Inter, sans-serif', size: 12, color: '#475569' } },
        gridcolor: '#E2E8F0',
        zerolinecolor: '#94A3B8',
        zerolinewidth: 1.2,
        tickfont: { family: 'Inter, sans-serif', size: 11, color: '#64748B' }
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: `${title.toLowerCase().replace(/\s+/g, '_')}_scatter`,
        height: 700,
        width: 1000,
        scale: 2
      }
    };

    Plotly.react(containerRef.current, traces, layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [points, xKey, yKey, xAxisTitle, yAxisTitle, selectedLabels]);

  const handleResetZoom = () => {
    if (containerRef.current) {
      Plotly.relayout(containerRef.current, {
        'xaxis.autorange': true,
        'yaxis.autorange': true
      });
    }
  };

  const activePointsCount = points.filter(p => selectedLabels[p.label || 'Unlabeled']).length;

  return (
    <div className="bg-white rounded-xl border border-borderSubtle shadow-subtle p-5">
      {/* Plot Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-borderSubtle">
        <div>
          <h3 className="text-sm font-bold text-navy-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Displaying <span className="font-semibold text-navy-800">{activePointsCount.toLocaleString()}</span> of{' '}
            <span className="font-medium text-slate-700">{points.length.toLocaleString()}</span> observations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Legend / Filter Toggles */}
          {['Free-flow', 'Moderate', 'Heavy', 'Gridlock'].map(lbl => {
            const isSelected = selectedLabels[lbl];
            const color = TRAFFIC_COLORS[lbl];
            return (
              <button
                key={lbl}
                onClick={() => toggleLabel(lbl)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
                    : 'bg-white border-dashed border-slate-200 text-slate-400 line-through opacity-60'
                }`}
                title={`Toggle ${lbl} visibility`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{lbl}</span>
              </button>
            );
          })}

          <button
            onClick={handleResetZoom}
            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-navy-800 transition-colors ml-1"
            title="Reset Zoom & Pan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Plot Container */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: `${height}px` }}
        className="w-full relative mt-2"
      />
    </div>
  );
}
