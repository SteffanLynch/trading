import {describe, expect, it} from 'vitest';
import {fibonacciLevels} from './fibonacci';

describe('fibonacciLevels', () => {
  it('measures retracements down from the high of an up-swing', () => {
    const result = fibonacciLevels(1.12, 1.1, 'up');
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    const at = (ratio: number) => result.value.retracements.find((level) => level.ratio === ratio)!.price;
    expect(result.value.range).toBeCloseTo(0.02);
    expect(at(0)).toBeCloseTo(1.12);
    expect(at(0.382)).toBeCloseTo(1.11236, 5);
    expect(at(0.5)).toBeCloseTo(1.11);
    expect(at(0.618)).toBeCloseTo(1.10764, 5);
    expect(at(1)).toBeCloseTo(1.1);
  });

  it('projects extensions beyond the high of an up-swing', () => {
    const result = fibonacciLevels(1.12, 1.1, 'up');
    const ext = result.status === 'ok' ? result.value.extensions : [];
    expect(ext.find((level) => level.ratio === 1.618)!.price).toBeCloseTo(1.13236, 5);
    expect(ext.find((level) => level.ratio === 2)!.price).toBeCloseTo(1.14, 5);
  });

  it('mirrors for a down-swing', () => {
    const result = fibonacciLevels(1.12, 1.1, 'down');
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.retracements.find((level) => level.ratio === 0.618)!.price).toBeCloseTo(1.11236, 5);
    expect(result.value.extensions.find((level) => level.ratio === 1.272)!.price).toBeCloseTo(1.09456, 5);
  });

  it('validates', () => {
    expect(fibonacciLevels(null, 1.1, 'up').status).toBe('incomplete');
    expect(fibonacciLevels(1.1, 1.1, 'up')).toMatchObject({status: 'invalid'});
    expect(fibonacciLevels(1.09, 1.1, 'up')).toMatchObject({status: 'invalid'});
  });
});
