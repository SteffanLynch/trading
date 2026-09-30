import {incomplete, invalid, isNum, ok, type Calc} from './result';

export interface CompoundGrowthInputs {
  startingBalance: number | null;
  /** Average return per period, percent. */
  ratePct: number | null;
  periods: number | null;
  /** Optional amount added at the end of every period. */
  contribution?: number | null;
}

export interface CompoundGrowthValue {
  /** Balance at the end of each period; index 0 is the starting balance. */
  balances: number[];
  /** What the same rate would give without compounding (simple growth), for comparison. */
  simpleBalances: number[];
  finalBalance: number;
  totalContributed: number;
  totalGain: number;
  /** Final balance divided by what was put in. */
  multiple: number;
  /** Periods needed to double the starting balance at this rate; null if it never doubles. */
  periodsToDouble: number | null;
}

export const MAX_PERIODS = 600;

export function compoundGrowth(inputs: CompoundGrowthInputs): Calc<CompoundGrowthValue> {
  const {startingBalance, ratePct, periods} = inputs;
  if (!isNum(startingBalance) || !isNum(ratePct) || !isNum(periods)) return incomplete();
  if (startingBalance <= 0) return invalid('Starting balance must be greater than zero.');
  if (ratePct <= -100) return invalid('A return of −100% or worse would wipe out the account.');
  if (!Number.isInteger(periods) || periods < 1) return invalid('Enter a whole number of periods (1 or more).');
  if (periods > MAX_PERIODS) return invalid(`Choose ${MAX_PERIODS} periods or fewer.`);

  const contribution = isNum(inputs.contribution) ? inputs.contribution : 0;
  const rate = ratePct / 100;

  const balances = [startingBalance];
  const simpleBalances = [startingBalance];
  for (let period = 1; period <= periods; period += 1) {
    balances.push(balances[period - 1] * (1 + rate) + contribution);
    simpleBalances.push(startingBalance * (1 + rate * period) + contribution * period);
  }

  const finalBalance = balances[periods];
  if (!Number.isFinite(finalBalance)) return invalid('The result is too large to display. Try fewer periods or a lower rate.');

  const totalContributed = startingBalance + contribution * periods;
  return ok({
    balances,
    simpleBalances,
    finalBalance,
    totalContributed,
    totalGain: finalBalance - totalContributed,
    multiple: finalBalance / totalContributed,
    periodsToDouble: rate > 0 ? Math.log(2) / Math.log(1 + rate) : null,
  });
}
