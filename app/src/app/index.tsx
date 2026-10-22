import { useTheme, Button, Page } from '../components/ui';
import { t, formatDate } from '../i18n';
import React, { useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { MenuAnchor, PopupMenu, useDialogs } from '../components/overlays';
import { useStore } from '../infrastructure/store';
import { orientation } from '../infrastructure/native';
import { ChevronDown, EllipsisVertical, FolderOpen, Pin, PinOff, Plus, Settings2, Trash2 } from 'lucide-react-native';
import { BrandLogo, BrandMark } from '../components/Brand';
import { canCreateProject } from '../domain/access';
import { usePlusOffer } from '../components/PlusOffer';
export default function Projects() {
  const { colors, s } = useTheme();
  const store = useStore(), dialogs = useDialogs();
  const plus = usePlusOffer();
  const [menu, setMenu] = useState(false), [anchor, setAnchor] = useState<MenuAnchor>();
  const [projectMenu, setProjectMenu] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(3);
  const visibleProjects = store.projects.slice(0, visibleCount);
  const selectedProject = store.projects.find(p => p.id === projectMenu);
  const openProject = (id: string) => router.push({ pathname: '/outline', params: { id } });
  const remove = (id: string) => dialogs.alert(t("Usunąć szkic?"), t('Usunięte zostaną pomiary szkicu.'), [
    { text: t("Anuluj"), style: 'cancel' }, { text: t("Usuń szkic"), icon: Trash2, style: 'destructive', onPress: () => store.run(async () => {
      if (store.sessionProject === id) await store.stop();
      for (const log of await orientation().listLogs()) if (log.projectId === id) await orientation().deleteLog(log.id);
      await store.repo!.remove(id); await store.refresh();
    }) },
  ]);
  return <Page title={t("Pomiary w terenie")} subtitle={t("Twoje szkice, zapisane na telefonie.")} footer={
    <Button label={t("Nowy szkic")} icon={Plus} onPress={() => {
      if (!canCreateProject(store.projects.length, store.plan)) { plus.projectLimit(() => setVisibleCount(Math.max(3, store.projects.length))); return; }
      router.push('/new-project');
    }} disabled={store.busy || !store.repo} />}>
    <Stack.Screen options={{ headerTitle: () => <BrandLogo />, headerRight: () => <Pressable accessibilityRole="button" accessibilityLabel={t("Menu główne")}
      onPress={event => { Keyboard.dismiss(); setAnchor({ x: event.nativeEvent.pageX + 22, y: event.nativeEvent.pageY + 22 }); setMenu(true); }}
      style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
      <EllipsisVertical size={22} strokeWidth={1.8} color={colors.ink} accessible={false} /></Pressable> }} />
    <PopupMenu visible={menu} anchor={anchor} onClose={() => setMenu(false)} items={[
      { label: t('Ustawienia'), icon: Settings2, onPress: () => router.push('/settings') },
      { label: 'outlineGo Plus', icon: Plus, onPress: () => router.push('/plus') },
    ]} />
    <PopupMenu visible={!!selectedProject} anchor={anchor} title={selectedProject?.name} onClose={() => setProjectMenu(null)} items={[
      { label: t("Otwórz"), icon: FolderOpen, disabled: store.busy, onPress: () => { if (selectedProject) openProject(selectedProject.id); } },
      { label: selectedProject?.pinned ? t("Odepnij szkic") : t("Przypnij szkic"), icon: selectedProject?.pinned ? PinOff : Pin, disabled: store.busy,
        onPress: () => store.run(async () => { if (selectedProject) { await store.repo!.updateMetadata(selectedProject.id, { pinned: !selectedProject.pinned }); await store.refresh(); } }) },
      { label: t("Usuń"), icon: Trash2, danger: true, disabled: store.busy, onPress: () => { if (selectedProject) remove(selectedProject.id); } },
    ]} />
    {plus.offer}
    <View style={[s.row, { justifyContent: 'space-between', marginTop: 8 }]}><Text style={s.h2}>{t("Twoje szkice")}</Text><Text style={s.muted}>{store.projects.length}</Text></View>
    {!store.projects.length && <View style={{ alignItems: 'center', gap: 14, paddingVertical: 48 }}><BrandMark size={48} />
      <Text style={s.h2}>{t("Twój pierwszy obrys")}</Text><Text style={s.muted}>{t("Utwórz szkic i zapisz pierwszy punkt.")}</Text></View>}
    {!!visibleProjects.length && <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.white, paddingHorizontal: 14 }}>
      {visibleProjects.map((p, index) => <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: index < visibleProjects.length - 1 ? 1 : 0, borderColor: colors.line }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t("Otwórz szkic {0}", [p.name])} disabled={store.busy}
          onPress={() => openProject(p.id)} style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: 64, paddingVertical: 16,
            flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.65 : 1 })}>
          {p.pinned && <Pin size={16} color={colors.green} accessibilityLabel={t("Przypięty szkic")} />}
          <Text numberOfLines={1} ellipsizeMode="tail" style={[s.text, { flex: 1, fontWeight: '600' }]}>{p.name}</Text>
          <Text numberOfLines={1} style={[s.muted, { flexShrink: 0 }]}>{formatDate(p.updatedAt)}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t("Menu szkicu {0}", [p.name])} disabled={store.busy}
          onPress={event => { Keyboard.dismiss(); setAnchor({ x: event.nativeEvent.pageX + 22, y: event.nativeEvent.pageY + 22 }); setProjectMenu(p.id); }}
          style={({ pressed }) => ({ minWidth: 56, minHeight: 56, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}>
          <EllipsisVertical size={22} strokeWidth={1.8} color={colors.ink} accessible={false} />
        </Pressable>
      </View>)}
    </View>}
    {visibleCount < store.projects.length && <Button label={t("Więcej")} icon={ChevronDown} quiet onPress={() => setVisibleCount(count => count + 10)} />}
  </Page>;
}
