import {getTool} from '../../../data/tools';
import {formatMoney, formatNumber, formatPercent, formatR, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {strategyStats} from '../../../utils/calculators/strategyStats';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Callout, CurrencySelect, Explainer, FieldRow, Note, NumberField, ResultHero, Segmented, StatGrid, StatusMessage, ToolCard} from '../ui';
import {WinRateGauge} from './WinRateGauge';

const SPECS = defineSpecs({
  mode: {default: 'money', options: ['money', 'r']},
  winners: {default: '45'},
  losers: {default: '55'},
  breakEven: {default: ''},
  avgWin: {default: '200'},
  avgLoss: {default: '100'},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
});

export default function StrategyStatisticsCalculator({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const inR = values.mode === 'r';
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const show = (value: number, signed = true) => (inR ? formatR(value) : formatMoney(value, account, {signed}));

  const result = strategyStats({
    winners: parseNumber(values.winners),
    losers: parseNumber(values.losers),
    breakEven: parseNumber(values.breakEven),
    averageWin: parseNumber(values.avgWin),
    averageLoss: parseNumber(values.avgLoss),
  });

  useTrackCalculation({
    name: 'strategy_statistics',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      mode: values.mode,
      winners: parseNumber(values.winners),
      losers: parseNumber(values.losers),
      break_even_trades: parseNumber(values.breakEven),
      average_win: parseNumber(values.avgWin),
      average_loss: parseNumber(values.avgLoss),
      win_rate: result.status === 'ok' ? result.value.winRate : null,
      expectancy: result.status === 'ok' ? result.value.expectancy : null,
      profit_factor: result.status === 'ok' ? result.value.profitFactor : null,
      net_profit: result.status === 'ok' ? result.value.netProfit : null,
    },
  });

  const inputs = (
    <>
      <Segmented
        label="Measure results in"
        value={values.mode}
        onChange={(v) => setMany(v === 'r' ? {mode: v, avgWin: '2', avgLoss: '1'} : {mode: v, avgWin: '200', avgLoss: '100'})}
        options={[
          {value: 'money', label: 'Money'},
          {value: 'r', label: 'R multiples'},
        ]}
      />
      <FieldRow>
        <NumberField label="Winning trades" value={values.winners} onChange={(v) => set('winners', v)} group placeholder="45" />
        <NumberField label="Losing trades" value={values.losers} onChange={(v) => set('losers', v)} group placeholder="55" />
      </FieldRow>
      <NumberField label="Break-even trades (optional)" value={values.breakEven} onChange={(v) => set('breakEven', v)} group placeholder="0" hint="Trades that closed at about zero. They count in the total but not as wins or losses." />
      <FieldRow>
        <NumberField label="Average winning trade" value={values.avgWin} onChange={(v) => set('avgWin', v)} prefix={inR ? undefined : symbol} suffix={inR ? 'R' : undefined} />
        <NumberField label="Average losing trade" value={values.avgLoss} onChange={(v) => set('avgLoss', v)} prefix={inR ? undefined : symbol} suffix={inR ? 'R' : undefined} hint="Enter as a positive number." />
      </FieldRow>
      {!inR && <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />}
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter the number of winners and losers, and the average win and loss." />;
  } else {
    const v = result.value;
    const tone = v.edge === 'positive' ? 'positive' : v.edge === 'negative' ? 'negative' : 'neutral';
    results = (
      <>
        <ResultHero
          label="Historical expectancy per trade"
          value={show(v.expectancy)}
          unit="per trade"
          tone={tone}
          sentence={
            v.edge === 'positive' ? (
              <>
                Across these <strong>{formatNumber(v.trades, 0)}</strong> trades, each one contributed an average of <strong>{show(v.expectancy)}</strong> to the results, {show(v.netProfit)} in total.
              </>
            ) : v.edge === 'negative' ? (
              <>
                Across these <strong>{formatNumber(v.trades, 0)}</strong> trades, each one cost an average of <strong>{show(Math.abs(v.expectancy), false)}</strong>: {show(v.netProfit)} in total. On these numbers the strategy lost money.
              </>
            ) : (
              <>On these numbers the strategy broke exactly even before costs.</>
            )
          }
        />
        <WinRateGauge winRate={v.winRate} breakEvenWinRate={v.breakEvenWinRate} winners={v.winners} losers={v.losers} breakEven={v.breakEven} />
        {v.edge === 'positive' && v.winRate < 50 && (
          <Callout tone="success">A strategy does not need a high win rate to be profitable. Winning {formatPercent(v.winRate, 0)} of the time works here because the average winner is {formatNumber(v.payoffRatio ?? 0, 2)}× the average loser.</Callout>
        )}
        {v.edge === 'negative' && v.winRate >= 50 && <Callout tone="warning">A winning-most-of-the-time record can still lose money: here the losers are big enough to outweigh the winners.</Callout>}
        <StatGrid
          stats={[
            {label: 'Trades', value: formatNumber(v.trades, 0)},
            {label: 'Win rate', value: formatPercent(v.winRate, 1)},
            {label: 'Loss rate', value: formatPercent(v.lossRate, 1)},
            {label: 'Reward : risk', value: v.payoffRatio !== null ? `${formatNumber(v.payoffRatio, 2)} : 1` : '—', hint: 'average win ÷ average loss'},
            {label: 'Profit factor', value: v.profitFactor !== null ? formatNumber(v.profitFactor, 2) : '∞', hint: v.profitFactor !== null ? 'gross win ÷ gross loss' : 'no losing trades'},
            {label: 'Net result', value: show(v.netProfit), tone},
            {label: 'Break-even win rate', value: v.breakEvenWinRate !== null ? formatPercent(v.breakEvenWinRate, 1) : '—', hint: 'before costs'},
            {label: 'Average R', value: v.expectancyR !== null ? formatR(v.expectancyR) : '—', hint: 'per trade', tone},
          ]}
        />
        <Note>Results describe the past. A sample of a few dozen trades can look good or bad by chance, costs are not included unless they are in the averages, and none of this predicts future results.</Note>
        <Explainer
          steps={[
            `Trades = ${v.winners} + ${v.losers}${v.breakEven ? ` + ${v.breakEven}` : ''} = ${v.trades}; win rate = ${v.winners} ÷ ${v.trades} = ${formatPercent(v.winRate, 2)}`,
            `Gross profit = ${v.winners} × ${show(parseNumber(values.avgWin) ?? 0, false)} = ${show(v.grossProfit, false)}; gross loss = ${v.losers} × ${show(parseNumber(values.avgLoss) ?? 0, false)} = ${show(v.grossLoss, false)}`,
            `Net result = ${show(v.grossProfit, false)} − ${show(v.grossLoss, false)} = ${show(v.netProfit)}`,
            `Expectancy = ${show(v.netProfit)} ÷ ${v.trades} trades = ${show(v.expectancy)}`,
            ...(v.profitFactor !== null ? [`Profit factor = ${show(v.grossProfit, false)} ÷ ${show(v.grossLoss, false)} = ${formatNumber(v.profitFactor, 2)}`] : []),
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('strategy-statistics-calculator').name} name="strategy_statistics" embedded={embedded} href={getTool('strategy-statistics-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
