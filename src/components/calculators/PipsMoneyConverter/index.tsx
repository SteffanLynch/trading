import {getTool} from '../../../data/tools';
import {formatMoney, formatNumber, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, currencySymbol, type CurrencyCode} from '../../../utils/calculators/instruments';
import {moneyToPips, pipsToMoney} from '../../../utils/calculators/pips';
import {defineSpecs} from '../../../utils/calculators/toolState';
import type {CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {CurrencySelect, Explainer, MiniTable, NumberField, ResultHero, StatusMessage, ToolCard} from '../ui';

const SPECS = defineSpecs({
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
  pipValue: {default: '10'},
  pips: {default: '50'},
  money: {default: ''},
  /** Which box the trader typed in last; the other one is calculated. */
  driver: {default: 'pips', options: ['pips', 'money']},
});

const QUICK_PIPS = [5, 10, 25, 50, 100, 200];
const clean = (value: number, decimals: number) => String(Number(value.toFixed(decimals)));

export default function PipsMoneyConverter({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {syncUrl: !embedded});
  const account = values.currency as CurrencyCode;
  const symbol = currencySymbol(account);
  const pipValue = parseNumber(values.pipValue);
  const pipsTyped = parseNumber(values.pips);
  const moneyTyped = parseNumber(values.money);

  const pipValueOk = pipValue !== null && Number.isFinite(pipValue);
  const validPipValue = pipValueOk && pipValue > 0;

  // The box the trader is not editing shows the calculated value.
  let pips: number | null = pipsTyped;
  let money: number | null = moneyTyped;
  if (validPipValue) {
    if (values.driver === 'pips' && pipsTyped !== null && Number.isFinite(pipsTyped)) money = pipsToMoney(pipsTyped, pipValue);
    if (values.driver === 'money' && moneyTyped !== null && Number.isFinite(moneyTyped)) pips = moneyToPips(moneyTyped, pipValue);
  }
  const pipsShown = values.driver === 'pips' ? values.pips : pips !== null && Number.isFinite(pips) ? clean(pips, 4) : '';
  const moneyShown = values.driver === 'money' ? values.money : money !== null && Number.isFinite(money) ? clean(money, 2) : '';

  const ready = validPipValue && pips !== null && money !== null && Number.isFinite(pips) && Number.isFinite(money);
  const result = ready
    ? ({status: 'ok', value: {pips, money}} as const)
    : pipValueOk && !validPipValue
      ? ({status: 'invalid', message: 'Pip value must be greater than zero.'} as const)
      : ({status: 'incomplete'} as const);

  useTrackCalculation({
    name: 'pips_money',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      account_currency: account,
      pip_value: pipValue,
      pips: result.status === 'ok' ? result.value.pips : null,
      money: result.status === 'ok' ? result.value.money : null,
      edited_field: values.driver,
    },
  });

  const inputs = (
    <>
      <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} label="Currency" />
      <NumberField label="Value of one pip" value={values.pipValue} onChange={(v) => set('pipValue', v)} prefix={symbol} placeholder="10" hint="Not sure? Use the Pip Value calculator." />
      <NumberField label="Pips" value={pipsShown} onChange={(v) => setMany({pips: v, driver: 'pips'})} suffix="pips" placeholder="50" hint="Type here to find the money…" />
      <NumberField label="Money" value={moneyShown} onChange={(v) => setMany({money: v, driver: 'money'})} prefix={symbol} group placeholder="500" hint="…or type here to find the pips. Use a minus sign for a loss." />
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter a pip value, then either pips or money." />;
  } else {
    const {pips: p, money: m} = result.value;
    const pv = pipValue ?? 0;
    const heroMoney = values.driver === 'pips';
    results = (
      <>
        <ResultHero
          label={heroMoney ? 'Money' : 'Pips'}
          value={heroMoney ? formatMoney(m, account, {signed: m < 0}) : formatNumber(p, 2)}
          unit={heroMoney ? undefined : 'pips'}
          tone={heroMoney ? (m < 0 ? 'negative' : 'neutral') : 'neutral'}
          sentence={
            <>
              {formatNumber(p, 2)} pips × {formatMoney(pv, account)} per pip = <strong>{formatMoney(m, account)}</strong>.
            </>
          }
        />
        <MiniTable
          caption="Pips converted to money at your pip value"
          head={['Pips', 'Money']}
          rows={QUICK_PIPS.map((count) => ({cells: [`${count} pips`, formatMoney(pipsToMoney(count, pv), account)]}))}
        />
        <Explainer
          steps={[
            `Money = Pips × Pip value = ${formatNumber(p, 2)} × ${formatMoney(pv, account)} = ${formatMoney(m, account)}`,
            `Pips = Money ÷ Pip value = ${formatMoney(m, account)} ÷ ${formatMoney(pv, account)} = ${formatNumber(p, 2)}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('pips-to-money-converter').name} name="pips_money" embedded={embedded} href={getTool('pips-to-money-converter').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
