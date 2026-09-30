import {getTool} from '../../../data/tools';
import {compoundGrowth} from '../../../utils/calculators/growth';
import {formatCompactMoney, formatMoney, formatNumber, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Callout, CurrencySelect, Disclosure, Explainer, FieldRow, LineChart, NumberField, ResultHero, Segmented, StatGrid, StatusMessage, ToolCard} from '../ui';

const SPECS = defineSpecs({
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
  start: {default: '10000', pref: true},
  rate: {default: '2'},
  periods: {default: '24'},
  unit: {default: 'months', options: ['months', 'trades', 'years']},
  contribution: {default: ''},
});

const SINGULAR = {months: 'month', trades: 'trade', years: 'year'} as const;

export default function CompoundGrowthCalculator({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const unit = values.unit as keyof typeof SINGULAR;
  const rate = parseNumber(values.rate);
  const periods = parseNumber(values.periods);

  const result = compoundGrowth({startingBalance: parseNumber(values.start), ratePct: rate, periods, contribution: parseNumber(values.contribution)});

  useTrackCalculation({
    name: 'compound_growth',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      account_currency: account,
      starting_balance: parseNumber(values.start),
      return_per_period: rate,
      periods,
      period_unit: unit,
      contribution_per_period: parseNumber(values.contribution),
      final_balance: result.status === 'ok' ? result.value.finalBalance : null,
      total_gain: result.status === 'ok' ? result.value.totalGain : null,
    },
  });

  const inputs = (
    <>
      <FieldRow>
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />
        <NumberField label="Starting balance" value={values.start} onChange={(v) => set('start', v)} prefix={symbol} group placeholder="10,000" />
      </FieldRow>
      <Segmented
        label="Each period is a"
        value={values.unit}
        onChange={(v) => set('unit', v)}
        options={[
          {value: 'months', label: 'Month'},
          {value: 'years', label: 'Year'},
          {value: 'trades', label: 'Trade'},
        ]}
      />
      <FieldRow>
        <NumberField label={`Average return per ${SINGULAR[unit]}`} value={values.rate} onChange={(v) => set('rate', v)} suffix="%" placeholder="2" />
        <NumberField label={`Number of ${unit}`} value={values.periods} onChange={(v) => set('periods', v)} placeholder="24" />
      </FieldRow>
      <Disclosure defaultOpen={values.contribution !== ''}>
        <NumberField label={`Deposit each ${SINGULAR[unit]} (optional)`} value={values.contribution} onChange={(v) => set('contribution', v)} prefix={symbol} group placeholder="0" hint="Added at the end of every period. Use a negative number for regular withdrawals." />
      </Disclosure>
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter a starting balance, a return and a number of periods to see the growth." />;
  } else {
    const v = result.value;
    const n = periods ?? 0;
    const points = v.balances.map((balance, index) => [index, balance] as [number, number]);
    const simple = v.simpleBalances.map((balance, index) => [index, balance] as [number, number]);
    results = (
      <>
        <ResultHero
          label={`Balance after ${formatNumber(n, 0)} ${unit}`}
          value={formatMoney(v.finalBalance, account, {decimals: 0})}
          tone={v.totalGain >= 0 ? 'positive' : 'negative'}
          sentence={
            <>
              At {formatNumber(rate ?? 0, 2)}% per {SINGULAR[unit]}, {formatMoney(parseNumber(values.start) ?? 0, account, {decimals: 0})} becomes <strong>{formatMoney(v.finalBalance, account, {decimals: 0})}</strong> — a {v.totalGain >= 0 ? 'gain' : 'loss'} of {formatMoney(Math.abs(v.totalGain), account, {decimals: 0})}, or {formatNumber(v.multiple, 2)}× what was put in.
            </>
          }
        />
        <Callout tone="warning">
          <strong>Illustration only — not a prediction of future returns.</strong> Real returns are uneven, never guaranteed, and can be negative for long stretches.
        </Callout>
        <LineChart
          ariaLabel={`Balance growth over ${n} ${unit} with and without compounding`}
          xLabel={unit.charAt(0).toUpperCase() + unit.slice(1)}
          formatX={(x) => formatNumber(x, 0)}
          formatY={(y) => formatCompactMoney(y, account)}
          series={[
            {name: 'Compounded', points, color: 'var(--accent)', area: true},
            {name: 'Same rate, no compounding', points: simple, color: 'var(--muted)', dashed: true},
          ]}
          marker={{x: n, y: v.finalBalance, label: formatCompactMoney(v.finalBalance, account)}}
        />
        <StatGrid
          stats={[
            {label: 'Total put in', value: formatMoney(v.totalContributed, account, {decimals: 0})},
            {label: 'Total gain', value: formatMoney(v.totalGain, account, {decimals: 0, signed: true}), tone: v.totalGain >= 0 ? 'positive' : 'negative'},
            {label: 'Growth multiple', value: `${formatNumber(v.multiple, 2)}×`},
            {label: 'Time to double', value: v.periodsToDouble !== null ? `${formatNumber(v.periodsToDouble, 1)} ${unit}` : '—', hint: v.periodsToDouble !== null ? 'at this rate' : 'never at this rate'},
          ]}
        />
        <Explainer
          steps={[
            `Each ${SINGULAR[unit]}: Balance × (1 + ${formatNumber((rate ?? 0) / 100, 4)})${parseNumber(values.contribution) ? ` + ${formatMoney(parseNumber(values.contribution) ?? 0, account)}` : ''}`,
            `After ${formatNumber(n, 0)} ${unit}: ${formatMoney(parseNumber(values.start) ?? 0, account)} × (1 + ${formatNumber((rate ?? 0) / 100, 4)})^${formatNumber(n, 0)}${parseNumber(values.contribution) ? ' plus the compounded deposits' : ''} = ${formatMoney(v.finalBalance, account)}`,
            ...(v.periodsToDouble !== null ? [`Time to double = ln(2) ÷ ln(1 + ${formatNumber((rate ?? 0) / 100, 4)}) = ${formatNumber(v.periodsToDouble, 2)} ${unit}`] : []),
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('compound-growth-calculator').name} name="compound_growth" embedded={embedded} href={getTool('compound-growth-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
