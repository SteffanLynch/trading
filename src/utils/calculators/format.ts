import {currencySymbol, type CurrencyCode} from './instruments';

// A fixed locale keeps server-rendered and client-rendered text identical (no hydration mismatch).
const LOCALE = 'en-US';

/**
 * Parses what a person typed into a number.
 * Returns `null` for an empty field and `NaN` for text that isn't a number, so the caller can tell
 * "not filled in yet" apart from "typed something invalid". Commas, spaces and currency/percent signs are ignored.
 */
export function parseNumber(text: string | null | undefined): number | null {
  if (text === null || text === undefined) return null;
  const cleaned = text.replace(/[,\s%£$€¥]|CHF|A\$|C\$|NZ\$/gi, '');
  if (cleaned === '') return null;
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(cleaned)) return Number.NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : Number.NaN;
}

/** Adds thousands separators to what was typed while keeping its decimals exactly as entered ("10000.50" -> "10,000.50"). */
export function groupDigits(text: string): string {
  const trimmed = text.trim();
  const match = /^([+-]?)(\d+)(\.\d*)?$/.exec(trimmed.replace(/,/g, ''));
  if (!match) return text;
  const [, sign, integer, fraction = ''] = match;
  return `${sign}${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${fraction}`;
}

export function formatNumber(value: number, maxDecimals = 2, minDecimals = 0): string {
  if (!Number.isFinite(value)) return '—';
  // Avoid "-0"
  const safe = Object.is(value, -0) || Math.abs(value) < 10 ** -(maxDecimals + 1) ? 0 : value;
  return safe.toLocaleString(LOCALE, {minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals});
}

export function formatMoney(value: number, currency: CurrencyCode, options: {signed?: boolean; decimals?: number} = {}): string {
  if (!Number.isFinite(value)) return '—';
  const {signed = false, decimals} = options;
  const fractionDigits = decimals ?? (currency === 'JPY' ? 0 : 2);
  const rounded = Number(value.toFixed(fractionDigits));
  const magnitude = Math.abs(rounded).toLocaleString(LOCALE, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const sign = rounded < 0 ? '−' : signed && rounded > 0 ? '+' : '';
  return `${sign}${currencySymbol(currency)}${magnitude}`;
}

export function formatPercent(value: number, decimals = 2, signed = false): string {
  if (!Number.isFinite(value)) return '—';
  const rounded = Number(value.toFixed(decimals));
  const sign = rounded < 0 ? '−' : signed && rounded > 0 ? '+' : '';
  return `${sign}${Math.abs(rounded).toLocaleString(LOCALE, {maximumFractionDigits: decimals})}%`;
}

/** 2 -> "1 : 2", 2.5 -> "1 : 2.5", 0.333 -> "1 : 0.33" */
export function formatRatio(reward: number): string {
  return `1 : ${formatNumber(reward, 2)}`;
}

/** Multiples of risk: 2 -> "+2R", -1 -> "−1R", 0.35 -> "+0.35R" */
export function formatR(value: number, decimals = 2): string {
  const rounded = Number(value.toFixed(decimals));
  const sign = rounded < 0 ? '−' : rounded > 0 ? '+' : '';
  return `${sign}${Math.abs(rounded).toLocaleString(LOCALE, {maximumFractionDigits: decimals})}R`;
}

/** Trims a price to the significant precision the market uses, keeping trailing zeros ("1.1600"). */
export function formatPrice(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString(LOCALE, {minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false});
}

/** "2h 15m" / "45m" from a number of minutes. */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

/** "$12.4K" / "£1.2M" for chart axes. */
export function formatCompactMoney(value: number, currency: CurrencyCode): string {
  if (!Number.isFinite(value)) return '—';
  const compact = new Intl.NumberFormat(LOCALE, {notation: 'compact', maximumFractionDigits: 1}).format(Math.abs(value));
  return `${value < 0 ? '−' : ''}${currencySymbol(currency)}${compact}`;
}
