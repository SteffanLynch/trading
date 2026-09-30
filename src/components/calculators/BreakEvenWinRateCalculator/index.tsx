import {getTool} from '../../../data/tools';
import {formatNumber, formatPercent, formatRatio, parseNumber} from '../../../utils/calculators/format';
import {breakEvenWinRate, requiredRewardToRisk} from '../../../utils/calculators/risk';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Explainer, LineChart, MiniTable, Note, ResultHero, Segmented, SliderField, SplitBar, StatusMessage, ToolCard} from '../ui';
import {incomplete, invalid, isNum, ok, type Calc} from '../../../utils/calculators/result';

const SPECS = defineSpecs({
  mode: {default: 'rr', options: ['rr', 'winrate']},
  rr: {default: '2'},
  winRate: {default: '40'},
});

const CURVE: [number, number][] = Array.from({length: 96}, (_, index) => {
  const rr = 0.25 + index * 0.05;
  return [Number(rr.toFixed(2)), breakEvenWinRate(rr)];
});
const REFERENCE = [0.5, 1, 1.5, 2, 3, 5];

interface Value {
  rr: number;
  winRate: number;
}

function solve(mode: string, rr: number | null, winRate: number | null): Calc<Value> {
  if (mode === 'rr') {
    if (!isNum(rr)) return incomplete();
    if (rr <= 0) return invalid('Risk-to-reward must be greater than zero.');
    return ok({rr, winRate: breakEvenWinRate(rr)});
  }
  if (!isNum(winRate)) return incomplete();
  if (winRate <= 0 || winRate >= 100) return invalid('Win rate must be between 0% and 100%.');
  return ok({rr: requiredRewardToRisk(winRate), winRate});
}

export default function BreakEvenWinRateCalculator({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const knowsRatio = values.mode === 'rr';
  const result = solve(values.mode, parseNumber(values.rr), parseNumber(values.winRate));

  useTrackCalculation({
    name: 'break_even_win_rate',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      mode: values.mode,
      risk_reward_ratio: result.status === 'ok' ? result.value.rr : null,
      win_rate: result.status === 'ok' ? result.value.winRate : null,
    },
  });

  const inputs = (
    <>
      <Segmented
        label="I know my…"
        value={values.mode}
        onChange={(v) => set('mode', v)}
        options={[
          {value: 'rr', label: 'Risk : reward'},
          {value: 'winrate', label: 'Win rate'},
        ]}
      />
      {knowsRatio ? (
        <SliderField label="Reward for every 1 you risk" value={values.rr} onChange={(v) => set('rr', v)} min={0.25} max={10} step={0.25} suffix="R" hint="2 means you aim to make 2 for every 1 you risk (1 : 2)." />
      ) : (
        <SliderField label="Win rate" value={values.winRate} onChange={(v) => set('winRate', v)} min={5} max={95} step={1} suffix="%" hint="The share of your trades that hit their target." />
      )}
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter a risk-to-reward ratio or a win rate to see what it takes to break even." />;
  } else {
    const v = result.value;
    results = (
      <>
        {knowsRatio ? (
          <ResultHero
            label="Break-even win rate"
            value={formatPercent(v.winRate, 1)}
            sentence={
              <>
                At <strong>{formatRatio(v.rr)}</strong>, you need to win more than roughly <strong>{formatPercent(v.winRate, 1)}</strong> of your trades to have a positive result, before costs. Win less often than that and you lose money over time, however good the winners feel.
              </>
            }
          />
        ) : (
          <ResultHero
            label="Reward-to-risk you need"
            value={formatRatio(v.rr)}
            sentence={
              <>
                Winning <strong>{formatPercent(v.winRate, 1)}</strong> of trades, your average winner must be at least <strong>{formatNumber(v.rr, 2)}×</strong> your average loser just to break even, before costs.
              </>
            }
          />
        )}
        <SplitBar left={{label: `Win ${formatPercent(v.winRate, 1)}`, value: v.winRate, tone: 'positive'}} right={{label: `Lose ${formatPercent(100 - v.winRate, 1)}`, value: 100 - v.winRate, tone: 'negative'}} />
        <LineChart
          ariaLabel="Break-even win rate falls as the reward-to-risk ratio rises"
          xLabel="Reward for every 1 risked"
          formatX={(x) => `1:${formatNumber(x, 1)}`}
          formatY={(y) => `${formatNumber(y, 0)}%`}
          series={[{name: 'Break-even win rate', points: CURVE, color: 'var(--accent)', area: true}]}
          marker={v.rr >= 0.25 && v.rr <= 5 ? {x: v.rr, y: v.winRate, label: `${formatRatio(v.rr)} → ${formatPercent(v.winRate, 1)}`} : undefined}
        />
        <MiniTable
          caption="Break-even win rate at common risk-to-reward ratios"
          head={['Risk : reward', 'Break-even win rate']}
          rows={REFERENCE.map((rr) => ({cells: [formatRatio(rr), formatPercent(breakEvenWinRate(rr), 1)], highlight: Math.abs(rr - v.rr) < 1e-9}))}
        />
        <Note>This is the break-even point before spreads, commissions and slippage. Real costs push the win rate you need higher.</Note>
        <Explainer
          steps={
            knowsRatio
              ? [`Break-even win rate = 1 ÷ (1 + R) = 1 ÷ (1 + ${formatNumber(v.rr, 3)}) = ${formatNumber(1 / (1 + v.rr), 4)} (${formatPercent(v.winRate, 2)})`]
              : [`Required R = (1 − Win rate) ÷ Win rate = (1 − ${formatNumber(v.winRate / 100, 4)}) ÷ ${formatNumber(v.winRate / 100, 4)} = ${formatNumber(v.rr, 3)}`]
          }
        />
      </>
    );
  }

  return <ToolCard title={getTool('break-even-win-rate-calculator').name} name="break_even_win_rate" embedded={embedded} href={getTool('break-even-win-rate-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
