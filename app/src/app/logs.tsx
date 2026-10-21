import { t, formatDate } from '../i18n';
import React, { useCallback, useState } from 'react';
import { BackHandler, Pressable, Text, View } from 'react-native';
import { useDialogs } from '../components/overlays';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Button, colors, fmt, Page, s } from '../components/ui';
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Download, FileText, RefreshCw, Trash2 } from 'lucide-react-native';
import { Badge } from '../components/presentation';
import { CSV_HEADER, csvRecord } from '../domain/logs';
import { LogSession, orientation, Snapshot } from '../infrastructure/native';
import { useStore } from '../infrastructure/store';
const statusName: Record<string, string> = { running: 'aktywna', complete: 'zakończona', interrupted: 'przerwana' };
export default function Logs() {
  const Alert = useDialogs();
  const { projectId } = useLocalSearchParams<{ projectId?: string }>(); const store = useStore();
  const [logs, setLogs] = useState<LogSession[]>([]); const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [text, setText] = useState(''); const [part, setPart] = useState(0);
  const refresh = async () => setLogs((await orientation().listLogs()).filter(l => !projectId || l.projectId === projectId));
  useFocusEffect(useCallback(() => { store.run(refresh); }, [projectId]));
  useFocusEffect(useCallback(() => {
    if (!snapshot) return;
    const back = BackHandler.addEventListener('hardwareBackPress', () => { setSnapshot(null); setText(''); return true; });
    return () => back.remove();
  }, [snapshot]));
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
    const header = snapshot.parts > 1 ? t("outlineGo | sesja {0} | część {1}/{2} | rekordy {3}–{4}\n", [snapshot.sessionId, part + 1, snapshot.parts, first, last]) : '';
    const ok = await Clipboard.setStringAsync(header + data);
    if (!ok) throw new Error(t("Nie udało się skopiować loga. Spróbuj ponownie lub wyeksportuj plik."));
    Alert.alert(t("Skopiowano log"), snapshot.parts > 1 ? t("Część {0} z {1}. Skopiuj także pozostałe części.", [part + 1, snapshot.parts]) : t("Pełna treść migawki znajduje się w schowku."));
  });
  const exportLog = (csv: boolean) => store.run(async () => {
    if (!snapshot) return;
    if (!await Sharing.isAvailableAsync()) throw new Error(t("Udostępnianie plików jest niedostępne. Użyj kopiowania."));
    if (!csv) { await Sharing.shareAsync(snapshot.uri, { mimeType: 'application/x-ndjson', dialogTitle: t("Eksport loga JSONL") }); return; }
    const file = new File(Paths.cache, `outlinego-${snapshot.sessionId}.csv`);
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
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: t("Eksport loga CSV") });
  });
  const remove = (log: LogSession) => Alert.alert(t("Usunąć log?"), t("Geometria szkicu pozostanie bez zmian."), [
    { text: t("Anuluj"), style: 'cancel' }, { text: t("Usuń"), style: 'destructive', onPress: () => store.run(async () => {
      await orientation().deleteLog(log.id); setSnapshot(null); setText(''); await refresh();
    }) },
  ]);
  return <Page title={snapshot ? t("Migawka loga") : t("Logi pomiarowe")} subtitle={t("Zapisane na telefonie. Dostępne bez internetu.")}
    resetKey={snapshot?.token} footer={snapshot && <>
      <Button label={snapshot.parts > 1 ? t("Kopiuj część {0}", [part + 1]) : t("Kopiuj treść loga")} icon={Copy} onPress={copy} disabled={store.busy} />
      <View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Button label={t("Pełny JSONL")} icon={Download} secondary disabled={store.busy} onPress={() => exportLog(false)} /></View>
        <View style={{ flex: 1 }}><Button label={t("Pełny CSV")} icon={Download} secondary disabled={store.busy} onPress={() => exportLog(true)} /></View></View>
    </>}>
    {!snapshot && <><Button label={t("Odśwież listę sesji")} icon={RefreshCw} quiet disabled={store.busy} onPress={() => store.run(refresh)} />
    {!logs.length && <Text style={s.muted}>{t("Brak logów. Rozpocznij sesję w projekcie, aby zarejestrować pierwszą próbę.")}</Text>}
    {logs.map(log => <View style={s.card} key={log.id}>
      <Text style={s.h2}>{store.projects.find(p => p.id === log.projectId)?.name ?? t("Sesja pomiarowa")}</Text>
      <Text style={s.muted}>{formatDate(log.createdAt, true)}</Text>
      <View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.muted}>{t(statusName[log.status] ?? log.status)}</Text><Text style={s.muted}>{fmt(log.bytes / 1024)} KiB</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ flex: 1 }}><Button label={t("Otwórz migawkę")} icon={FileText} secondary onPress={() => open(log)} disabled={store.busy} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel={t("Usuń sesję logów")} disabled={store.busy || log.status === 'running'} accessibilityState={{ disabled: store.busy || log.status === 'running' }} onPress={() => remove(log)}
          style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center', opacity: store.busy || log.status === 'running' ? 0.4 : 1 }}><Trash2 size={20} color={colors.muted} /></Pressable></View>
    </View>)}</>}
    {snapshot && <>
      <Button label={t("Wróć do listy sesji")} icon={ArrowLeft} quiet align="start" onPress={() => { setSnapshot(null); setText(''); }} />
      <Badge label={t("Część {0} z {1}", [part + 1, snapshot.parts])} icon={FileText} />
      <Text style={s.muted}>{t("Migawka sesji")}{' '}{snapshot.sessionId}{t(". Nowe próbki nie zmieniają jej treści.")}</Text>
      {snapshot.parts > 1 && <View style={s.row}><Button label={t("Poprzednia część")} icon={ChevronLeft} secondary disabled={part === 0 || store.busy} onPress={() => page(part - 1)} />
        <Button label={t("Następna część")} iconEnd={ChevronRight} secondary disabled={part >= snapshot.parts - 1 || store.busy} onPress={() => page(part + 1)} /></View>}
      <View style={[s.card, { backgroundColor: colors.mint }]}><Text selectable style={{ color: colors.muted, fontFamily: 'monospace', fontSize: 12, lineHeight: 19 }}>{text}</Text></View>
    </>}
  </Page>;
}
