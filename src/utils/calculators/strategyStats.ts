import {breakEvenWinRate} from './risk';
import {incomplete, invalid, isNum, ok, type Calc} from './result';

export interface StrategyStatsInputs {
  winners: number | null;
  losers: number | null;
  /** Trades that closed at break-even. Empty counts as none. */
  breakEven?: number | null;
  /** Average winning trade, money or R, as a positive number. */
  averageWin: number | null;
  /** Average losing trade, money or R, as a positive number. */
  averageLoss: number | null;
}

export interface StrategyStatsValue {
  trades: number;
  winners: number;
  losers: number;
  breakEven: number;
  winRate: number;
  lossRate: number;
  /** Average win divided by average loss. */
  payoffRatio: number | null;
  /** Average result per trade (same unit as the averages). */
  expectancy: number;
  /** Expectancy measured in multiples of the average loss. */
  expectancyR: number | null;
  grossProfit: number;
  grossLoss: number;
  netProfit: number;
  profitFactor: number | null;
  /** Win rate needed to break even at this payoff ratio (percent), before costs. */
  breakEvenWinRate: number | null;
  /** How far the actual win rate sits above (+) or below (-) that break-even point, in percentage points. */
  marginOverBreakEven: number | null;
  edge: 'positive' | 'negative' | 'flat';
}

const isCount = (value: number) => Number.isInteger(value) && value >= 0;

export function strategyStats(inputs: StrategyStatsInputs): Calc<StrategyStatsValue> {
  const {winners, losers, averageWin, averageLoss} = inputs;
  if (!isNum(winners) || !isNum(losers) || !isNum(averageWin) || !isNum(averageLoss)) return incomplete();
  const breakEven = isNum(inputs.breakEven) ? inputs.breakEven : 0;

  if (![winners, losers, breakEven].every(isCount)) return invalid('Winners, losers and break-even trades must be whole numbers (zero or more).');
  const trades = winners + losers + breakEven;
  if (trades === 0) return invalid('Enter at least one trade.');
  if (averageWin < 0 || averageLoss < 0) return invalid('Enter the average win and the average loss as positive numbers.');
  if (winners > 0 && averageWin === 0) return invalid('Winning trades need an average win above zero.');

  const grossProfit = winners * averageWin;
  const grossLoss = losers * averageLoss;
  const netProfit = grossProfit - grossLoss;
  const expectancy = netProfit / trades;
  const payoffRatio = averageLoss > 0 ? averageWin / averageLoss : null;
  const winRate = (winners / trades) * 100;
  const breakEvenRate = payoffRatio !== null && payoffRatio > 0 ? breakEvenWinRate(payoffRatio) : null;

  return ok({
    trades,
    winners,
    losers,
    breakEven,
    winRate,
    lossRate: (losers / trades) * 100,
    payoffRatio,
    expectancy,
    expectancyR: averageLoss > 0 ? expectancy / averageLoss : null,
    grossProfit,
    grossLoss,
    netProfit,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : null,
    breakEvenWinRate: breakEvenRate,
    marginOverBreakEven: breakEvenRate !== null ? winRate - breakEvenRate : null,
    edge: Math.abs(expectancy) < 1e-9 ? 'flat' : expectancy > 0 ? 'positive' : 'negative',
  });
}
