import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, View, Text } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';
import type { Project } from '../domain/model';
import { distance } from '../domain/geometry';
import { Button, colors, fmt, s } from './ui';
export function OutlineCanvas({ project }: { project: Project }) {
  const [zoom, setZoom] = useState(1); const [pan, setPan] = useState({ x: 0, y: 0 });
  const origin = useRef(pan); const width = 320, height = 330;
  const bounds = useMemo(() => {
    const xs = project.points.map(p => p.x), ys = project.points.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, scale: Math.min(240 / Math.max(maxX - minX, 1), 240 / Math.max(maxY - minY, 1)) };
  }, [project.points]);
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { origin.current = pan; },
    onPanResponderMove: (_, gesture) => setPan({ x: origin.current.x + gesture.dx, y: origin.current.y + gesture.dy }),
  }), [pan]);
  const points = project.points.map(p => ({ ...p, sx: width / 2 + (p.x - bounds.cx) * bounds.scale * zoom + pan.x,
    sy: height / 2 - (p.y - bounds.cy) * bounds.scale * zoom + pan.y }));
  const path = project.closed ? [...points, points[0]!] : points;
  return <View style={{ gap: 12 }}>
    <View {...responder.panHandlers} style={{ backgroundColor: '#FBFDF9', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {Array.from({ length: 14 }, (_, i) => <G key={i}><Line x1={i * 25} y1={0} x2={i * 25} y2={height} stroke="#E7ECE4" />
          <Line x1={0} y1={i * 25} x2={width} y2={i * 25} stroke="#E7ECE4" /></G>)}
        <Polyline points={path.map(p => `${p.sx},${p.sy}`).join(' ')} fill={project.closed ? '#DDEFE580' : 'none'} stroke={colors.green} strokeWidth={2.5} />
        {points.map((p, i) => <G key={p.id}><Circle cx={p.sx} cy={p.sy} r={5} fill={colors.green} stroke="white" strokeWidth={2} />
          <SvgText x={p.sx + 9} y={p.sy - 9} fill={colors.ink} fontSize={13} fontWeight="bold">P{i + 1}</SvgText></G>)}
        {path.slice(1).map((p, i) => { const a = path[i]!; return <SvgText key={`${a.id}-${p.id}`} x={(a.sx + p.sx) / 2 + 5}
          y={(a.sy + p.sy) / 2 - 7} fill={colors.green} fontSize={11}>{fmt(distance(a, p) * 100)} cm</SvgText>; })}
      </Svg>
    </View>
    <View style={s.row}><Button label="−" secondary onPress={() => setZoom(v => Math.max(0.1, v / 1.4))} />
      <Button label="+" secondary onPress={() => setZoom(v => Math.min(20, v * 1.4))} />
      <Button label="Dopasuj" secondary onPress={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} /></View>
    <Text style={s.muted}>Przeciągnij szkic, aby przesunąć widok. Przyciski + i − zmieniają skalę.</Text>
  </View>;
}
