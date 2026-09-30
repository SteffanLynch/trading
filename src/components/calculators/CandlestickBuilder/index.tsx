import {getTool} from '../../../data/tools';
import {CANDLE_PRESETS, candleAnatomy, normaliseCandle, readCandle, type Candle, type CandlePreset} from '../../../utils/calculators/candles';
import {formatNumber, formatPercent, formatPrice, parseNumber} from '../../../utils/calculators/format';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Explainer, FieldRow, Note, NumberField, ResultHero, Segmented, StatGrid, StatusMessage, ToolCard} from '../ui';
import styles from '../ui/ui.module.css';
import {AXIS_HI, AXIS_LO, CandleCanvas} from './CandleCanvas';

const f = (value: number) => value.toFixed(4);

const SPECS = defineSpecs({
  o: {default: '1.1000'},
  h: {default: '1.1100'},
  l: {default: '1.0950'},
  c: {default: '1.1070'},
  prev: {default: '0', options: ['0', '1']},
  po: {default: '1.1050'},
  ph: {default: '1.1055'},
  pl: {default: '1.1000'},
  pc: {default: '1.1010'},
  preset: {default: 'bullish'},
});

const LABEL = {bullish: 'Bullish', bearish: 'Bearish', doji: 'Doji'} as const;
const SHAPE_NAME: Record<string, string> = {hammer: 'Hammer', 'shooting-star': 'Shooting star', marubozu: 'Marubozu', doji: 'Doji', 'spinning-top': 'Spinning top', standard: 'Standard candle'};

export default function CandlestickBuilder({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});

  const nums = {open: parseNumber(values.o), high: parseNumber(values.h), low: parseNumber(values.l), close: parseNumber(values.c)};
  const complete = Object.values(nums).every((n) => n !== null && Number.isFinite(n));
  const inRange = complete && Object.values(nums).every((n) => (n as number) >= AXIS_LO && (n as number) <= AXIS_HI);
  const raw = complete ? (nums as Candle) : null;
  const candle = raw ? normaliseCandle(raw) : null;
  const adjusted = raw !== null && candle !== null && (candle.high !== raw.high || candle.low !== raw.low);

  const prevNums = {open: parseNumber(values.po), high: parseNumber(values.ph), low: parseNumber(values.pl), close: parseNumber(values.pc)};
  const previous = values.prev === '1' && Object.values(prevNums).every((n) => n !== null && Number.isFinite(n)) ? normaliseCandle(prevNums as Candle) : null;

  const anatomy = candle ? candleAnatomy(candle) : null;
  const activePreset = CANDLE_PRESETS.find((preset) => preset.id === values.preset);

  useTrackCalculation({
    name: 'candlestick_builder',
    embedded,
    enabled: dirty && candle !== null,
    payload: {open: candle?.open ?? null, high: candle?.high ?? null, low: candle?.low ?? null, close: candle?.close ?? null, direction: anatomy?.direction ?? null, shape: anatomy?.shape ?? null, preset: values.preset || null, previous_candle: previous !== null},
  });

  function applyPreset(preset: CandlePreset) {
    setMany({
      o: f(preset.candle.open),
      h: f(preset.candle.high),
      l: f(preset.candle.low),
      c: f(preset.candle.close),
      prev: preset.previous ? '1' : '0',
      ...(preset.previous ? {po: f(preset.previous.open), ph: f(preset.previous.high), pl: f(preset.previous.low), pc: f(preset.previous.close)} : {}),
      preset: preset.id,
    });
  }

  function edit(field: 'o' | 'h' | 'l' | 'c', price: number) {
    if (!raw) return;
    const clamped = Math.min(AXIS_HI - 0.0005, Math.max(AXIS_LO + 0.0005, Number(price.toFixed(4))));
    const next: Candle = {...raw};
    if (field === 'o') next.open = clamped;
    if (field === 'c') next.close = clamped;
    if (field === 'h') next.high = clamped;
    if (field === 'l') next.low = clamped;
    const fixed = normaliseCandle(next);
    setMany({o: f(fixed.open), h: f(fixed.high), l: f(fixed.low), c: f(fixed.close), preset: ''});
  }

  const typed = (key: 'o' | 'h' | 'l' | 'c') => (value: string) => setMany({[key]: value, preset: ''});

  const inputs = (
    <>
      <div className={styles.field}>
        <span className={styles.label}>Try a shape</span>
        <div className={styles.quickRow}>
          {CANDLE_PRESETS.map((preset) => (
            <button type="button" key={preset.id} className={`${styles.quickBtn} ${values.preset === preset.id ? styles.quickBtnOn : ''}`} aria-pressed={values.preset === preset.id} onClick={() => applyPreset(preset)}>
              {preset.label}
            </button>
          ))}
        </div>
        {activePreset && <p className={styles.hint}>{activePreset.blurb}</p>}
      </div>
      <FieldRow>
        <NumberField label="Open" value={values.o} onChange={typed('o')} />
        <NumberField label="Close" value={values.c} onChange={typed('c')} />
      </FieldRow>
      <FieldRow>
        <NumberField label="High" value={values.h} onChange={typed('h')} />
        <NumberField label="Low" value={values.l} onChange={typed('l')} />
      </FieldRow>
      <Segmented
        label="Show the previous candle"
        value={values.prev}
        onChange={(v) => set('prev', v)}
        options={[
          {value: '0', label: 'Off'},
          {value: '1', label: 'On'},
        ]}
        hint="Two-candle patterns like engulfing and inside bars need the candle before."
      />
    </>
  );

  let results;
  if (!candle || !anatomy) {
    results = <StatusMessage result={{status: 'incomplete'}} idle="Enter an open, high, low and close to draw the candle." />;
  } else if (!inRange) {
    results = <StatusMessage result={{status: 'invalid', message: `Keep the prices between ${formatPrice(AXIS_LO, 4)} and ${formatPrice(AXIS_HI, 4)} so they fit on the chart.`}} idle="" />;
  } else {
    const a = anatomy;
    const pips = (value: number) => formatNumber(value / 0.0001, 1);
    const tone = a.direction === 'bullish' ? 'positive' : a.direction === 'bearish' ? 'negative' : 'neutral';
    const lines = readCandle(candle);
    results = (
      <>
        <ResultHero
          label="What this candle is"
          value={LABEL[a.direction]}
          tone={tone}
          sub={a.shape !== 'standard' && SHAPE_NAME[a.shape] !== LABEL[a.direction] ? SHAPE_NAME[a.shape] : undefined}
          sentence={<>A candle is four prices drawn as a shape: the open, the high, the low and the close. Drag a handle on the chart and watch it change.</>}
        />
        <CandleCanvas candle={candle} previous={previous} onEdit={edit} />
        {adjusted && <Note>The high can’t be below the open or close, and the low can’t be above them, so the chart stretches the wicks to fit the body.</Note>}
        <StatGrid
          stats={[
            {label: 'Range (high − low)', value: `${pips(a.range)} pips`},
            {label: 'Body', value: `${pips(a.body)} pips`, hint: `${formatPercent(a.bodyPct, 0)} of the range`},
            {label: 'Upper wick', value: `${pips(a.upperWick)} pips`, hint: `${formatPercent(a.upperPct, 0)} of the range`},
            {label: 'Lower wick', value: `${pips(a.lowerWick)} pips`, hint: `${formatPercent(a.lowerPct, 0)} of the range`},
          ]}
        />
        <div className={styles.readout}>
          <p className={styles.readoutTitle}>What the candle says</p>
          <ul>
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
        <Note>A single candle is a clue, not a signal. Patterns mean more when they appear at a meaningful level and in the right context, and none of them guarantees what price will do next.</Note>
        <Explainer
          steps={[
            `Body = |Close − Open| = |${formatPrice(candle.close, 4)} − ${formatPrice(candle.open, 4)}| = ${pips(a.body)} pips`,
            `Upper wick = High − the higher of open and close = ${formatPrice(candle.high, 4)} − ${formatPrice(Math.max(candle.open, candle.close), 4)} = ${pips(a.upperWick)} pips`,
            `Lower wick = the lower of open and close − Low = ${formatPrice(Math.min(candle.open, candle.close), 4)} − ${formatPrice(candle.low, 4)} = ${pips(a.lowerWick)} pips`,
            `Direction: close ${candle.close > candle.open ? 'above' : candle.close < candle.open ? 'below' : 'equal to'} open, so the candle is ${LABEL[a.direction].toLowerCase()}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('candlestick-builder').name} name="candlestick_builder" embedded={embedded} href={getTool('candlestick-builder').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
