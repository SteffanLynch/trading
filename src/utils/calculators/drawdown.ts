import {incomplete, invalid, isNum, ok, type Calc} from './result';

/** Gain (percent) needed to get back to break-even after losing `drawdownPct` percent. */
export function recoveryRequired(drawdownPct: number): number {
  const d = drawdownPct / 100;
  return (1 / (1 - d) - 1) * 100;
}

export interface DrawdownValue {
  /** Percent gain needed to recover. */
  recoveryPct: number;
  /** Balance after the loss, when a starting balance was supplied. */
  balanceAfter: number | null;
  /** Money needed to climb back, when a starting balance was supplied. */
  moneyToRecover: number | null;
  /** How many times bigger than the loss the recovery gain is. */
  recoveryMultiple: number;
}

export const MAX_DRAWDOWN = 99;

export function drawdownRecovery(drawdownPct: number | null, startingBalance?: number | null): Calc<DrawdownValue> {
  if (!isNum(drawdownPct)) return incomplete();
  if (drawdownPct <= 0) return invalid('Enter a loss greater than 0%.');
  if (drawdownPct > MAX_DRAWDOWN) return invalid(`Enter a loss of ${MAX_DRAWDOWN}% or less. A 100% loss can never be recovered.`);

  const recoveryPct = recoveryRequired(drawdownPct);
  const balance = isNum(startingBalance) && startingBalance > 0 ? startingBalance : null;
  const balanceAfter = balance !== null ? balance * (1 - drawdownPct / 100) : null;

  return ok({
    recoveryPct,
    balanceAfter,
    moneyToRecover: balance !== null && balanceAfter !== null ? balance - balanceAfter : null,
    recoveryMultiple: recoveryPct / drawdownPct,
  });
}

/** Points for the recovery curve, from 0% to `max`% of losses. */
export function recoveryCurve(max = 90, step = 1): [number, number][] {
  const points: [number, number][] = [];
  for (let loss = 0; loss <= max; loss += step) points.push([loss, recoveryRequired(loss)]);
  return points;
}

export const REFERENCE_DRAWDOWNS = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
