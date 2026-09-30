import type {PartialProfitValue} from '../../../utils/calculators/partialProfit';
import {formatNumber, formatR} from '../../../utils/calculators/format';
import styles from '../ui/ui.module.css';

const COLORS = ['var(--violet)', 'var(--cyan)', 'var(--lime)', 'var(--amber)', 'var(--coral)'];

/** The position as one bar split into the stages it was closed in, then each stage's contribution to the final result. */
export function StageBars({value}: {value: PartialProfitValue}) {
  const maxContribution = Math.max(...value.stages.map((stage) => Math.abs(stage.contribution)), Math.abs(value.remainderContribution), 0.0001);
  return (
    <div className={styles.stageWrap}>
      <div className={styles.stageBar} role="img" aria-label="The position split into the stages it was closed in">
        {value.stages.map((stage, index) => (
          <div key={index} style={{flexGrow: stage.closePct, background: COLORS[index % COLORS.length]}} title={`${stage.closePct}% at ${formatR(stage.r)}`}>
            <span>{formatNumber(stage.closePct, 1)}%</span>
          </div>
        ))}
        {value.remainingPct > 0 && (
          <div style={{flexGrow: value.remainingPct, background: 'repeating-linear-gradient(45deg, var(--line), var(--line) 6px, transparent 6px, transparent 12px)'}}>
            <span className={styles.stageLeft}>{formatNumber(value.remainingPct, 1)}% left</span>
          </div>
        )}
      </div>
      <ul className={styles.stageList}>
        {value.stages.map((stage, index) => (
          <li key={index}>
            <span className={styles.stageDot} style={{background: COLORS[index % COLORS.length]}} />
            <span className={styles.stageName}>{formatNumber(stage.closePct, 1)}% at {formatR(stage.r)}</span>
            <span className={styles.stageTrack}>
              <i style={{width: `${(Math.abs(stage.contribution) / maxContribution) * 100}%`, background: stage.contribution >= 0 ? 'var(--pos)' : 'var(--neg)'}} />
            </span>
            <b>{formatR(stage.contribution)}</b>
          </li>
        ))}
        {value.remainingPct > 0 && (
          <li>
            <span className={styles.stageDot} style={{background: 'var(--muted)'}} />
            <span className={styles.stageName}>{formatNumber(value.remainingPct, 1)}% left at {formatR(value.remainderR)}</span>
            <span className={styles.stageTrack}>
              <i style={{width: `${(Math.abs(value.remainderContribution) / maxContribution) * 100}%`, background: value.remainderContribution >= 0 ? 'var(--pos)' : 'var(--neg)'}} />
            </span>
            <b>{formatR(value.remainderContribution)}</b>
          </li>
        )}
      </ul>
    </div>
  );
}
