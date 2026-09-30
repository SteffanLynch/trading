/** Money put at risk on one trade. `riskPercentage` is a percentage (1 = 1%). */
export function riskAmount(accountBalance: number, riskPercentage: number): number {
  return accountBalance * (riskPercentage / 100);
}

/** How many units can be traded so that hitting the stop loses exactly `risk`. */
export function unitsForRisk(risk: number, lossPerUnit: number): number {
  return risk / lossPerUnit;
}

/** Reward per 1 of risk. */
export function rewardToRisk(risk: number, reward: number): number {
  return reward / risk;
}
