import { SketchPanel } from './SketchPanel';
import { LengthUnit } from '../domain/units';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, PanResponder, StyleSheet, View } from 'react-native';
import type { Project } from '../domain/model';
import { clampSketch, cornerPosition, nearestCorner, sketchCorners, SketchCorner } from '../domain/floatingSketch';
import type { OutlinePreview } from './OutlineCanvas';
import { useStore } from '../infrastructure/store';

export function FloatingSketch({ project, preview, fitKey, unit, onDock, onExpand }: {
  project: Project; preview?: OutlinePreview; fitKey: number; unit: LengthUnit; onDock(): void; onExpand(): void;
}) {
  const { settings, rememberUi } = useStore();
  const [keyboardOpen, setKeyboardOpen] = useState(Keyboard.isVisible());
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [thumbnail, setThumbnail] = useState({ width: 154, height: 150 });
  const position = useRef(new Animated.ValueXY()).current;
  const current = useRef({ area, thumbnail, rememberUi }); current.current = { area, thumbnail, rememberUi };
  const corner = useRef<SketchCorner>(settings.sketchCorner ?? 'bottom-right');
  const pendingCorner = useRef<SketchCorner | null>(null);
  const location = useRef({ x: 0, y: 0 }), origin = useRef({ x: 0, y: 0 });
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
    onPanResponderGrant: () => { position.stopAnimation(); origin.current = { ...location.current }; },
    onPanResponderMove: (_, gesture) => position.setValue(clampSketch({ x: origin.current.x + gesture.dx, y: origin.current.y + gesture.dy }, current.current.area, current.current.thumbnail)),
    onPanResponderRelease: (_, gesture) => {
      const end = clampSketch({ x: origin.current.x + gesture.dx, y: origin.current.y + gesture.dy }, current.current.area, current.current.thumbnail);
      chooseCorner(nearestCorner(end, current.current.area, current.current.thumbnail));
    },
    onPanResponderTerminate: () => { snap(corner.current); },
    onPanResponderTerminationRequest: () => false,
  }), []);
  return <>
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill} onLayout={e => setArea(e.nativeEvent.layout)}>
      <Animated.View {...responder.panHandlers} style={{ position: 'absolute', top: 0, left: 0, transform: position.getTranslateTransform(), opacity: area.width ? 1 : 0 }}>
        <View onLayout={e => setThumbnail(e.nativeEvent.layout)} style={{ width: Math.min(keyboardOpen ? 148 : 164, area.width || 164) }}>
          <SketchPanel project={project} preview={preview} fitKey={fitKey} unit={unit} floating onToggleDock={onDock} onExpand={onExpand} />
        </View>
      </Animated.View>
    </View>

  </>;
}
