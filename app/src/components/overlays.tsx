import { t } from '../i18n';
import React, { createContext, useContext, useRef, useState } from 'react';
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, type LucideIcon } from 'lucide-react-native';
import { Button, colors, s } from './ui';

export function Dialog({ visible, title, subtitle, children, footer, onClose, fullWidth = false }: {
  visible: boolean; title: string; subtitle?: string; children?: React.ReactNode; footer?: React.ReactNode;
  onClose(): void; fullWidth?: boolean;
}) {
  const { height } = useWindowDimensions(); const insets = useSafeAreaInsets();
  return <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
    <View style={[o.backdrop, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12, paddingHorizontal: fullWidth ? 0 : 20 }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t("Zamknij okno")} accessibilityRole="button" />
      <View accessibilityViewIsModal style={[o.dialog, { maxHeight: height - insets.top - insets.bottom - 24 }, fullWidth && { maxWidth: undefined }]}>
        <View style={o.dialogHeader}><View style={{ flex: 1, gap: 4 }}><Text accessibilityRole="header" style={s.h2}>{title}</Text>
          {!!subtitle && <Text style={s.muted}>{subtitle}</Text>}</View>
          <Pressable accessibilityRole="button" accessibilityLabel={t("Zamknij")} onPress={onClose} hitSlop={4} style={o.close}><X size={22} color={colors.ink} /></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={o.dialogBody} bounces={false}>{children}</ScrollView>
        {!!footer && <View style={o.dialogFooter}>{footer}</View>}
      </View>
    </View>
  </Modal>;
}

export interface DialogAction { text: string; style?: 'cancel' | 'destructive' | 'default'; onPress?(): void; icon?: LucideIcon }
interface Request { title: string; message?: string; actions: DialogAction[] }
const DialogContext = createContext<{ alert(title: string, message?: string, actions?: DialogAction[]): void } | null>(null);
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const acting = useRef(false);
  const api = useRef({ alert(title: string, message?: string, actions: DialogAction[] = [{ text: t("OK") }]) {
    Keyboard.dismiss(); setRequests(current => [...current, { title, message, actions }]);
  } }).current;
  const current = requests[0];
  const choose = (action?: DialogAction) => {
    if (acting.current) return;
    acting.current = true;
    setRequests(list => list.slice(1));
    // Close the previous native Modal before an action can present another one.
    setTimeout(() => { acting.current = false; action?.onPress?.(); }, 180);
  };
  const cancel = () => choose(current?.actions.find(a => a.style === 'cancel'));
  return <DialogContext.Provider value={api}>{children}
    <Dialog visible={!!current} title={current?.title ?? ''} onClose={cancel} footer={current && <>
      {[...current.actions.filter(a => a.style !== 'cancel'), ...current.actions.filter(a => a.style === 'cancel')].map((action, i) =>
        <Button key={i} label={action.text} icon={action.icon} danger={action.style === 'destructive'}
          quiet={action.style === 'cancel'} secondary={i > 0 && action.style !== 'destructive'} onPress={() => choose(action)} />)}
    </>}><Text style={s.text}>{current?.message}</Text></Dialog>
  </DialogContext.Provider>;
}
export function useDialogs() { const value = useContext(DialogContext); if (!value) throw new Error('DialogProvider missing'); return value; }

export interface MenuAnchor { x: number; y: number }
export interface MenuItem { label: string; icon?: LucideIcon; danger?: boolean; disabled?: boolean; onPress(): void }
export function PopupMenu({ visible, onClose, anchor, items, title }: {
  visible: boolean; onClose(): void; anchor?: MenuAnchor; items: MenuItem[]; title?: string;
}) {
  const { width, height } = useWindowDimensions(); const insets = useSafeAreaInsets();
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const menuWidth = Math.min(280, width - 24);
  const maxHeight = height - insets.top - insets.bottom - 24;
  const top = Math.max(insets.top + 8, Math.min(anchor?.y ?? insets.top + 48, height - insets.bottom - Math.min(measuredHeight || 220, maxHeight) - 12));
  const left = Math.max(12, Math.min((anchor?.x ?? width - 12) - menuWidth, width - menuWidth - 12));
  const select = (item: MenuItem) => { onClose(); setTimeout(item.onPress, 180); };
  return <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
    <View style={{ flex: 1 }}><Pressable style={[StyleSheet.absoluteFill, { backgroundColor: '#183A2C20' }]}
      onPress={onClose} accessibilityRole="button" accessibilityLabel={t("Zamknij menu")} />
      <View accessibilityViewIsModal onLayout={e => setMeasuredHeight(e.nativeEvent.layout.height)} style={[o.menu, { top, left, width: menuWidth, maxHeight }]}>
        <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
          {!!title && <Text style={[s.label, { padding: 12 }]}>{title}</Text>}
          {items.map(({ label, icon: Icon, danger, disabled, ...item }) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label}
            accessibilityState={{ disabled }} disabled={disabled} onPress={() => select({ label, ...item })}
            style={({ pressed }) => [o.menuItem, { opacity: disabled ? 0.4 : 1, backgroundColor: pressed ? colors.mint : colors.white }]}>
            {Icon && <Icon size={20} color={danger ? '#A13E33' : colors.green} accessible={false} />}
            <Text style={[s.text, { flex: 1, color: danger ? '#A13E33' : colors.ink }]}>{label}</Text>
          </Pressable>)}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}
const o = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#183A2C66' },
  dialog: { width: '100%', maxWidth: 480, backgroundColor: colors.white, borderRadius: 24, overflow: 'hidden', flexShrink: 1, elevation: 8 },
  dialogHeader: { padding: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  dialogBody: { paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
  dialogFooter: { borderTopWidth: 1, borderColor: colors.line, padding: 16, gap: 8 },
  menu: { position: 'absolute', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 6, elevation: 8, overflow: 'hidden' },
  menuItem: { minHeight: 50, flexDirection: 'row', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12 },
});
