import {getTool} from '../../../data/tools';
import {formatMoney, formatNumber, formatPercent, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {SANDBOX_LEVERAGES, leverageComparison, leverageSandbox} from '../../../utils/calculators/leverage';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {Callout, CurrencySelect, Explainer, FieldRow, Note, NumberField, ResultHero, Segmented, SliderField, StatGrid, StatusMessage, ToolCard} from '../ui';
import {LeverageVisual} from './LeverageVisual';

const SPECS = defineSpecs({
  balance: {default: '1000'},
  leverage: {default: '10', options: SANDBOX_LEVERAGES.map(String) as readonly string[]},
  move: {default: '-1'},
  direction: {default: 'long', options: ['long', 'short']},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
});

export default function LeverageSandbox({embedded = false}: CalculatorProps) {
  const {values, set, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const direction = values.direction === 'short' ? 'short' : 'long';
  const balance = parseNumber(values.balance);
  const leverage = Number(values.leverage);
  const move = parseNumber(values.move);

  const result = leverageSandbox({balance, leverage, movePct: move, direction});

  useTrackCalculation({
    name: 'leverage_sandbox',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      account_balance: balance,
      account_currency: account,
      leverage,
      market_move_pct: move,
      direction,
      exposure: result.status === 'ok' ? result.value.exposure : null,
      pnl: result.status === 'ok' ? result.value.pnl : null,
      account_after: result.status === 'ok' ? result.value.newBalance : null,
      wiped_out: result.status === 'ok' ? result.value.wipedOut : null,
    },
  });

  const inputs = (
    <>
      <FieldRow>
        <NumberField label="Practice account" value={values.balance} onChange={(v) => set('balance', v)} prefix={symbol} group placeholder="1,000" />
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />
      </FieldRow>
      <Segmented label="Leverage" value={values.leverage} onChange={(v) => set('leverage', v)} options={SANDBOX_LEVERAGES.map((level) => ({value: String(level), label: `${level}×`}))} hint="1× means no leverage: the account controls only its own value." />
      <SliderField label="Market movement" value={values.move} onChange={(v) => set('move', v)} min={-5} max={5} step={0.1} hint="The percentage the market moves while the position is open." />
      <Segmented
        label="Position"
        value={values.direction}
        onChange={(v) => set('direction', v)}
        options={[
          {value: 'long', label: 'Long (buy)'},
          {value: 'short', label: 'Short (sell)'},
        ]}
      />
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter a practice account size to get started." />;
  } else {
    const v = result.value;
    const comparison = leverageComparison(v.balance, v.movePct, direction);
    const tone = v.pnl > 0 ? 'positive' : v.pnl < 0 ? 'negative' : 'neutral';
    const movement = `${v.movePct > 0 ? '+' : v.movePct < 0 ? '−' : ''}${formatNumber(Math.abs(v.movePct), 1)}%`;
    results = (
      <>
        <ResultHero
          label="Account after the move"
          value={formatMoney(v.newBalance, account, {decimals: 0})}
          tone={v.wipedOut ? 'negative' : tone}
          sub={`${formatPercent(v.accountImpactPct, 1, true)} of the account`}
          sentence={
            <>
              At <strong>{v.leverage}×</strong>, {formatMoney(v.balance, account, {decimals: 0})} controls <strong>{formatMoney(v.exposure, account, {decimals: 0})}</strong>. A market move of <strong>{movement}</strong> {direction === 'short' ? 'against a short' : 'on a long'} position is {v.pnl >= 0 ? 'a gain' : 'a loss'} of <strong>{formatMoney(Math.abs(v.pnl), account, {decimals: 0})}</strong> on that exposure: <strong>{formatPercent(v.accountImpactPct, 1, true)}</strong> of the account.
            </>
          }
        />
        {v.wipedOut && (
          <Callout tone="error">The account is wiped out. A move of {formatNumber(v.wipeOutMovePct, 1)}% against the position erases it at {v.leverage}×. In practice a broker closes positions before the balance hits zero (a stop-out), but the loss would still be close to everything.</Callout>
        )}
        <LeverageVisual value={v} comparison={comparison} currency={account} maxLeverage={Math.max(...SANDBOX_LEVERAGES)} />
        <StatGrid
          stats={[
            {label: 'Exposure', value: formatMoney(v.exposure, account, {decimals: 0}), hint: `${v.leverage}× the account`},
            {label: 'Profit / loss', value: formatMoney(v.pnl, account, {decimals: 0, signed: true}), tone},
            {label: 'Account impact', value: formatPercent(v.accountImpactPct, 1, true), tone},
            {label: 'Wipe-out move', value: v.leverage > 1 ? `${formatNumber(v.wipeOutMovePct, 1)}%` : '100%', hint: 'against the position', tone: v.leverage >= 20 ? 'negative' : 'neutral'},
          ]}
        />
        <Note>This simplified sandbox uses the whole account as margin. Real trading adds position sizing, stop losses, margin calls and stop-outs, spreads and costs. Leverage magnifies losses exactly as much as gains.</Note>
        <Explainer
          steps={[
            `Exposure = Account × Leverage = ${formatMoney(v.balance, account, {decimals: 0})} × ${v.leverage} = ${formatMoney(v.exposure, account, {decimals: 0})}`,
            `Profit or loss = Exposure × Market move = ${formatMoney(v.exposure, account, {decimals: 0})} × ${movement}${direction === 'short' ? ' × −1 (short)' : ''} = ${formatMoney(v.pnl, account, {decimals: 0, signed: true})}`,
            `Account impact = ${formatMoney(v.pnl, account, {decimals: 0, signed: true})} ÷ ${formatMoney(v.balance, account, {decimals: 0})} = ${formatPercent((v.pnl / v.balance) * 100, 1, true)}`,
            `Move that wipes out the account = 100% ÷ ${v.leverage} = ${formatNumber(v.wipeOutMovePct, 1)}%`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('leverage-sandbox').name} name="leverage_sandbox" embedded={embedded} href={getTool('leverage-sandbox').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
