import { distance, metrics } from './geometry';
import type { Project } from './model';

export function sketchExport(project: Project) {
  const width = 1080, rowHeight = 54;
  const edges = project.points.slice(1).map((p, i) => ({ from: i + 1, to: i + 2, lengthM: distance(project.points[i]!, p),
    source: project.observations.find(o => o.id === project.activeObservationIds[i])?.lengthSource === 'manual' ? 'ręczny' : 'kroki' }));
  if (project.closed && project.points.length > 2) edges.push({ from: project.points.length, to: 1,
    lengthM: distance(project.points.at(-1)!, project.points[0]!), source: 'wyliczony' });
  const height = 1120 + Math.ceil(edges.length / 2) * rowHeight;
  const xs = project.points.map(p => p.x), ys = project.points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min(840 / Math.max(maxX - minX, 0.01), 440 / Math.max(maxY - minY, 0.01));
  const points = project.points.map((p, i) => ({ id: p.id, label: `P${i + 1}`,
    x: 540 + (p.x - (minX + maxX) / 2) * scale, y: 450 - (p.y - (minY + maxY) / 2) * scale }));
  if (points.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error('Nie można przedstawić współrzędnych szkicu.');
  const estimated = project.observations.some(o => project.activeObservationIds.includes(o.id) && o.lengthSource !== 'manual');
  return { width, height, points, edges, estimated, metrics: metrics(project), tableY: 890, rowHeight };
}
