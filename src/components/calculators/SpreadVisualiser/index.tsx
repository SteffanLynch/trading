import {getTool} from '../../../data/tools';
import {formatMoney, formatNumber, formatPercent, formatPrice, parseNumber} from '../../../utils/calculators/format';
import {CURRENCY_CODES, FOREX_INSTRUMENT_IDS, getForexInstrument, seedLevels, type CurrencyCode} from '../../../utils/calculators/instruments';
import {spreadCost} from '../../../utils/calculators/spread';
import {defineSpecs} from '../../../utils/calculators/toolState';
import {decimalsOf, needsManualRate, type CalculatorProps} from '../common';
import {useToolState} from '../hooks/useToolState';
import {useTrackCalculation} from '../hooks/useTrackCalculation';
import {ConversionPriceField, CurrencySelect, Disclosure, ExchangeRateField, Explainer, FieldRow, MarketSelect, MiniTable, Note, NumberField, ResultHero, Segmented, SliderField, StatGrid, StatusMessage, ToolCard} from '../ui';
import {SpreadDiagram} from './SpreadDiagram';

const SPECS = defineSpecs({
  pair: {default: 'EURUSD', options: FOREX_INSTRUMENT_IDS},
  bid: {default: '1.1000'},
  spread: {default: '2'},
  lots: {default: '1'},
  side: {default: 'buy', options: ['buy', 'sell']},
  currency: {default: 'USD', options: CURRENCY_CODES, pref: true},
  commission: {default: ''},
  distance: {default: '20'},
  rate: {default: ''},
});

const COMPARE = [0.2, 0.5, 1, 2, 3, 5];

export default function SpreadVisualiser({embedded = false}: CalculatorProps) {
  const {values, set, setMany, dirty, reset, shareUrl} = useToolState(SPECS, {
    syncUrl: !embedded,
    finalize: (initial, urlKeys) => (urlKeys.includes('pair') && !urlKeys.includes('bid') ? {...initial, bid: seedLevels(getForexInstrument(initial.pair)).entry} : initial),
  });
  const instrument = getForexInstrument(values.pair);
  const account = values.currency as CurrencyCode;
  const side = values.side === 'sell' ? 'sell' : 'buy';
  const bid = parseNumber(values.bid);
  const spread = parseNumber(values.spread);
  const lots = parseNumber(values.lots);
  const commission = parseNumber(values.commission);
  const distance = parseNumber(values.distance);

  const base = {instrument, accountCurrency: account, bid, lots, commission, distancePips: distance, manualRate: parseNumber(values.rate)};
  const result = spreadCost({...base, spreadPips: spread});
  const decimals = Math.min(6, Math.max(instrument.pipDecimals, decimalsOf(values.bid)) + 1);
  const priceNeeded = instrument.base === account;

  useTrackCalculation({
    name: 'spread_visualiser',
    embedded,
    enabled: dirty && result.status === 'ok',
    payload: {market: instrument.id, bid, spread_pips: spread, position_size_lots: lots, side, account_currency: account, spread_cost: result.status === 'ok' ? result.value.spreadCost : null, total_cost: result.status === 'ok' ? result.value.totalCost : null},
  });

  const inputs = (
    <>
      <FieldRow>
        <MarketSelect value={values.pair} onChange={(id) => setMany({pair: id, bid: seedLevels(getForexInstrument(id)).entry})} includeOther={false} label="Currency pair" />
        <CurrencySelect value={values.currency} onChange={(v) => set('currency', v)} />
      </FieldRow>
      <SliderField label="Spread" value={values.spread} onChange={(v) => set('spread', v)} min={0.1} max={10} step={0.1} suffix=" pips" hint="Tight spreads are typical on major pairs in busy hours; wider spreads are common on exotic pairs, in quiet hours or around news." />
      <FieldRow>
        <NumberField label="Position size" value={values.lots} onChange={(v) => set('lots', v)} suffix="lots" placeholder="1" />
        <NumberField label="Bid price" value={values.bid} onChange={(v) => set('bid', v)} />
      </FieldRow>
      <Segmented
        label="Open a"
        value={values.side}
        onChange={(v) => set('side', v)}
        options={[
          {value: 'buy', label: 'Buy (long)'},
          {value: 'sell', label: 'Sell (short)'},
        ]}
      />
      {priceNeeded && <ConversionPriceField instrument={instrument} account={account} value={values.bid} onChange={(v) => set('bid', v)} label={`Current ${instrument.label} bid`} />}
      {needsManualRate(instrument, account) && <ExchangeRateField from={instrument.quote} to={account} value={values.rate} onChange={(v) => set('rate', v)} />}
      <Disclosure defaultOpen={values.commission !== ''}>
        <FieldRow>
          <NumberField label="Commission (round trip)" value={values.commission} onChange={(v) => set('commission', v)} prefix={account} placeholder="0" hint="Some accounts charge a commission on top of a tighter spread." />
          <NumberField label="Planned stop or target" value={values.distance} onChange={(v) => set('distance', v)} suffix="pips" hint="Shows how much of it the spread uses up." />
        </FieldRow>
      </Disclosure>
    </>
  );

  let results;
  if (result.status !== 'ok') {
    results = <StatusMessage result={result} idle="Enter a price, a spread and a position size to see the cost." />;
  } else {
    const v = result.value;
    const costText = formatMoney(-v.spreadCost, account);
    results = (
      <>
        <ResultHero
          label="Cost of the spread"
          value={formatMoney(v.spreadCost, account)}
          tone="negative"
          sentence={
            <>
              {side === 'buy' ? 'Buyers pay the ask' : 'Sellers receive the bid'}, but an open position is valued at the {side === 'buy' ? 'bid' : 'ask'}. With a <strong>{formatNumber(v.spreadPips, 1)}-pip</strong> spread on <strong>{formatNumber(lots ?? 0, 2)} lots</strong> at {formatMoney(v.perPip, account)} per pip, the trade opens <strong>{costText}</strong> behind. Price has to move {formatNumber(v.breakEvenPips, 1)} pips in favour just to reach break-even.
            </>
          }
        />
        <SpreadDiagram bid={v.bid} spreadPips={v.spreadPips} pipSize={instrument.pipSize} decimals={decimals} side={side} cost={costText} breakEvenPips={v.breakEvenPips} />
        <StatGrid
          stats={[
            {label: 'Bid (sell)', value: formatPrice(v.bid, decimals)},
            {label: 'Ask (buy)', value: formatPrice(v.ask, decimals)},
            {label: 'Spread', value: `${formatNumber(v.spreadPips, 1)} pips`, hint: `${formatNumber(v.spreadPrice, decimals)} in price`},
            {label: 'Value per pip', value: formatMoney(v.perPip, account)},
            ...(v.commission > 0 ? [{label: 'Total cost', value: formatMoney(v.totalCost, account), tone: 'negative' as const, hint: 'spread + commission'}] : []),
            ...(v.shareOfDistancePct !== null ? [{label: 'Share of planned distance', value: formatPercent(v.shareOfDistancePct, 0), hint: `of ${formatNumber(distance ?? 0, 0)} pips`, tone: (v.shareOfDistancePct >= 25 ? 'negative' : 'neutral') as 'negative' | 'neutral'}] : []),
          ]}
        />
        <MiniTable
          caption="What this trade costs at different spreads"
          head={['Spread', 'Cost at this size']}
          rows={COMPARE.map((pips) => ({cells: [`${pips} pips`, formatMoney(pips * v.perPip, account)], highlight: Math.abs(pips - v.spreadPips) < 1e-9}))}
        />
        <Note>Spreads change constantly and differ by broker and account type. This shows the cost of a fixed spread you choose; it does not include slippage, swaps or other fees.</Note>
        <Explainer
          steps={[
            `Ask = Bid + Spread = ${formatPrice(v.bid, decimals)} + ${formatNumber(v.spreadPips, 1)} × ${instrument.pipSize} = ${formatPrice(v.ask, decimals)}`,
            `Value of one pip at ${formatNumber(lots ?? 0, 2)} lots = ${formatMoney(v.perPip, account)}`,
            `Spread cost = ${formatNumber(v.spreadPips, 1)} pips × ${formatMoney(v.perPip, account)} = ${formatMoney(v.spreadCost, account)}`,
          ]}
        />
      </>
    );
  }

  return <ToolCard title={getTool('spread-visualiser').name} name="spread_visualiser" embedded={embedded} href={getTool('spread-visualiser').path} dirty={dirty} onReset={reset} shareUrl={shareUrl} inputs={inputs} results={results} />;
}
