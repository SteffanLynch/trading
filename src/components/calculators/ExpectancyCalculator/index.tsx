import {getTool} from '../../../data/tools';
import {calculateExpectancy} from '../../../utils/calculators/expectancy';
import {formatMoney, formatNumber, formatPercent, formatR, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Callout, CurrencySelect, Explainer, FieldRow, Note, NumberField, ResultHero, Segmented, SliderField, StatGrid, StatusMessage, ToolCard} from '../ui';

const SPECS = defineSpecs({
  mode: {default: 'r', options: ['r', 'money']},
  win: {default: '45'},
  avgWin: {default: '2'},
  avgLoss: {default: '1'},
  trades: {default: '100'},
  oneR: {default: ''},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
});

export default function ExpectancyCalculator({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const inR = values.mode === 'r';
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const oneR = parseNumber(values.oneR);
  const trades = parseNumber(values.trades);

  const result = calculateExpectancy({winRatePct: parseNumber(values.win), averageWin: parseNumber(values.avgWin), averageLoss: parseNumber(values.avgLoss), trades});

  useTrackCalculation({
    name: 'expectancy',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      mode: values.mode,
      win_rate: parseNumber(values.win),
      average_win: parseNumber(values.avgWin),
      average_loss: parseNumber(values.avgLoss),
      trades,
      expectancy: result.status === 'ok' ? result.value.expectancy : null,
      profit_factor: result.status === 'ok' ? result.value.profitFactor : null,
      break_even_win_rate: result.status === 'ok' ? result.value.breakEvenWinRate : null,
    },
  });

  const show = (value: number, signed = true) => (inR ? formatR(value) : formatMoney(value, account, {signed}));

  const inputs = (
    <>
      <Segmented
        label="Measure my trades in"
        value={values.mode}
        onChange={(v) => setMany(v === 'r' ? {mode: v, avgWin: '2', avgLoss: '1'} : {mode: v, avgWin: '300', avgLoss: '100'})}
        options={[
          {value: 'r', label: 'R multiples'},
          {value: 'money', label: 'Money'},
        ]}
        hint={inR ? '1R is the amount you risk on a trade. A 2R winner makes twice that.' : undefined}
      />
      <SliderField label="Win rate" value={values.win} onChange={(v) => set('win', v)} min={5} max={95} step={1} suffix="%" hint="The share of your trades that were winners." />
      <FieldRow>
        <NumberField label={inR ? 'Average win' : 'Average winning trade'} value={values.avgWin} onChange={(v) => set('avgWin', v)} prefix={inR ? undefined : symbol} suffix={inR ? 'R' : undefined} placeholder={inR ? '2' : '300'} />
        <NumberField label={inR ? 'Average loss' : 'Average losing trade'} value={values.avgLoss} onChange={(v) => set('avgLoss', v)} prefix={inR ? undefined : symbol} suffix={inR ? 'R' : undefined} placeholder={inR ? '1' : '100'} hint="Enter as a positive number." />
      </FieldRow>
      <NumberField label="Number of trades (optional)" value={values.trades} onChange={(v) => set('trades', v)} group placeholder="100" hint="Projects the average across a sample." />
      {inR && (
        <FieldRow>
          <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />
          <NumberField label="1R equals (optional)" value={values.oneR} onChange={(v) => set('oneR', v)} prefix={symbol} group placeholder="100" hint="Converts R into money." />
        </FieldRow>
      )}
      {!inR && <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />}
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter a win rate, an average win and an average loss to see your expectancy." />;
  } else {
    const v = result.value;
    const tone = v.edge === 'positive' ? 'positive' : v.edge === 'negative' ? 'negative' : 'neutral';
    results = (
      <>
        <ResultHero
          label="Expectancy per trade"
          value={show(v.expectancy)}
          unit="per trade"
          tone={tone}
          sentence={
            v.edge === 'positive' ? (
              <>
                Across this sample, an average trade returned <strong>{show(v.expectancy)}</strong>
                {inR ? <>, or {formatNumber(v.expectancy, 2)} times the amount you normally risk</> : null}.
                {v.projected !== null && <> Over {formatNumber(trades ?? 0, 0)} trades that adds up to <strong>{show(v.projected)}</strong>.</>}
              </>
            ) : v.edge === 'negative' ? (
              <>
                On these numbers an average trade <strong>loses {show(Math.abs(v.expectancy), false)}</strong>. Over many trades that loses money, whatever the run of recent results looks like. Improve the win rate, the size of winners relative to losers, or both.
              </>
            ) : (
              <>On these numbers an average trade neither makes nor loses money: you are exactly at break-even before costs.</>
            )
          }
        />
        <Callout tone="info">Expectancy describes results you have already had. It is not a forecast, small samples can be badly misleading, and it ignores costs unless you have included them in your averages.</Callout>
        <StatGrid
          stats={[
            {label: 'Break-even win rate', value: formatPercent(v.breakEvenWinRate, 1), hint: 'at this payoff ratio'},
            {label: 'Payoff ratio', value: `${formatNumber(v.payoffRatio, 2)} : 1`, hint: 'average win ÷ average loss'},
            {label: 'Profit factor', value: v.profitFactor !== null ? formatNumber(v.profitFactor, 2) : '∞', hint: v.profitFactor !== null ? 'gross win ÷ gross loss' : 'no losing trades'},
            {label: 'Loss rate', value: formatPercent(v.lossRatePct, 1)},
            ...(inR && oneR !== null && oneR > 0 ? [{label: 'Per trade in money', value: formatMoney(v.expectancy * oneR, account, {signed: true}), tone: tone as 'positive' | 'negative' | 'neutral'}] : []),
            ...(inR && oneR !== null && oneR > 0 && v.projected !== null ? [{label: `Over ${formatNumber(trades ?? 0, 0)} trades`, value: formatMoney(v.projected * oneR, account, {signed: true}), tone: tone as 'positive' | 'negative' | 'neutral'}] : []),
          ]}
        />
        <Note>Profit factor here is the expected gross profit divided by expected gross loss per trade at these averages.</Note>
        <Explainer
          steps={[
            `Loss rate = 100% − ${formatNumber(parseNumber(values.win) ?? 0, 2)}% = ${formatPercent(v.lossRatePct, 2)}`,
            `Expectancy = Win rate × Average win − Loss rate × Average loss`,
            `= ${formatNumber((parseNumber(values.win) ?? 0) / 100, 4)} × ${formatNumber(parseNumber(values.avgWin) ?? 0, 2)} − ${formatNumber(v.lossRatePct / 100, 4)} × ${formatNumber(parseNumber(values.avgLoss) ?? 0, 2)} = ${formatNumber(v.expectancy, 4)}${inR ? 'R' : ''}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('expectancy-calculator').name} name="expectancy" embedded={embedded} href={getTool('expectancy-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
