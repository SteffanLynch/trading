import type {ReactNode} from 'react';
import {formatMoney, formatNumber, formatPercent, parseNumber} from '../../utils/calculators/format';
import {CURRENCY_CODES, INSTRUMENT_IDS, currencySymbol, getInstrument, type CurrencyCode, type Instrument} from '../../utils/calculators/instruments';
import {defineSpecs, type FieldValues} from '../../utils/calculators/toolState';
import type {SizingContext, SizingValue} from '../../utils/calculators/sizing';
import {Disclosure, FieldRow, NumberField} from './ui';

/** Fields shared by every tool that sizes a position. */
export const SIZING_FIELDS = {
  balance: {default: '10000', pref: true},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
  risk: {default: '1', pref: true},
  pair: {default: 'EURUSD', options: INSTRUMENT_IDS},
  rate: {default: ''},
  contract: {default: ''},
  step: {default: ''},
};

export const sizingSpecs = defineSpecs(SIZING_FIELDS);
type SizingKeys = keyof typeof SIZING_FIELDS;

export function sizingContext(values: FieldValues<SizingKeys>): SizingContext {
  return {
    instrument: getInstrument(values.pair),
    accountCurrency: values.currency as CurrencyCode,
    balance: parseNumber(values.balance),
    riskPct: parseNumber(values.risk),
    manualRate: parseNumber(values.rate),
    contractSize: parseNumber(values.contract),
    lotStep: parseNumber(values.step),
  };
}

interface AdvancedProps {
  instrument: Instrument;
  contract: string;
  step: string;
  onContract: (value: string) => void;
  onStep: (value: string) => void;
}

/** Contract size and smallest step, tucked away so a beginner's first view is only balance, risk and stop. */
export function SizingAdvanced({instrument, contract, step, onContract, onStep}: AdvancedProps) {
  const forex = instrument.kind === 'forex';
  return (
    <Disclosure defaultOpen={contract !== '' || step !== ''}>
      <FieldRow>
        <NumberField
          label={forex ? 'Contract size (units per lot)' : 'Contract multiplier'}
          value={contract}
          onChange={onContract}
          placeholder={forex ? '100,000' : '1'}
          group
          hint={forex ? 'Standard forex lots are 100,000 units. Check your broker for other instruments.' : 'Value of a one-point move per unit. Leave at 1 for shares and crypto; futures contracts use their point value.'}
        />
        <NumberField
          label={forex ? 'Smallest lot step' : 'Smallest size step'}
          value={step}
          onChange={onStep}
          placeholder="0.01"
          hint={forex ? 'Your size is rounded down to this. Most brokers allow 0.01 lots.' : 'Set to 1 for whole shares or contracts.'}
        />
      </FieldRow>
    </Disclosure>
  );
}

/** "You are risking £100.00" — makes the percentage real. */
export function riskHint(balance: number | null, riskPct: number | null, currency: CurrencyCode): ReactNode {
  if (balance === null || riskPct === null || !Number.isFinite(balance) || !Number.isFinite(riskPct) || balance <= 0 || riskPct <= 0) return undefined;
  return (
    <>
      You are risking <strong>{formatMoney((balance * riskPct) / 100, currency)}</strong> on this trade.
    </>
  );
}

const decimalsForStep = (step: number) => Math.max(0, Math.ceil(-Math.log10(step) - 1e-9));

export function sizeHeadline(value: SizingValue, instrument: Instrument): {value: string; unit: string; sub: string | null} {
  if (instrument.kind === 'forex' && value.lots !== null) {
    return {
      value: formatNumber(value.lots, Math.max(2, decimalsForStep(value.lotStep)), 2),
      unit: 'lots',
      sub: `Approximately ${formatNumber(value.units, 0)} units`,
    };
  }
  return {value: formatNumber(value.units, decimalsForStep(value.lotStep)), unit: 'units', sub: null};
}

const smallMoney = (value: number, currency: CurrencyCode) => `${currencySymbol(currency)}${formatNumber(value, 8)}`;

interface StepsInput {
  value: SizingValue;
  instrument: Instrument;
  currency: CurrencyCode;
  balance: number;
  riskPct: number;
  /** Set when the stop distance came from two prices; otherwise from a distance in pips/points. */
  prices?: {entry: string; stop: string};
}

/** The workings, using the trader's own numbers. */
export function sizingSteps({value, instrument, currency, balance, riskPct, prices}: StepsInput): string[] {
  const steps: string[] = [];
  steps.push(`Risk amount = ${formatMoney(balance, currency)} × ${formatNumber(riskPct, 4)}% = ${formatMoney(value.targetRisk, currency)}`);

  steps.push(
    prices
      ? `Stop distance = |${prices.entry} − ${prices.stop}| = ${formatNumber(value.stopDistance, 6)} (${formatNumber(value.stopDistanceInUnits, 2)} ${value.unitLabel})`
      : `Stop distance = ${formatNumber(value.stopDistanceInUnits, 2)} ${value.unitLabel} × ${formatNumber(instrument.pipSize, 4)} = ${formatNumber(value.stopDistance, 6)}`,
  );

  const terms: string[] = [];
  if (instrument.kind === 'other' && value.contractSize !== 1) terms.push(`${formatNumber(value.contractSize, 4)} (multiplier)`);
  if (value.rate !== 1) terms.push(`${formatNumber(value.rate, 6)} (exchange rate)`);
  steps.push(
    `Loss per unit = ${formatNumber(value.stopDistance, 6)}${terms.length ? ` × ${terms.join(' × ')}` : ''} = ${smallMoney(value.lossPerUnit, currency)}`,
  );

  steps.push(`Units = ${formatMoney(value.targetRisk, currency)} ÷ ${smallMoney(value.lossPerUnit, currency)} = ${formatNumber(value.unitsExact, 2)}`);

  if (instrument.kind === 'forex' && value.lotsExact !== null && value.lots !== null) {
    steps.push(`Lots = ${formatNumber(value.unitsExact, 2)} ÷ ${formatNumber(value.contractSize, 0)} = ${formatNumber(value.lotsExact, 4)}, rounded down to ${formatNumber(value.lots, 2, 2)}`);
  } else {
    steps.push(`Rounded down to the smallest step (${formatNumber(value.lotStep, 4)}): ${formatNumber(value.units, 4)}`);
  }
  steps.push(`Loss if stopped = ${formatNumber(value.units, 2)} units × ${smallMoney(value.lossPerUnit, currency)} = ${formatMoney(value.actualRisk, currency)} (${formatPercent(value.actualRiskPct)} of the account)`);
  return steps;
}
