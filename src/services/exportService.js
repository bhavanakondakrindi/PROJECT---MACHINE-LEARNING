/**
 * Export coordinates and analytical summaries as downloadable CSV or JSON
 */

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportPCACoordinatesCSV(points, filename = 'traffic_pca_coordinates.csv') {
  if (!points || points.length === 0) return;
  const header = 'id,label,pc1,pc2\n';
  const rows = points.map(p => `${p.id},"${p.label || 'Unlabeled'}",${p.pca_x},${p.pca_y}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

export function exportTSNECoordinatesCSV(points, filename = 'traffic_tsne_coordinates.csv') {
  if (!points || points.length === 0) return;
  const header = 'id,label,tsne1,tsne2\n';
  const rows = points.map(p => `${p.id},"${p.label || 'Unlabeled'}",${p.tsne_x},${p.tsne_y}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

export function exportCombinedCoordinatesCSV(points, filename = 'traffic_pca_vs_tsne_coordinates.csv') {
  if (!points || points.length === 0) return;
  const header = 'id,label,pca_pc1,pca_pc2,tsne_dim1,tsne_dim2\n';
  const rows = points.map(p => `${p.id},"${p.label || 'Unlabeled'}",${p.pca_x},${p.pca_y},${p.tsne_x},${p.tsne_y}`).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
}

export function exportAnalysisSummaryJSON(summary, filename = 'traffic_analysis_report.json') {
  const jsonStr = JSON.stringify(summary, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerDownload(blob, filename);
}
