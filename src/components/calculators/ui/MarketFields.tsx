import {CURRENCIES, FOREX_INSTRUMENTS, OTHER_INSTRUMENT, currencySymbol, type CurrencyCode, type Instrument} from '../../../utils/calculators/instruments';
import {NumberField, SelectField} from './Fields';

const MAJORS = FOREX_INSTRUMENTS.slice(0, 7);
const CROSSES = FOREX_INSTRUMENTS.slice(7);

const toOption = (instrument: Instrument) => ({value: instrument.id, label: instrument.label});

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function CurrencySelect({value, onChange, label = 'Account currency'}: CurrencySelectProps) {
  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={CURRENCIES.map((currency) => ({value: currency.code, label: `${currency.code} · ${currency.name}`}))}
    />
  );
}

interface MarketSelectProps {
  value: string;
  onChange: (value: string) => void;
  includeOther?: boolean;
  label?: string;
  hint?: string;
}

/** Forex pairs grouped as majors and crosses, optionally with a generic "stocks, crypto & other" entry. */
export function MarketSelect({value, onChange, includeOther = true, label = 'Market', hint}: MarketSelectProps) {
  const groups = [
    {label: 'Major pairs', options: MAJORS.map(toOption)},
    {label: 'Cross pairs', options: CROSSES.map(toOption)},
    ...(includeOther ? [{label: 'Other markets', options: [toOption(OTHER_INSTRUMENT)]}] : []),
  ];
  return <SelectField label={label} value={value} onChange={onChange} groups={groups} hint={hint} />;
}

interface ExchangeRateFieldProps {
  from: CurrencyCode;
  to: CurrencyCode;
  value: string;
  onChange: (value: string) => void;
}

/** Shown only when a conversion is needed and the site has no way to know it (e.g. a GBP account trading EUR/USD). */
export function ExchangeRateField({from, to, value, onChange}: ExchangeRateFieldProps) {
  return (
    <NumberField
      label={`Exchange rate: 1 ${from} = ? ${to}`}
      value={value}
      onChange={onChange}
      suffix={to}
      placeholder="0.7500"
      hint={`This trade is profitable or loses in ${from}, but your account is in ${to}. Enter what 1 ${from} is worth in ${to} today. If you only know ${to}/${from}, divide 1 by it.`}
    />
  );
}

interface PriceFieldProps {
  instrument: Instrument;
  account: CurrencyCode;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/** The pair's own price doubles as the conversion rate when the base currency is the account currency (USD/JPY on a USD account). */
export function ConversionPriceField({instrument, account, value, onChange, label}: PriceFieldProps) {
  if (instrument.kind !== 'forex') return null;
  return (
    <NumberField
      label={label ?? `Current ${instrument.label} price`}
      value={value}
      onChange={onChange}
      hint={`Used to convert ${instrument.quote} profits and losses into ${account}.`}
    />
  );
}

export const symbolFor = currencySymbol;
