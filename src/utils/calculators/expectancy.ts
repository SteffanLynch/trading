import {breakEvenWinRate} from './risk';
import {incomplete, invalid, isNum, ok, type Calc} from './result';

export interface ExpectancyInputs {
  /** Percent of trades that win (0-100). */
  winRatePct: number | null;
  /** Average winning trade, as a positive number (R multiples or money). */
  averageWin: number | null;
  /** Average losing trade, as a positive number (R multiples or money). */
  averageLoss: number | null;
  /** Optional sample size used to project the average over many trades. */
  trades?: number | null;
}

export interface ExpectancyValue {
  /** Average result per trade, in the same unit as the inputs. */
  expectancy: number;
  lossRatePct: number;
  /** Average win divided by average loss. */
  payoffRatio: number;
  /** Win rate needed to break even at this payoff ratio, before costs (percent). */
  breakEvenWinRate: number;
  /** Gross profit divided by gross loss over a large sample; null when there are no losses. */
  profitFactor: number | null;
  /** Expectancy multiplied by `trades`, or null if no sample size was given. */
  projected: number | null;
  edge: 'positive' | 'negative' | 'flat';
}

export function calculateExpectancy(inputs: ExpectancyInputs): Calc<ExpectancyValue> {
  const {winRatePct, averageWin, averageLoss} = inputs;
  if (!isNum(winRatePct) || !isNum(averageWin) || !isNum(averageLoss)) return incomplete();
  if (winRatePct < 0 || winRatePct > 100) return invalid('Win rate must be between 0% and 100%.');
  if (averageWin < 0 || averageLoss <= 0) return invalid('Average win must be zero or more, and average loss must be greater than zero. Enter the loss as a positive number.');

  const winRate = winRatePct / 100;
  const lossRate = 1 - winRate;
  const expectancy = winRate * averageWin - lossRate * averageLoss;
  const trades = isNum(inputs.trades) && inputs.trades > 0 ? inputs.trades : null;
  const grossLoss = lossRate * averageLoss;

  return ok({
    expectancy,
    lossRatePct: lossRate * 100,
    payoffRatio: averageWin / averageLoss,
    breakEvenWinRate: breakEvenWinRate(averageWin / averageLoss),
    profitFactor: grossLoss > 0 ? (winRate * averageWin) / grossLoss : null,
    projected: trades !== null ? expectancy * trades : null,
    edge: Math.abs(expectancy) < 1e-9 ? 'flat' : expectancy > 0 ? 'positive' : 'negative',
  });
}
