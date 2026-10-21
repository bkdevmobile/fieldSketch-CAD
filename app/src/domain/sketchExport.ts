import { placeLabels } from './labelLayout';
import { formatNumber, t } from '../i18n';
import { distance, metrics, outlinePoints } from './geometry';
import type { Project } from './model';
import { FREE_WATERMARK, Plan } from './access';

export function wrapExportText(input: string, maxCharacters = 72): string[] {
  return input.split(/\r?\n/).flatMap(paragraph => {
    const lines: string[] = [];
    let line = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && Array.from(line + ' ' + word).length > maxCharacters) { lines.push(line); line = ''; }
      let remaining = Array.from(word);
      while (remaining.length > maxCharacters) {
        lines.push(remaining.slice(0, maxCharacters).join('')); remaining = remaining.slice(maxCharacters);
      }
      const tail = remaining.join('');
      if (tail) line += (line ? ' ' : '') + tail;
    }
    if (line || !lines.length) lines.push(line);
    return lines;
  });
}

export function sketchExport(project: Project, plan: Plan = 'free') {
  const width = 1080, rowHeight = 54, margin = 64, contentWidth = width - 2 * margin;
  const vertices = outlinePoints(project.points, project.closed);
  const measuredReturn = vertices.length < project.points.length;
  const edges = project.points.slice(1).map((p, i) => ({ from: i + 1, to: i + 2, lengthM: distance(project.points[i]!, p),
    source: project.observations.find(o => o.id === project.activeObservationIds[i])?.lengthSource === 'manual' ? t("ręczny") : t("kroki") }));
  if (measuredReturn) edges.at(-1)!.to = 1;
  if (project.closed && project.points.length > 2 && !measuredReturn) edges.push({ from: project.points.length, to: 1,
    lengthM: distance(project.points.at(-1)!, project.points[0]!), source: t("wyliczony") });
  const noteLines = project.note ? wrapExportText(project.note) : [];
  const watermark = plan === 'plus' ? null : t(FREE_WATERMARK);
  const xs = vertices.map(p => p.x), ys = vertices.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min(856 / Math.max(maxX - minX, 0.01), 1000 / Math.max(maxY - minY, 0.01));
  const points = vertices.map((p, i) => ({ id: p.id, label: 'P' + (i + 1),
    x: (p.x - minX) * scale, y: (maxY - p.y) * scale }));
  if (points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error(t("Nie można przedstawić współrzędnych szkicu."));
  const estimated = project.observations.some(o => project.activeObservationIds.includes(o.id) && o.lengthSource !== 'manual');
  const path = project.closed ? [...points, points[0]!] : points;
  const labels = placeLabels(points.map(p => ({ text: p.label, anchor: p, fontSize: 24, kind: 'point' as const })),
    path.slice(1).map((p, i) => [path[i]!, p]), points);
  // Crop to the actual geometry and text, rather than a fixed sheet-sized viewBox.
  const left = Math.min(...points.map(p => p.x - 8), ...labels.map(l => l.box.x)) - 24;
  const top = Math.min(...points.map(p => p.y - 8), ...labels.map(l => l.box.y)) - 24;
  const drawingBounds = { x: left, y: top,
    width: Math.max(...points.map(p => p.x + 8), ...labels.map(l => l.box.x + l.box.width)) + 24 - left,
    height: Math.max(...points.map(p => p.y + 8), ...labels.map(l => l.box.y + l.box.height)) + 24 - top };
  const drawingScale = Math.min(contentWidth / drawingBounds.width, 1280 / drawingBounds.height);
  const drawingHeight = Math.ceil(drawingBounds.height * drawingScale);
  const metadataY = project.name.length > 42 ? 195 : 159;
  const drawingTop = metadataY + 28;
  const drawingTransform = { scale: drawingScale,
    x: margin + (contentWidth - drawingBounds.width * drawingScale) / 2 - drawingBounds.x * drawingScale,
    y: drawingTop - drawingBounds.y * drawingScale };
  const separatorY = drawingTop + drawingHeight + 24;
  const metricLabelY = separatorY + 42, metricValueY = separatorY + 84;
  const tableY = metricValueY + 54, afterTable = tableY + Math.ceil(edges.length / 2) * rowHeight;
  const noteTitleY = afterTable, noteY = noteTitleY + 34;
  const footerY = noteLines.length ? noteY + noteLines.length * 30 + 24 : afterTable + 12;
  const values = metrics(project);
  const footerLines = [
    estimated ? t("Długości pochodzące z kroków są szacunkowe.") : t("Długości boków wpisane ręcznie."),
    values.intersects ? t("Samoprzecięcie obrysu — pole niedostępne.") : project.closed && !project.closureObservationId && !measuredReturn
      ? t("Przerywany bok zamykający jest wyliczony.") : t("Szkic pomocniczy."),
    values.closure ? t("Błąd zamknięcia: {0} m", [formatNumber(values.closure.norm, 3)]) : t("Brak niezależnego pomiaru zamknięcia."),
  ].flatMap(line => wrapExportText(line));
  const contentHeight = footerY + (footerLines.length - 1) * 32 + 48;
  const height = contentHeight + (watermark ? 64 : 0);
  return { labels, drawingBounds, drawingTransform, drawingTop, drawingHeight, metadataY, separatorY, metricLabelY, metricValueY,
    noteLines, noteTitleY, noteY, footerLines, footerY, width, height, contentHeight, watermark, points, edges, estimated,
    measuredReturn, metrics: values, tableY, rowHeight };
}
