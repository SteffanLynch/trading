import {rewardToRisk} from './core';
import {incomplete, invalid, isNum, ok, type Calc} from './result';

export type LevelDirection = 'long' | 'short';

export interface RiskRewardValue {
  direction: LevelDirection;
  /** Distance from entry to stop, as a price difference. */
  risk: number;
  /** Distance from entry to target, as a price difference. */
  reward: number;
  /** Reward per 1 of risk (2 means 1 : 2). */
  ratio: number;
  /** Win rate needed to break even at this ratio, before costs (percent). */
  breakEvenWinRate: number;
}

/** Percentage of trades that must win for a strategy to break even at reward-to-risk `ratio` (before costs). */
export function breakEvenWinRate(ratio: number): number {
  return 100 / (1 + ratio);
}

/** Reward-to-risk needed to break even at a given win rate (percent, 0 < winRate < 100), before costs. */
export function requiredRewardToRisk(winRatePct: number): number {
  const winRate = winRatePct / 100;
  return (1 - winRate) / winRate;
}

/** Direction is inferred from where the stop and target sit around the entry. */
export function riskReward(entry: number | null, stop: number | null, target: number | null): Calc<RiskRewardValue> {
  if (!isNum(entry) || !isNum(stop) || !isNum(target)) return incomplete();
  if (stop === entry) return invalid('Entry price and stop loss price cannot be identical.');
  if (target === entry) return invalid('Entry price and target price cannot be identical.');

  const long = stop < entry && target > entry;
  const short = stop > entry && target < entry;
  if (!long && !short) return invalid('Your stop and target must sit on opposite sides of your entry price.');

  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  const ratio = rewardToRisk(risk, reward);
  return ok({direction: long ? 'long' : 'short', risk, reward, ratio, breakEvenWinRate: breakEvenWinRate(ratio)});
}

/** The target price that delivers `ratio` : 1 reward-to-risk for a given entry and stop. */
export function targetForRatio(entry: number, stop: number, ratio: number): number {
  const risk = entry - stop;
  return entry + risk * ratio;
}
