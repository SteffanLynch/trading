import {isNum} from './result';
import type {CurrencyCode, Instrument} from './instruments';

export type RateSource = 'same-currency' | 'inverse-price' | 'manual' | 'assumed';

export type RateResolution =
  | {status: 'ok'; rate: number; source: RateSource}
  | {status: 'needs-rate'; from: CurrencyCode; to: CurrencyCode}
  | {status: 'incomplete'};

/**
 * Finds "how many units of the account currency is 1 unit of the instrument's quote currency worth?".
 * Profit and loss are earned in the quote currency, so this is what turns them into account money.
 *
 *  - Quote currency == account currency (USD account, EUR/USD): 1.
 *  - Base currency == account currency (USD account, USD/JPY): 1 / price, which is exact enough
 *    because the pair's own price is the conversion rate.
 *  - Anything else (GBP account, EUR/USD): needs an exchange rate supplied by the trader, since the
 *    site deliberately uses no live market data.
 *  - Non-forex instruments are assumed to be priced in the account currency.
 */
export function resolveQuoteToAccountRate(
  instrument: Instrument,
  accountCurrency: CurrencyCode,
  referencePrice: number | null | undefined,
  manualRate: number | null | undefined,
): RateResolution {
  if (instrument.kind === 'other') return {status: 'ok', rate: 1, source: 'assumed'};
  if (instrument.quote === accountCurrency) return {status: 'ok', rate: 1, source: 'same-currency'};
  if (instrument.base === accountCurrency) {
    if (!isNum(referencePrice) || referencePrice <= 0) return {status: 'incomplete'};
    return {status: 'ok', rate: 1 / referencePrice, source: 'inverse-price'};
  }
  if (isNum(manualRate) && manualRate > 0) return {status: 'ok', rate: manualRate, source: 'manual'};
  return {status: 'needs-rate', from: instrument.quote, to: accountCurrency};
}

/** True when the trader must supply an exchange rate for this market/account combination. */
export function requiresManualRate(instrument: Instrument, accountCurrency: CurrencyCode): boolean {
  return instrument.kind === 'forex' && instrument.quote !== accountCurrency && instrument.base !== accountCurrency;
}
