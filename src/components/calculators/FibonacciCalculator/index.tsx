import {getTool} from '../../../data/tools';
import {fibonacciLevels} from '../../../utils/calculators/fibonacci';
import {formatNumber, formatPrice, parseNumber} from '../../../utils/calculators/format';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {decimalsOf, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Explainer, FieldRow, LevelChart, MiniTable, Note, NumberField, ResultHero, Segmented, StatusMessage, ToolCard, type ChartLevel} from '../ui';

const SPECS = defineSpecs({
  direction: {default: 'up', options: ['up', 'down']},
  high: {default: '1.1200'},
  low: {default: '1.1000'},
  extensions: {default: '0', options: ['0', '1']},
});

const KEY_LEVELS = [0.382, 0.5, 0.618];
const pct = (ratio: number) => `${formatNumber(ratio * 100, 1)}%`;

export default function FibonacciCalculator({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const direction = values.direction === 'down' ? 'down' : 'up';
  const high = parseNumber(values.high);
  const low = parseNumber(values.low);
  const showExtensions = values.extensions === '1';
  const result = fibonacciLevels(high, low, direction);
  const decimals = Math.min(6, Math.max(2, decimalsOf(values.high), decimalsOf(values.low)) + 1);

  useTrackCalculation({
    name: 'fibonacci',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {direction, swing_high: high, swing_low: low, show_extensions: showExtensions, level_61_8: result.status === 'ok' ? (result.value.retracements.find((level) => level.ratio === 0.618)?.price ?? null) : null},
  });

  const inputs = (
    <>
      <Segmented
        label="The swing moved"
        value={values.direction}
        onChange={(v) => set('direction', v)}
        options={[
          {value: 'up', label: 'Up (low to high)'},
          {value: 'down', label: 'Down (high to low)'},
        ]}
        hint={direction === 'up' ? 'Retracement levels measure how far price could pull back down from the high.' : 'Retracement levels measure how far price could bounce back up from the low.'}
      />
      <FieldRow>
        <NumberField label="Swing high" value={values.high} onChange={(v) => set('high', v)} />
        <NumberField label="Swing low" value={values.low} onChange={(v) => set('low', v)} />
      </FieldRow>
      <Segmented
        label="Also show"
        value={values.extensions}
        onChange={(v) => set('extensions', v)}
        options={[
          {value: '0', label: 'Retracements'},
          {value: '1', label: 'Retracements + extensions'},
        ]}
      />
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter the swing high and swing low to see the levels." />;
  } else {
    const v = result.value;
    const levels: ChartLevel[] = v.retracements.map((level, index) => ({
      price: level.price,
      label: pct(level.ratio),
      hint: index === 0 ? (direction === 'up' ? 'swing high' : 'swing low') : index === v.retracements.length - 1 ? (direction === 'up' ? 'swing low' : 'swing high') : undefined,
      tone: level.ratio === 0 || level.ratio === 1 ? 'muted' : KEY_LEVELS.includes(level.ratio) ? 'accent' : 'warn',
      dashed: level.ratio === 0 || level.ratio === 1,
    }));
    if (showExtensions) v.extensions.forEach((level) => levels.push({price: level.price, label: pct(level.ratio), tone: 'pos', dashed: true}));

    const swing = direction === 'up' ? {from: low ?? 0, to: high ?? 0} : {from: high ?? 0, to: low ?? 0};
    const fmt = (price: number) => formatPrice(price, decimals);
    results = (
      <>
        <ResultHero
          label="61.8% retracement"
          value={fmt(v.retracements.find((level) => level.ratio === 0.618)?.price ?? 0)}
          sentence={
            <>
              The swing from {fmt(low ?? 0)} to {fmt(high ?? 0)} is {fmt(v.range)} long. The levels below divide that move into the ratios some traders watch: {direction === 'up' ? 'pullbacks into these prices' : 'bounces up to these prices'} are where they look for a reaction.
            </>
          }
        />
        <LevelChart levels={levels} swing={swing} ariaLabel={`Fibonacci levels for a swing ${direction} from ${fmt(low ?? 0)} to ${fmt(high ?? 0)}`} formatPrice={fmt} />
        <MiniTable
          caption="Fibonacci retracement levels"
          head={['Level', 'Price']}
          rows={v.retracements.map((level) => ({cells: [pct(level.ratio), fmt(level.price)], highlight: KEY_LEVELS.includes(level.ratio)}))}
        />
        {showExtensions && <MiniTable caption="Fibonacci extension levels" head={['Extension', 'Price']} rows={v.extensions.map((level) => ({cells: [pct(level.ratio), fmt(level.price)]}))} />}
        <Note>These are levels that some traders monitor. The tool does not imply that price will react to them: Fibonacci levels are a reference, not a prediction or a signal.</Note>
        <Explainer
          steps={[
            `Range = ${fmt(high ?? 0)} − ${fmt(low ?? 0)} = ${fmt(v.range)}`,
            direction === 'up' ? `Retracement level = High − Range × ratio. For 61.8%: ${fmt(high ?? 0)} − ${fmt(v.range)} × 0.618 = ${fmt((high ?? 0) - v.range * 0.618)}` : `Retracement level = Low + Range × ratio. For 61.8%: ${fmt(low ?? 0)} + ${fmt(v.range)} × 0.618 = ${fmt((low ?? 0) + v.range * 0.618)}`,
            direction === 'up' ? `Extension level = Low + Range × ratio. For 161.8%: ${fmt(low ?? 0)} + ${fmt(v.range)} × 1.618 = ${fmt((low ?? 0) + v.range * 1.618)}` : `Extension level = High − Range × ratio. For 161.8%: ${fmt(high ?? 0)} − ${fmt(v.range)} × 1.618 = ${fmt((high ?? 0) - v.range * 1.618)}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('fibonacci-calculator').name} name="fibonacci" embedded={embedded} href={getTool('fibonacci-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
