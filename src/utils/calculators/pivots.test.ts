import {describe, expect, it} from 'vitest';
import {pivotLevels} from './pivots';

const price = (levels: {name: string; price: number}[], name: string) => levels.find((level) => level.name === name)!.price;

describe('pivotLevels', () => {
  it('classic: high 1.1100, low 1.0900, close 1.1050 gives a pivot of about 1.1017', () => {
    const result = pivotLevels(1.11, 1.09, 1.105, 'classic');
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    const {levels, pivot} = result.value;
    expect(pivot).toBeCloseTo(1.101667, 5);
    expect(price(levels, 'R1')).toBeCloseTo(1.113333, 5);
    expect(price(levels, 'S1')).toBeCloseTo(1.093333, 5);
    expect(price(levels, 'R2')).toBeCloseTo(1.121667, 5);
    expect(price(levels, 'S2')).toBeCloseTo(1.081667, 5);
    expect(price(levels, 'R3')).toBeCloseTo(1.133333, 5);
    expect(price(levels, 'S3')).toBeCloseTo(1.073333, 5);
    // ordered from highest to lowest
    expect(levels.map((level) => level.price)).toEqual([...levels.map((level) => level.price)].sort((a, b) => b - a));
  });

  it('woodie weights the close', () => {
    const result = pivotLevels(1.11, 1.09, 1.105, 'woodie');
    expect(result.status === 'ok' && result.value.pivot).toBeCloseTo(1.1025, 5);
  });

  it('fibonacci spaces levels by ratios of the range', () => {
    const result = pivotLevels(1.11, 1.09, 1.105, 'fibonacci');
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(price(result.value.levels, 'R1')).toBeCloseTo(1.101667 + 0.382 * 0.02, 5);
    expect(price(result.value.levels, 'S3')).toBeCloseTo(1.101667 - 0.02, 5);
  });

  it('camarilla builds levels around the close', () => {
    const result = pivotLevels(1.11, 1.09, 1.105, 'camarilla');
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(price(result.value.levels, 'R1')).toBeCloseTo(1.105 + (0.02 * 1.1) / 12, 6);
    expect(price(result.value.levels, 'S4')).toBeCloseTo(1.105 - (0.02 * 1.1) / 2, 6);
    expect(result.value.levels).toHaveLength(9);
  });

  it('validates', () => {
    expect(pivotLevels(1.11, 1.09, null, 'classic').status).toBe('incomplete');
    expect(pivotLevels(1.09, 1.11, 1.1, 'classic')).toMatchObject({status: 'invalid'});
    expect(pivotLevels(1.11, 1.09, 1.12, 'classic')).toMatchObject({status: 'invalid'});
  });
});
