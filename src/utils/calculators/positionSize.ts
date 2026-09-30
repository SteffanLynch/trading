import {riskAmount, unitsForRisk} from './core';

/**
 * The simple case: entry and stop prices, with the account currency equal to the quote currency.
 * The full engine (`sizePosition` in ./sizing) handles pips, lots, currency conversion and rounding.
 */
export interface PositionSizeInputs {
  accountBalance: number | null;
  riskPercentage: number | null;
  entryPrice: number | null;
  stopLossPrice: number | null;
}

export interface PositionSizeOutputs {
  amountAtRisk: number;
  riskPerUnit: number;
  positionSizeUnits: number;
  isValid: boolean;
  errorMessage?: string;
}

const INCOMPLETE: PositionSizeOutputs = {
  amountAtRisk: 0,
  riskPerUnit: 0,
  positionSizeUnits: 0,
  isValid: false,
};

export function calculatePositionSize(inputs: PositionSizeInputs): PositionSizeOutputs {
  const {accountBalance, riskPercentage, entryPrice, stopLossPrice} = inputs;

  // Empty or non-numeric fields pause the calculation silently (no error shown).
  if (
    accountBalance === null ||
    riskPercentage === null ||
    entryPrice === null ||
    stopLossPrice === null ||
    !Number.isFinite(accountBalance) ||
    !Number.isFinite(riskPercentage) ||
    !Number.isFinite(entryPrice) ||
    !Number.isFinite(stopLossPrice)
  ) {
    return {...INCOMPLETE};
  }

  if (accountBalance <= 0 || riskPercentage <= 0) {
    return {
      ...INCOMPLETE,
      errorMessage: 'Account balance and risk percentage must be greater than zero.',
    };
  }

  const riskPerUnit = Math.abs(entryPrice - stopLossPrice);

  if (riskPerUnit === 0) {
    return {
      ...INCOMPLETE,
      errorMessage: 'Entry price and stop loss price cannot be identical.',
    };
  }

  const amountAtRisk = riskAmount(accountBalance, riskPercentage);
  const positionSizeUnits = unitsForRisk(amountAtRisk, riskPerUnit);

  return {
    amountAtRisk: Number(amountAtRisk.toFixed(2)),
    riskPerUnit: Number(riskPerUnit.toFixed(5)),
    positionSizeUnits: Number(positionSizeUnits.toFixed(2)),
    isValid: true,
  };
}
