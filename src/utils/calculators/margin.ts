import {incomplete, invalid, isNum, ok, type Calc} from './result';

export interface MarginInputs {
  /** Full notional value of the position, in the account currency. */
  positionValue: number | null;
  /** Broker leverage as the first number of the ratio (30 means 30:1). */
  leverage: number | null;
  /** Optional account equity, to work out free margin and effective leverage. */
  equity?: number | null;
}

export interface MoveImpact {
  /** Adverse market move, percent. */
  movePct: number;
  /** Money lost on the whole position. */
  loss: number;
  /** Loss as a percentage of the margin committed. */
  pctOfMargin: number;
  /** Loss as a percentage of equity, when equity is supplied. */
  pctOfEquity: number | null;
}

export interface MarginValue {
  marginRequired: number;
  /** Margin as a percentage of the position value (100 / leverage). */
  marginPct: number;
  /** Position value divided by equity. */
  effectiveLeverage: number | null;
  freeMargin: number | null;
  /** The largest position this equity can open at the broker's leverage. */
  maxPositionValue: number | null;
  /** True when the position needs more margin than the account holds. */
  exceedsEquity: boolean;
  impacts: MoveImpact[];
}

export const IMPACT_MOVES = [0.5, 1, 2, 5];

export function calculateMargin(inputs: MarginInputs): Calc<MarginValue> {
  const {positionValue, leverage} = inputs;
  if (!isNum(positionValue) || !isNum(leverage)) return incomplete();
  if (positionValue <= 0) return invalid('Position value must be greater than zero.');
  if (leverage < 1) return invalid('Leverage must be 1 or higher (1 means no leverage).');

  const equity = isNum(inputs.equity) ? inputs.equity : null;
  if (equity !== null && equity <= 0) return invalid('Account equity must be greater than zero.');

  const marginRequired = positionValue / leverage;

  return ok({
    marginRequired,
    marginPct: 100 / leverage,
    effectiveLeverage: equity !== null ? positionValue / equity : null,
    freeMargin: equity !== null ? equity - marginRequired : null,
    maxPositionValue: equity !== null ? equity * leverage : null,
    exceedsEquity: equity !== null && marginRequired > equity,
    impacts: IMPACT_MOVES.map((movePct) => {
      const loss = positionValue * (movePct / 100);
      return {
        movePct,
        loss,
        pctOfMargin: (loss / marginRequired) * 100,
        pctOfEquity: equity !== null ? (loss / equity) * 100 : null,
      };
    }),
  });
}
