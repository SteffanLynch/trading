import {incomplete, invalid, isNum, ok, type Calc} from './result';

export interface Stage {
  /** Percentage of the position closed at this stage. */
  closePct: number | null;
  /** Result of this stage in R multiples (1R = the amount risked). */
  r: number | null;
}

export interface PartialProfitInputs {
  stages: Stage[];
  /** What the part of the position not yet accounted for ends at (0 = break-even, -1 = stopped out). Default 0. */
  remainderR?: number | null;
  /** Optional: what 1R is worth in money. */
  oneRMoney?: number | null;
}

export interface PartialProfitValue {
  stages: {closePct: number; r: number; contribution: number}[];
  allocatedPct: number;
  remainingPct: number;
  remainderR: number;
  remainderContribution: number;
  /** Final result of the whole trade in R. */
  totalR: number;
  totalMoney: number | null;
  /** What closing the entire position at the first target would have returned, for comparison. */
  allAtFirstTargetR: number;
}

/** R multiple of a price, given the entry and stop. Works for longs and shorts. */
export function rMultipleAt(entry: number, stop: number, price: number): number | null {
  if (entry === stop) return null;
  return (price - entry) / (entry - stop);
}

/** Final result in R when a winning trade is closed in stages. */
export function partialProfit(inputs: PartialProfitInputs): Calc<PartialProfitValue> {
  const touched = inputs.stages.filter((stage) => stage.closePct !== null || stage.r !== null);
  if (touched.length === 0) return incomplete();
  if (touched.some((stage) => !isNum(stage.closePct) || !isNum(stage.r))) return incomplete();

  const stages = touched as {closePct: number; r: number}[];
  if (stages.some((stage) => stage.closePct <= 0 || stage.closePct > 100)) return invalid('Each stage must close between 0% and 100% of the position.');

  const allocatedPct = stages.reduce((sum, stage) => sum + stage.closePct, 0);
  if (allocatedPct > 100 + 1e-9) return invalid(`The stages close ${Number(allocatedPct.toFixed(2))}% of the position. The total cannot be more than 100%.`);

  const remainderR = isNum(inputs.remainderR) ? inputs.remainderR : 0;
  const remainingPct = Math.max(0, 100 - allocatedPct);
  const rows = stages.map((stage) => ({...stage, contribution: (stage.closePct / 100) * stage.r}));
  const remainderContribution = (remainingPct / 100) * remainderR;
  const totalR = rows.reduce((sum, row) => sum + row.contribution, 0) + remainderContribution;
  const oneR = isNum(inputs.oneRMoney) && inputs.oneRMoney > 0 ? inputs.oneRMoney : null;

  return ok({
    stages: rows,
    allocatedPct,
    remainingPct,
    remainderR,
    remainderContribution,
    totalR,
    totalMoney: oneR !== null ? totalR * oneR : null,
    allAtFirstTargetR: rows[0].r,
  });
}
