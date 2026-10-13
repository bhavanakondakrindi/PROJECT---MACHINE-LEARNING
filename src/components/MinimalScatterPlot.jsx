import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

const TRAFFIC_COLORS = {
  'Free-flow': '#16A34A', // Green
  'Moderate': '#2563EB',  // Blue
  'Heavy': '#EA580C',     // Orange
  'Gridlock': '#DC2626',  // Red
  'Unlabeled': '#6B7280'
};

export default function MinimalScatterPlot({
  points = [],
  xKey = 'pca_x',
  yKey = 'pca_y',
  xAxisTitle = 'Dimension 1',
  yAxisTitle = 'Dimension 2',
  plotId = 'scatter-plot',
  height = 540
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !points || points.length === 0) return;

    // Group points by label for clean distinct legend items
    const groups = {};
    const labelOrder = ['Free-flow', 'Moderate', 'Heavy', 'Gridlock', 'Unlabeled'];

    points.forEach((pt) => {
      const lbl = pt.label || 'Unlabeled';
      if (!groups[lbl]) {
        groups[lbl] = { x: [], y: [], text: [] };
      }
      groups[lbl].x.push(pt[xKey]);
      groups[lbl].y.push(pt[yKey]);
      groups[lbl].text.push(
        `${lbl}<br>${xAxisTitle}: ${pt[xKey]}<br>${yAxisTitle}: ${pt[yKey]}`
      );
    });

    const traces = [];
    labelOrder.forEach((lbl) => {
      if (groups[lbl]) {
        traces.push({
          type: 'scattergl',
          mode: 'markers',
          name: lbl,
          x: groups[lbl].x,
          y: groups[lbl].y,
          text: groups[lbl].text,
          hoverinfo: 'text',
          marker: {
            color: TRAFFIC_COLORS[lbl] || '#6B7280',
            size: points.length > 3000 ? 5 : 6,
            opacity: 0.75,
            line: {
              width: 0.5,
              color: '#FFFFFF'
            }
          }
        });
      }
    });

    const layout = {
      margin: { l: 55, r: 25, t: 25, b: 50 },
      paper_bgcolor: '#FFFFFF',
      plot_bgcolor: '#FAFAFA',
      autosize: true,
      hovermode: 'closest',
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0,
        y: 1.08,
        font: { family: 'Inter, Arial, sans-serif', size: 12, color: '#1F2937' }
      },
      xaxis: {
        title: { text: xAxisTitle, font: { family: 'Inter, Arial, sans-serif', size: 12, color: '#374151' } },
        gridcolor: '#E5E7EB',
        zerolinecolor: '#9CA3AF',
        zerolinewidth: 1,
        tickfont: { family: 'Inter, Arial, sans-serif', size: 11, color: '#4B5563' }
      },
      yaxis: {
        title: { text: yAxisTitle, font: { family: 'Inter, Arial, sans-serif', size: 12, color: '#374151' } },
        gridcolor: '#E5E7EB',
        zerolinecolor: '#9CA3AF',
        zerolinewidth: 1,
        tickfont: { family: 'Inter, Arial, sans-serif', size: 11, color: '#4B5563' }
      }
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d']
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
  }, [points, xKey, yKey, xAxisTitle, yAxisTitle]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-md p-3">
      <div
        ref={containerRef}
        style={{ width: '100%', height: `${height}px` }}
        className="w-full"
      />
    </div>
  );
}
