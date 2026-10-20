import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { dxfExport, DxfUnit } from '../domain/dxfExport';
import type { Project } from '../domain/model';
import { AccessLimitError, Plan } from '../domain/access';

export async function shareDxf(project: Project, unit: DxfUnit, plan: Plan = 'free') {
  if (plan !== 'plus') throw new AccessLimitError('dxf');
  if (!await Sharing.isAvailableAsync()) throw new Error('Udostępnianie plików jest niedostępne.');
  const data = dxfExport(project, unit);
  const file = new File(Paths.cache, `outlinego-${project.id}-r${project.geometryRevision}-${unit}.dxf`);
  file.write(data);
  if (!file.exists || file.size === 0) throw new Error('Nie udało się zapisać pliku DXF.');
  await Sharing.shareAsync(file.uri, { mimeType: 'image/vnd.dxf', UTI: 'com.autodesk.dxf', dialogTitle: 'Udostępnij szkic DXF' });
}
