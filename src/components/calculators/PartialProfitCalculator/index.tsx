import {getTool} from '../../../data/tools';
import {formatMoney, formatNumber, formatR, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {partialProfit, rMultipleAt} from '../../../utils/calculators/partialProfit';
import {decodeRows, encodeRows} from '../../../utils/calculators/rows';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Callout, CurrencySelect, Explainer, FieldRow, Note, NumberField, ResultHero, RowList, Segmented, StatGrid, StatusMessage, ToolCard} from '../ui';
import {StageBars} from './StageBars';

const SPECS = defineSpecs({
  rows: {default: '50:1,25:2,25:4', list: true, maxLength: 400},
  mode: {default: 'r', options: ['r', 'price']},
  entry: {default: '100'},
  stop: {default: '95'},
  rest: {default: '0'},
  oneR: {default: ''},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
});

export default function PartialProfitCalculator({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const byPrice = values.mode === 'price';
  const entry = parseNumber(values.entry);
  const stop = parseNumber(values.stop);
  const rows = decodeRows(values.rows, 2);

  // In price mode each target price is converted to R using the entry and stop.
  const stages = rows.map(([pct, target]) => {
    const raw = parseNumber(target);
    const r = byPrice ? (raw !== null && entry !== null && stop !== null && Number.isFinite(raw) && Number.isFinite(entry) && Number.isFinite(stop) ? rMultipleAt(entry, stop, raw) : raw === null ? null : Number.NaN) : raw;
    return {closePct: parseNumber(pct), r};
  });

  const result = partialProfit({stages, remainderR: parseNumber(values.rest), oneRMoney: parseNumber(values.oneR)});

  useTrackCalculation({
    name: 'partial_profit',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      stages_raw: values.rows,
      target_mode: values.mode,
      remainder_r: parseNumber(values.rest),
      total_r: result.status === 'ok' ? result.value.totalR : null,
      total_money: result.status === 'ok' ? result.value.totalMoney : null,
    },
  });

  const inputs = (
    <>
      <Segmented
        label="Targets are entered as"
        value={values.mode}
        onChange={(v) => set('mode', v)}
        options={[
          {value: 'r', label: 'R multiples'},
          {value: 'price', label: 'Prices'},
        ]}
        hint={byPrice ? 'Each price is converted to R using the entry and stop below.' : '1R is the amount risked on the trade. A target at 2R is twice that.'}
      />
      {byPrice && (
        <FieldRow>
          <NumberField label="Entry price" value={values.entry} onChange={(v) => set('entry', v)} />
          <NumberField label="Stop-loss price" value={values.stop} onChange={(v) => set('stop', v)} />
        </FieldRow>
      )}
      <RowList
        columns={[{label: 'Close', suffix: '%', placeholder: '50'}, byPrice ? {label: 'At price', placeholder: '105'} : {label: 'At', suffix: 'R', placeholder: '1'}]}
        rows={rows}
        onChange={(next) => set('rows', encodeRows(next))}
        addLabel="Add take profit"
        rowName="Take profit"
      />
      <FieldRow>
        <NumberField label="Anything left ends at (R)" value={values.rest} onChange={(v) => set('rest', v)} suffix="R" hint="Only used if the stages total less than 100%. 0 is break-even; −1 is a full stop-out." />
        <NumberField label="1R equals (optional)" value={values.oneR} onChange={(v) => set('oneR', v)} prefix={symbol} group placeholder="100" hint="Converts the result into money." />
      </FieldRow>
      {values.oneR !== '' && <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />}
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter how much to close and at what target for each stage." />;
  } else {
    const v = result.value;
    const tone = v.totalR > 0 ? 'positive' : v.totalR < 0 ? 'negative' : 'neutral';
    results = (
      <>
        <ResultHero
          label="Result of the whole trade"
          value={formatR(v.totalR)}
          tone={tone}
          sub={v.totalMoney !== null ? formatMoney(v.totalMoney, account, {signed: true}) : undefined}
          sentence={
            <>
              Closing in stages turned these targets into a single blended result of <strong>{formatR(v.totalR)}</strong>. Closing everything at the first target ({formatR(v.allAtFirstTargetR)}) would have given {formatR(v.allAtFirstTargetR)}.
            </>
          }
        />
        <StageBars value={v} />
        <StatGrid
          stats={[
            {label: 'Closed at targets', value: `${formatNumber(v.allocatedPct, 1)}%`},
            {label: 'Still open / left', value: `${formatNumber(v.remainingPct, 1)}%`, hint: v.remainingPct > 0 ? `ends at ${formatR(v.remainderR)}` : undefined},
            {label: 'Total result', value: formatR(v.totalR), tone},
            ...(v.totalMoney !== null ? [{label: 'In money', value: formatMoney(v.totalMoney, account, {signed: true}), tone: tone as 'positive' | 'negative' | 'neutral'}] : []),
          ]}
        />
        {v.remainingPct > 0 && <Callout tone="warning">These stages only account for {formatNumber(v.allocatedPct, 1)}% of the position. The rest is assumed to end at {formatR(v.remainderR)}; change that above to test other outcomes.</Callout>}
        <Note>This assumes every target is reached. Scaling out lowers the result of a full winner but makes a trade easier to stick with; it does not change the risk taken at the start.</Note>
        <Explainer
          steps={[
            ...v.stages.map((stage) => `${formatNumber(stage.closePct, 2)}% × ${formatR(stage.r)} = ${formatR(stage.contribution)}`),
            ...(v.remainingPct > 0 ? [`${formatNumber(v.remainingPct, 2)}% × ${formatR(v.remainderR)} = ${formatR(v.remainderContribution)}`] : []),
            `Total = ${formatR(v.totalR)}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('partial-profit-calculator').name} name="partial_profit" embedded={embedded} href={getTool('partial-profit-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
