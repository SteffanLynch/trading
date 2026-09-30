import {describe, expect, it} from 'vitest';
import {MAX_ROWS, decodeRows, encodeRows} from './rows';

describe('rows', () => {
  it('round-trips rows through a string', () => {
    const rows = [['10', '100'], ['12', '200']];
    expect(encodeRows(rows)).toBe('10:100,12:200');
    expect(decodeRows('10:100,12:200', 2)).toEqual(rows);
  });

  it('pads short rows, trims long ones, and keeps a blank row for an empty string', () => {
    expect(decodeRows('', 2)).toEqual([['', '']]);
    expect(decodeRows('10', 2)).toEqual([['10', '']]);
    expect(decodeRows('1:2:3', 2)).toEqual([['1', '2']]);
    expect(decodeRows(':,5:6', 2)).toEqual([['', ''], ['5', '6']]);
  });

  it('strips separators from cells and caps the number of rows', () => {
    expect(encodeRows([['1,000', '2 0']])).toBe('1000:20');
    expect(decodeRows(Array.from({length: 40}, () => '1:1').join(','), 2)).toHaveLength(MAX_ROWS);
  });
});
