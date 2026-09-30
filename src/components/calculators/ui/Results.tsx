import type {ReactNode} from 'react';
import clsx from 'clsx';
import type {Calc} from '../../../utils/calculators/result';
import styles from './ui.module.css';

export type Tone = 'neutral' | 'positive' | 'negative';

interface HeroProps {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: ReactNode;
  /** Plain-English meaning of the number. */
  sentence?: ReactNode;
  tone?: Tone;
  /** Announce changes to screen readers. Turn off for values that tick on their own (a clock). */
  live?: boolean;
}

/** The one big answer, with a sentence saying what it means. Announced politely to screen readers. */
export function ResultHero({label, value, unit, sub, sentence, tone = 'neutral', live = true}: HeroProps) {
  return (
    <section className={clsx(styles.hero, tone === 'positive' && styles.positive, tone === 'negative' && styles.negative)} aria-live={live ? 'polite' : undefined} aria-atomic={live ? 'true' : undefined}>
      <p className={styles.heroLabel}>{label}</p>
      <p className={styles.heroValue}>
        {value}
        {unit && <span className={styles.heroUnit}>{unit}</span>}
      </p>
      {sub && <p className={styles.heroSub}>{sub}</p>}
      {sentence && <p className={styles.heroSentence}>{sentence}</p>}
    </section>
  );
}

export interface Stat {
  label: string;
  value: ReactNode;
  tone?: Tone;
  hint?: ReactNode;
}

export function StatGrid({stats}: {stats: Stat[]}) {
  return (
    <div className={styles.stats}>
      {stats.map((stat) => (
        <div className={styles.stat} key={stat.label}>
          <span className={styles.statLabel}>{stat.label}</span>
          <span className={clsx(styles.statValue, stat.tone === 'positive' && styles.positive, stat.tone === 'negative' && styles.negative)}>{stat.value}</span>
          {stat.hint && <span className={styles.statHint}>{stat.hint}</span>}
        </div>
      ))}
    </div>
  );
}

interface CalloutProps {
  tone?: 'info' | 'warning' | 'error' | 'success';
  children: ReactNode;
}

export function Callout({tone = 'info', children}: CalloutProps) {
  return (
    <p className={clsx(styles.callout, tone === 'warning' && styles.warning, tone === 'error' && styles.error, tone === 'success' && styles.success)} role={tone === 'error' ? 'alert' : undefined}>
      {children}
    </p>
  );
}

export function Note({children}: {children: ReactNode}) {
  return <p className={styles.note}>{children}</p>;
}

interface ExplainerProps {
  /** Worked steps using the current numbers. */
  steps: string[];
  title?: string;
}

export function Explainer({steps, title = 'How was this calculated?'}: ExplainerProps) {
  if (steps.length === 0) return null;
  return (
    <details className={styles.explainer}>
      <summary>{title}</summary>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </details>
  );
}

interface TableProps {
  head: string[];
  rows: {cells: ReactNode[]; highlight?: boolean}[];
  caption: string;
}

export function MiniTable({head, rows, caption}: TableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.miniTable}>
        <caption className={styles.srOnly}>{caption}</caption>
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={row.highlight ? styles.highlight : undefined}>
              {row.cells.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SplitBarProps {
  left: {label: string; value: number; tone: 'negative' | 'positive' | 'neutral'};
  right: {label: string; value: number; tone: 'negative' | 'positive' | 'neutral'};
}

const TONE_VAR = {negative: 'var(--neg)', positive: 'var(--pos)', neutral: 'var(--accent)'};

/** Two proportional bars side by side, e.g. risk vs reward. The bars are decorative; the text carries the meaning. */
export function SplitBar({left, right}: SplitBarProps) {
  const total = left.value + right.value || 1;
  const part = (entry: SplitBarProps['left']) => ({flexGrow: Math.max(entry.value, total * 0.08), background: TONE_VAR[entry.tone]});
  return (
    <div>
      <div style={{display: 'flex', gap: 3, height: 10, borderRadius: 6, overflow: 'hidden'}} aria-hidden="true">
        <div style={part(left)} />
        <div style={part(right)} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.72rem', color: 'var(--muted)'}}>
        <span>{left.label}</span>
        <span>{right.label}</span>
      </div>
    </div>
  );
}

/** What to show in place of results while a calculation is not `ok`. Quiet while fields are empty; an alert only for real problems. */
export function StatusMessage({result, idle}: {result: Calc<unknown>; idle: string}) {
  switch (result.status) {
    case 'incomplete':
      return <Note>{idle}</Note>;
    case 'invalid':
      return <Callout tone="error">{result.message}</Callout>;
    case 'needs-rate':
      return (
        <Callout tone="info">
          Enter the exchange rate (1 {result.from} = ? {result.to}) to see your result.
        </Callout>
      );
    default:
      return null;
  }
}
