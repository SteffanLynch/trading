import {describe, expect, it} from 'vitest';
import {breakEvenWinRate, requiredRewardToRisk, riskReward, targetForRatio} from './risk';

describe('breakEvenWinRate', () => {
  it('matches the classic values', () => {
    expect(breakEvenWinRate(1)).toBeCloseTo(50);
    expect(breakEvenWinRate(2)).toBeCloseTo(33.333, 2);
    expect(breakEvenWinRate(3)).toBeCloseTo(25);
    expect(breakEvenWinRate(0.5)).toBeCloseTo(66.667, 2);
  });
});

describe('requiredRewardToRisk', () => {
  it('is the inverse of the break-even win rate', () => {
    expect(requiredRewardToRisk(40)).toBeCloseTo(1.5);
    expect(requiredRewardToRisk(50)).toBeCloseTo(1);
    expect(breakEvenWinRate(requiredRewardToRisk(35))).toBeCloseTo(35);
  });
});

describe('riskReward', () => {
  it('reads a long: 50 pips of risk for 100 pips of reward is 1:2', () => {
    const result = riskReward(1.165, 1.16, 1.175);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.direction).toBe('long');
    expect(result.value.ratio).toBeCloseTo(2);
    expect(result.value.breakEvenWinRate).toBeCloseTo(33.333, 2);
  });

  it('reads a short', () => {
    const result = riskReward(100, 105, 85);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.direction).toBe('short');
    expect(result.value.ratio).toBeCloseTo(3);
  });

  it('is incomplete while a field is empty and invalid for nonsense levels', () => {
    expect(riskReward(100, null, 110).status).toBe('incomplete');
    expect(riskReward(100, 100, 110)).toMatchObject({status: 'invalid'});
    expect(riskReward(100, 95, 100)).toMatchObject({status: 'invalid'});
    expect(riskReward(100, 95, 90)).toMatchObject({status: 'invalid'}); // stop and target both below entry
  });
});

describe('targetForRatio', () => {
  it('finds the target for a given ratio, long and short', () => {
    expect(targetForRatio(100, 95, 3)).toBeCloseTo(115);
    expect(targetForRatio(100, 105, 2)).toBeCloseTo(90);
  });
});
