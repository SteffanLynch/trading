import {getTool} from '../../../data/tools';
import {averageEntry} from '../../../utils/calculators/averageEntry';
import {formatMoney, formatNumber, formatPercent, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {decodeRows, encodeRows} from '../../../utils/calculators/rows';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Callout, CurrencySelect, Explainer, FieldRow, NumberField, ResultHero, RowList, Segmented, StatGrid, StatusMessage, ToolCard} from '../ui';
import {EntryDots} from './EntryDots';

const SPECS = defineSpecs({
  rows: {default: '10:100,12:200', list: true, maxLength: 400},
  current: {default: ''},
  direction: {default: 'long', options: ['long', 'short']},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
});

export default function AverageEntryCalculator({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const rows = decodeRows(values.rows, 2);
  const current = parseNumber(values.current);
  const direction = values.direction === 'short' ? 'short' : 'long';

  const result = averageEntry(
    rows.map(([price, quantity]) => ({price: parseNumber(price), quantity: parseNumber(quantity)})),
    {currentPrice: current, direction},
  );

  useTrackCalculation({
    name: 'average_entry',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      entries: rows.length,
      entries_raw: values.rows,
      average_price: result.status === 'ok' ? result.value.averagePrice : null,
      total_quantity: result.status === 'ok' ? result.value.totalQuantity : null,
      total_cost: result.status === 'ok' ? result.value.totalCost : null,
    },
  });

  const inputs = (
    <>
      <RowList
        columns={[{label: 'Price', prefix: symbol, placeholder: '10'}, {label: 'Quantity', placeholder: '100'}]}
        rows={rows}
        onChange={(next) => set('rows', encodeRows(next))}
        addLabel="Add entry"
        rowName="Entry"
      />
      <FieldRow>
        <NumberField label="Current price (optional)" value={values.current} onChange={(v) => set('current', v)} prefix={symbol} hint="Adds the open profit or loss on the whole position." />
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />
      </FieldRow>
      {current !== null && (
        <Segmented
          label="Position is"
          value={values.direction}
          onChange={(v) => set('direction', v)}
          options={[
            {value: 'long', label: 'Long (bought)'},
            {value: 'short', label: 'Short (sold)'},
          ]}
        />
      )}
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter a price and a quantity for each entry to see the average." />;
  } else {
    const v = result.value;
    const differs = Math.abs(v.averagePrice - v.simpleAverage) > 1e-9;
    results = (
      <>
        <ResultHero
          label="Average entry price"
          value={`${symbol}${formatNumber(v.averagePrice, 4)}`}
          sub={`${formatNumber(v.totalQuantity, 4)} units in total`}
          sentence={
            <>
              The whole position cost <strong>{formatMoney(v.totalCost, account)}</strong> for {formatNumber(v.totalQuantity, 4)} units, so each unit cost <strong>{symbol}{formatNumber(v.averagePrice, 4)}</strong> on average.
              {differs && <> The plain average of the prices ({symbol}{formatNumber(v.simpleAverage, 4)}) is different because more was bought at some prices than others.</>}
            </>
          }
        />
        <EntryDots value={v} symbol={symbol} />
        <StatGrid
          stats={[
            {label: 'Total position', value: `${formatNumber(v.totalQuantity, 4)} units`},
            {label: 'Total cost', value: formatMoney(v.totalCost, account)},
            {label: 'Average entry', value: `${symbol}${formatNumber(v.averagePrice, 4)}`},
            {label: 'Plain average', value: `${symbol}${formatNumber(v.simpleAverage, 4)}`, hint: 'ignores quantity'},
            ...(v.open
              ? [
                  {label: 'Open profit / loss', value: formatMoney(v.open.pnl, account, {signed: true}), tone: (v.open.pnl > 0 ? 'positive' : v.open.pnl < 0 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral'},
                  {label: 'Return on cost', value: formatPercent(v.open.pnlPct, 2, true), tone: (v.open.pnl > 0 ? 'positive' : v.open.pnl < 0 ? 'negative' : 'neutral') as 'positive' | 'negative' | 'neutral'},
                ]
              : []),
          ]}
        />
        {v.entries.length >= 2 && <Callout tone="info">Buying more as price falls lowers the average, but it also makes the position bigger. The risk grows with it: averaging down is not the same as reducing risk.</Callout>}
        <Explainer
          steps={[
            ...v.entries.map((entry, index) => `Entry ${index + 1}: ${formatNumber(entry.quantity, 4)} × ${symbol}${formatNumber(entry.price, 4)} = ${formatMoney(entry.cost, account)}`),
            `Total cost = ${formatMoney(v.totalCost, account)}; total quantity = ${formatNumber(v.totalQuantity, 4)}`,
            `Average entry = ${formatMoney(v.totalCost, account)} ÷ ${formatNumber(v.totalQuantity, 4)} = ${symbol}${formatNumber(v.averagePrice, 4)}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('average-entry-calculator').name} name="average_entry" embedded={embedded} href={getTool('average-entry-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
