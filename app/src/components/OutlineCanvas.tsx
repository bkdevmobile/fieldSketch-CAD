import { LengthUnit, fromMetres } from '../domain/units';
import { useTheme, Button, fmt } from './ui';
import { t } from '../i18n';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, PanResponder, View, Text } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import type { Project } from '../domain/model';
import { placeLabels, DrawingLabel } from '../domain/labelLayout';
import { distance, outlinePoints } from '../domain/geometry';
import { beginCanvasGesture, CanvasGesture, CanvasTouch, constrainCanvas, fitCanvas, moveCanvasGesture, nextZoom, scaleCanvas, snapZoom } from '../domain/sketchViewport';

export interface OutlinePreview { theta: number; lengthM?: number }
export function OutlineCanvas({ project, preview, fitKey = 0, compact = false, thumbnail = false, unit = 'm', canvasHeight }: {
  project: Project; preview?: OutlinePreview; fitKey?: number; compact?: boolean; thumbnail?: boolean; unit?: LengthUnit; canvasHeight?: number;
}) {
  const { colors, s } = useTheme();
  const [zoom, setZoom] = useState(1), [pan, setPan] = useState({ x: 0, y: 0 });
  const [width, setWidth] = useState(320), [fit, setFit] = useState(0);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const height = canvasHeight ?? (thumbnail ? keyboardOpen ? 74 : 104 : compact ? keyboardOpen ? 86 : 140 : 330);
  const rawBounds = project.points.reduce((b, p) => ({ minX: Math.min(b.minX, p.x), maxX: Math.max(b.maxX, p.x),
    minY: Math.min(b.minY, p.y), maxY: Math.max(b.maxY, p.y) }),
    { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
  const last = project.points.at(-1)!;
  const vectorLength = Math.max(rawBounds.maxX - rawBounds.minX, rawBounds.maxY - rawBounds.minY, 2) * 0.45;
  const endpoint = preview && !project.closed ? { id: 'preview', x: last.x + Math.cos(preview.theta) * (preview.lengthM ?? vectorLength),
    y: last.y + Math.sin(preview.theta) * (preview.lengthM ?? vectorLength) } : null;
  const hasPreview = !!endpoint;
  // Refit only on committed geometry or an explicit fit event, not every slider movement.
  const bounds = useMemo(() => {
    const points = endpoint ? [...project.points, endpoint] : project.points;
    return fitCanvas(points, width, height, thumbnail);
  }, [project.points, project.closed, fitKey, fit, width, height, thumbnail, hasPreview]);
  const transition = useRef(new Animated.Value(0)).current;
  useEffect(() => { transition.stopAnimation(); setZoom(1); setPan({ x: 0, y: 0 }); }, [bounds]);
  useEffect(() => () => { transition.stopAnimation(); transition.removeAllListeners(); }, []);
  const viewport = useRef({ zoom, pan, width, height }); viewport.current = { zoom, pan, width, height };
  const fittedPoints = (endpoint ? [...project.points, endpoint] : project.points).map(p => ({ x: (p.x - bounds.cx) * bounds.scale, y: -(p.y - bounds.cy) * bounds.scale }));
  const geometry = useRef(fittedPoints); geometry.current = fittedPoints;
  const apply = (value: { zoom: number; pan: CanvasTouch }) => {
    const next = constrainCanvas(value, geometry.current, viewport.current.width, viewport.current.height);
    viewport.current = { ...viewport.current, ...next }; setZoom(next.zoom); setPan(next.pan);
  };
  const focal = useRef({ x: 0, y: 0 });
  const animateZoom = (target: number) => {
    transition.stopAnimation(); transition.removeAllListeners(); transition.setValue(0);
    const start = viewport.current;
    const end = scaleCanvas(start, target, focal.current);
    const listener = transition.addListener(({ value }) => apply({ zoom: start.zoom + (end.zoom - start.zoom) * value,
      pan: { x: start.pan.x + (end.pan.x - start.pan.x) * value, y: start.pan.y + (end.pan.y - start.pan.y) * value } }));
    Animated.timing(transition, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: false })
      .start(() => transition.removeListener(listener));
  };
  const actions = useRef({ apply, animateZoom }); actions.current = { apply, animateZoom };
  const gestureStart = useRef<CanvasGesture | null>(null);
  const canvas = useRef<View>(null), canvasOrigin = useRef({ x: 0, y: 0 });
  const touches = (items: readonly { pageX: number; pageY: number }[]): CanvasTouch[] => items.slice(0, 2).map(t => ({ x: t.pageX, y: t.pageY }));
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: event => {
      transition.stopAnimation();
      gestureStart.current = beginCanvasGesture(viewport.current, touches(event.nativeEvent.touches));
    },
    onPanResponderMove: event => {
      const points = touches(event.nativeEvent.touches);
      if (!points.length) return;
      focal.current = { x: points.reduce((sum, p) => sum + p.x, 0) / points.length - canvasOrigin.current.x - viewport.current.width / 2,
        y: points.reduce((sum, p) => sum + p.y, 0) / points.length - canvasOrigin.current.y - viewport.current.height / 2 };
      if (!gestureStart.current || gestureStart.current.count !== points.length) {
        gestureStart.current = beginCanvasGesture(viewport.current, points); return;
      }
      const next = moveCanvasGesture(gestureStart.current, points, { x: canvasOrigin.current.x + viewport.current.width / 2, y: canvasOrigin.current.y + viewport.current.height / 2 });
      actions.current.apply(next);
    },
    onPanResponderRelease: () => { gestureStart.current = null; actions.current.animateZoom(snapZoom(viewport.current.zoom)); },
    onPanResponderTerminate: () => { gestureStart.current = null; actions.current.animateZoom(snapZoom(viewport.current.zoom)); },
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
  }), []);
  const screen = (p: { x: number; y: number }) => ({ sx: width / 2 + (p.x - bounds.cx) * bounds.scale * zoom + pan.x,
    sy: height / 2 - (p.y - bounds.cy) * bounds.scale * zoom + pan.y });
  const points = outlinePoints(project.points, project.closed).map(p => ({ ...p, ...screen(p) }));
  const path = project.closed ? [...points, points[0]!] : points;
  const draft = endpoint && screen(endpoint), start = points.at(-1)!;
  const label = (length: number) => `${fmt(length * (fromMetres(1, unit)), 3)} ${unit}`;
  const segments: [{ x: number; y: number }, { x: number; y: number }][] = path.slice(1).map((p, i) => [{ x: path[i]!.sx, y: path[i]!.sy }, { x: p.sx, y: p.sy }]);
  if (draft) segments.push([{ x: start.sx, y: start.sy }, { x: draft.sx, y: draft.sy }]);
  const labels: DrawingLabel[] = points.map((p, i) => ({ text: 'P' + (i + 1), anchor: { x: p.sx, y: p.sy }, fontSize: 13, kind: 'point' }));
  if (!thumbnail) path.slice(1).forEach((p, i) => { const a = path[i]!; labels.push({ text: label(distance(a, p)), anchor: { x: (a.sx + p.sx) / 2, y: (a.sy + p.sy) / 2 }, fontSize: 11, kind: 'length' }); });
  if (draft) {
    if (preview?.lengthM !== undefined) labels.push({ text: 'P' + (points.length + 1), anchor: { x: draft.sx, y: draft.sy }, fontSize: 13, kind: 'point' });
    if (!thumbnail) labels.push({ text: preview?.lengthM === undefined ? t("kierunek") : label(preview.lengthM), anchor: { x: (start.sx + draft.sx) / 2, y: (start.sy + draft.sy) / 2 }, fontSize: 12, kind: 'length' });
  }
  // The viewport clips the drawing and its labels together. Constraining labels
  // to its bounds would pull descriptions of offscreen geometry back into view.
  const placed = placeLabels(labels, segments, [...points.map(p => ({ x: p.sx, y: p.sy })), ...(draft ? [{ x: draft.sx, y: draft.sy }] : [])]);
  return <View style={{ gap: 8 }}>
    {!thumbnail && <View style={s.row}><Text style={[s.label, { flex: 1 }]}>{t("Szkic na żywo")}</Text>
      {!(compact && keyboardOpen) && <>
      <Button label="−" secondary disabled={zoom <= 0.5} onPress={() => { focal.current = { x: 0, y: 0 }; animateZoom(nextZoom(viewport.current.zoom, -1)); }} />
      <Button label="+" secondary disabled={zoom >= 8} onPress={() => { focal.current = { x: 0, y: 0 }; animateZoom(nextZoom(viewport.current.zoom, 1)); }} />
      <Button label={t("Dopasuj")} secondary onPress={() => setFit(v => v + 1)} /></>}
    </View>}
    <View ref={canvas} {...(thumbnail ? {} : responder.panHandlers)} onLayout={event => {
      setWidth(event.nativeEvent.layout.width);
      canvas.current?.measureInWindow((x, y) => { canvasOrigin.current = { x, y }; });
    }} onTouchStart={() => canvas.current?.measureInWindow((x, y) => { canvasOrigin.current = { x, y }; })}
      style={{ backgroundColor: colors.bg, borderRadius: thumbnail ? 10 : 18, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessible={!thumbnail} accessibilityLabel={t("Szkic obrysu z numerami punktów i roboczym bokiem")}>
        {Array.from({ length: Math.ceil(Math.max(width, height) / 25) + 1 }, (_, i) => <G key={i}>
          <Line x1={i * 25} y1={0} x2={i * 25} y2={height} stroke={colors.line} />
          <Line x1={0} y1={i * 25} x2={width} y2={i * 25} stroke={colors.line} /></G>)}
        <Polyline points={points.map(p => `${p.sx},${p.sy}`).join(' ')} fill={project.closed ? '#DDEFE580' : 'none'} stroke={colors.green} strokeWidth={2.5} />
        {project.closed && points.length >= 3 && <Line x1={points.at(-1)!.sx} y1={points.at(-1)!.sy}
          x2={points[0]!.sx} y2={points[0]!.sy} stroke={colors.green} strokeWidth={2.5}
          strokeDasharray={project.closureObservationId || points.length < project.points.length ? undefined : '3 4'} />}
        {points.map(p => <Circle key={p.id} cx={p.sx} cy={p.sy} r={5} fill={colors.green} stroke="white" strokeWidth={2} />)}

        {draft && <G>
          <Line x1={start.sx} y1={start.sy} x2={draft.sx} y2={draft.sy} stroke={colors.green} strokeWidth={2.5} strokeDasharray="7 5" />
          {preview?.lengthM === undefined ? <G transform={`translate(${draft.sx},${draft.sy}) rotate(${-preview!.theta * 180 / Math.PI})`}>
            <Polyline points="-11,-6 0,0 -11,6" fill="none" stroke={colors.green} strokeWidth={2.5} />
          </G> : <Circle cx={draft.sx} cy={draft.sy} r={6} fill="white" stroke={colors.green} strokeWidth={2} />}

        </G>}
        {placed.map((l, i) => <G key={'label-' + i}><Rect x={l.box.x} y={l.box.y} width={l.box.width} height={l.box.height} rx={3} fill={colors.bg} opacity={0.95} /><SvgText x={l.box.x + 5} y={l.box.y + 4 + l.fontSize}
          fill={l.kind === 'point' ? colors.ink : colors.green} fontSize={l.fontSize} fontWeight={l.kind === 'point' ? 'bold' : 'normal'}>{l.text}</SvgText></G>)}
      </Svg>
    </View>
    {!thumbnail && !(compact && keyboardOpen) && <Text style={s.muted}>{draft ? t("Linia przerywana: pomiar przed zapisem.") : t("Zapisane boki: linia ciągła.")} {!compact && t("Przesuwaj palcem; zbliżaj lub rozsuwaj dwa palce, aby zmienić skalę.")}</Text>}
  </View>;
}
