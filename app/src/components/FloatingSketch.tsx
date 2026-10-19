import React, { useEffect, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Project } from '../domain/model';
import { OutlineCanvas, OutlinePreview } from './OutlineCanvas';
import { Button, colors, s } from './ui';

export function FloatingSketch({ project, preview, fitKey, unit }: {
  project: Project; preview?: OutlinePreview; fitKey: number; unit: 'm' | 'cm';
}) {
  const [expanded, setExpanded] = useState(false), [keyboardOpen, setKeyboardOpen] = useState(Keyboard.isVisible());
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Powiększ szkic" accessibilityHint="Otwiera duży podgląd szkicu"
      onPress={() => { Keyboard.dismiss(); setExpanded(true); }} style={({ pressed }) => ({
        position: 'absolute', right: 14, bottom: 12, width: keyboardOpen ? 132 : 170,
        backgroundColor: colors.white, padding: 8, gap: 6, borderWidth: 1, borderColor: colors.line,
        borderRadius: 14, elevation: 6, shadowColor: colors.ink, shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.16, shadowRadius: 8, opacity: pressed ? 0.8 : 1,
      })}>
      <Text style={[s.label, { fontSize: 12 }]}>Szkic ↗</Text>
      <View pointerEvents="none"><OutlineCanvas project={project} preview={preview} fitKey={fitKey} thumbnail unit={unit} /></View>
    </Pressable>
    <Modal visible={expanded} animationType="slide" onRequestClose={() => setExpanded(false)}>
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={s.page}><Text style={s.h2}>{project.name}</Text>
          <OutlineCanvas project={project} preview={preview} fitKey={fitKey} unit={unit} />
          <Text style={s.muted}>Punkty zapisane: {project.points.length}{preview ? ' · przerywana linia pokazuje bieżący pomiar' : ''}</Text>
        </ScrollView>
        <View style={s.footer}><Button label="Wróć do pomiaru" onPress={() => setExpanded(false)} /></View>
      </SafeAreaView>
    </Modal>
  </>;
}
