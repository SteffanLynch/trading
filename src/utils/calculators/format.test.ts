import {describe, expect, it} from 'vitest';
import {formatDuration, formatMoney, formatNumber, formatPercent, formatR, formatRatio, groupDigits, parseNumber} from './format';

describe('parseNumber', () => {
  it('reads plain and formatted numbers', () => {
    expect(parseNumber('10000')).toBe(10000);
    expect(parseNumber('10,000.50')).toBe(10000.5);
    expect(parseNumber('£1,250')).toBe(1250);
    expect(parseNumber(' 1.5% ')).toBe(1.5);
    expect(parseNumber('-3')).toBe(-3);
    expect(parseNumber('.5')).toBe(0.5);
    expect(parseNumber('1e3')).toBe(1000);
  });

  it('separates "empty" from "invalid"', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('  ')).toBeNull();
    expect(parseNumber(null)).toBeNull();
    expect(parseNumber('abc')).toBeNaN();
    expect(parseNumber('1.2.3')).toBeNaN();
    expect(parseNumber('-')).toBeNaN();
    expect(parseNumber('1e999')).toBeNaN();
  });
});

describe('groupDigits', () => {
  it('adds separators without touching decimals', () => {
    expect(groupDigits('10000')).toBe('10,000');
    expect(groupDigits('1234567.80')).toBe('1,234,567.80');
    expect(groupDigits('1.1650')).toBe('1.1650');
    expect(groupDigits('-2500')).toBe('-2,500');
    expect(groupDigits('abc')).toBe('abc');
  });
});

describe('formatting', () => {
  it('formats money with a sign and the right symbol', () => {
    expect(formatMoney(1234.5, 'GBP')).toBe('£1,234.50');
    expect(formatMoney(-96.05, 'USD')).toBe('−$96.05');
    expect(formatMoney(200, 'EUR', {signed: true})).toBe('+€200.00');
    expect(formatMoney(0, 'USD', {signed: true})).toBe('$0.00');
    expect(formatMoney(125_000, 'JPY')).toBe('¥125,000');
  });

  it('never shows negative zero', () => {
    expect(formatMoney(-0.001, 'USD')).toBe('$0.00');
    expect(formatNumber(-0.0001, 2)).toBe('0');
  });

  it('formats numbers, percentages, ratios and R', () => {
    expect(formatNumber(20000)).toBe('20,000');
    expect(formatNumber(0.1874, 4)).toBe('0.1874');
    expect(formatPercent(33.3333)).toBe('33.33%');
    expect(formatPercent(-1.5, 2, true)).toBe('−1.5%');
    expect(formatPercent(2, 2, true)).toBe('+2%');
    expect(formatRatio(2)).toBe('1 : 2');
    expect(formatRatio(2.345)).toBe('1 : 2.35');
    expect(formatR(0.35)).toBe('+0.35R');
    expect(formatR(-1)).toBe('−1R');
  });

  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(135)).toBe('2h 15m');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(3000)).toBe('2d 2h');
  });
});
