import {formatMoney, formatNumber, formatPercent, formatRatio, parseNumber} from '../../../utils/calculators/format';
import {getInstrument, seedLevels, type CurrencyCode, type Instrument} from '../../../utils/calculators/instruments';
import {planTrade, type Direction} from '../../../utils/calculators/sizing';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {currencyNote, distanceText, needsManualRate, priceDecimals, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {SIZING_FIELDS, riskHint, sizeHeadline, sizingContext, sizingSteps, SizingAdvanced} from '../SizingParts';
import {Callout, CurrencySelect, Explainer, ExchangeRateField, FieldRow, MarketSelect, Note, NumberField, ResultHero, Segmented, SliderField, StatGrid, StatusMessage, ToolCard} from '../ui';
import {getTool} from '../../../data/tools';
import {PriceLadder} from './PriceLadder';

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
  ...SIZING_FIELDS,
  direction: {default: 'long', options: ['long', 'short']},
  entry: {default: seed.entry},
  stop: {default: seed.stop},
  target: {default: seed.target},
});

export default function TradePlanner({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {
    syncUrl: !embedded,
    finalize: (initial, urlKeys) =>
      urlKeys.includes('pair') && !urlKeys.some((key) => key === 'entry' || key === 'stop' || key === 'target')
        ? {...initial, ...levelsFor(getInstrument(initial.pair), initial.direction as Direction)}
        : initial,
  });

  const instrument = getInstrument(values.pair);
  const account = values.currency as CurrencyCode;
  const direction = values.direction as Direction;
  const context = sizingContext(values);
  const entry = parseNumber(values.entry);
  const stop = parseNumber(values.stop);
  const target = parseNumber(values.target);
  const result = planTrade({...context, direction, entry, stop, target});
  const manualRateNeeded = needsManualRate(instrument, account);
  const decimals = priceDecimals(instrument, values.entry, values.stop, values.target);
  const writePrice = (key: 'stop' | 'target') => (price: number) => set(key, price.toFixed(decimals));

  useTrackCalculation({
    name: 'trade_planner',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      account_balance: context.balance,
      account_currency: account,
      risk_percentage: context.riskPct,
      market: instrument.id,
      direction,
      entry_price: entry,
      stop_loss_price: stop,
      target_price: target,
      amount_at_risk: result.status === 'ok' ? result.value.sizing.actualRisk : null,
      position_size_units: result.status === 'ok' ? result.value.sizing.units : null,
      position_size_lots: result.status === 'ok' ? result.value.sizing.lots : null,
      potential_profit: result.status === 'ok' ? (result.value.target?.profit ?? null) : null,
      risk_reward_ratio: result.status === 'ok' ? (result.value.target?.ratio ?? null) : null,
    },
  });

  function changeMarket(id: string) {
    const next = getInstrument(id);
    setMany({pair: id, ...levelsFor(next, direction), ...(next.kind !== instrument.kind ? {contract: '', step: ''} : {})});
  }

  /** Switching side mirrors the stop and target around the entry so the trade stays valid. */
  function changeDirection(next: string) {
    if (next === direction) return;
    const mirror = (text: string) => {
      const value = parseNumber(text);
      return entry !== null && value !== null && Number.isFinite(value) ? (entry + (entry - value)).toFixed(decimals) : text;
    };
    setMany({direction: next, stop: mirror(values.stop), target: mirror(values.target)});
  }

  const inputs = (
    <>
      <NumberField label="Account balance" value={values.balance} onChange={(v) => set('balance', v)} prefix={account} group placeholder="10,000" />
      <SliderField label="Risk per trade" value={values.risk} onChange={(v) => set('risk', v)} min={0.25} max={5} step={0.05} hint={riskHint(context.balance, context.riskPct, account)} />
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
      <NumberField label="Entry price" value={values.entry} onChange={(v) => set('entry', v)} />
      <FieldRow>
        <NumberField label="Stop-loss price" value={values.stop} onChange={(v) => set('stop', v)} />
        <NumberField label="Target price (optional)" value={values.target} onChange={(v) => set('target', v)} />
      </FieldRow>
      {manualRateNeeded && instrument.kind === 'forex' && <ExchangeRateField from={instrument.quote} to={account} value={values.rate} onChange={(v) => set('rate', v)} />}
      <SizingAdvanced instrument={instrument} contract={values.contract} step={values.step} onContract={(v) => set('contract', v)} onStep={(v) => set('step', v)} />
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter your account, entry and stop and your plan appears here." />;
  } else {
    const {sizing: v, target: outcome, targetIssue} = result.value;
    const headline = sizeHeadline(v, instrument);
    const balance = context.balance ?? 0;
    const loss = formatMoney(-v.actualRisk, account);
    const stopLabel = {money: loss, distance: distanceText(v.stopDistanceInUnits, instrument)};
    const targetLabel = outcome ? {money: formatMoney(outcome.profit, account, {signed: true}), distance: distanceText(outcome.distanceInUnits, instrument)} : null;

    results = (
      <>
        <ResultHero
          label="Your position size"
          value={headline.value}
          unit={headline.unit}
          sub={headline.sub}
          sentence={
            <>
              If your stop is hit you lose <strong>{formatMoney(v.actualRisk, account)}</strong> ({formatPercent(v.actualRiskPct)} of your account)
              {outcome ? (
                <>
                  ; if your target is hit you make <strong>{formatMoney(outcome.profit, account)}</strong> ({formatPercent(outcome.gainPct)}) — a <strong>{formatRatio(outcome.ratio)}</strong> risk-to-reward
                </>
              ) : null}
              . Excludes slippage and fees.
              {v.wasRounded && v.lotsExact !== null && <> Rounded down from {formatNumber(v.lotsExact, 4)} lots so you never risk more than {formatMoney(v.targetRisk, account)}.</>}
            </>
          }
        />
        {v.belowMinimum && (
          <Callout tone="warning">
            Even the smallest size ({formatNumber(v.lotStep, 4)} {instrument.kind === 'forex' ? 'lots' : 'units'}) would risk {formatMoney(v.minimumStepRisk, account)}, more than your {formatMoney(v.targetRisk, account)} target. Use a tighter stop or risk a little more.
          </Callout>
        )}
        {targetIssue && <Callout tone="warning">{targetIssue}</Callout>}
        {entry !== null && stop !== null && (
          <PriceLadder
            instrument={instrument}
            direction={direction}
            entry={entry}
            stop={stop}
            target={outcome ? target : null}
            decimals={decimals}
            stopLabel={stopLabel}
            targetLabel={targetLabel}
            onStopChange={writePrice('stop')}
            onTargetChange={writePrice('target')}
          />
        )}
        <Note>Drag the stop or target line — or focus it and use the arrow keys — and every number updates.</Note>
        <StatGrid
          stats={[
            {label: 'Amount at risk', value: formatMoney(v.actualRisk, account), tone: 'negative', hint: v.wasRounded ? `Target ${formatMoney(v.targetRisk, account)}` : undefined},
            {label: 'Stop distance', value: distanceText(v.stopDistanceInUnits, instrument)},
            {label: 'Potential profit', value: outcome ? formatMoney(outcome.profit, account) : '—', tone: outcome ? 'positive' : 'neutral'},
            {label: 'Target distance', value: outcome ? distanceText(outcome.distanceInUnits, instrument) : '—'},
            {label: 'Risk : reward', value: outcome ? formatRatio(outcome.ratio) : '—'},
            {label: 'Break-even win rate', value: outcome ? formatPercent(outcome.breakEvenWinRate, 1) : '—', hint: outcome ? 'before costs' : undefined},
            {label: 'If stopped', value: formatPercent(-v.actualRiskPct, 2, true), tone: 'negative', hint: 'of account'},
            {label: 'If target hit', value: outcome ? formatPercent(outcome.gainPct, 2, true) : '—', tone: outcome ? 'positive' : 'neutral', hint: outcome ? 'of account' : undefined},
          ]}
        />
        <Note>{currencyNote(v.rateSource, instrument, account, v.rate)}</Note>
        <Explainer
          steps={[
            ...sizingSteps({value: v, instrument, currency: account, balance, riskPct: context.riskPct ?? 0, prices: {entry: values.entry.trim(), stop: values.stop.trim()}}),
            ...(outcome
              ? [
                  `Reward distance = |${values.target.trim()} − ${values.entry.trim()}| = ${formatNumber(outcome.distance, 6)} (${distanceText(outcome.distanceInUnits, instrument)})`,
                  `Potential profit = ${formatNumber(v.units, 2)} units × ${formatNumber(outcome.distance, 6)} × conversion = ${formatMoney(outcome.profit, account)}`,
                  `Risk : reward = ${formatNumber(outcome.distance, 6)} ÷ ${formatNumber(v.stopDistance, 6)} = ${formatRatio(outcome.ratio)}`,
                ]
              : []),
          ]}
        />
      </>
    );
  }

  return (
    <ToolCard
      title={getTool('trade-planner').name}
      name="trade_planner"
      embedded={embedded}
      href={getTool('trade-planner').path}
      dirty={dirty}
      onReset={reset}
      shareUrl={shareUrl}
      inputs={inputs}
      results={results}
    />
  );
}
