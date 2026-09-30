import {getTool} from '../../../data/tools';
import {calculatePipValue} from '../../../utils/calculators/pips';
import {formatMoney, formatNumber, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, FOREX_INSTRUMENT_IDS, getForexInstrument, seedLevels, type CurrencyCode} from '../../../utils/calculators/instruments';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {currencyNote, needsManualRate, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {ConversionPriceField, CurrencySelect, ExchangeRateField, Explainer, FieldRow, MarketSelect, MiniTable, Note, NumberField, ResultHero, Segmented, StatGrid, StatusMessage, ToolCard, Disclosure} from '../ui';

const SPECS = defineSpecs({
  pair: {default: 'EURUSD', options: FOREX_INSTRUMENT_IDS, pref: true},
  size: {default: '1'},
  unit: {default: 'lots', options: ['lots', 'units']},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
  price: {default: '1.1650'},
  rate: {default: ''},
  contract: {default: ''},
});

const TABLE_LOTS = [0.01, 0.1, 0.5, 1, 2, 5, 10];

export default function PipValueCalculator({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {
    syncUrl: !embedded,
    // A saved market arrives without its matching example price.
    finalize: (initial, urlKeys) => (urlKeys.includes('price') ? initial : {...initial, price: seedLevels(getForexInstrument(initial.pair)).entry}),
  });

  const instrument = getForexInstrument(values.pair);
  const account = values.currency as CurrencyCode;
  const size = parseNumber(values.size);
  const contractOverride = parseNumber(values.contract);
  const contractSize = contractOverride && contractOverride > 0 ? contractOverride : instrument.contractSize;
  const units = size === null ? null : values.unit === 'lots' ? size * contractSize : size;

  const result = calculatePipValue({
    instrument,
    accountCurrency: account,
    units,
    price: parseNumber(values.price),
    manualRate: parseNumber(values.rate),
    contractSize: contractOverride,
  });
  const priceNeeded = instrument.base === account;

  useTrackCalculation({
    name: 'pip_value',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      market: instrument.id,
      position_size: size,
      position_size_unit: values.unit,
      account_currency: account,
      pip_value: result.status === 'ok' ? result.value.perPip : null,
      pip_value_per_standard_lot: result.status === 'ok' ? result.value.perStandardLot : null,
    },
  });

  const inputs = (
    <>
      <FieldRow>
        <MarketSelect value={values.pair} onChange={(v) => setMany({pair: v, price: seedLevels(getForexInstrument(v)).entry})} includeOther={false} label="Currency pair" />
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} />
      </FieldRow>
      <NumberField label="Position size" value={values.size} onChange={(v) => set('size', v)} suffix={values.unit} group placeholder="1" />
      <Segmented
        label="Size is in"
        value={values.unit}
        onChange={(v) => set('unit', v)}
        options={[
          {value: 'lots', label: 'Lots'},
          {value: 'units', label: 'Units'},
        ]}
      />
      {priceNeeded && <ConversionPriceField instrument={instrument} account={account} value={values.price} onChange={(v) => set('price', v)} />}
      {needsManualRate(instrument, account) && <ExchangeRateField from={instrument.quote} to={account} value={values.rate} onChange={(v) => set('rate', v)} />}
      <Disclosure defaultOpen={values.contract !== ''}>
        <NumberField label="Contract size (units per lot)" value={values.contract} onChange={(v) => set('contract', v)} placeholder="100,000" group hint="Standard forex lots are 100,000 units. Only change this if your broker differs." />
      </Disclosure>
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Choose a pair and a position size to see the value of one pip." />;
  } else {
    const v = result.value;
    const pipMoves = `${formatNumber(v.pipSize, 4)}`;
    results = (
      <>
        <ResultHero
          label="Value of one pip"
          value={formatMoney(v.perPip, account)}
          unit="per pip"
          sentence={
            <>
              At {formatNumber(size ?? 0, 4)} {values.unit}, every pip {instrument.label} moves is worth <strong>{formatMoney(v.perPip, account)}</strong> in your {account} account. A 10-pip move is worth{' '}
              <strong>{formatMoney(v.per10Pips, account)}</strong>.
            </>
          }
        />
        <StatGrid
          stats={[
            {label: 'Standard lot', value: formatMoney(v.perStandardLot, account), hint: `${formatNumber(v.contractSize, 0)} units`},
            {label: 'Mini lot', value: formatMoney(v.perMiniLot, account), hint: `${formatNumber(v.contractSize / 10, 0)} units`},
            {label: 'Micro lot', value: formatMoney(v.perMicroLot, account), hint: `${formatNumber(v.contractSize / 100, 0)} units`},
            {label: 'One pip is', value: pipMoves, hint: 'in price'},
          ]}
        />
        <MiniTable
          caption={`Pip value of ${instrument.label} at common lot sizes`}
          head={['Lots', 'Units', 'Per pip', 'Per 10 pips']}
          rows={TABLE_LOTS.map((lots) => ({
            cells: [formatNumber(lots, 2), formatNumber(lots * v.contractSize, 0), formatMoney(lots * v.perStandardLot, account), formatMoney(lots * v.perStandardLot * 10, account)],
          }))}
        />
        <Note>{currencyNote(v.rateSource, instrument, account, v.rate)}</Note>
        <Explainer
          steps={[
            `Pip size = ${formatNumber(v.pipSize, 4)} (${instrument.quote === 'JPY' ? 'JPY pairs use the second decimal' : 'most pairs use the fourth decimal'})`,
            `Pip value in ${instrument.quote} = ${formatNumber(units ?? 0, 2)} units × ${formatNumber(v.pipSize, 4)} = ${formatNumber((units ?? 0) * v.pipSize, 4)} ${instrument.quote}`,
            ...(v.rate !== 1 ? [`Converted to ${account} at ${formatNumber(v.rate, 6)} = ${formatMoney(v.perPip, account)}`] : []),
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('pip-value-calculator').name} name="pip_value" embedded={embedded} href={getTool('pip-value-calculator').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
