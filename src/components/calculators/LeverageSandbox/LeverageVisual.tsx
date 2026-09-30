import type {LeverageOutcome, LeverageSandboxValue} from '../../../utils/calculators/leverage';
import {formatMoney, formatNumber, formatPercent} from '../../../utils/calculators/format';
import type {CurrencyCode} from '../../../utils/calculators/instruments';
import styles from '../ui/ui.module.css';

interface Props {
  value: LeverageSandboxValue;
  comparison: LeverageOutcome[];
  currency: CurrencyCode;
  maxLeverage: number;
}

/** Three pictures of the same idea: how much is controlled, what happens to the balance, and the same move at every leverage. */
export function LeverageVisual({value, comparison, currency, maxLeverage}: Props) {
  const max = value.balance * maxLeverage;
  const accountWidth = Math.max(1.5, (value.balance / max) * 100);
  const exposureWidth = Math.max(accountWidth, (value.exposure / max) * 100);
  const top = Math.max(value.balance, value.newBalance) || 1;
  const gain = value.newBalance >= value.balance;

  return (
    <div className={styles.levVisual}>
      <div className={styles.levBlock}>
        <p className={styles.levCaption}>What the account controls</p>
        <div className={styles.levBars}>
          <div className={styles.levRow}>
            <span>Account</span>
            <div className={styles.levTrack}><i style={{width: `${accountWidth}%`, background: 'var(--accent)'}} /></div>
            <b>{formatMoney(value.balance, currency, {decimals: 0})}</b>
          </div>
          <div className={styles.levRow}>
            <span>Exposure</span>
            <div className={styles.levTrack}><i style={{width: `${exposureWidth}%`, background: 'var(--amber)'}} /></div>
            <b>{formatMoney(value.exposure, currency, {decimals: 0})}</b>
          </div>
        </div>
      </div>

      <div className={styles.levBlock}>
        <p className={styles.levCaption}>Account before and after</p>
        <div className={styles.levBars}>
          <div className={styles.levRow}>
            <span>Before</span>
            <div className={styles.levTrack}><i style={{width: `${(value.balance / top) * 100}%`, background: 'var(--muted)'}} /></div>
            <b>{formatMoney(value.balance, currency, {decimals: 0})}</b>
          </div>
          <div className={styles.levRow}>
            <span>After</span>
            <div className={styles.levTrack}><i style={{width: `${(value.newBalance / top) * 100}%`, background: gain ? 'var(--pos)' : 'var(--neg)'}} /></div>
            <b>{formatMoney(value.newBalance, currency, {decimals: 0})}</b>
          </div>
        </div>
      </div>

      <div className={styles.levBlock}>
        <p className={styles.levCaption}>The same {formatNumber(value.movePct, 1)}% move at every leverage</p>
        <ul className={styles.levCompare}>
          {comparison.map((row) => {
            const clamped = Math.max(-100, Math.min(100, row.accountImpactPct));
            const active = row.leverage === value.leverage;
            return (
              <li key={row.leverage} className={active ? styles.levActive : undefined}>
                <span>{row.leverage}×</span>
                <div className={styles.levDiverge} aria-hidden="true">
                  <i className={styles.levZero} />
                  <i className={styles.levFill} style={{width: `${Math.abs(clamped) / 2}%`, [clamped < 0 ? 'right' : 'left']: '50%', background: clamped < 0 ? 'var(--neg)' : 'var(--pos)'}} />
                </div>
                <b style={{color: row.accountImpactPct < 0 ? 'var(--neg)' : 'var(--pos)'}}>{formatPercent(row.accountImpactPct, 0, true)}</b>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
