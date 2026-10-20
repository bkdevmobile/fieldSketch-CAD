jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: { cache: '/cache' } }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { shareDxf } from '../src/infrastructure/shareDxf';
import { commitMeasurement } from '../src/domain/geometry';
import { newProject } from '../src/domain/model';

const file = { write: jest.fn(), exists: true, size: 100, uri: '/cache/test.dxf' };
beforeEach(() => {
  jest.clearAllMocks(); file.exists = true; file.size = 100;
  jest.mocked(File).mockImplementation(() => file as unknown as File);
  jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
  jest.mocked(Sharing.shareAsync).mockResolvedValue(undefined);
});
const sample = () => commitMeasurement(newProject('Test', 'manual'), { source: 'manual', value: 2, unit: 'm' }, 0, 'manual', 's', null);

test('zapisuje plik DXF w wybranej jednostce i udostępnia go jako plik CAD', async () => {
  const project = sample();
  await shareDxf(project, 'cm');
  expect(File).toHaveBeenCalledWith('/cache', `outlinego-${project.id}-r${project.geometryRevision}-cm.dxf`);
  expect(file.write).toHaveBeenCalledWith(expect.stringContaining('200.00 cm'));
  expect(Sharing.shareAsync).toHaveBeenCalledWith(file.uri, expect.objectContaining({ mimeType: 'image/vnd.dxf', UTI: 'com.autodesk.dxf' }));
});

test('brak udostępniania nie tworzy pliku', async () => {
  jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(false);
  await expect(shareDxf(sample(), 'm')).rejects.toThrow('niedostępne');
  expect(File).not.toHaveBeenCalled();
});

test('nie udostępnia pustego lub niezapisanego pliku', async () => {
  for (const missing of [true, false]) {
    file.exists = !missing; file.size = missing ? 100 : 0;
    await expect(shareDxf(sample(), 'm')).rejects.toThrow('zapisać pliku');
  }
  expect(Sharing.shareAsync).not.toHaveBeenCalled();
});
