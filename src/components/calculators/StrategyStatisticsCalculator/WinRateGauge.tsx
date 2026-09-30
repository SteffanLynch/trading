import {formatPercent} from '../../../utils/calculators/format';
import styles from '../ui/ui.module.css';

interface Props {
  winRate: number;
  breakEvenWinRate: number | null;
  winners: number;
  losers: number;
  breakEven: number;
}

/** The win rate against the break-even line, plus the split of all trades. */
export function WinRateGauge({winRate, breakEvenWinRate, winners, losers, breakEven}: Props) {
  const total = winners + losers + breakEven || 1;
  const pct = (count: number) => (count / total) * 100;
  const above = breakEvenWinRate !== null && winRate >= breakEvenWinRate;
  return (
    <div className={styles.gauge}>
      <div className={styles.gaugeTrack} role="img" aria-label={`Win rate ${formatPercent(winRate, 1)}${breakEvenWinRate !== null ? `, break-even win rate ${formatPercent(breakEvenWinRate, 1)}` : ''}`}>
        <div className={styles.gaugeFill} style={{width: `${Math.min(100, winRate)}%`, background: above || breakEvenWinRate === null ? 'var(--pos)' : 'var(--neg)'}} />
        {breakEvenWinRate !== null && (
          <div className={styles.gaugeMark} style={{left: `${Math.min(100, breakEvenWinRate)}%`}}>
            <span>break-even {formatPercent(breakEvenWinRate, 1)}</span>
          </div>
        )}
      </div>
      <div className={styles.gaugeLegend}>
        <span>win rate {formatPercent(winRate, 1)}</span>
        <span>{above ? 'above' : 'below'} break-even</span>
      </div>
      <div className={styles.stageBar} role="img" aria-label="Split of winners, losers and break-even trades">
        <div style={{flexGrow: winners || 0.0001, background: 'var(--pos)'}}>{winners > 0 && <span>{formatPercent(pct(winners), 0)}</span>}</div>
        <div style={{flexGrow: losers || 0.0001, background: 'var(--neg)'}}>{losers > 0 && <span>{formatPercent(pct(losers), 0)}</span>}</div>
        {breakEven > 0 && <div style={{flexGrow: breakEven, background: 'var(--muted)'}}><span>{formatPercent(pct(breakEven), 0)}</span></div>}
      </div>
    </div>
  );
}
