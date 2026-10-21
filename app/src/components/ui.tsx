import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../infrastructure/store';
import type { LucideIcon } from 'lucide-react-native';
import { formatNumber, translateError } from '../i18n';
import { decimalInput } from '../domain/precision';
export const colors = { ink: '#183A2C', muted: '#607267', green: '#1B684B', mint: '#E7EEE2', bg: '#F5F4EE', line: '#DBE4D9', amber: '#8D4D14', white: '#FFFEFA', onGreen: '#FFFFFF', ready: '#177043' };
export function Page({ title, subtitle, children, footer, overlay, heading, resetKey, compactHeader = false }: {
  title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode; overlay?: React.ReactNode; heading?: React.ReactNode; resetKey?: string; compactHeader?: boolean;
}) {
  const { error, busy } = useStore();
  const scroll = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const viewport = useRef<View>(null);
  const container = useRef<View>(null);
  const hasOverlay = !!overlay;
  const keepFocusedInputClear = () => {
    if (!hasOverlay || !Keyboard.isVisible()) return;
    const input = TextInput.State.currentlyFocusedInput();
    if (!input) return;
    viewport.current?.measureInWindow((_, top, __, height) => {
      input.measureInWindow((___, inputTop, ____, inputHeight) => {
        // Leave room for the floating sketch above the fixed footer.
        const safeBottom = top + height - 152;
        const overlap = inputTop + inputHeight + 8 - safeBottom;
        if (overlap > 0) scroll.current?.scrollTo({ y: scrollY.current + overlap, animated: false });
      });
    });
  };
  const insets = useSafeAreaInsets();
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);
  const [keyboardVisible, setKeyboardVisible] = React.useState(Keyboard.isVisible());
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => { setKeyboardVisible(true); requestAnimationFrame(keepFocusedInputClear); });
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, [hasOverlay]);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [resetKey]);
  return <SafeAreaView style={s.safe} edges={['left', 'right', 'bottom']}>
    <View ref={container} style={{ flex: 1 }} onLayout={() => container.current?.measureInWindow((_, y) =>
      setKeyboardOffset(y + (Platform.OS === 'android' ? insets.top : 0)))}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled={keyboardVisible} keyboardVerticalOffset={keyboardOffset}>
    <View ref={viewport} style={{ flex: 1 }}>
    <ScrollView ref={scroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={[s.page, overlay ? { paddingBottom: 200 } : undefined]}
      onScroll={event => { scrollY.current = event.nativeEvent.contentOffset.y; }} scrollEventThrottle={16}
      onLayout={() => requestAnimationFrame(keepFocusedInputClear)}>
    {heading ?? <>
    <Text style={compactHeader ? s.h2 : s.title}>{title}</Text>
    {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}</>}
    {!!error && <View accessibilityRole="alert" style={s.warning}><Text style={s.warningText}>{translateError(error)}</Text></View>}
    {children}
  </ScrollView>
  {busy && <View pointerEvents="none" style={{ position: 'absolute', top: 8, right: 16, padding: 8, borderRadius: 20, backgroundColor: colors.white }}>
    <ActivityIndicator color={colors.green} />
  </View>}
  {overlay}
  </View>
  {footer && <View style={s.footer}>{footer}</View>}
  </KeyboardAvoidingView></View></SafeAreaView>;
}
export function Button({ label, onPress, secondary = false, disabled = false, danger = false, quiet = false, compact = false, align = 'center', icon: Icon, iconEnd: IconEnd }: {
  label: string; onPress(): void; secondary?: boolean; disabled?: boolean; danger?: boolean; quiet?: boolean; compact?: boolean; align?: 'center' | 'start'; icon?: LucideIcon; iconEnd?: LucideIcon;
}) {
  const foreground = danger ? '#963A25' : secondary || quiet ? colors.green : colors.onGreen;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.button, secondary && s.secondary, quiet && s.quiet, compact && s.compactButton, align === 'start' && { justifyContent: 'flex-start', alignSelf: 'flex-start', paddingHorizontal: 0 },
      danger && { backgroundColor: '#F9E6DE' }, (pressed || disabled) && { opacity: disabled ? 0.45 : 0.75 }]}>
    {Icon && <Icon size={18} strokeWidth={1.8} color={foreground} accessible={false} />}
    <Text style={[s.buttonText, { color: foreground }, compact && { fontSize: 14 }]}>{label}</Text>
    {IconEnd && <IconEnd size={18} strokeWidth={1.8} color={foreground} accessible={false} />}
  </Pressable>;
}
export function Field({ label, value, onChangeText, numeric = false, placeholder = '', onEndEditing, disabled = false, decimalPlaces }: {
  label: string; value: string; onChangeText(value: string): void; numeric?: boolean; placeholder?: string; onEndEditing?(): void; disabled?: boolean;
  decimalPlaces?: number;
}) {
  return <View style={{ gap: 7 }}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value}
    onChangeText={text => {
      const next = decimalPlaces === undefined ? text : decimalInput(text, decimalPlaces);
      if (next !== null) onChangeText(next);
    }} onEndEditing={onEndEditing} editable={!disabled} accessibilityState={{ disabled }} placeholder={placeholder} placeholderTextColor={colors.muted}
    keyboardType={numeric ? 'decimal-pad' : 'default'} style={s.input} /></View>;
}
export const fmt = formatNumber;
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, page: { padding: 20, gap: 16, paddingBottom: 36 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 4, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  eyebrow: { fontSize: 11, letterSpacing: 2, color: colors.green, fontWeight: '800' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '600', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.muted },
  card: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 12 },
  measurement: { gap: 14 }, workPanel: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 14 },
  stepTitle: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: colors.ink, letterSpacing: -0.6 },
  measureValue: { fontSize: 30, lineHeight: 38, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'], letterSpacing: -0.5 },
  segment: { flexDirection: 'row', padding: 4, gap: 4, backgroundColor: colors.mint, borderRadius: 16 },
  h2: { fontSize: 18, fontWeight: '600', color: colors.ink }, text: { fontSize: 15, lineHeight: 22, color: colors.ink },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted }, row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  button: { minHeight: 52, minWidth: 52, backgroundColor: colors.green, borderRadius: 14, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  secondary: { backgroundColor: colors.mint }, quiet: { backgroundColor: 'transparent', minHeight: 44, paddingVertical: 8 }, compactButton: { minHeight: 44, paddingHorizontal: 10, paddingVertical: 10 },
  buttonText: { color: colors.onGreen, fontSize: 15, fontWeight: '600', textAlign: 'center', flexShrink: 1 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  input: { minHeight: 52, padding: 14, borderColor: colors.line, borderWidth: 1, borderRadius: 12, backgroundColor: colors.white, color: colors.ink, fontSize: 18 },
  warning: { backgroundColor: '#FFF0D9', padding: 14, borderRadius: 12 }, warningText: { color: colors.amber, lineHeight: 21 },
});
