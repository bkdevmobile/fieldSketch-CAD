export const ANGLE_DECIMALS = 2;
export const LENGTH_DECIMALS = 3;

export function roundDecimal(value: number, digits: number): number {
  if (!Number.isFinite(value)) return value;
  // Shift the decimal exponent instead of multiplying: 1.005 rounds to 1.01.
  const [coefficient, exponent = '0'] = String(Math.abs(value)).split('e');
  const shifted = Number(`${coefficient}e${Number(exponent) + digits}`);
  if (!Number.isFinite(shifted)) return value;
  const [rounded, roundedExponent = '0'] = String(Math.round(shifted)).split('e');
  const result = Number(`${rounded}e${Number(roundedExponent) - digits}`);
  return result === 0 ? 0 : Math.sign(value) * result;
}

export const decimalText = (value: number, digits: number) => String(roundDecimal(value, digits));
export function roundedInput(input: string, digits: number): string {
  const value = Number(input.trim().replace(',', '.'));
  return input.trim() && Number.isFinite(value) ? decimalText(value, digits).replace('.', ',') : input;
}

// Preserve incomplete edits and either decimal separator. Reject pasted non-numbers.
export function decimalInput(input: string, digits: number): string | null {
  if (!/^\d*(?:[.,]\d*)?$/.test(input)) return null;
  const separator = input.search(/[.,]/);
  return separator < 0 ? input : input.slice(0, separator + 1 + digits);
}
