import {getTool} from '../../../data/tools';
import {formatNumber, formatPercent, formatRatio, parseNumber} from '../../../utils/calculators/format';
import {INSTRUMENT_IDS, distanceUnit, getInstrument, priceToPips, seedLevels} from '../../../utils/calculators/instruments';
import {riskReward} from '../../../utils/calculators/risk';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {distanceText, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Explainer, FieldRow, MarketSelect, Note, NumberField, ResultHero, SplitBar, StatGrid, StatusMessage, ToolCard} from '../ui';

const seed = seedLevels(getInstrument('EURUSD'));

const SPECS = defineSpecs({
  pair: {default: 'EURUSD', options: INSTRUMENT_IDS},
  entry: {default: seed.entry},
  stop: {default: seed.stop},
  target: {default: seed.target},
});

export default function RiskRewardCalculator({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {
    syncUrl: !embedded,
    finalize: (initial, urlKeys) =>
      urlKeys.includes('pair') && !urlKeys.some((key) => key === 'entry' || key === 'stop' || key === 'target') ? {...initial, ...seedLevels(getInstrument(initial.pair))} : initial,
  });

  const instrument = getInstrument(values.pair);
  const entry = parseNumber(values.entry);
  const stop = parseNumber(values.stop);
  const target = parseNumber(values.target);
  const result = riskReward(entry, stop, target);

  useTrackCalculation({
    name: 'risk_reward',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      market: instrument.id,
      entry_price: entry,
      stop_loss_price: stop,
      target_price: target,
      risk_reward_ratio: result.status === 'ok' ? result.value.ratio : null,
      break_even_win_rate: result.status === 'ok' ? result.value.breakEvenWinRate : null,
    },
  });

  const inputs = (
    <>
      <MarketSelect value={values.pair} onChange={(id) => setMany({pair: id, ...seedLevels(getInstrument(id))})} hint="Sets the unit distances are shown in: pips for forex, points for everything else." />
      <NumberField label="Entry price" value={values.entry} onChange={(v) => set('entry', v)} />
      <FieldRow>
        <NumberField label="Stop-loss price" value={values.stop} onChange={(v) => set('stop', v)} />
        <NumberField label="Target price" value={values.target} onChange={(v) => set('target', v)} />
      </FieldRow>
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter your entry, stop and target to see your risk-to-reward ratio." />;
  } else {
    const v = result.value;
    const riskUnits = priceToPips(v.risk, instrument);
    const rewardUnits = priceToPips(v.reward, instrument);
    const unit = distanceUnit(instrument);
    results = (
      <>
        <ResultHero
          label="Risk : reward"
          value={formatRatio(v.ratio)}
          tone={v.ratio >= 1 ? 'positive' : 'negative'}
          sentence={
            <>
              You are risking <strong>1</strong> for the possibility of making <strong>{formatNumber(v.ratio, 2)}</strong>. At this ratio you would need to win more than <strong>{formatPercent(v.breakEvenWinRate, 1)}</strong> of your trades to break even, before costs.
            </>
          }
        />
        <SplitBar left={{label: `Risk ${distanceText(riskUnits, instrument)}`, value: v.risk, tone: 'negative'}} right={{label: `Reward ${distanceText(rewardUnits, instrument)}`, value: v.reward, tone: 'positive'}} />
        <StatGrid
          stats={[
            {label: 'Direction', value: v.direction === 'long' ? 'Long (buy)' : 'Short (sell)'},
            {label: 'Risk distance', value: distanceText(riskUnits, instrument), tone: 'negative'},
            {label: 'Reward distance', value: distanceText(rewardUnits, instrument), tone: 'positive'},
            {label: 'Break-even win rate', value: formatPercent(v.breakEvenWinRate, 1), hint: 'before costs'},
          ]}
        />
        {v.ratio < 1 && <Note>A ratio below 1 : 1 means each win is smaller than each loss, so you must win more often than you lose just to break even.</Note>}
        <Explainer
          steps={[
            `Risk = |Entry − Stop| = |${values.entry.trim()} − ${values.stop.trim()}| = ${formatNumber(v.risk, 6)} (${formatNumber(riskUnits, 1)} ${unit})`,
            `Reward = |Target − Entry| = |${values.target.trim()} − ${values.entry.trim()}| = ${formatNumber(v.reward, 6)} (${formatNumber(rewardUnits, 1)} ${unit})`,
            `Risk : reward = Reward ÷ Risk = ${formatNumber(v.reward, 6)} ÷ ${formatNumber(v.risk, 6)} = ${formatNumber(v.ratio, 3)}`,
            `Break-even win rate = 1 ÷ (1 + ${formatNumber(v.ratio, 3)}) = ${formatPercent(v.breakEvenWinRate, 2)}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('risk-reward-calculator').name} name="risk_reward" embedded={embedded} href={getTool('risk-reward-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
