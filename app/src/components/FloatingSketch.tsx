import { t } from '../i18n';
﻿import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, PanResponder, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import type { Project } from '../domain/model';
import { clampSketch, cornerPosition, nearestCorner, sketchCorners, SketchCorner } from '../domain/floatingSketch';
import { OutlineCanvas, OutlinePreview } from './OutlineCanvas';
import { Button, colors, s } from './ui';
import { Dialog } from './overlays';
import { ArrowLeft, Maximize2, Move } from 'lucide-react-native';
import { useStore } from '../infrastructure/store';

export function FloatingSketch({ project, preview, fitKey, unit }: {
  project: Project; preview?: OutlinePreview; fitKey: number; unit: 'm' | 'cm';
}) {
  const { settings, rememberUi } = useStore();
  const [expanded, setExpanded] = useState(false), [keyboardOpen, setKeyboardOpen] = useState(Keyboard.isVisible());
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [thumbnail, setThumbnail] = useState({ width: 154, height: 150 });
  const { height } = useWindowDimensions();
  const position = useRef(new Animated.ValueXY()).current;
  const current = useRef({ area, thumbnail, rememberUi }); current.current = { area, thumbnail, rememberUi };
  const corner = useRef<SketchCorner>(settings.sketchCorner ?? 'bottom-right');
  const pendingCorner = useRef<SketchCorner | null>(null);
  const location = useRef({ x: 0, y: 0 }), origin = useRef({ x: 0, y: 0 });
  const suppressTapUntil = useRef(0);
  const snap = (next: SketchCorner, animated = true) => {
    corner.current = next;
    const target = cornerPosition(next, current.current.area, current.current.thumbnail);
    position.stopAnimation();
    if (animated) Animated.spring(position, { toValue: target, useNativeDriver: false, bounciness: 0, speed: 20 }).start();
    else position.setValue(target);
  };
  useEffect(() => {
    const listener = position.addListener(value => { location.current = value; });
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => { position.removeListener(listener); position.stopAnimation(); show.remove(); hide.remove(); };
  }, []);
  useEffect(() => { snap(corner.current, false); }, [area.width, area.height, thumbnail.width, thumbnail.height]);
  useEffect(() => {
    const saved = settings.sketchCorner ?? 'bottom-right';
    if (pendingCorner.current && saved !== pendingCorner.current) return;
    pendingCorner.current = null;
    if (saved !== corner.current) snap(saved, false);
  }, [settings.sketchCorner]);
  const chooseCorner = (next: SketchCorner) => { pendingCorner.current = next; snap(next); void current.current.rememberUi({ sketchCorner: next }); };
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.hypot(gesture.dx, gesture.dy) > 6,
    onPanResponderGrant: () => { position.stopAnimation(); origin.current = { ...location.current }; suppressTapUntil.current = Infinity; },
    onPanResponderMove: (_, gesture) => position.setValue(clampSketch({ x: origin.current.x + gesture.dx, y: origin.current.y + gesture.dy }, current.current.area, current.current.thumbnail)),
    onPanResponderRelease: (_, gesture) => {
      const end = clampSketch({ x: origin.current.x + gesture.dx, y: origin.current.y + gesture.dy }, current.current.area, current.current.thumbnail);
      suppressTapUntil.current = Date.now() + 250;
      chooseCorner(nearestCorner(end, current.current.area, current.current.thumbnail));
    },
    onPanResponderTerminate: () => { suppressTapUntil.current = Date.now() + 250; snap(corner.current); },
    onPanResponderTerminationRequest: () => false,
  }), []);
  const open = () => { if (Date.now() < suppressTapUntil.current) return; Keyboard.dismiss(); setExpanded(true); };
  return <>
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill} onLayout={e => setArea(e.nativeEvent.layout)}>
      <Animated.View {...responder.panHandlers} style={{ position: 'absolute', top: 0, left: 0, transform: position.getTranslateTransform(), opacity: area.width ? 1 : 0 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={t("Powiększ szkic")} accessibilityHint={t("Dotknij, aby powiększyć. Przeciągnij, aby przenieść do innego rogu.")}
          accessibilityActions={[{ name: 'activate', label: t("Powiększ szkic") }, { name: 'move', label: t("Przenieś do następnego rogu") }]}
          onAccessibilityAction={e => { if (e.nativeEvent.actionName === 'move') chooseCorner(sketchCorners[(sketchCorners.indexOf(corner.current) + 1) % 4]!); else open(); }}
          onLayout={e => setThumbnail(e.nativeEvent.layout)} onPress={open} style={({ pressed }) => ({
            width: Math.min(keyboardOpen ? 128 : 154, area.width || 154), backgroundColor: colors.white, padding: 10, gap: 6,
            borderWidth: 1, borderColor: colors.line, borderRadius: 18, elevation: 4, shadowColor: colors.ink,
            shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, opacity: pressed ? 0.8 : 1,
          })}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <Move size={12} color={colors.muted} accessible={false} /><Text style={[s.label, { fontSize: 12, flex: 1 }]}>{t("Szkic")}</Text><Maximize2 size={14} color={colors.green} accessible={false} />
          </View>
          <View pointerEvents="none"><OutlineCanvas project={project} preview={preview} fitKey={fitKey} thumbnail unit={unit} /></View>
        </Pressable>
      </Animated.View>
    </View>
    <Dialog visible={expanded} title={t("Szkic")} subtitle={project.name} fullWidth onClose={() => setExpanded(false)}
      footer={<Button label={t("Wróć do pomiaru")} icon={ArrowLeft} secondary onPress={() => setExpanded(false)} />}>
      <OutlineCanvas project={project} preview={preview} fitKey={fitKey} unit={unit} canvasHeight={Math.min(330, height * 0.43)} />
      <Text style={s.muted}>{t("Punkty zapisane:")}{' '}{project.points.length}{preview ? t(" · przerywana linia pokazuje bieżący pomiar") : ''}</Text>
    </Dialog>
  </>;
}
