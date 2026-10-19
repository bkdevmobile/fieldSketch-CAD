import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../infrastructure/store';
export const colors = { ink: '#142B28', muted: '#60706A', green: '#136B53', mint: '#E4F1EA', bg: '#F5F6F0', line: '#DCE3DB', amber: '#8D4D14', white: '#FFFFFF' };
export function Page({ title, subtitle, children, footer, resetKey, compactHeader = false }: {
  title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode; resetKey?: string; compactHeader?: boolean;
}) {
  const { error, busy } = useStore();
  const scroll = useRef<ScrollView>(null);
  const container = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const [keyboardOffset, setKeyboardOffset] = React.useState(0);
  const [keyboardVisible, setKeyboardVisible] = React.useState(Keyboard.isVisible());
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [resetKey]);
  return <SafeAreaView style={s.safe} edges={['left', 'right', 'bottom']}>
    <View ref={container} style={{ flex: 1 }} onLayout={() => container.current?.measureInWindow((_, y) =>
      setKeyboardOffset(y + (Platform.OS === 'android' ? insets.top : 0)))}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled={keyboardVisible} keyboardVerticalOffset={keyboardOffset}>
    <ScrollView ref={scroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={s.page}>
    {!compactHeader && <Text style={s.eyebrow}>FIELDSKETCH / PROTOTYP</Text>}
    <Text style={compactHeader ? s.h2 : s.title}>{title}</Text>
    {subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
    {!!error && <View accessibilityRole="alert" style={s.warning}><Text style={s.warningText}>{error}</Text></View>}
    {busy && <ActivityIndicator color={colors.green} />}{children}
  </ScrollView>
  {footer && <View style={s.footer}>{footer}</View>}
  </KeyboardAvoidingView></View></SafeAreaView>;
}
export function Button({ label, onPress, secondary = false, disabled = false, danger = false }: {
  label: string; onPress(): void; secondary?: boolean; disabled?: boolean; danger?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.button, secondary && s.secondary, danger && { backgroundColor: '#F9E6DE' }, (pressed || disabled) && { opacity: disabled ? 0.45 : 0.75 }]}>
    <Text style={[s.buttonText, secondary && { color: colors.green }, danger && { color: '#963A25' }]}>{label}</Text>
  </Pressable>;
}
export function Field({ label, value, onChangeText, numeric = false, placeholder = '', onEndEditing, disabled = false }: {
  label: string; value: string; onChangeText(value: string): void; numeric?: boolean; placeholder?: string; onEndEditing?(): void; disabled?: boolean;
}) {
  return <View style={{ gap: 7 }}><Text style={s.label}>{label}</Text><TextInput accessibilityLabel={label} value={value}
    onChangeText={onChangeText} onEndEditing={onEndEditing} editable={!disabled} accessibilityState={{ disabled }} placeholder={placeholder} placeholderTextColor={colors.muted}
    keyboardType={numeric ? 'decimal-pad' : 'default'} style={s.input} /></View>;
}
export const fmt = (n: number, digits = 1) => n.toLocaleString('pl-PL', { maximumFractionDigits: digits });
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, page: { padding: 20, gap: 16, paddingBottom: 36 },
  footer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  eyebrow: { fontSize: 11, letterSpacing: 2, color: colors.green, fontWeight: '800' },
  title: { fontSize: 32, lineHeight: 36, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 15, lineHeight: 22, color: colors.muted },
  card: { backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 12 },
  h2: { fontSize: 20, fontWeight: '700', color: colors.ink }, text: { fontSize: 15, lineHeight: 22, color: colors.ink },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted }, row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  button: { minHeight: 52, backgroundColor: colors.green, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  secondary: { backgroundColor: colors.mint }, buttonText: { color: colors.white, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  input: { minHeight: 52, padding: 14, borderColor: colors.line, borderWidth: 1, borderRadius: 12, backgroundColor: colors.white, color: colors.ink, fontSize: 18 },
  warning: { backgroundColor: '#FFF0D9', padding: 14, borderRadius: 12 }, warningText: { color: colors.amber, lineHeight: 21 },
});
