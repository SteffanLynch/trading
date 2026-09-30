import {describe, expect, it} from 'vitest';
import {niceTicks} from './chart';

describe('niceTicks', () => {
  it('picks round, readable steps', () => {
    expect(niceTicks(0, 900, 4)).toEqual([0, 250, 500, 750]);
    expect(niceTicks(0, 16084, 4)).toEqual([0, 5000, 10000, 15000]);
    expect(niceTicks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('copes with a degenerate range', () => {
    expect(niceTicks(5, 5)).toEqual([5]);
  });
});
