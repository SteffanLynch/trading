import {resolveQuoteToAccountRate, type RateSource} from './currency';
import type {CurrencyCode, ForexInstrument} from './instruments';
import {incomplete, invalid, isNum, ok, type Calc} from './result';

export interface PipValueInputs {
  instrument: ForexInstrument;
  accountCurrency: CurrencyCode;
  /** Position size in currency units (1 standard lot = contractSize units). */
  units: number | null;
  /** Current market price. Only used when the pair's base currency is the account currency (e.g. USD/JPY on a USD account). */
  price?: number | null;
  /** Account-currency value of 1 unit of the quote currency, for crosses. */
  manualRate?: number | null;
  contractSize?: number | null;
}

export interface PipValueOutput {
  /** Money gained or lost per pip at this position size, in the account currency. */
  perPip: number;
  perStandardLot: number;
  perMiniLot: number;
  perMicroLot: number;
  pipSize: number;
  contractSize: number;
  rate: number;
  rateSource: RateSource;
  /** Money moved by a 10-pip move. */
  per10Pips: number;
}

export function calculatePipValue(inputs: PipValueInputs): Calc<PipValueOutput> {
  const {instrument, accountCurrency, units} = inputs;
  if (!isNum(units)) return incomplete();
  if (units <= 0) return invalid('Position size must be greater than zero.');

  const resolution = resolveQuoteToAccountRate(instrument, accountCurrency, inputs.price, inputs.manualRate);
  if (resolution.status === 'incomplete') return incomplete();
  if (resolution.status === 'needs-rate') return {status: 'needs-rate', from: resolution.from, to: resolution.to};

  const contractSize = isNum(inputs.contractSize) && inputs.contractSize > 0 ? inputs.contractSize : instrument.contractSize;
  const perUnit = instrument.pipSize * resolution.rate;
  const perPip = units * perUnit;

  return ok({
    perPip,
    perStandardLot: contractSize * perUnit,
    perMiniLot: (contractSize / 10) * perUnit,
    perMicroLot: (contractSize / 100) * perUnit,
    pipSize: instrument.pipSize,
    contractSize,
    rate: resolution.rate,
    rateSource: resolution.source,
    per10Pips: perPip * 10,
  });
}

/** Money for a number of pips at a given pip value. */
export function pipsToMoney(pips: number, pipValue: number): number {
  return pips * pipValue;
}

/** Number of pips for an amount of money at a given pip value. */
export function moneyToPips(money: number, pipValue: number): number {
  return money / pipValue;
}

/** Distance between two prices in pips (always positive). */
export function pipDistance(a: number, b: number, pipSize: number): number {
  return Math.abs(a - b) / pipSize;
}
