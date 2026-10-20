import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Svg from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ExportSketch } from '../components/ExportSketch';
import { Button, Page, s } from '../components/ui';
import { sketchExport } from '../domain/sketchExport';
import { useStore } from '../infrastructure/store';
import { Share2 } from 'lucide-react-native';

export default function Export() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore(), [width, setWidth] = useState(320);
  const image = useRef<Svg>(null);
  const [snapshot, setSnapshot] = useState(() => store.projects.find(p => p.id === id));
  useEffect(() => { if (!snapshot || snapshot.id !== id) setSnapshot(store.projects.find(p => p.id === id)); }, [store.projects, id]);
  if (!snapshot || snapshot.id !== id) return <Page title="Eksport PNG"><Text style={s.text}>Szkic niedostępny.</Text></Page>;
  const drawing = sketchExport(snapshot);
  const share = () => store.run(async () => {
    if (!image.current) throw new Error('Poczekaj na przygotowanie podglądu.');
    if (!await Sharing.isAvailableAsync()) throw new Error('Udostępnianie plików jest niedostępne.');
    const svg = image.current;
    const data = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Nie udało się przygotować PNG. Spróbuj ponownie.')), 15000);
      svg.toDataURL(value => { clearTimeout(timer); value ? resolve(value) : reject(new Error('Pusty obraz PNG.')); }, { width: drawing.width, height: drawing.height });
    });
    const file = new File(Paths.cache, `outlinego-${snapshot.id}-r${snapshot.geometryRevision}.png`);
    file.write(data, { encoding: 'base64' });
    if (!file.exists || file.size === 0) throw new Error('Nie udało się zapisać obrazu PNG.');
    await Sharing.shareAsync(file.uri, { mimeType: 'image/png', dialogTitle: 'Udostępnij szkic PNG' });
  });
  return <Page title="Podgląd PNG" subtitle={snapshot.name} footer={<Button label="Udostępnij PNG" icon={Share2} onPress={share} disabled={store.busy} />}>
    <View style={[s.card, { padding: 10, borderRadius: 8 }]}><View onLayout={event => setWidth(event.nativeEvent.layout.width)}><ExportSketch ref={image} project={snapshot} displayWidth={width} /></View></View>
    <Text style={[s.muted, { textAlign: 'center' }]}>{drawing.width} × {drawing.height} px · szkic i wymiary</Text>
  </Page>;
}
