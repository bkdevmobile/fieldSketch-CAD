import React, { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Button, fmt, Page, s } from '../components/ui';
import { CSV_HEADER, csvRecord } from '../domain/logs';
import { LogSession, orientation, Snapshot } from '../infrastructure/native';
import { useStore } from '../infrastructure/store';
const statusName: Record<string, string> = { running: 'aktywna', complete: 'zakończona', interrupted: 'przerwana' };
export default function Logs() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>(); const store = useStore();
  const [logs, setLogs] = useState<LogSession[]>([]); const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [text, setText] = useState(''); const [part, setPart] = useState(0);
  const refresh = async () => setLogs((await orientation().listLogs()).filter(l => !projectId || l.projectId === projectId));
  useFocusEffect(useCallback(() => { store.run(refresh); }, [projectId]));
  const open = (log: LogSession) => store.run(async () => {
    const snap = await orientation().snapshotLog(log.id);
    setSnapshot(snap); setPart(0); setText(await orientation().readLogPart(snap.token, 0));
  });
  const page = (index: number) => store.run(async () => {
    if (!snapshot) return; const data = await orientation().readLogPart(snapshot.token, index); setPart(index); setText(data);
  });
  const copy = () => store.run(async () => {
    if (!snapshot) return;
    const data = await orientation().readLogPart(snapshot.token, part);
    const records = data.trim().split('\n').filter(Boolean);
    const first = records[0] ? JSON.parse(records[0]).sequence : '—';
    const last = records.at(-1) ? JSON.parse(records.at(-1)!).sequence : '—';
    const header = snapshot.parts > 1 ? `FieldSketch CAD | sesja ${snapshot.sessionId} | część ${part + 1}/${snapshot.parts} | rekordy ${first}–${last}\n` : '';
    const ok = await Clipboard.setStringAsync(header + data);
    if (!ok) throw new Error('Nie udało się skopiować loga. Spróbuj ponownie lub wyeksportuj plik.');
    Alert.alert('Skopiowano log', snapshot.parts > 1 ? `Część ${part + 1} z ${snapshot.parts}. Skopiuj także pozostałe części.` : 'Pełna treść migawki znajduje się w schowku.');
  });
  const exportLog = (csv: boolean) => store.run(async () => {
    if (!snapshot) return;
    if (!await Sharing.isAvailableAsync()) throw new Error('Udostępnianie plików jest niedostępne. Użyj kopiowania.');
    if (!csv) { await Sharing.shareAsync(snapshot.uri, { mimeType: 'application/x-ndjson', dialogTitle: 'Eksport loga JSONL' }); return; }
    const file = new File(Paths.cache, `fieldsketch-${snapshot.sessionId}.csv`);
    file.create({ overwrite: true });
    const handle = file.open();
    try {
      handle.writeBytes(new TextEncoder().encode(CSV_HEADER));
      for (let index = 0; index < snapshot.parts; index++) {
        const data = await orientation().readLogPart(snapshot.token, index);
        const csvText = data.split('\n').filter(Boolean).map(line => csvRecord(JSON.parse(line))).join('');
        handle.writeBytes(new TextEncoder().encode(csvText));
      }
    } finally { handle.close(); }
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Eksport loga CSV' });
  });
  const remove = (log: LogSession) => Alert.alert('Usunąć log?', 'Geometria projektu pozostanie bez zmian.', [
    { text: 'Anuluj', style: 'cancel' }, { text: 'Usuń', style: 'destructive', onPress: () => store.run(async () => {
      await orientation().deleteLog(log.id); setSnapshot(null); setText(''); await refresh();
    }) },
  ]);
  return <Page title="Logi pomiarowe" subtitle="Zapisane na telefonie. Dostępne także po restarcie i bez internetu.">
    <Button label="Odśwież listę sesji" secondary disabled={store.busy} onPress={() => store.run(refresh)} />
    {!logs.length && <Text style={s.muted}>Brak logów. Rozpocznij sesję w projekcie, aby zarejestrować pierwszą próbę.</Text>}
    {logs.map(log => <View style={s.card} key={log.id}>
      <Text style={s.h2}>{store.projects.find(p => p.id === log.projectId)?.name ?? 'Sesja pomiarowa'}</Text>
      <Text style={s.muted}>{new Date(log.createdAt).toLocaleString('pl-PL')} · {statusName[log.status] ?? log.status} · {fmt(log.bytes / 1024)} KiB</Text>
      <Button label="Otwórz migawkę loga" onPress={() => open(log)} disabled={store.busy} />
      <Button label="Usuń sesję logów" secondary danger disabled={store.busy || log.status === 'running'} onPress={() => remove(log)} />
    </View>)}
    {snapshot && <View style={s.card}><Text style={s.h2}>Treść loga</Text>
      <Text style={s.muted}>Migawka sesji {snapshot.sessionId} · część {part + 1}/{snapshot.parts}. Nowe próbki nie zmieniają tej migawki.</Text>
      <Button label={snapshot.parts > 1 ? `Kopiuj treść loga — część ${part + 1}` : 'Kopiuj treść loga'} onPress={copy} disabled={store.busy} />
      <View style={s.row}><Button label="Poprzednia część" secondary disabled={part === 0 || store.busy} onPress={() => page(part - 1)} />
        <Button label="Następna część" secondary disabled={part >= snapshot.parts - 1 || store.busy} onPress={() => page(part + 1)} /></View>
      <Button label="Eksportuj pełny JSONL" secondary disabled={store.busy} onPress={() => exportLog(false)} />
      <Button label="Eksportuj pełny CSV" secondary disabled={store.busy} onPress={() => exportLog(true)} />
      <Text selectable style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 17 }}>{text}</Text>
    </View>}
  </Page>;
}
