import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemePreference } from '../domain/model';

export const lightColors = { ink: '#183A2C', muted: '#607267', green: '#1B684B', mint: '#E7EEE2', bg: '#F5F4EE', line: '#DBE4D9', amber: '#8D4D14', white: '#FFFEFA', onGreen: '#FFFFFF', ready: '#177043', primary: '#1B684B', danger: '#963A25', dangerBg: '#F9E6DE', warningBg: '#FFF0D9' };
export const darkColors: typeof lightColors = { ink: '#E3EEE6', muted: '#A2B6A8', green: '#8ACDAA', mint: '#233E31', bg: '#101D17', line: '#31493C', amber: '#F1BE80', white: '#182A21', onGreen: '#FFFFFF', ready: '#8ACDAA', primary: '#28684B', danger: '#FFC6B5', dangerBg: '#522E26', warningBg: '#49351F' };
const ThemeContext = createContext({ colors: lightColors, dark: false });
export function ThemeProvider({ preference, children }: { preference: ThemePreference; children: React.ReactNode }) {
  const system = useColorScheme();
  const dark = preference === 'dark' || (preference === 'system' && system === 'dark');
  const value = useMemo(() => ({ colors: dark ? darkColors : lightColors, dark }), [dark]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const usePalette = () => useContext(ThemeContext);
