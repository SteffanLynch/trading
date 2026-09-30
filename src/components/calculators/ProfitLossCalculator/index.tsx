import {getTool} from '../../../data/tools';
import {calculatePnL} from '../../../utils/calculators/pnl';
import {formatMoney, formatNumber, formatPercent, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, INSTRUMENT_IDS, getInstrument, seedLevels, type CurrencyCode} from '../../../utils/calculators/instruments';
import type {Direction} from '../../../utils/calculators/sizing';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {currencyNote, distanceText, needsManualRate, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {ConversionPriceField, CurrencySelect, Disclosure, ExchangeRateField, Explainer, FieldRow, MarketSelect, Note, NumberField, ResultHero, Segmented, StatGrid, StatusMessage, ToolCard} from '../ui';

const seed = seedLevels(getInstrument('EURUSD'));

const SPECS = defineSpecs({
  balance: {default: '10000', pref: true},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
  pair: {default: 'EURUSD', options: INSTRUMENT_IDS},
  direction: {default: 'long', options: ['long', 'short']},
  entry: {default: seed.entry},
  exit: {default: seed.target},
  size: {default: '0.2'},
  unit: {default: 'lots', options: ['lots', 'units']},
  costs: {default: ''},
  rate: {default: ''},
  contract: {default: ''},
});

export default function ProfitLossCalculator({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {
    syncUrl: !embedded,
    finalize: (initial, urlKeys) => {
      if (!urlKeys.includes('pair') || urlKeys.some((key) => key === 'entry' || key === 'exit')) return initial;
      const instrument = getInstrument(initial.pair);
      const levels = seedLevels(instrument);
      return {...initial, entry: levels.entry, exit: levels.target, ...(instrument.kind === 'other' && !urlKeys.includes('size') ? {size: '10', unit: 'units'} : {})};
    },
  });

  const instrument = getInstrument(values.pair);
  const account = values.currency as CurrencyCode;
  const forex = instrument.kind === 'forex';
  const direction = values.direction as Direction;
  const size = parseNumber(values.size);
  const contractOverride = parseNumber(values.contract);
  const lotUnits = contractOverride && contractOverride > 0 ? contractOverride : instrument.contractSize;
  const inLots = forex && values.unit === 'lots';
  const units = size === null ? null : inLots ? size * lotUnits : size;

  const result = calculatePnL({
    instrument,
    accountCurrency: account,
    direction,
    entry: parseNumber(values.entry),
    exit: parseNumber(values.exit),
    units,
    costs: parseNumber(values.costs),
    balance: parseNumber(values.balance),
    manualRate: parseNumber(values.rate),
    contractSize: forex ? null : contractOverride,
  });
  const priceNeeded = forex && instrument.base === account;

  useTrackCalculation({
    name: 'profit_loss',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      market: instrument.id,
      direction,
      account_currency: account,
      account_balance: parseNumber(values.balance),
      entry_price: parseNumber(values.entry),
      exit_price: parseNumber(values.exit),
      position_size: size,
      position_size_unit: inLots ? 'lots' : 'units',
      costs: parseNumber(values.costs),
      gross_pnl: result.status === 'ok' ? result.value.gross : null,
      net_pnl: result.status === 'ok' ? result.value.net : null,
      return_percentage: result.status === 'ok' ? result.value.returnPct : null,
    },
  });

  function changeMarket(id: string) {
    const next = getInstrument(id);
    const levels = seedLevels(next);
    setMany({
      pair: id,
      entry: levels.entry,
      exit: levels.target,
      ...(next.kind !== instrument.kind ? {size: next.kind === 'forex' ? '0.2' : '10', unit: next.kind === 'forex' ? 'lots' : 'units', contract: ''} : {}),
    });
  }

  const inputs = (
    <>
      <FieldRow>
        <MarketSelect value={values.pair} onChange={changeMarket} />
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} />
      </FieldRow>
      <Segmented
        label="Direction"
        value={values.direction}
        onChange={(v) => set('direction', v)}
        options={[
          {value: 'long', label: 'Long (buy)'},
          {value: 'short', label: 'Short (sell)'},
        ]}
      />
      <FieldRow>
        <NumberField label="Entry price" value={values.entry} onChange={(v) => set('entry', v)} />
        <NumberField label="Exit price" value={values.exit} onChange={(v) => set('exit', v)} />
      </FieldRow>
      <NumberField label="Position size" value={values.size} onChange={(v) => set('size', v)} suffix={inLots ? 'lots' : 'units'} group />
      {forex && (
        <Segmented
          label="Size is in"
          value={values.unit}
          onChange={(v) => set('unit', v)}
          options={[
            {value: 'lots', label: 'Lots'},
            {value: 'units', label: 'Units'},
          ]}
        />
      )}
      <NumberField label="Costs (optional)" value={values.costs} onChange={(v) => set('costs', v)} prefix={account} placeholder="0" hint="Commission, spread or fees in your account currency." />
      <NumberField label="Account balance (optional)" value={values.balance} onChange={(v) => set('balance', v)} prefix={account} group hint="Only used to show the result as a % of your account." />
      {needsManualRate(instrument, account) && instrument.kind === 'forex' && <ExchangeRateField from={instrument.quote} to={account} value={values.rate} onChange={(v) => set('rate', v)} />}
      {priceNeeded && <Note>Converted using the exit price, since {instrument.base} is your account currency.</Note>}
      <Disclosure defaultOpen={values.contract !== ''}>
        <NumberField
          label={forex ? 'Contract size (units per lot)' : 'Contract multiplier'}
          value={values.contract}
          onChange={(v) => set('contract', v)}
          placeholder={forex ? '100,000' : '1'}
          group
          hint={forex ? 'Standard forex lots are 100,000 units.' : 'Value of a one-point move per unit. Leave at 1 for shares and crypto.'}
        />
      </Disclosure>
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter entry, exit and position size to see your profit or loss." />;
  } else {
    const v = result.value;
    const tone = v.outcome === 'profit' ? 'positive' : v.outcome === 'loss' ? 'negative' : 'neutral';
    const sizeText = inLots ? `${formatNumber(size ?? 0, 4)} lots` : `${formatNumber(size ?? 0, 4)} units`;
    results = (
      <>
        <ResultHero
          label="Net profit / loss"
          value={formatMoney(v.net, account, {signed: true})}
          tone={tone}
          sentence={
            <>
              A {distanceText(Math.abs(v.moveInUnits), instrument)} move {v.move >= 0 ? 'in your favour' : 'against you'} on {sizeText} {direction === 'long' ? 'bought' : 'sold'} is <strong>{formatMoney(v.gross, account, {signed: true})}</strong> before costs
              {v.costs > 0 ? <>, and <strong>{formatMoney(v.net, account, {signed: true})}</strong> after {formatMoney(v.costs, account)} of costs</> : null}
              {v.returnPct !== null ? <>. That is <strong>{formatPercent(v.returnPct, 2, true)}</strong> of your account.</> : '.'}
            </>
          }
        />
        <StatGrid
          stats={[
            {label: 'Gross P&L', value: formatMoney(v.gross, account, {signed: true}), tone: v.gross > 0 ? 'positive' : v.gross < 0 ? 'negative' : 'neutral'},
            {label: 'Costs', value: formatMoney(v.costs, account)},
            {label: 'Net P&L', value: formatMoney(v.net, account, {signed: true}), tone},
            {label: `Move (${v.unitLabel})`, value: `${formatNumber(v.moveInUnits, 1)}`, hint: v.move >= 0 ? 'in your favour' : 'against you'},
            {label: 'Price move', value: formatPercent(v.movePct, 2, true)},
            {label: 'Return on account', value: v.returnPct !== null ? formatPercent(v.returnPct, 2, true) : '—', tone: v.returnPct === null ? 'neutral' : v.returnPct > 0 ? 'positive' : v.returnPct < 0 ? 'negative' : 'neutral'},
          ]}
        />
        <Note>{currencyNote(v.rateSource, instrument, account, v.rate)}</Note>
        <Explainer
          steps={[
            `Move = ${direction === 'long' ? 'Exit − Entry' : 'Entry − Exit'} = ${direction === 'long' ? `${values.exit.trim()} − ${values.entry.trim()}` : `${values.entry.trim()} − ${values.exit.trim()}`} = ${formatNumber(v.move, 6)}`,
            `Gross P&L = ${formatNumber(v.move, 6)} × ${formatNumber(units ?? 0, 2)} units${v.rate !== 1 ? ` × ${formatNumber(v.rate, 6)} (exchange rate)` : ''} = ${formatMoney(v.gross, account)}`,
            `Net P&L = Gross − Costs = ${formatMoney(v.gross, account)} − ${formatMoney(v.costs, account)} = ${formatMoney(v.net, account)}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('profit-loss-calculator').name} name="profit_loss" embedded={embedded} href={getTool('profit-loss-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
