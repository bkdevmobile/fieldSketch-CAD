import { t } from '../i18n';
import { distance, outlinePoints } from './geometry';
import type { Project } from './model';

export type DxfUnit = 'm' | 'cm';

// AutoCAD 2000 ASCII DXF. Unicode escapes keep names portable without
// depending on the recipient's legacy code page. Coordinates remain in XY.
function textValue(value: string) {
  return value.replace(/[\r\n\t\x00-\x1f\x7f]/g, ' ').slice(0, 120)
    .replace(/[^\x20-\x7e]|[\\%]/g, char => `\\U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`);
}

export function dxfExport(project: Project, unit: DxfUnit = 'm'): string {
  if (unit !== 'm' && unit !== 'cm') throw new Error(t("Nieobsługiwana jednostka DXF."));
  if (project.points.length < 2) throw new Error(t("Eksport DXF wymaga co najmniej dwóch punktów."));
  const factor = unit === 'cm' ? 100 : 1;
  const vertices = outlinePoints(project.points, project.closed).map(p => ({ ...p, x: p.x * factor, y: p.y * factor }));
  if (vertices.some(p => !Number.isFinite(p.x) || !Number.isFinite(p.y))) throw new Error(t("Nieprawidłowe współrzędne szkicu."));
  const xs = vertices.map(p => p.x), ys = vertices.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const span = Math.max(maxX - minX, maxY - minY);
  if (!Number.isFinite(span) || span <= 0) throw new Error(t("Szkic nie ma poprawnego boku do eksportu."));
  const height = Math.max(span / 55, 0.015 * factor), gap = height * 1.5;
  const tags: string[] = [];
  const pair = (code: number, value: string | number) => {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error(t("Wartość poza zakresem DXF."));
    tags.push(String(code), String(Object.is(value, -0) ? 0 : value));
  };
  let sequence = 0x10;
  const handle = () => (sequence++).toString(16).toUpperCase();
  const model = handle(), paper = handle();
  const section = (name: string) => { pair(0, 'SECTION'); pair(2, name); };
  const end = () => pair(0, 'ENDSEC');
  const point = (x: number, y: number) => { pair(10, x); pair(20, y); pair(30, 0); };
  const entity = (type: string, layer: string, owner = model) => {
    pair(0, type); pair(5, handle()); pair(330, owner); pair(100, 'AcDbEntity'); pair(8, layer);
  };
  const text = (value: string, x: number, y: number, layer: string, rotation = 0, centered = false) => {
    entity('TEXT', layer); pair(100, 'AcDbText'); point(x, y);
    pair(40, height); pair(1, textValue(value)); pair(50, rotation); pair(7, 'STANDARD');
    pair(72, centered ? 1 : 0);
    if (centered) { pair(11, x); pair(21, y); pair(31, 0); }
    pair(100, 'AcDbText'); pair(73, 0);
  };
  section('HEADER');
  pair(9, '$ACADVER'); pair(1, 'AC1015');
  pair(9, '$DWGCODEPAGE'); pair(3, 'ANSI_1252');
  pair(9, '$INSUNITS'); pair(70, unit === 'cm' ? 5 : 6);
  pair(9, '$MEASUREMENT'); pair(70, 1);
  pair(9, '$INSBASE'); point(0, 0);
  pair(9, '$LUNITS'); pair(70, 2);
  pair(9, '$LUPREC'); pair(70, 4);
  end();

  section('TABLES');
  const table = (name: string, count: number) => {
    const id = handle(); pair(0, 'TABLE'); pair(2, name); pair(5, id); pair(330, '0');
    pair(100, 'AcDbSymbolTable'); pair(70, count); return id;
  };
  const record = (type: string, owner: string, subclass: string) => {
    pair(0, type); pair(5, handle()); pair(330, owner);
    pair(100, 'AcDbSymbolTableRecord'); pair(100, subclass);
  };
  const ltypes = table('LTYPE', 3);
  for (const name of ['ByBlock', 'ByLayer', 'CONTINUOUS']) {
    record('LTYPE', ltypes, 'AcDbLinetypeTableRecord'); pair(2, name); pair(70, 0);
    pair(3, ''); pair(72, 65); pair(73, 0); pair(40, 0);
  }
  pair(0, 'ENDTAB');
  const layers = table('LAYER', 5);
  for (const [name, color] of [['0', 7], ['OUTLINE', 7], ['POINT_LABELS', 3], ['LENGTHS', 2], ['NOTES', 8]] as const) {
    record('LAYER', layers, 'AcDbLayerTableRecord'); pair(2, name); pair(70, 0); pair(62, color); pair(6, 'CONTINUOUS');
  }
  pair(0, 'ENDTAB');
  const styles = table('STYLE', 1);
  record('STYLE', styles, 'AcDbTextStyleTableRecord'); pair(2, 'STANDARD'); pair(70, 0);
  pair(40, 0); pair(41, 1); pair(50, 0); pair(71, 0); pair(42, height); pair(3, 'txt'); pair(4, '');
  pair(0, 'ENDTAB');
  const blocks = table('BLOCK_RECORD', 2);
  for (const [name, id] of [['*Model_Space', model], ['*Paper_Space', paper]]) {
    pair(0, 'BLOCK_RECORD'); pair(5, id!); pair(330, blocks);
    pair(100, 'AcDbSymbolTableRecord'); pair(100, 'AcDbBlockTableRecord'); pair(2, name!);
  }
  pair(0, 'ENDTAB'); end();
  section('BLOCKS');
  for (const [name, owner] of [['*Model_Space', model], ['*Paper_Space', paper]] as const) {
    entity('BLOCK', '0', owner); pair(100, 'AcDbBlockBegin'); pair(2, name); pair(70, 0);
    point(0, 0); pair(3, name); pair(1, '');
    entity('ENDBLK', '0', owner); pair(100, 'AcDbBlockEnd');
  }
  end(); section('ENTITIES');
  entity('LWPOLYLINE', 'OUTLINE'); pair(100, 'AcDbPolyline');
  pair(90, vertices.length); pair(70, project.closed ? 1 : 0);
  for (const p of vertices) { pair(10, p.x); pair(20, p.y); }
  vertices.forEach((p, index) => text(`P${index + 1}`, p.x + gap / 2, p.y + gap / 2, 'POINT_LABELS'));
  const measuredReturn = vertices.length < project.points.length;
  const observations = new Map(project.observations.map(o => [o.id, o]));
  for (let i = 0; i < vertices.length - (project.closed ? 0 : 1); i++) {
    const a = vertices[i]!, b = vertices[(i + 1) % vertices.length]!;
    const length = distance(a, b);
    if (length === 0) continue;
    const automatic = project.closed && i === vertices.length - 1 && !measuredReturn;
    const observation = observations.get(project.activeObservationIds[i] ?? '');
    const estimated = !automatic && !!observation && observation.lengthSource !== 'manual';
    let rotation = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    if (rotation > 90) rotation -= 180;
    if (rotation <= -90) rotation += 180;
    const x = (a.x + b.x) / 2 - (b.y - a.y) / length * gap;
    const y = (a.y + b.y) / 2 + (b.x - a.x) / length * gap;
    text(`${estimated ? '~ ' : ''}${length.toFixed(2)} ${unit}${automatic ? ' (auto)' : ''}`, x, y, 'LENGTHS', rotation, true);
  }
  const notes = [`outlineGo - ${project.name}`, t("Układ lokalny XY; jednostka: {0}.", [unit])];
  if (project.activeObservationIds.some(id => observations.get(id)?.lengthSource !== 'manual' && observations.has(id)))
    notes.push(t("~ długość z kroków jest szacunkowa."));
  if (project.closed && !measuredReturn) notes.push(t("(auto) bok zamykający jest wyliczony z punktów."));
  if (project.closureObservationId) notes.push(t("Niezależny pomiar zamknięcia nie koryguje geometrii obrysu."));
  notes.forEach((note, i) => text(note, minX, minY - gap * (i + 2), 'NOTES'));
  end(); pair(0, 'EOF');
  return tags.join('\r\n') + '\r\n';
}
