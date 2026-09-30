import {getTool} from '../../../data/tools';
import {calculateMargin} from '../../../utils/calculators/margin';
import {formatMoney, formatNumber, formatPercent, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Callout, CurrencySelect, Explainer, MiniTable, Note, NumberField, ResultHero, SliderField, StatGrid, StatusMessage, ToolCard} from '../ui';

const SPECS = defineSpecs({
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
  value: {default: '100000'},
  leverage: {default: '20'},
  equity: {default: '10000', pref: false},
});

export default function MarginLeverageCalculator({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const positionValue = parseNumber(values.value);
  const leverage = parseNumber(values.leverage);
  const equity = parseNumber(values.equity);

  const result = calculateMargin({positionValue, leverage, equity});

  useTrackCalculation({
    name: 'margin_leverage',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      account_currency: account,
      position_value: positionValue,
      leverage,
      account_equity: equity,
      margin_required: result.status === 'ok' ? result.value.marginRequired : null,
      effective_leverage: result.status === 'ok' ? result.value.effectiveLeverage : null,
      free_margin: result.status === 'ok' ? result.value.freeMargin : null,
    },
  });

  const inputs = (
    <>
      <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />
      <NumberField label="Position value" value={values.value} onChange={(v) => set('value', v)} prefix={symbol} group placeholder="100,000" hint="The full value of the position you want to control (units × price), in your account currency." />
      <SliderField label="Broker leverage" value={values.leverage} onChange={(v) => set('leverage', v)} min={1} max={100} step={1} suffix=":1" hint="30 means 30:1 — every 1 of margin controls 30 of position." />
      <NumberField label="Account equity (optional)" value={values.equity} onChange={(v) => set('equity', v)} prefix={symbol} group hint="Adds free margin, effective leverage and the impact of market moves on your account." />
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter a position value and your leverage to see the margin required." />;
  } else {
    const v = result.value;
    const oneP = v.impacts.find((impact) => impact.movePct === 1);
    results = (
      <>
        <ResultHero
          label="Margin required"
          value={formatMoney(v.marginRequired, account)}
          sentence={
            <>
              You control <strong>{formatMoney(positionValue ?? 0, account)}</strong> while committing <strong>{formatMoney(v.marginRequired, account)}</strong> of margin — {formatPercent(v.marginPct, 2)} of the position. Margin is held by the broker as collateral; it is not a fee and is released when the trade closes.
            </>
          }
        />
        {v.exceedsEquity && <Callout tone="error">This position needs {formatMoney(v.marginRequired, account)} of margin but your equity is {formatMoney(equity ?? 0, account)}. Your broker would not let you open it.</Callout>}
        {v.effectiveLeverage !== null && v.effectiveLeverage > 10 && !v.exceedsEquity && (
          <Callout tone="warning">
            At {formatNumber(v.effectiveLeverage, 1)}× effective leverage, a 1% move against you costs about {formatPercent(oneP?.pctOfEquity ?? 0, 1)} of your account.
          </Callout>
        )}
        <StatGrid
          stats={[
            {label: 'Margin %', value: formatPercent(v.marginPct, 2), hint: 'of position value'},
            {label: 'Free margin', value: v.freeMargin !== null ? formatMoney(v.freeMargin, account) : '—', tone: v.freeMargin !== null && v.freeMargin < 0 ? 'negative' : 'neutral', hint: v.freeMargin !== null ? 'equity − margin' : undefined},
            {label: 'Effective leverage', value: v.effectiveLeverage !== null ? `${formatNumber(v.effectiveLeverage, 2)}×` : '—', hint: v.effectiveLeverage !== null ? 'position ÷ equity' : undefined},
            {label: 'Largest position', value: v.maxPositionValue !== null ? formatMoney(v.maxPositionValue, account, {decimals: 0}) : '—', hint: v.maxPositionValue !== null ? 'equity × leverage' : undefined},
          ]}
        />
        <MiniTable
          caption="What a market move against you costs"
          head={['If price moves against you', 'You lose', 'Of your margin', ...(equity !== null && equity > 0 ? ['Of your equity'] : [])]}
          rows={v.impacts.map((impact) => ({
            cells: [`−${formatNumber(impact.movePct, 1)}%`, formatMoney(impact.loss, account), formatPercent(impact.pctOfMargin, 0), ...(impact.pctOfEquity !== null ? [formatPercent(impact.pctOfEquity, 1)] : [])],
          }))}
        />
        <Note>Leverage decides how much margin you must lock up. It does not change how much a price move earns or costs: that depends on your position size. Brokers also apply margin-call and stop-out levels that are not modelled here.</Note>
        <Explainer
          steps={[
            `Margin required = Position value ÷ Leverage = ${formatMoney(positionValue ?? 0, account)} ÷ ${formatNumber(leverage ?? 0, 2)} = ${formatMoney(v.marginRequired, account)}`,
            ...(v.effectiveLeverage !== null ? [`Effective leverage = Position value ÷ Equity = ${formatMoney(positionValue ?? 0, account)} ÷ ${formatMoney(equity ?? 0, account)} = ${formatNumber(v.effectiveLeverage, 2)}×`] : []),
            ...(v.freeMargin !== null ? [`Free margin = Equity − Margin = ${formatMoney(equity ?? 0, account)} − ${formatMoney(v.marginRequired, account)} = ${formatMoney(v.freeMargin, account)}`] : []),
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('margin-leverage-calculator').name} name="margin_leverage" embedded={embedded} href={getTool('margin-leverage-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
