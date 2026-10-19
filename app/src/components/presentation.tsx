import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react-native';
import { colors, s } from './ui';

export function SectionTitle({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return <View style={s.row}><Icon size={20} color={colors.green} accessible={false} /><Text style={s.h2}>{title}</Text></View>;
}
export function Segments<T extends string | number>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string; disabled?: boolean }[]; onChange(value: T): void;
}) {
  return <View accessibilityLabel={label} style={[s.segment, { flexWrap: 'wrap' }]}>{options.map(option => <Pressable key={option.value}
    accessibilityRole="button" accessibilityLabel={option.label} accessibilityState={{ selected: option.value === value, disabled: option.disabled }}
    disabled={option.disabled} onPress={() => onChange(option.value)} style={({ pressed }) => ({
      flexGrow: 1, flexBasis: 60, minHeight: 44, justifyContent: 'center', alignItems: 'center', padding: 8, borderRadius: 12,
      backgroundColor: option.value === value ? colors.white : 'transparent', opacity: option.disabled ? 0.4 : pressed ? 0.7 : 1,
    })}><Text style={[s.label, { textAlign: 'center', color: option.value === value ? colors.ink : colors.muted }]}>{option.label}</Text></Pressable>)}</View>;
}
export function Badge({ label, icon: Icon }: { label: string; icon?: LucideIcon }) {
  return <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, backgroundColor: colors.mint, paddingHorizontal: 12, paddingVertical: 6 }}>
    {Icon && <Icon size={15} color={colors.green} accessible={false} />}<Text style={[s.label, { color: colors.green }]}>{label}</Text></View>;
}
export function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false); const Icon = open ? ChevronUp : ChevronDown;
  return <View style={s.card}><Pressable accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)}
    style={{ minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={[s.text, { flex: 1, fontWeight: '600' }]}>{title}</Text><Icon size={20} color={colors.green} /></Pressable>
    {open && children}</View>;
}
