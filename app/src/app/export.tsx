import { useTheme, Button, Page } from '../components/ui';
import { t } from '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Svg from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ExportSketch } from '../components/ExportSketch';
import { sketchExport } from '../domain/sketchExport';
import { useStore } from '../infrastructure/store';
import { Share2 } from 'lucide-react-native';
import { usePlusOffer } from '../components/PlusOffer';

export default function Export() {
  const { s } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore(), [width, setWidth] = useState(320);
  const plus = usePlusOffer();
  const image = useRef<Svg>(null);
  const [snapshot, setSnapshot] = useState(() => store.projects.find(p => p.id === id));
  useEffect(() => { if (!snapshot || snapshot.id !== id) setSnapshot(store.projects.find(p => p.id === id)); }, [store.projects, id]);
  if (!snapshot || snapshot.id !== id) return <Page title={t("Eksport PNG")}><Text style={s.text}>{t("Szkic niedostępny.")}</Text></Page>;
  const drawing = sketchExport(snapshot, store.plan, store.settings.unit);
  const share = () => store.run(async () => {
    if (!image.current) throw new Error(t("Poczekaj na przygotowanie podglądu."));
    if (!await Sharing.isAvailableAsync()) throw new Error(t("Udostępnianie plików jest niedostępne."));
    const svg = image.current;
    const data = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(t("Nie udało się przygotować PNG. Spróbuj ponownie."))), 15000);
      svg.toDataURL(value => { clearTimeout(timer); value ? resolve(value) : reject(new Error(t("Pusty obraz PNG."))); }, { width: drawing.width, height: drawing.height });
    });
    const file = new File(Paths.cache, `outlinego-${snapshot.id}-r${snapshot.geometryRevision}-${store.plan}.png`);
    file.write(data, { encoding: 'base64' });
    if (!file.exists || file.size === 0) throw new Error(t("Nie udało się zapisać obrazu PNG."));
    await Sharing.shareAsync(file.uri, { mimeType: 'image/png', dialogTitle: t("Udostępnij szkic PNG") });
  });
  return <Page title={t("Podgląd PNG")} subtitle={snapshot.name} footer={<Button label={t("Udostępnij PNG")} icon={Share2} onPress={share} disabled={store.busy} />}>
    {plus.offer}
    <View style={[s.card, { padding: 10, borderRadius: 8 }]}><View onLayout={event => setWidth(event.nativeEvent.layout.width)}><ExportSketch ref={image} project={snapshot} displayWidth={width} plan={store.plan} unit={store.settings.unit} /></View></View>
    <Text style={[s.muted, { textAlign: 'center' }]}>{drawing.width} × {drawing.height}{' '}{t("px · szkic i wymiary")}</Text>
    {store.plan === 'free' && <Button label={t("PNG bez znaku wodnego · Plus")} secondary disabled={store.busy} onPress={() => plus.show('watermark')} />}
  </Page>;
}
