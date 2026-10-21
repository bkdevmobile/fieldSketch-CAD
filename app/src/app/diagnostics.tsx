import { t } from '../i18n';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useDialogs } from '../components/overlays';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Field, fmt, Page, s } from '../components/ui';
import { useStore } from '../infrastructure/store';
import { Activity, Check, FileText, Plus, Square } from 'lucide-react-native';
import { Badge, SectionTitle } from '../components/presentation';

export default function Diagnostics() {
  const Alert = useDialogs();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const store = useStore();
  const projectId = id ?? store.sessionProject;
  const project = store.projects.find(p => p.id === projectId);
  const active = !!project && store.sessionProject === project.id && !!store.sessionId;
  const live = active && store.live?.sessionId === store.sessionId ? store.live : null;
  const [notes, setNotes] = useState(''), [reference, setReference] = useState('');
  return <Page title={t("Diagnostyka")} subtitle={project?.name ?? t("Wybierz szkic lub otwórz logi")} compactHeader>
    {project ? <>
      <View style={s.card}><SectionTitle title={t("Sesja i czujniki")} icon={Activity} />
        <Badge label={active ? t("Sesja aktywna") : t("Brak aktywnej sesji")} icon={active ? Check : Square} />
        {live && <><View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.muted}>{t("Rozrzut kierunku")}</Text><Text style={s.text}>{fmt(live.stdDevDeg)}°</Text></View>
          <View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.muted}>{t("Jakość / okno")}</Text><Text style={s.text}>{live.accuracy}/3 · {live.ready ? t("gotowe") : t('stabilizowanie…')}</Text></View></>}
        {active && <Button label={t("Zatrzymaj sesję czujników")} icon={Square} secondary disabled={store.busy} onPress={() => store.run(store.stop)} />}
        <Text style={s.muted}>{t("Zatrzymanie sesji wymaga ponownego przechwycenia kierunku i odtworzenia odniesienia przy powrocie do pomiaru.")}</Text>
      </View>
      <View style={s.card}><Text style={s.h2}>{t("Kontekst próby")}</Text>
        <Field label={t("Otoczenie i uwagi testera")} value={notes} onChangeText={setNotes} />
        <Field label={t("Pomiar odniesienia i metoda")} value={reference} onChangeText={setReference} />
        <Button label={t("Dopisz kontekst do loga")} icon={Plus} disabled={!active || store.busy || (!notes.trim() && !reference.trim())} onPress={() => store.run(async () => {
          await store.log('test_context', { notes, independentReference: reference || null, geometryRevision: project.geometryRevision });
          Alert.alert(t('Zapisano'), t("Kontekst został dodany do loga sesji."));
        })} />
        {!active && <Text style={s.muted}>{t("Aby dopisać kontekst, rozpocznij pomiar w tym projekcie.")}</Text>}
      </View>
      <Button label={t("Logi tego szkicu")} icon={FileText} secondary onPress={() => router.push({ pathname: '/logs', params: { projectId: project.id } })} />
    </> : store.projects.map(p => <Button key={p.id} label={p.name} secondary onPress={() => router.push({ pathname: '/diagnostics', params: { id: p.id } })} />)}
    <Button label={t("Wszystkie logi")} icon={FileText} quiet onPress={() => router.push('/logs')} />
  </Page>;
}
