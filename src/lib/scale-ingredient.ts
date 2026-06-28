const UNICODE_FRACTIONS: Record<string, number> = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const COMMON_FRACTIONS: [number, string][] = [
  [0.25, "1/4"],
  [0.5, "1/2"],
  [0.75, "3/4"],
  [1 / 3, "1/3"],
  [2 / 3, "2/3"],
];

export interface ScaledAmount {
  amount: string;
  scaled: boolean;
}

function parseSimpleFraction(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null;
  return numerator / denominator;
}

/** Parse a leading numeric value from an amount string (decimals, fractions, unicode fractions). */
export function parseLeadingNumber(amount: string): { value: number; length: number } | null {
  const trimmed = amount.trimStart();
  if (!trimmed) return null;

  const unicodeFraction = UNICODE_FRACTIONS[trimmed[0]];
  if (unicodeFraction !== undefined) {
    return { value: unicodeFraction, length: 1 };
  }

  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const fraction = parseSimpleFraction(Number(mixedMatch[2]), Number(mixedMatch[3]));
    if (fraction === null) return null;
    return { value: whole + fraction, length: mixedMatch[0].length };
  }

  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)/);
  if (fractionMatch) {
    const fraction = parseSimpleFraction(Number(fractionMatch[1]), Number(fractionMatch[2]));
    if (fraction === null) return null;
    return { value: fraction, length: fractionMatch[0].length };
  }

  const decimalMatch = trimmed.match(/^(\d+(?:\.\d+)?)/);
  if (decimalMatch) {
    return { value: Number(decimalMatch[1]), length: decimalMatch[1].length };
  }

  return null;
}

function formatScaledNumber(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  const whole = Math.floor(rounded);
  const fractional = rounded - whole;

  if (fractional < 0.001) {
    return String(whole);
  }

  for (const [amount, label] of COMMON_FRACTIONS) {
    if (Math.abs(fractional - amount) < 0.02) {
      return whole > 0 ? `${whole} ${label}` : label;
    }
  }

  return rounded
    .toFixed(2)
    .replace(/\.?0+$/, "")
    .replace(/^\./, "0.");
}

/** Scale an ingredient amount by a factor. Unparseable amounts are returned unchanged. */
export function scaleIngredientAmount(amount: string, factor: number): ScaledAmount {
  if (factor === 1) {
    return { amount, scaled: true };
  }

  const parsed = parseLeadingNumber(amount);
  if (!parsed) {
    return { amount, scaled: false };
  }

  const leadingWhitespace = amount.slice(0, amount.length - amount.trimStart().length);
  const trimmed = amount.trimStart();
  const suffix = trimmed.slice(parsed.length);
  const scaledAmount = `${leadingWhitespace}${formatScaledNumber(parsed.value * factor)}${suffix}`;

  return { amount: scaledAmount, scaled: true };
}
