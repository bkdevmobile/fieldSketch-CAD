import React, { useState } from 'react';
import { Keyboard, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Maximize2, PanelRightClose, PanelRightOpen, X } from 'lucide-react-native';
import { t } from '../i18n';
import type { Project } from '../domain/model';
import type { LengthUnit } from '../domain/units';
import { OutlineCanvas, OutlinePreview } from './OutlineCanvas';
import { useTheme } from './ui';

interface SketchProps {
  project: Project; preview?: OutlinePreview; fitKey: number; unit: LengthUnit; floating?: boolean; onToggleDock(): void;
}
export function SketchPanel({ project, preview, fitKey, unit, floating = false, onToggleDock, onExpand }: SketchProps & {
  onExpand(): void;
}) {
  const { colors, s } = useTheme();
  const DockIcon = floating ? PanelRightClose : PanelRightOpen;
  const actionStyle = { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mint } as const;
  return <>
    <View style={{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 6, gap: 6, flexGrow: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        <Text numberOfLines={1} style={[s.label, { flex: 1, fontSize: 11 }]}>{t('Szkic')}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={floating ? t('Zadokuj w treści') : t('Oddokuj jako overlay')} onPress={onToggleDock} style={actionStyle}>
          <DockIcon size={16} color={colors.green} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={t('Powiększ szkic')} onPress={() => { Keyboard.dismiss(); onExpand(); }} style={actionStyle}>
          <Maximize2 size={16} color={colors.green} />
        </Pressable>
      </View>
      <View pointerEvents="none"><OutlineCanvas project={project} preview={preview} fitKey={fitKey} thumbnail unit={unit} canvasHeight={154} /></View>
    </View>
  </>;
}

export function SketchFullscreen({ project, preview, fitKey, unit, floating = false, onToggleDock, visible, onClose }: SketchProps & {
  visible: boolean; onClose(): void;
}) {
  const { colors, s } = useTheme();
  const [height, setHeight] = useState(400);
  const DockIcon = floating ? PanelRightClose : PanelRightOpen;
  const actionStyle = { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mint } as const;
  return <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ flex: 1, gap: 4 }}><Text style={s.h2}>{t('Szkic')}</Text><Text style={s.muted}>{project.name}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={floating ? t('Zadokuj w treści') : t('Oddokuj jako overlay')} onPress={onToggleDock} style={actionStyle}>
            <DockIcon size={16} color={colors.green} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={t('Wróć do pomiaru')} onPress={onClose} style={actionStyle}><X size={16} color={colors.green} /></Pressable>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 16 }} onLayout={event => setHeight(event.nativeEvent.layout.height)}>
          <OutlineCanvas project={project} preview={preview} fitKey={fitKey} unit={unit} canvasHeight={Math.max(120, height - 140)} />
        </View>
      </SafeAreaView>
    </Modal>;
}

export function MeasurementRow({ children, sketch }: { children: React.ReactNode; sketch?: React.ReactNode }) {
  return <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: sketch ? 10 : 0 }}>
    <View style={{ flex: 1, minWidth: 0, gap: 12 }}>{children}</View>
    {sketch && <View style={{ width: '40%', minWidth: 0 }}>{sketch}</View>}
  </View>;
}
