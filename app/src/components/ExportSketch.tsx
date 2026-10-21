import { t } from '../i18n';
import React, { forwardRef } from 'react';
import Svg, { Circle, G, Line, Polyline, Rect, Text } from 'react-native-svg';
import type { Project } from '../domain/model';
import { sketchExport } from '../domain/sketchExport';
import { fmt } from './ui';
import { BrandGraphic } from './Brand';
import type { Plan } from '../domain/access';

export const ExportSketch = forwardRef<Svg, { project: Project; displayWidth: number; plan?: Plan }>(function ExportSketch({ project, displayWidth, plan = 'free' }, ref) {
  const drawing = sketchExport(project, plan);
  return <Svg ref={ref} width={displayWidth} height={displayWidth * drawing.height / drawing.width}
    viewBox={`0 0 ${drawing.width} ${drawing.height}`} accessibilityLabel={t("Podgląd obrazu PNG ze szkicem i tabelą wymiarów")}>
    <Rect x="0" y="0" width={drawing.width} height={drawing.height} fill="#FFFFFF" />
    <G transform="translate(60 24) scale(0.38)"><BrandGraphic /></G>
    <Text x="122" y="62" fontSize="30" fill="#183A2C" fontWeight="bold">outlineGo</Text>
    <Text x="64" y="119" fontSize="34" fill="#142B28" fontWeight="bold">{project.name.slice(0, 42)}</Text>
    {project.name.length > 42 && <Text x="64" y="155" fontSize="28" fill="#142B28">{project.name.slice(42, 92)}{project.name.length > 92 ? '…' : ''}</Text>}
    <Text x="64" y="195" fontSize="22" fill="#52665C">{project.closed ? t("Obrys zamknięty") : t("Obrys otwarty")} · {drawing.points.length}{' '}{t("punktów · wymiary w metrach")}</Text>
    <Svg x={64} y={215} width={952} height={500} viewBox={[drawing.drawingBounds.x, drawing.drawingBounds.y, drawing.drawingBounds.width, drawing.drawingBounds.height].join(' ')}>
    <Polyline points={drawing.points.map(p => `${p.x},${p.y}`).join(' ')} fill={project.closed ? '#EDF4EF' : 'none'} stroke="#235B43" strokeWidth="4" />
    {project.closed && <Line x1={drawing.points.at(-1)!.x} y1={drawing.points.at(-1)!.y}
      x2={drawing.points[0]!.x} y2={drawing.points[0]!.y} stroke="#235B43" strokeWidth="4" strokeDasharray={project.closureObservationId || drawing.measuredReturn ? undefined : '8 7'} />}
    {drawing.points.map(p => <Circle key={p.id} cx={p.x} cy={p.y} r="7" fill="#235B43" />)}
    {drawing.labels.map((l, i) => <Text key={i} x={l.box.x + 5} y={l.box.y + 4 + l.fontSize} fontSize={l.fontSize} fontWeight="bold" fill="#142B28">{l.text}</Text>)}
    </Svg>
    {!!drawing.noteLines.length && <Text x="64" y={drawing.noteY - 30} fontSize="22" fontWeight="bold" fill="#142B28">{t("Notatka do szkicu")}</Text>}
    {drawing.noteLines.map((line, i) => <Text key={'note-' + i} x="64" y={drawing.noteY + i * 30} fontSize="22" fill="#52665C">{line}</Text>)}
    <Line x1="64" x2="1016" y1="735" y2="735" stroke="#D9E2D9" />
    <Text x="64" y="778" fontSize="22" fill="#52665C">{project.closed ? t("Obwód") : t("Długość trasy")}</Text>
    <Text x="64" y="825" fontSize="34" fontWeight="bold" fill="#142B28">{fmt(drawing.metrics.perimeter, 2)} m</Text>
    <Text x="565" y="778" fontSize="22" fill="#52665C">{t("Pole")}</Text>
    <Text x="565" y="825" fontSize="34" fontWeight="bold" fill="#142B28">{drawing.metrics.area === null ? t("Niedostępne") : `${fmt(drawing.metrics.area, 2)} m²`}</Text>
    {drawing.edges.map((edge, i) => {
      const x = i % 2 ? 565 : 64, y = drawing.tableY + Math.floor(i / 2) * drawing.rowHeight;
      return <G key={i}><Text x={x} y={y} fontSize="22" fill="#142B28">P{edge.from}{t("–P")}{edge.to}: {fmt(edge.lengthM, 2)} m</Text>
        <Text x={x + 290} y={y} fontSize="19" fill="#52665C">{edge.source}</Text></G>;
    })}
    <Text x="64" y={drawing.contentHeight - 136} fontSize="22" fill="#52665C">{drawing.estimated ? t("Długości pochodzące z kroków są szacunkowe.") : t("Długości boków wpisane ręcznie.")}</Text>
    <Text x="64" y={drawing.contentHeight - 97} fontSize="22" fill="#52665C">{drawing.metrics.intersects ? t("Samoprzecięcie obrysu — pole niedostępne.") : project.closed && !project.closureObservationId && !drawing.measuredReturn ? t("Przerywany bok zamykający jest wyliczony.") : t("Szkic pomocniczy.")}</Text>
    <Text x="64" y={drawing.contentHeight - 58} fontSize="20" fill="#52665C">{drawing.metrics.closure ? t("Błąd zamknięcia: {0} m", [fmt(drawing.metrics.closure.norm, 3)]) : t("Brak niezależnego pomiaru zamknięcia.")}</Text>
    {drawing.watermark && <G><Rect x="0" y={drawing.contentHeight} width={drawing.width} height="64" fill="#E7EEE2" />
      <Text x={drawing.width / 2} y={drawing.contentHeight + 41} textAnchor="middle" fontSize="24" fill="#183A2C">{drawing.watermark}</Text></G>}
  </Svg>;
});
