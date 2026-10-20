import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, PanResponder, View, Text } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';
import type { Project } from '../domain/model';
import { distance, outlinePoints } from '../domain/geometry';
import { beginCanvasGesture, CanvasGesture, CanvasTouch, fitCanvas, moveCanvasGesture } from '../domain/sketchViewport';
import { Button, colors, fmt, s } from './ui';

export interface OutlinePreview { theta: number; lengthM?: number }
export function OutlineCanvas({ project, preview, fitKey = 0, compact = false, thumbnail = false, unit = 'm', canvasHeight }: {
  project: Project; preview?: OutlinePreview; fitKey?: number; compact?: boolean; thumbnail?: boolean; unit?: 'm' | 'cm'; canvasHeight?: number;
}) {
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
  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, [project.points, project.closed, fitKey, fit]);
  const viewport = useRef({ zoom, pan, width, height }); viewport.current = { zoom, pan, width, height };
  const gestureStart = useRef<CanvasGesture | null>(null);
  const canvas = useRef<View>(null), canvasOrigin = useRef({ x: 0, y: 0 });
  const touches = (items: readonly { pageX: number; pageY: number }[]): CanvasTouch[] => items.slice(0, 2).map(t => ({ x: t.pageX, y: t.pageY }));
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: event => {
      gestureStart.current = beginCanvasGesture(viewport.current, touches(event.nativeEvent.touches));
    },
    onPanResponderMove: event => {
      const points = touches(event.nativeEvent.touches);
      if (!points.length) return;
      if (!gestureStart.current || gestureStart.current.count !== points.length) {
        gestureStart.current = beginCanvasGesture(viewport.current, points); return;
      }
      const next = moveCanvasGesture(gestureStart.current, points, { x: canvasOrigin.current.x + viewport.current.width / 2, y: canvasOrigin.current.y + viewport.current.height / 2 });
      viewport.current = { ...viewport.current, ...next }; setZoom(next.zoom); setPan(next.pan);
    },
    onPanResponderRelease: () => { gestureStart.current = null; },
    onPanResponderTerminate: () => { gestureStart.current = null; },
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
  }), []);
  const screen = (p: { x: number; y: number }) => ({ sx: width / 2 + (p.x - bounds.cx) * bounds.scale * zoom + pan.x,
    sy: height / 2 - (p.y - bounds.cy) * bounds.scale * zoom + pan.y });
  const points = outlinePoints(project.points, project.closed).map(p => ({ ...p, ...screen(p) }));
  const path = project.closed ? [...points, points[0]!] : points;
  const draft = endpoint && screen(endpoint), start = points.at(-1)!;
  const label = (length: number) => `${fmt(length * (unit === 'cm' ? 100 : 1), 2)} ${unit}`;
  return <View style={{ gap: 8 }}>
    {!thumbnail && <View style={s.row}><Text style={[s.label, { flex: 1 }]}>Szkic na żywo</Text>
      {!(compact && keyboardOpen) && <>
      <Button label="−" secondary onPress={() => setZoom(v => Math.max(0.1, v / 1.4))} />
      <Button label="+" secondary onPress={() => setZoom(v => Math.min(20, v * 1.4))} />
      <Button label="Dopasuj" secondary onPress={() => setFit(v => v + 1)} /></>}
    </View>}
    <View ref={canvas} {...(thumbnail ? {} : responder.panHandlers)} onLayout={event => {
      setWidth(event.nativeEvent.layout.width);
      canvas.current?.measureInWindow((x, y) => { canvasOrigin.current = { x, y }; });
    }} onTouchStart={() => canvas.current?.measureInWindow((x, y) => { canvasOrigin.current = { x, y }; })}
      style={{ backgroundColor: colors.bg, borderRadius: thumbnail ? 10 : 18, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} accessible={!thumbnail} accessibilityLabel="Szkic obrysu z numerami punktów i roboczym bokiem">
        {Array.from({ length: Math.ceil(Math.max(width, height) / 25) + 1 }, (_, i) => <G key={i}>
          <Line x1={i * 25} y1={0} x2={i * 25} y2={height} stroke={colors.line} />
          <Line x1={0} y1={i * 25} x2={width} y2={i * 25} stroke={colors.line} /></G>)}
        <Polyline points={points.map(p => `${p.sx},${p.sy}`).join(' ')} fill={project.closed ? '#DDEFE580' : 'none'} stroke={colors.green} strokeWidth={2.5} />
        {project.closed && points.length >= 3 && <Line x1={points.at(-1)!.sx} y1={points.at(-1)!.sy}
          x2={points[0]!.sx} y2={points[0]!.sy} stroke={colors.green} strokeWidth={2.5}
          strokeDasharray={project.closureObservationId || points.length < project.points.length ? undefined : '3 4'} />}
        {points.map((p, i) => <G key={p.id}><Circle cx={p.sx} cy={p.sy} r={5} fill={colors.green} stroke="white" strokeWidth={2} />
          <SvgText x={p.sx + 9} y={p.sy - 9} fill={colors.ink} fontSize={13} fontWeight="bold">P{i + 1}</SvgText></G>)}
        {!thumbnail && path.slice(1).map((p, i) => { const a = path[i]!; return <SvgText key={`${a.id}-${p.id}`} x={(a.sx + p.sx) / 2}
          y={(a.sy + p.sy) / 2 - 14} textAnchor="middle" fill={colors.green} fontSize={11}>{label(distance(a, p))}</SvgText>; })}
        {draft && <G>
          <Line x1={start.sx} y1={start.sy} x2={draft.sx} y2={draft.sy} stroke={colors.green} strokeWidth={2.5} strokeDasharray="7 5" />
          {preview?.lengthM === undefined ? <G transform={`translate(${draft.sx},${draft.sy}) rotate(${-preview!.theta * 180 / Math.PI})`}>
            <Polyline points="-11,-6 0,0 -11,6" fill="none" stroke={colors.green} strokeWidth={2.5} />
          </G> : <><Circle cx={draft.sx} cy={draft.sy} r={6} fill="white" stroke={colors.green} strokeWidth={2} />
            <SvgText x={draft.sx + 9} y={draft.sy - 9} fill={colors.ink} fontSize={13}>P{points.length + 1}</SvgText></>}
          {!thumbnail && <SvgText x={(start.sx + draft.sx) / 2} y={(start.sy + draft.sy) / 2 - 14} textAnchor="middle" fill={colors.green} fontSize={12}>
            {preview?.lengthM === undefined ? 'kierunek' : label(preview.lengthM)}</SvgText>}
        </G>}
      </Svg>
    </View>
    {!thumbnail && !(compact && keyboardOpen) && <Text style={s.muted}>{draft ? 'Linia przerywana: pomiar przed zapisem.' : 'Zapisane boki: linia ciągła.'} {!compact && 'Przesuwaj palcem; zbliżaj lub rozsuwaj dwa palce, aby zmienić skalę.'}</Text>}
  </View>;
}
