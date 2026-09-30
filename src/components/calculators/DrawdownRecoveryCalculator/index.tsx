import {getTool} from '../../../data/tools';
import {REFERENCE_DRAWDOWNS, drawdownRecovery, recoveryCurve, recoveryRequired} from '../../../utils/calculators/drawdown';
import {formatMoney, formatNumber, formatPercent, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {CurrencySelect, Explainer, FieldRow, LineChart, MiniTable, NumberField, ResultHero, SliderField, StatGrid, StatusMessage, ToolCard} from '../ui';

const SPECS = defineSpecs({
  loss: {default: '20'},
  balance: {default: '10000', pref: true},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
});

const CURVE = recoveryCurve(90, 1);

export default function DrawdownRecoveryCalculator({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const loss = parseNumber(values.loss);
  const balance = parseNumber(values.balance);
  const result = drawdownRecovery(loss, balance);

  useTrackCalculation({
    name: 'drawdown_recovery',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      drawdown_percentage: loss,
      account_balance: balance,
      account_currency: account,
      recovery_percentage: result.status === 'ok' ? result.value.recoveryPct : null,
      balance_after_loss: result.status === 'ok' ? result.value.balanceAfter : null,
    },
  });

  const inputs = (
    <>
      <SliderField label="Loss from your peak" value={values.loss} onChange={(v) => set('loss', v)} min={1} max={90} step={1} hint="How far the account has fallen from its highest balance." />
      <FieldRow>
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />
        <NumberField label="Balance before the loss (optional)" value={values.balance} onChange={(v) => set('balance', v)} prefix={symbol} group placeholder="10,000" />
      </FieldRow>
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter the size of a loss to see the gain needed to recover from it." />;
  } else {
    const v = result.value;
    const drop = loss ?? 0;
    results = (
      <>
        <ResultHero
          label="Gain needed to get back to break-even"
          value={formatPercent(v.recoveryPct, 2, true)}
          tone="positive"
          sentence={
            <>
              After losing <strong>{formatNumber(drop, 2)}%</strong>, you need a <strong>{formatPercent(v.recoveryPct, 2)}</strong> gain just to return to where you started. That is {formatNumber(v.recoveryMultiple, 2)}× the size of the loss, because you are now climbing from a smaller balance.
            </>
          }
        />
        {v.balanceAfter !== null && v.moneyToRecover !== null && (
          <StatGrid
            stats={[
              {label: 'Before the loss', value: formatMoney(balance ?? 0, account, {decimals: 0})},
              {label: 'After the loss', value: formatMoney(v.balanceAfter, account, {decimals: 0}), tone: 'negative'},
              {label: 'Money to win back', value: formatMoney(v.moneyToRecover, account, {decimals: 0})},
              {label: 'Gain on what is left', value: formatPercent(v.recoveryPct, 1, true), tone: 'positive'},
            ]}
          />
        )}
        <LineChart
          ariaLabel="Gain required to recover as the size of the loss grows"
          xLabel="Loss from peak"
          formatX={(x) => `${formatNumber(x, 0)}%`}
          formatY={(y) => `${formatNumber(y, 0)}%`}
          series={[{name: 'Gain required', points: CURVE, color: 'var(--accent)', area: true}]}
          marker={{x: Math.min(drop, 90), y: v.recoveryPct > 900 ? 900 : v.recoveryPct, label: formatPercent(v.recoveryPct, 1)}}
        />
        <MiniTable
          caption="Gain needed to recover from common losses"
          head={['Loss', 'Gain needed']}
          rows={REFERENCE_DRAWDOWNS.map((d) => ({cells: [`${d}%`, formatPercent(recoveryRequired(d), 1)], highlight: d === drop}))}
        />
        <Explainer
          steps={[
            `Balance left = 1 − ${formatNumber(drop / 100, 4)} = ${formatNumber(1 - drop / 100, 4)} of the peak`,
            `Gain needed = 1 ÷ (1 − ${formatNumber(drop / 100, 4)}) − 1 = ${formatNumber(1 / (1 - drop / 100), 4)} − 1 = ${formatNumber(v.recoveryPct / 100, 4)} (${formatPercent(v.recoveryPct, 2)})`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('drawdown-recovery-calculator').name} name="drawdown_recovery" embedded={embedded} href={getTool('drawdown-recovery-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
