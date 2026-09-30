import {useState} from 'react';
import Link from '@docusaurus/Link';
import {formatMoney, formatNumber} from '../../utils/calculators/format';
import {getInstrument} from '../../utils/calculators/instruments';
import {sizePosition} from '../../utils/calculators/sizing';
import styles from './hero.module.css';

const BALANCE = 10_000;
const STOP_PIPS = 50;
const REWARD_MULTIPLE = 2;

/** A small live position-size ticket: drag the risk and watch the lots change. Same engine as the real tools. */
export default function HeroTicket() {
  const [risk, setRisk] = useState(1);
  const result = sizePosition(
    {instrument: getInstrument('EURUSD'), accountCurrency: 'USD', balance: BALANCE, riskPct: risk},
    {mode: 'distance', distance: STOP_PIPS, referencePrice: 1.165},
  );
  const value = result.status === 'ok' ? result.value : null;

  return (
    <div className={styles.ticket}>
      <p className={styles.ticketLabel}>Live · try it</p>
      <label className={styles.ticketRow} htmlFor="hero-risk">
        <span>Risk per trade</span>
        <b>{formatNumber(risk, 2)}%</b>
      </label>
      <input id="hero-risk" className={styles.ticketRange} type="range" min={0.25} max={3} step={0.05} value={risk} onChange={(event) => setRisk(Number(event.target.value))} />
      <p className={styles.ticketMeta}>$10,000 account · EUR/USD · {STOP_PIPS}-pip stop</p>
      <p className={styles.ticketBig} aria-live="polite">
        {value?.lots !== null && value?.lots !== undefined ? formatNumber(value.lots, 2, 2) : '—'}
        <small>lots</small>
      </p>
      <div className={styles.ticketOutcome}>
        <span className={styles.lose}>{value ? formatMoney(-value.actualRisk, 'USD') : '—'}</span>
        <span className={styles.sep}>if stopped</span>
        <span className={styles.win}>{value ? formatMoney(value.actualRisk * REWARD_MULTIPLE, 'USD', {signed: true}) : '—'}</span>
        <span className={styles.sep}>at 1 : {REWARD_MULTIPLE}</span>
      </div>
      <Link className={styles.ticketLink} to="/tools/trade-planner">
        Plan a real trade <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
