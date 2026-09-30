import {formatMoney, formatNumber, formatPercent, parseNumber} from '../../../utils/calculators/format';
import {getInstrument, seedLevels, type CurrencyCode} from '../../../utils/calculators/instruments';
import {sizePosition, type StopSpec} from '../../../utils/calculators/sizing';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {currencyNote, needsManualRate, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {SIZING_FIELDS, riskHint, sizeHeadline, sizingContext, sizingSteps, SizingAdvanced} from '../SizingParts';
import {
  Callout,
  ConversionPriceField,
  CurrencySelect,
  Explainer,
  ExchangeRateField,
  FieldRow,
  MarketSelect,
  Note,
  NumberField,
  ResultHero,
  Segmented,
  SliderField,
  StatGrid,
  StatusMessage,
  ToolCard,
} from '../ui';
import {getTool} from '../../../data/tools';

const seed = seedLevels(getInstrument('EURUSD'));

const SPECS = defineSpecs({
  ...SIZING_FIELDS,
  mode: {default: 'prices', options: ['prices', 'distance']},
  entry: {default: seed.entry},
  stop: {default: seed.stop},
  pips: {default: '50'},
});

export default function PositionSizeCalculator({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {
    syncUrl: !embedded,
    // A link like ?pair=USDJPY should open with prices that make sense for that pair.
    finalize: (initial, urlKeys) =>
      urlKeys.includes('pair') && !urlKeys.includes('entry') && !urlKeys.includes('stop')
        ? {...initial, ...seedLevels(getInstrument(initial.pair))}
        : initial,
  });

  const instrument = getInstrument(values.pair);
  const account = values.currency as CurrencyCode;
  const context = sizingContext(values);
  const stop: StopSpec =
    values.mode === 'prices'
      ? {mode: 'prices', entry: parseNumber(values.entry), stop: parseNumber(values.stop)}
      : {mode: 'distance', distance: parseNumber(values.pips), referencePrice: parseNumber(values.entry)};
  const result = sizePosition(context, stop);
  const manualRateNeeded = needsManualRate(instrument, account);
  const priceNeeded = values.mode === 'distance' && instrument.kind === 'forex' && instrument.base === account;

  useTrackCalculation({
    name: 'position_size',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {
      account_balance: context.balance,
      account_currency: account,
      risk_percentage: context.riskPct,
      market: instrument.id,
      stop_mode: values.mode,
      entry_price: parseNumber(values.entry),
      stop_loss_price: parseNumber(values.stop),
      stop_distance_input: parseNumber(values.pips),
      amount_at_risk: result.status === 'ok' ? result.value.actualRisk : null,
      position_size_units: result.status === 'ok' ? result.value.units : null,
      position_size_lots: result.status === 'ok' ? result.value.lots : null,
      stop_distance: result.status === 'ok' ? result.value.stopDistanceInUnits : null,
    },
  });

  function changeMarket(id: string) {
    const next = getInstrument(id);
    const levels = seedLevels(next);
    setMany({
      pair: id,
      entry: levels.entry,
      stop: levels.stop,
      pips: next.kind === 'forex' ? '50' : '5',
      // A contract size or step typed for one kind of market makes no sense for the other.
      ...(next.kind !== instrument.kind ? {contract: '', step: ''} : {}),
    });
  }

  const inputs = (
    <>
      <NumberField label="Account balance" value={values.balance} onChange={(v) => set('balance', v)} prefix={context.accountCurrency} group placeholder="10,000" />
      <SliderField
        label="Risk per trade"
        value={values.risk}
        onChange={(v) => set('risk', v)}
        min={0.25}
        max={5}
        step={0.05}
        hint={riskHint(context.balance, context.riskPct, account)}
      />
      <FieldRow>
        <MarketSelect value={values.pair} onChange={changeMarket} />
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} />
      </FieldRow>
      <Segmented
        label="Set the stop by"
        value={values.mode}
        onChange={(v) => set('mode', v)}
        options={[
          {value: 'prices', label: 'Entry & stop price'},
          {value: 'distance', label: instrument.kind === 'forex' ? 'Distance in pips' : 'Distance in points'},
        ]}
      />
      {values.mode === 'prices' ? (
        <FieldRow>
          <NumberField label="Entry price" value={values.entry} onChange={(v) => set('entry', v)} placeholder={seed.entry} />
          <NumberField label="Stop-loss price" value={values.stop} onChange={(v) => set('stop', v)} placeholder={seed.stop} />
        </FieldRow>
      ) : (
        <NumberField
          label="Stop distance"
          value={values.pips}
          onChange={(v) => set('pips', v)}
          suffix={instrument.kind === 'forex' ? 'pips' : 'points'}
          placeholder="50"
        />
      )}
      {priceNeeded && <ConversionPriceField instrument={instrument} account={account} value={values.entry} onChange={(v) => set('entry', v)} />}
      {manualRateNeeded && instrument.kind === 'forex' && <ExchangeRateField from={instrument.quote} to={account} value={values.rate} onChange={(v) => set('rate', v)} />}
      <SizingAdvanced instrument={instrument} contract={values.contract} step={values.step} onContract={(v) => set('contract', v)} onStep={(v) => set('step', v)} />
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Fill in every field and your position size appears here." />;
  } else {
    const v = result.value;
    const headline = sizeHeadline(v, instrument);
    const mini = v.lots === null ? null : v.units / 10_000;
    const micro = v.lots === null ? null : v.units / 1_000;
    results = (
      <>
        <ResultHero
          label="Your position size"
          value={headline.value}
          unit={headline.unit}
          sub={headline.sub}
          sentence={
            <>
              If your stop is reached, your estimated loss is <strong>{formatMoney(v.actualRisk, account)}</strong>, or <strong>{formatPercent(v.actualRiskPct)}</strong> of your{' '}
              {formatMoney(context.balance ?? 0, account)} account, excluding slippage and fees.
              {v.wasRounded && v.lotsExact !== null && <> Rounded down from {formatNumber(v.lotsExact, 4)} lots so you never risk more than {formatMoney(v.targetRisk, account)}.</>}
            </>
          }
        />
        {v.belowMinimum && (
          <Callout tone="warning">
            Even the smallest size ({formatNumber(v.lotStep, 4)} {instrument.kind === 'forex' ? 'lots' : 'units'}) would risk {formatMoney(v.minimumStepRisk, account)}, more than the {formatMoney(v.targetRisk, account)} you chose. Use a tighter stop, risk a little more, or trade a smaller step size if your broker allows it.
          </Callout>
        )}
        <StatGrid
          stats={[
            {label: 'Amount at risk', value: formatMoney(v.actualRisk, account), hint: v.wasRounded ? `Target ${formatMoney(v.targetRisk, account)}` : undefined},
            {label: 'Stop distance', value: `${formatNumber(v.stopDistanceInUnits, 1)} ${v.unitLabel}`},
            {label: `Value per ${instrument.kind === 'forex' ? 'pip' : 'point'}`, value: formatMoney(v.valuePerPip, account), hint: 'at this size'},
            ...(v.lots !== null && mini !== null && micro !== null
              ? [
                  {label: 'Standard lots', value: formatNumber(v.lots, 2, 2), hint: `${formatNumber(v.units, 0)} units`},
                  {label: 'Mini lots', value: formatNumber(mini, 2), hint: '10,000 units each'},
                  {label: 'Micro lots', value: formatNumber(micro, 1), hint: '1,000 units each'},
                ]
              : []),
          ]}
        />
        <Note>{currencyNote(v.rateSource, instrument, account, v.rate)}</Note>
        <Explainer
          steps={sizingSteps({
            value: v,
            instrument,
            currency: account,
            balance: context.balance ?? 0,
            riskPct: context.riskPct ?? 0,
            prices: values.mode === 'prices' ? {entry: values.entry.trim(), stop: values.stop.trim()} : undefined,
          })}
        />
      </>
    );
  }

  return (
    <ToolCard
      title={getTool('position-size-calculator').name}
      name="position_size"
      embedded={embedded}
      href={getTool('position-size-calculator').path}
      dirty={dirty}
      onReset={reset}
      shareUrl={shareUrl}
      inputs={inputs}
      results={results}
    />
  );
}
