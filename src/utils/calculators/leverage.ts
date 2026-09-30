import {incomplete, invalid, isNum, ok, type Calc} from './result';

export const SANDBOX_LEVERAGES = [1, 2, 5, 10, 20, 30];

export interface LeverageSandboxInputs {
  balance: number | null;
  leverage: number | null;
  /** Move in the underlying market, percent (negative = falls). */
  movePct: number | null;
  direction?: 'long' | 'short';
}

export interface LeverageOutcome {
  leverage: number;
  exposure: number;
  /** Profit or loss on the leveraged exposure (before the account floor). */
  pnl: number;
  newBalance: number;
  accountImpactPct: number;
  wipedOut: boolean;
}

export interface LeverageSandboxValue extends LeverageOutcome {
  balance: number;
  movePct: number;
  /** The move against the position that erases the whole account, in percent. */
  wipeOutMovePct: number;
}

function outcome(balance: number, leverage: number, movePct: number, direction: 'long' | 'short'): LeverageOutcome {
  const exposure = balance * leverage;
  const pnl = exposure * (movePct / 100) * (direction === 'long' ? 1 : -1);
  const newBalance = Math.max(0, balance + pnl);
  return {leverage, exposure, pnl, newBalance, accountImpactPct: ((newBalance - balance) / balance) * 100, wipedOut: balance + pnl <= 0};
}

/**
 * A simplified leveraged position using the whole account as margin: exposure = balance × leverage.
 * Real brokers close positions (a "stop-out") before the balance reaches zero; that is not modelled here.
 */
export function leverageSandbox(inputs: LeverageSandboxInputs): Calc<LeverageSandboxValue> {
  const {balance, leverage, movePct} = inputs;
  if (!isNum(balance) || !isNum(leverage) || !isNum(movePct)) return incomplete();
  if (balance <= 0) return invalid('The account balance must be greater than zero.');
  if (leverage < 1) return invalid('Leverage must be 1 or higher (1 means no leverage).');
  return ok({...outcome(balance, leverage, movePct, inputs.direction ?? 'long'), balance, movePct, wipeOutMovePct: 100 / leverage});
}

/** The same move at every leverage, for side-by-side comparison. */
export function leverageComparison(balance: number, movePct: number, direction: 'long' | 'short' = 'long', levels = SANDBOX_LEVERAGES): LeverageOutcome[] {
  return levels.map((level) => outcome(balance, level, movePct, direction));
}
