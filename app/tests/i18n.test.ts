import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { messages } from '../src/i18n/messages';
import { formatNumber, LANGUAGES, resolveLanguage, setLanguage, t, translateError } from '../src/i18n';
import { commitMeasurement } from '../src/domain/geometry';
import { newProject } from '../src/domain/model';
import { sketchExport } from '../src/domain/sketchExport';
import { dxfExport } from '../src/domain/dxfExport';

const placeholders = (text: string) => [...text.matchAll(/\{\d+\}/g)].map(match => match[0]).sort();
test('all five dictionaries are complete, unique and preserve parameters', () => {
  expect(new Set(messages.map(row => row[0])).size).toBe(messages.length);
  for (const row of messages) {
    expect(row).toHaveLength(5);
    for (const text of row) {
      expect(text.trim().length).toBeGreaterThan(0);
      expect(placeholders(text)).toEqual(placeholders(row[0]));
      expect(text).not.toContain('\uFFFD');
    }
  }
});

test('every literal translation call in the application has a dictionary entry', () => {
  const keys = new Set(messages.map(row => row[0]));
  const missing: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (!/\.tsx?$/.test(file)) continue;
      const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
      function visit(node: ts.Node) {
        if (ts.isCallExpression(node) && node.expression.getText(source) === 't') {
          const key = node.arguments[0];
          if (key && ts.isStringLiteral(key) && !keys.has(key.text)) missing.push(`${entry.name}: ${key.text}`);
        }
        ts.forEachChild(node, visit);
      }
      visit(source);
    }
  }
  walk(path.join(__dirname, '../src'));
  expect(missing).toEqual([]);
});

test('system language resolves regions and ordered supported preferences with English fallback', () => {
  expect(resolveLanguage('system', ['es-MX'])).toBe('es');
  expect(resolveLanguage('system', ['fr_CA'])).toBe('fr');
  expect(resolveLanguage('system', ['it-IT', 'de-DE', 'pl-PL'])).toBe('de');
  expect(resolveLanguage('system', ['ja-JP'])).toBe('en');
  expect(resolveLanguage('system', [])).toBe('en');
  expect(resolveLanguage('pl', ['en-US'])).toBe('pl');
});

test.each(LANGUAGES)('language %s translates exports without changing geometry, names or CAD numbers', language => {
  const project = commitMeasurement(newProject('Zapisz — Casa ąé', 'manual'), { source: 'manual', value: 2.5, unit: 'm' }, 0, 'manual', 's', null);
  const before = JSON.stringify(project);
  setLanguage(language);
  expect(t('Otwórz szkic {0}', [project.name])).toContain(project.name);
  const drawing = sketchExport(project);
  expect(drawing.edges[0]!.source).toBe(t('ręczny'));
  expect(drawing.watermark).toContain('outlineGo');
  expect(drawing.edges[0]!.lengthM).toBe(2.5);
  expect(dxfExport(project)).toContain('\r\n2.5\r\n');
  expect(JSON.stringify(project)).toBe(before);
});

test('number formatting and wrapped native errors use the active language', () => {
  setLanguage('en'); expect(formatNumber(2.5)).toBe('2.5');
  expect(translateError('Call rejected: Brak aktywnej sesji logów')).toBe('No active logging session');
  setLanguage('fr'); expect(formatNumber(2.5)).toBe('2,5');
  expect(translateError('Nieprawidłowa długość.')).toBe('Distance incorrecte.');
  expect(t('unknown diagnostic')).toBe('unknown diagnostic');
});
