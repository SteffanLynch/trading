import {getTool} from '../../../data/tools';
import {formatMoney, formatNumber, formatPercent, formatRatio, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, INSTRUMENT_IDS, getInstrument, seedLevels, type CurrencyCode, type Instrument} from '../../../utils/calculators/instruments';
import {targetForRatio} from '../../../utils/calculators/risk';
import type {Direction} from '../../../utils/calculators/sizing';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {visualiseTrade} from '../../../utils/calculators/tradeDiagram';
import {currencyNote, distanceText, needsManualRate, priceDecimals, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {PriceLadder} from '../TradePlanner/PriceLadder';
import {Callout, CurrencySelect, Explainer, ExchangeRateField, FieldRow, MarketSelect, Note, NumberField, ResultHero, Segmented, StatGrid, StatusMessage, ToolCard} from '../ui';
import styles from '../ui/ui.module.css';

/** Example levels for a market, mirrored for a short trade. */
function levelsFor(instrument: Instrument, direction: Direction) {
  const long = seedLevels(instrument);
  if (direction === 'long') return long;
  const entry = Number(long.entry);
  const mirror = (value: string) => (entry + (entry - Number(value))).toFixed(instrument.pipDecimals);
  return {entry: long.entry, stop: mirror(long.stop), target: mirror(long.target)};
}

const seed = seedLevels(getInstrument('EURUSD'));

const SPECS = defineSpecs({
  pair: {default: 'EURUSD', options: INSTRUMENT_IDS},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
  direction: {default: 'long', options: ['long', 'short']},
  size: {default: '0.2'},
  entry: {default: seed.entry},
  stop: {default: seed.stop},
  target: {default: seed.target},
  rate: {default: ''},
});

const QUICK_RATIOS = [1, 2, 3];

export default function StopTargetVisualiser({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {
    syncUrl: !embedded,
    finalize: (initial, urlKeys) =>
      urlKeys.includes('pair') && !urlKeys.some((key) => key === 'entry' || key === 'stop' || key === 'target') ? {...initial, ...levelsFor(getInstrument(initial.pair), initial.direction as Direction)} : initial,
  });

  const instrument = getInstrument(values.pair);
  const forex = instrument.kind === 'forex';
  const account = values.currency as CurrencyCode;
  const direction = values.direction as Direction;
  const entry = parseNumber(values.entry);
  const stop = parseNumber(values.stop);
  const target = parseNumber(values.target);
  const size = parseNumber(values.size);
  const units = size === null ? null : forex ? size * instrument.contractSize : size;
  const decimals = priceDecimals(instrument, values.entry, values.stop, values.target);

  const result = visualiseTrade({instrument, accountCurrency: account, direction, entry, stop, target, units, manualRate: parseNumber(values.rate)});
  const write = (key: 'entry' | 'stop' | 'target') => (price: number) => set(key, price.toFixed(decimals));

  useTrackCalculation({
    name: 'stop_target_visualiser',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      market: instrument.id,
      direction,
      account_currency: account,
      position_size: size,
      entry_price: entry,
      stop_loss_price: stop,
      target_price: target,
      risk: result.status === 'ok' ? result.value.risk : null,
      reward: result.status === 'ok' ? result.value.reward : null,
      risk_reward_ratio: result.status === 'ok' ? result.value.ratio : null,
    },
  });

  function changeMarket(id: string) {
    const next = getInstrument(id);
    setMany({pair: id, ...levelsFor(next, direction), size: next.kind === 'forex' ? '0.2' : '10'});
  }

  function changeDirection(next: string) {
    if (next === direction) return;
    const mirror = (text: string) => {
      const value = parseNumber(text);
      return entry !== null && value !== null && Number.isFinite(value) ? (entry + (entry - value)).toFixed(decimals) : text;
    };
    setMany({direction: next, stop: mirror(values.stop), target: mirror(values.target)});
  }

  function setRatio(ratio: number) {
    if (entry === null || stop === null) return;
    set('target', targetForRatio(entry, stop, ratio).toFixed(decimals));
  }

  const ratioNow = result.status === 'ok' ? result.value.ratio : 2;

  const inputs = (
    <>
      <FieldRow>
        <MarketSelect value={values.pair} onChange={changeMarket} />
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} />
      </FieldRow>
      <Segmented
        label="Direction"
        value={values.direction}
        onChange={changeDirection}
        options={[
          {value: 'long', label: 'Long (buy)'},
          {value: 'short', label: 'Short (sell)'},
        ]}
      />
      <NumberField label="Position size" value={values.size} onChange={(v) => set('size', v)} suffix={forex ? 'lots' : 'units'} hint="Kept fixed, so moving the lines shows how risk and reward change for the same position." />
      <NumberField label="Entry price" value={values.entry} onChange={(v) => set('entry', v)} />
      <FieldRow>
        <NumberField label="Stop-loss price" value={values.stop} onChange={(v) => set('stop', v)} />
        <NumberField label="Take-profit price" value={values.target} onChange={(v) => set('target', v)} />
      </FieldRow>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="rr-slider">
          <span>Move the target to a reward-to-risk of</span>
          <span>{formatRatio(ratioNow)}</span>
        </label>
        <input id="rr-slider" className={styles.range} type="range" min={0.5} max={6} step={0.1} value={Math.min(6, Math.max(0.5, ratioNow))} onChange={(event) => setRatio(Number(event.target.value))} />
        <div className={styles.quickRow}>
          {QUICK_RATIOS.map((ratio) => (
            <button type="button" key={ratio} className={styles.quickBtn} onClick={() => setRatio(ratio)}>
              1 : {ratio}
            </button>
          ))}
        </div>
      </div>
      {needsManualRate(instrument, account) && instrument.kind === 'forex' && <ExchangeRateField from={instrument.quote} to={account} value={values.rate} onChange={(v) => set('rate', v)} />}
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter an entry, a stop and a target to see the diagram." />;
  } else {
    const v = result.value;
    const stopLabel = {money: formatMoney(-v.risk, account), distance: distanceText(v.riskPips, instrument)};
    const targetLabel = {money: formatMoney(v.reward, account, {signed: true}), distance: distanceText(v.rewardPips, instrument)};
    results = (
      <>
        <ResultHero
          label="Risk : reward"
          value={formatRatio(v.ratio)}
          tone={v.ratio >= 1 ? 'positive' : 'negative'}
          sentence={
            <>
              Risking <strong>{formatMoney(v.risk, account)}</strong> ({distanceText(v.riskPips, instrument)}) to make <strong>{formatMoney(v.reward, account)}</strong> ({distanceText(v.rewardPips, instrument)}). Break-even needs a win rate of <strong>{formatPercent(v.breakEvenWinRate, 1)}</strong> before costs.
            </>
          }
        />
        {entry !== null && stop !== null && target !== null && (
          <PriceLadder
            instrument={instrument}
            direction={direction}
            entry={entry}
            stop={stop}
            target={target}
            decimals={decimals}
            stopLabel={stopLabel}
            targetLabel={targetLabel}
            onEntryChange={write('entry')}
            onStopChange={write('stop')}
            onTargetChange={write('target')}
          />
        )}
        <Note>Grab any line, the entry, the stop or the target, and drag it. Or focus a line and use the arrow keys (hold Shift to move ten at a time).</Note>
        {v.ratio < 1 && <Callout tone="warning">The target is closer than the stop: each win is smaller than each loss, so winning less than {formatPercent(v.breakEvenWinRate, 0)} of trades loses money.</Callout>}
        <StatGrid
          stats={[
            {label: 'Stop distance', value: distanceText(v.riskPips, instrument), tone: 'negative'},
            {label: 'Target distance', value: distanceText(v.rewardPips, instrument), tone: 'positive'},
            {label: 'Risk', value: formatMoney(v.risk, account), tone: 'negative'},
            {label: 'Potential reward', value: formatMoney(v.reward, account), tone: 'positive'},
            {label: 'Risk : reward', value: formatRatio(v.ratio)},
            {label: 'Break-even win rate', value: formatPercent(v.breakEvenWinRate, 1), hint: 'before costs'},
          ]}
        />
        <Note>{currencyNote(v.rateSource, instrument, account, v.rate)}</Note>
        <Explainer
          steps={[
            `Risk distance = |${values.entry.trim()} − ${values.stop.trim()}| = ${formatNumber(v.riskDistance, 6)} (${distanceText(v.riskPips, instrument)})`,
            `Reward distance = |${values.target.trim()} − ${values.entry.trim()}| = ${formatNumber(v.rewardDistance, 6)} (${distanceText(v.rewardPips, instrument)})`,
            `Risk = distance × position × conversion = ${formatMoney(v.risk, account)}; reward = ${formatMoney(v.reward, account)}`,
            `Risk : reward = ${formatNumber(v.rewardDistance, 6)} ÷ ${formatNumber(v.riskDistance, 6)} = ${formatRatio(v.ratio)}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('stop-target-visualiser').name} name="stop_target_visualiser" embedded={embedded} href={getTool('stop-target-visualiser').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
