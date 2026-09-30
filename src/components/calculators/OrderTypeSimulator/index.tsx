import {useEffect, useReducer, useRef, useState} from 'react';
import {getTool} from '../../../data/tools';
import {formatPrice, formatNumber, parseNumber} from '../../../utils/calculators/format';
import {orderGuide, positionPips, validateOrder, type OrderKind, type OrderSpec, type Side} from '../../../utils/calculators/orders';
import {DEFAULT_CONFIG, initialSim, simReducer} from '../../../utils/calculators/orderSim';
import type {CalculatorProps} from '../common';
import {trackEvent} from '../hooks/useTrackCalculation';
import {Callout, Note, NumberField, Segmented, ToolCard} from '../ui';
import styles from '../ui/ui.module.css';
import {MarketChart} from './MarketChart';

const {pipSize, decimals} = DEFAULT_CONFIG;
const START = 1.105;
const PIPS = (n: number) => n * pipSize;
const fmt = (price: number) => formatPrice(price, decimals);

/** Where a new draft order sits by default: 50 pips away, on the side the order type requires. */
function draftFor(kind: OrderKind, side: Side, current: number): {price: number | null; limit: number | null} {
  if (kind === 'market') return {price: null, limit: null};
  const buy = side === 'buy';
  if (kind === 'limit') return {price: current + (buy ? -PIPS(50) : PIPS(50)), limit: null};
  if (kind === 'stop') return {price: current + (buy ? PIPS(50) : -PIPS(50)), limit: null};
  return {price: current + (buy ? PIPS(50) : -PIPS(50)), limit: current + (buy ? PIPS(30) : -PIPS(30))};
}

const KIND_OPTIONS = [
  {value: 'market', label: 'Market'},
  {value: 'limit', label: 'Limit'},
  {value: 'stop', label: 'Stop'},
  {value: 'stop-limit', label: 'Stop-limit'},
];

export default function OrderTypeSimulator({embedded = false}: CalculatorProps) {
  const [sim, dispatch] = useReducer(simReducer, undefined, () => initialSim());
  const [kind, setKind] = useState<OrderKind>('limit');
  const [side, setSide] = useState<Side>('buy');
  const [draft, setDraft] = useState(() => draftFor('limit', 'buy', START));
  const [typedPrice, setTypedPrice] = useState(() => fmt(draftFor('limit', 'buy', START).price ?? START));
  const [typedLimit, setTypedLimit] = useState('');
  const timer = useRef<number | undefined>(undefined);
  const priceRef = useRef(sim.price);
  priceRef.current = sim.price;
  const reported = useRef(false);

  useEffect(() => () => window.clearInterval(timer.current), []);

  const placed = sim.order !== null;
  const working = placed && sim.orderState.status !== 'filled';
  const filled = sim.orderState.status === 'filled';
  const spec: OrderSpec = {kind, side, price: draft.price, limitPrice: draft.limit};
  const check = placed ? {valid: true} : validateOrder(spec, sim.price);
  const guide = orderGuide(kind, side);

  function applyDraft(next: {price: number | null; limit: number | null}) {
    setDraft(next);
    setTypedPrice(next.price !== null ? fmt(next.price) : '');
    setTypedLimit(next.limit !== null ? fmt(next.limit) : '');
  }

  function chooseKind(value: string) {
    const next = value as OrderKind;
    setKind(next);
    applyDraft(draftFor(next, side, sim.price));
  }

  function chooseSide(value: string) {
    const next = value as Side;
    setSide(next);
    applyDraft(draftFor(kind, next, sim.price));
  }

  function dragDraft(id: 'price' | 'limit', price: number) {
    const rounded = Number(price.toFixed(decimals));
    if (id === 'price') {
      setDraft((current) => ({...current, price: rounded}));
      setTypedPrice(fmt(rounded));
    } else {
      setDraft((current) => ({...current, limit: rounded}));
      setTypedLimit(fmt(rounded));
    }
  }

  function typePrice(id: 'price' | 'limit', text: string) {
    (id === 'price' ? setTypedPrice : setTypedLimit)(text);
    const value = parseNumber(text);
    setDraft((current) => ({...current, [id === 'price' ? 'price' : 'limit']: value !== null && Number.isFinite(value) ? value : null}));
  }

  function place() {
    if (!check.valid) return;
    dispatch({type: 'place', spec});
    if (!reported.current) {
      reported.current = true;
      trackEvent('calculator_calculated', {calculator_name: 'order_type_simulator', placement: embedded ? 'embedded' : 'page', order_type: kind, side});
    }
  }

  function stopMoving() {
    window.clearInterval(timer.current);
  }

  function glide(target: number) {
    stopMoving();
    let cursor = priceRef.current;
    timer.current = window.setInterval(() => {
      const diff = target - cursor;
      if (Math.abs(diff) <= PIPS(1.5)) {
        cursor = target;
        dispatch({type: 'tick', to: cursor, jump: false});
        stopMoving();
        return;
      }
      cursor += Math.sign(diff) * PIPS(1.5);
      dispatch({type: 'tick', to: cursor, jump: false});
    }, 24);
  }

  function move(pips: number, jump: boolean) {
    const target = priceRef.current + PIPS(pips);
    if (jump) {
      stopMoving();
      dispatch({type: 'tick', to: target, jump: true});
    } else {
      glide(target);
    }
  }

  function runToOrder() {
    if (!sim.order || sim.order.price === null) return;
    const target = sim.orderState.status === 'triggered' && sim.order.limitPrice ? sim.order.limitPrice : sim.order.price;
    glide(target);
  }

  function resetAll() {
    stopMoving();
    dispatch({type: 'reset'});
    applyDraft(draftFor(kind, side, START));
  }

  const position = sim.position;
  const pips = position ? positionPips(position.side, position.fill, sim.price, pipSize) : 0;
  const status = !placed ? (kind === 'market' ? 'Ready' : 'Draft: drag the line') : filled ? 'Filled' : sim.orderState.status === 'triggered' ? 'Triggered: waiting for the limit' : 'Pending';

  const inputs = (
    <>
      <Segmented label="Order type" value={kind} onChange={chooseKind} options={KIND_OPTIONS} />
      <Segmented
        label="Direction"
        value={side}
        onChange={chooseSide}
        options={[
          {value: 'buy', label: 'Buy'},
          {value: 'sell', label: 'Sell'},
        ]}
      />
      <div className={styles.readout}>
        <p className={styles.readoutTitle}>{guide.title}</p>
        <ul>
          <li>{guide.summary}</li>
          <li>
            <strong>Where it goes:</strong> {guide.placement}
          </li>
          <li>
            <strong>Why use it:</strong> {guide.use}
          </li>
        </ul>
      </div>
      {kind !== 'market' && (
        <>
          <NumberField label={kind === 'stop-limit' ? 'Stop (trigger) price' : 'Order price'} value={typedPrice} onChange={(text) => typePrice('price', text)} />
          {kind === 'stop-limit' && <NumberField label="Limit price" value={typedLimit} onChange={(text) => typePrice('limit', text)} />}
        </>
      )}
      {!check.valid && check.message && <Callout tone="warning">{check.message}</Callout>}
      <div className={styles.quickRow}>
        <button type="button" className={styles.primaryBtn} onClick={place} disabled={placed || !check.valid}>
          {kind === 'market' ? `Send market ${side}` : `Place ${side} ${kind}`}
        </button>
        {working && (
          <button type="button" className={styles.quickBtn} onClick={() => dispatch({type: 'cancel'})}>
            Cancel order
          </button>
        )}
        <button type="button" className={styles.quickBtn} onClick={resetAll}>
          Start again
        </button>
      </div>
    </>
  );

  const results = (
    <>
      <div className={`${styles.simStatus} ${filled ? styles.simFilled : ''}`} aria-live="polite">
        <span>Status</span>
        <strong>{filled && position ? `ORDER FILLED · ${position.side === 'buy' ? 'bought' : 'sold'} at ${fmt(position.fill)}` : status}</strong>
        {position && (
          <em className={pips >= 0 ? styles.win : styles.lose}>
            {pips >= 0 ? '+' : '−'}
            {formatNumber(Math.abs(pips), 1)} pips open
          </em>
        )}
      </div>
      <MarketChart sim={sim} draft={{kind, side, price: draft.price, limit: draft.limit}} editable={!placed} onDraftDrag={dragDraft} />
      <div className={styles.field}>
        <span className={styles.label}>
          <span>Move the market</span>
          <span>{fmt(sim.price)}</span>
        </span>
        <div className={styles.quickRow}>
          <button type="button" className={styles.quickBtn} onClick={() => move(-10, false)}>▼ 10 pips</button>
          <button type="button" className={styles.quickBtn} onClick={() => move(10, false)}>▲ 10 pips</button>
          <button type="button" className={styles.quickBtn} onClick={() => move(-50, false)}>▼ 50</button>
          <button type="button" className={styles.quickBtn} onClick={() => move(50, false)}>▲ 50</button>
          <button type="button" className={styles.quickBtn} onClick={() => move(-40, true)} title="A fast market: the price leaps with no trading in between">⚡ Fast ▼ 40</button>
          <button type="button" className={styles.quickBtn} onClick={() => move(40, true)} title="A fast market: the price leaps with no trading in between">⚡ Fast ▲ 40</button>
          {working && (
            <button type="button" className={styles.quickBtn} onClick={runToOrder}>
              Run to the order →
            </button>
          )}
        </div>
        <input
          className={styles.range}
          type="range"
          aria-label="Market price"
          min={DEFAULT_CONFIG.floor}
          max={DEFAULT_CONFIG.ceiling}
          step={pipSize}
          value={sim.price}
          onChange={(event) => {
            stopMoving();
            dispatch({type: 'tick', to: Number(event.target.value), jump: false});
          }}
        />
      </div>
      <div className={styles.simLog}>
        <p className={styles.readoutTitle}>What is happening</p>
        <ol reversed>
          {[...sim.log].reverse().slice(0, 7).map((line, index) => (
            <li key={`${sim.log.length - index}-${line}`}>{line}</li>
          ))}
        </ol>
      </div>
      <Note>This is a simplified practice market with a single price: it has no spread, no other traders and no liquidity limits. Real orders can fill at different prices, or not at all. Nothing here is real money or a trading signal.</Note>
    </>
  );

  return <ToolCard title={getTool('order-type-simulator').name} name="order_type_simulator" embedded={embedded} href={getTool('order-type-simulator').path} dirty={placed || sim.history.length > 1} onReset={resetAll} inputs={inputs} results={results} />;
}
