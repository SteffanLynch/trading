export const CURRENCIES = [
  {code: 'USD', symbol: '$', name: 'US dollar'},
  {code: 'EUR', symbol: '€', name: 'Euro'},
  {code: 'GBP', symbol: '£', name: 'British pound'},
  {code: 'JPY', symbol: '¥', name: 'Japanese yen'},
  {code: 'AUD', symbol: 'A$', name: 'Australian dollar'},
  {code: 'CAD', symbol: 'C$', name: 'Canadian dollar'},
  {code: 'CHF', symbol: 'CHF', name: 'Swiss franc'},
  {code: 'NZD', symbol: 'NZ$', name: 'New Zealand dollar'},
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code) as CurrencyCode[];

export function currencySymbol(code: CurrencyCode): string {
  return CURRENCIES.find((currency) => currency.code === code)?.symbol ?? code;
}

export interface ForexInstrument {
  kind: 'forex';
  id: string;
  label: string;
  base: CurrencyCode;
  quote: CurrencyCode;
  /** Price change that equals one pip. */
  pipSize: number;
  /** Decimal places in a whole pip (4 for EUR/USD, 2 for USD/JPY). */
  pipDecimals: number;
  /** Currency units in one standard lot. */
  contractSize: number;
  /** Placeholder market price so the calculators open with a worked example. Not live data. */
  examplePrice: number;
}

export interface OtherInstrument {
  kind: 'other';
  id: 'OTHER';
  label: string;
  /** For non-forex markets a "point" is one unit of price. */
  pipSize: 1;
  pipDecimals: number;
  /** Multiplier: currency value of a one-point move per unit/contract. 1 for shares and crypto. */
  contractSize: 1;
  examplePrice: number;
}

export type Instrument = ForexInstrument | OtherInstrument;

// [base, quote, example price]. Prices are illustrative defaults, never used as live rates.
const FOREX_PAIRS: [CurrencyCode, CurrencyCode, number][] = [
  ['EUR', 'USD', 1.165],
  ['GBP', 'USD', 1.34],
  ['USD', 'JPY', 150],
  ['USD', 'CHF', 0.8],
  ['AUD', 'USD', 0.66],
  ['USD', 'CAD', 1.38],
  ['NZD', 'USD', 0.6],
  ['EUR', 'GBP', 0.87],
  ['EUR', 'JPY', 175],
  ['EUR', 'CHF', 0.93],
  ['EUR', 'AUD', 1.76],
  ['EUR', 'CAD', 1.61],
  ['EUR', 'NZD', 1.94],
  ['GBP', 'JPY', 200],
  ['GBP', 'CHF', 1.07],
  ['GBP', 'AUD', 2.03],
  ['GBP', 'CAD', 1.85],
  ['GBP', 'NZD', 2.23],
  ['AUD', 'JPY', 99],
  ['AUD', 'CAD', 0.91],
  ['AUD', 'CHF', 0.53],
  ['AUD', 'NZD', 1.1],
  ['CAD', 'JPY', 108],
  ['CAD', 'CHF', 0.58],
  ['CHF', 'JPY', 188],
  ['NZD', 'JPY', 90],
  ['NZD', 'CAD', 0.83],
  ['NZD', 'CHF', 0.48],
];

export const FOREX_INSTRUMENTS: ForexInstrument[] = FOREX_PAIRS.map(([base, quote, examplePrice]) => {
  const jpy = quote === 'JPY';
  return {
    kind: 'forex',
    id: `${base}${quote}`,
    label: `${base}/${quote}`,
    base,
    quote,
    pipSize: jpy ? 0.01 : 0.0001,
    pipDecimals: jpy ? 2 : 4,
    contractSize: 100_000,
    examplePrice,
  };
});

export const OTHER_INSTRUMENT: OtherInstrument = {
  kind: 'other',
  id: 'OTHER',
  label: 'Stocks, crypto & other',
  pipSize: 1,
  pipDecimals: 2,
  contractSize: 1,
  examplePrice: 100,
};

export const INSTRUMENTS: Instrument[] = [...FOREX_INSTRUMENTS, OTHER_INSTRUMENT];
export const INSTRUMENT_IDS = INSTRUMENTS.map((instrument) => instrument.id);
export const FOREX_INSTRUMENT_IDS = FOREX_INSTRUMENTS.map((instrument) => instrument.id);
export const DEFAULT_INSTRUMENT_ID = 'EURUSD';

const BY_ID = new Map<string, Instrument>(INSTRUMENTS.map((instrument) => [instrument.id, instrument]));

export function getInstrument(id: string): Instrument {
  return BY_ID.get(id) ?? (BY_ID.get(DEFAULT_INSTRUMENT_ID) as Instrument);
}

export function getForexInstrument(id: string): ForexInstrument {
  const instrument = getInstrument(id);
  return instrument.kind === 'forex' ? instrument : (BY_ID.get(DEFAULT_INSTRUMENT_ID) as ForexInstrument);
}

/** Label for one step of distance: "pips" for forex, "points" (price units) for everything else. */
export function distanceUnit(instrument: Instrument): 'pips' | 'points' {
  return instrument.kind === 'forex' ? 'pips' : 'points';
}

export function priceToPips(distance: number, instrument: Instrument): number {
  return distance / instrument.pipSize;
}

export function pipsToPrice(pips: number, instrument: Instrument): number {
  return pips * instrument.pipSize;
}

export interface SeedLevels {
  entry: string;
  stop: string;
  target: string;
}

/** A believable long trade (50-pip stop, 100-pip target) for a fresh calculator or a newly chosen market. */
export function seedLevels(instrument: Instrument): SeedLevels {
  const decimals = instrument.pipDecimals;
  const entry = instrument.examplePrice;
  const stopDistance = instrument.kind === 'forex' ? 50 * instrument.pipSize : entry * 0.05;
  const targetDistance = stopDistance * 2;
  return {
    entry: entry.toFixed(decimals),
    stop: (entry - stopDistance).toFixed(decimals),
    target: (entry + targetDistance).toFixed(decimals),
  };
}
