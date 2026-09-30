import {distanceUnit, seedLevels, type Instrument} from '../../utils/calculators/instruments';
import {formatNumber, formatPrice} from '../../utils/calculators/format';
import {requiresManualRate} from '../../utils/calculators/currency';
import type {CurrencyCode} from '../../utils/calculators/instruments';
import type {RateSource} from '../../utils/calculators/currency';

export interface CalculatorProps {
  /** Render as a compact widget inside an article: no share/reset, no address-bar sync. */
  embedded?: boolean;
}

export const decimalsOf = (text: string): number => {
  const cleaned = text.replace(/,/g, '').trim();
  const dot = cleaned.indexOf('.');
  return dot === -1 ? 0 : Math.min(8, cleaned.length - dot - 1);
};

/** Price decimals to use when writing a price back into a field (keeps whatever precision the trader is using). */
export function priceDecimals(instrument: Instrument, ...texts: string[]): number {
  return Math.max(instrument.pipDecimals, ...texts.map(decimalsOf));
}

export const seedFor = seedLevels;

/** "50 pips" / "2.5 points" */
export function distanceText(units: number, instrument: Instrument): string {
  const unit = distanceUnit(instrument);
  const shown = formatNumber(units, units >= 100 ? 1 : 2);
  return `${shown} ${unit}`;
}

export function priceText(value: number, instrument: Instrument, extraDecimals = 0): string {
  return formatPrice(value, instrument.pipDecimals + extraDecimals);
}

/** One sentence about how the quote currency was turned into account money. */
export function currencyNote(source: RateSource, instrument: Instrument, account: CurrencyCode, rate: number): string {
  switch (source) {
    case 'same-currency':
      return `Your account currency (${account}) matches the currency this pair is quoted in, so no conversion was needed.`;
    case 'inverse-price':
      return `Converted to ${account} using the pair's own price (1 ${instrument.kind === 'forex' ? instrument.quote : account} ≈ ${formatNumber(rate, 6)} ${account}).`;
    case 'manual':
      return `Converted to ${account} using your exchange rate of ${formatNumber(rate, 6)}.`;
    case 'assumed':
      return `Assumes this instrument is priced in your account currency (${account}). If it isn't, convert your prices first.`;
  }
}

export const needsManualRate = requiresManualRate;
