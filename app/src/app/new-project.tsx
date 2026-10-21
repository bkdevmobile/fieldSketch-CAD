import { t } from '../i18n';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, HardDrive, Settings2 } from 'lucide-react-native';
import { Button, Field, Page, s, colors } from '../components/ui';
import { newProject } from '../domain/model';
import { useStore } from '../infrastructure/store';
import { BrandMark } from '../components/Brand';
import { canCreateProject } from '../domain/access';
import { usePlusOffer } from '../components/PlusOffer';

export default function NewProject() {
  const store = useStore(); const [name, setName] = useState('');
  const plus = usePlusOffer();
  const preferred = store.settings.directionMode;
  const effectiveMode = preferred === 'manual' || store.capabilities?.[preferred] ? preferred : 'manual';
  const create = () => store.run(async () => {
    if (!name.trim()) throw new Error(t("Podaj nazwę szkicu."));
    if (!store.repo) throw new Error(t("Baza nie jest jeszcze gotowa."));
    if (!canCreateProject((await store.repo.list()).length, store.plan)) { plus.projectLimit(() => router.replace('/')); return; }
    const project = newProject(name, effectiveMode);
    await store.repo.save(project, 'create', store.plan); await store.refresh();
    router.replace({ pathname: '/project', params: { id: project.id } });
  });
  return <Page title={t("Nowy szkic")} subtitle={t("Zacznij od nazwy")} footer={
    <Button label={t("Utwórz szkic")} iconEnd={ArrowRight} onPress={create} disabled={store.busy || !store.repo || !name.trim()} />}>
    {plus.offer}
    <View style={s.card}><Field label={t("Nazwa szkicu")} value={name} onChangeText={setName} placeholder={t("np. Ogród za domem")} />
      <View style={s.row}><HardDrive size={16} color={colors.muted} accessible={false} /><Text style={s.muted}>{t("Szkic zostanie zapisany na telefonie.")}</Text></View></View>
    <View style={{ gap: 16, paddingTop: 8 }}><View style={s.row}><BrandMark size={24} /><Text style={s.h2}>{t("Gotowy do pomiaru")}</Text></View>
      <View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.muted}>{t("Kierunek")}</Text><Text style={s.text}>{{ relative: t("Względny"), manual: t("Ręczny"), magnetic: t("Magnetyczny") }[effectiveMode]}</Text></View>
      <View style={[s.row, { justifyContent: 'space-between' }]}><Text style={s.muted}>{t("Długość kroku")}</Text><Text style={s.text}>{store.settings.stepLengthCm} cm</Text></View>
      <Button label={t("Zmień ustawienia")} icon={Settings2} quiet align="start" onPress={() => router.push('/settings')} />
    </View>
  </Page>;
}
