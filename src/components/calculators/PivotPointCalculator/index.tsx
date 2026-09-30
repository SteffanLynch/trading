import {getTool} from '../../../data/tools';
import {formatNumber, formatPrice, parseNumber} from '../../../utils/calculators/format';
import {PIVOT_METHODS, pivotLevels, type PivotMethod} from '../../../utils/calculators/pivots';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {decimalsOf, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Explainer, FieldRow, LevelChart, MiniTable, Note, NumberField, ResultHero, SelectField, StatusMessage, ToolCard, type ChartLevel} from '../ui';

const SPECS = defineSpecs({
  high: {default: '1.1100'},
  low: {default: '1.0900'},
  close: {default: '1.1050'},
  method: {default: 'classic', options: PIVOT_METHODS.map((method) => method.value) as readonly string[]},
});

const MEANING = (name: string): string => {
  if (name === 'P') return 'The central reference: the previous period’s average. Price above it is often read as stronger, below it as weaker.';
  const n = name.slice(1);
  const ordinal = ({'1': 'First', '2': 'Second', '3': 'Third', '4': 'Fourth'} as Record<string, string>)[n] ?? n;
  return name.startsWith('R') ? `${ordinal} resistance: a price above the pivot where sellers may show up.` : `${ordinal} support: a price below the pivot where buyers may show up.`;
};

export default function PivotPointCalculator({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const method = values.method as PivotMethod;
  const high = parseNumber(values.high);
  const low = parseNumber(values.low);
  const close = parseNumber(values.close);
  const result = pivotLevels(high, low, close, method);
  const decimals = Math.min(6, Math.max(2, decimalsOf(values.high), decimalsOf(values.low), decimalsOf(values.close)) + 1);

  useTrackCalculation({
    name: 'pivot_points',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {method, previous_high: high, previous_low: low, previous_close: close, pivot: result.status === 'ok' ? result.value.pivot : null},
  });

  const inputs = (
    <>
      <FieldRow>
        <NumberField label="Previous high" value={values.high} onChange={(v) => set('high', v)} />
        <NumberField label="Previous low" value={values.low} onChange={(v) => set('low', v)} />
      </FieldRow>
      <NumberField label="Previous close" value={values.close} onChange={(v) => set('close', v)} hint="From the period before the one being traded: usually yesterday for a daily pivot." />
      <SelectField label="Method" value={values.method} onChange={(v) => set('method', v)} options={PIVOT_METHODS.map((entry) => ({value: entry.value, label: entry.label}))} hint={PIVOT_METHODS.find((entry) => entry.value === method)?.note} />
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter the previous high, low and close to see the pivot levels." />;
  } else {
    const v = result.value;
    const fmt = (price: number) => formatPrice(price, decimals);
    const levels: ChartLevel[] = [
      ...v.levels.map((level) => ({price: level.price, label: level.name, hint: level.kind === 'pivot' ? 'pivot' : level.kind, tone: (level.kind === 'pivot' ? 'accent' : level.kind === 'resistance' ? 'neg' : 'pos') as ChartLevel['tone']})),
      {price: high ?? 0, label: 'High', hint: 'previous', tone: 'muted', dashed: true},
      {price: low ?? 0, label: 'Low', hint: 'previous', tone: 'muted', dashed: true},
    ];
    const top = Math.max(...levels.map((level) => level.price));
    const bottom = Math.min(...levels.map((level) => level.price));
    results = (
      <>
        <ResultHero
          label="Pivot point"
          value={fmt(v.pivot)}
          sentence={
            <>
              From a previous range of {fmt(low ?? 0)} to {fmt(high ?? 0)} that closed at {fmt(close ?? 0)}, the central reference is <strong>{fmt(v.pivot)}</strong>. Levels above it are read as resistance and levels below as support.
            </>
          }
        />
        <LevelChart
          levels={levels}
          zones={[{from: top, to: v.pivot, tone: 'neg'}, {from: v.pivot, to: bottom, tone: 'pos'}]}
          marker={{price: close ?? 0, label: 'close'}}
          ariaLabel={`Pivot point levels: pivot ${fmt(v.pivot)}, from resistance above to support below`}
          formatPrice={fmt}
          height={Math.max(340, v.levels.length * 44)}
        />
        <MiniTable caption="Pivot point levels and what they mean" head={['Level', 'Price', 'What it is']} rows={v.levels.map((level) => ({cells: [level.name, fmt(level.price), MEANING(level.name)], highlight: level.kind === 'pivot'}))} />
        <Note>Pivot points are reference levels calculated from past prices. Many traders watch them, which is the only reason price may react; they are not predictions and there is no guarantee price will stop at, or respect, any of them.</Note>
        <Explainer
          steps={
            method === 'classic'
              ? [
                  `Pivot = (High + Low + Close) ÷ 3 = (${fmt(high ?? 0)} + ${fmt(low ?? 0)} + ${fmt(close ?? 0)}) ÷ 3 = ${fmt(v.pivot)}`,
                  `R1 = 2 × Pivot − Low = ${fmt(2 * v.pivot - (low ?? 0))};  S1 = 2 × Pivot − High = ${fmt(2 * v.pivot - (high ?? 0))}`,
                  `R2 = Pivot + (High − Low) = ${fmt(v.pivot + ((high ?? 0) - (low ?? 0)))};  S2 = Pivot − (High − Low) = ${fmt(v.pivot - ((high ?? 0) - (low ?? 0)))}`,
                ]
              : [`The pivot is ${fmt(v.pivot)} and the levels are built from the previous range of ${formatNumber((high ?? 0) - (low ?? 0), decimals)} using the ${PIVOT_METHODS.find((entry) => entry.value === method)?.label} method.`]
          }
        />
      </>
    );
  }

  return <ToolCard title={getTool('pivot-point-calculator').name} name="pivot_points" embedded={embedded} href={getTool('pivot-point-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
