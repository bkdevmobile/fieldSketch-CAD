import { placeLabels } from './labelLayout';
import { t } from '../i18n';
import { distance, metrics, outlinePoints } from './geometry';
import type { Project } from './model';
import { FREE_WATERMARK, Plan } from './access';

export function sketchExport(project: Project, plan: Plan = 'free') {
  const width = 1080, rowHeight = 54;
  const vertices = outlinePoints(project.points, project.closed);
  const measuredReturn = vertices.length < project.points.length;
  const edges = project.points.slice(1).map((p, i) => ({ from: i + 1, to: i + 2, lengthM: distance(project.points[i]!, p),
    source: project.observations.find(o => o.id === project.activeObservationIds[i])?.lengthSource === 'manual' ? t("ręczny") : t("kroki") }));
  if (measuredReturn) edges.at(-1)!.to = 1;
  if (project.closed && project.points.length > 2 && !measuredReturn) edges.push({ from: project.points.length, to: 1,
    lengthM: distance(project.points.at(-1)!, project.points[0]!), source: t("wyliczony") });
  const noteLines = (project.note ?? '').split(/\r?\n/).flatMap(line => line.match(/.{1,72}(?:\s|$)|.{1,72}/gu) ?? ['']);
  if (!project.note) noteLines.length = 0;
  const noteHeight = noteLines.length ? 46 + noteLines.length * 30 : 0;
  const contentHeight = noteHeight + 1120 + Math.ceil(edges.length / 2) * rowHeight;
  const watermark = plan === 'plus' ? null : t(FREE_WATERMARK);
  const height = contentHeight + (watermark ? 64 : 0);
  const xs = project.points.map(p => p.x), ys = project.points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min(840 / Math.max(maxX - minX, 0.01), 440 / Math.max(maxY - minY, 0.01));
  const points = vertices.map((p, i) => ({ id: p.id, label: `P${i + 1}`,
    x: 540 + (p.x - (minX + maxX) / 2) * scale, y: 450 - (p.y - (minY + maxY) / 2) * scale }));
  if (points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error(t("Nie można przedstawić współrzędnych szkicu."));
  const estimated = project.observations.some(o => project.activeObservationIds.includes(o.id) && o.lengthSource !== 'manual');
  const path = project.closed ? [...points, points[0]!] : points;
  const labels = placeLabels(points.map(p => ({ text: p.label, anchor: p, fontSize: 24, kind: 'point' as const })),
    path.slice(1).map((p, i) => [path[i]!, p]), points, { x: 64, y: 215, width: 952, height: 500 });
  const labelMinX = Math.min(64, ...labels.map(l => l.box.x)), labelMinY = Math.min(215, ...labels.map(l => l.box.y));
  const drawingBounds = { x: labelMinX, y: labelMinY, width: Math.max(1016, ...labels.map(l => l.box.x + l.box.width)) - labelMinX,
    height: Math.max(715, ...labels.map(l => l.box.y + l.box.height)) - labelMinY };
  return { labels, drawingBounds, noteLines, noteY: 940 + Math.ceil(edges.length / 2) * rowHeight, width, height, contentHeight, watermark, points, edges, estimated, measuredReturn, metrics: metrics(project), tableY: 890, rowHeight };
}
