export const LENGTH_UNITS = ['m', 'cm', 'ft', 'in'] as const;
export type LengthUnit = typeof LENGTH_UNITS[number];
const metres: Record<LengthUnit, number> = { m: 1, cm: 0.01, ft: 0.3048, in: 0.0254 };
export const isLengthUnit = (value: unknown): value is LengthUnit => LENGTH_UNITS.includes(value as LengthUnit);
export const toMetres = (value: number, unit: LengthUnit) => value * metres[unit];
export const fromMetres = (value: number, unit: LengthUnit) => value / metres[unit];
export const isImperial = (unit: LengthUnit) => unit === 'ft' || unit === 'in';
export const areaUnit = (unit: LengthUnit) => isImperial(unit) ? 'ft²' : 'm²';
export const displayArea = (squareMetres: number, unit: LengthUnit) => isImperial(unit) ? squareMetres / (metres.ft ** 2) : squareMetres;
