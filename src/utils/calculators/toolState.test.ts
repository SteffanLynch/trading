import {describe, expect, it} from 'vitest';
import {buildQuery, defaultValues, readParams, resolveInitialValues, sanitizeValue, type FieldSpecs} from './toolState';

const specs: FieldSpecs<'balance' | 'risk' | 'pair' | 'currency'> = {
  balance: {default: '10000', pref: true},
  risk: {default: '1', pref: true},
  pair: {default: 'EURUSD', options: ['EURUSD', 'USDJPY']},
  currency: {default: 'USD', options: ['USD', 'GBP'], pref: true},
};

describe('sanitizeValue', () => {
  it('accepts numeric-looking text and rejects anything else', () => {
    expect(sanitizeValue({default: ''}, '1,250.5')).toBe('1,250.5');
    expect(sanitizeValue({default: ''}, '<script>alert(1)</script>')).toBeNull();
    expect(sanitizeValue({default: ''}, 'x'.repeat(30))).toBeNull();
  });

  it('only accepts listed options', () => {
    expect(sanitizeValue(specs.pair, 'USDJPY')).toBe('USDJPY');
    expect(sanitizeValue(specs.pair, 'EVIL')).toBeNull();
  });
});

describe('buildQuery / readParams', () => {
  it('omits fields that match their defaults', () => {
    expect(buildQuery(specs, defaultValues(specs))).toBe('');
    expect(buildQuery(specs, {...defaultValues(specs), risk: '2', pair: 'USDJPY'})).toBe('risk=2&pair=USDJPY');
  });

  it('strips thousands separators so links stay clean', () => {
    expect(buildQuery(specs, {...defaultValues(specs), balance: '25,000'})).toBe('balance=25000');
    expect(buildQuery(specs, {...defaultValues(specs), balance: '10,000'})).toBe('');
  });

  it('round-trips through the URL', () => {
    const values = {...defaultValues(specs), balance: '2500', currency: 'GBP'};
    expect(readParams(specs, `?${buildQuery(specs, values)}`)).toEqual({balance: '2500', currency: 'GBP'});
  });

  it('drops unknown keys and invalid values', () => {
    expect(readParams(specs, '?risk=2&pair=NOPE&utm_source=x&balance=%3Cb%3E')).toEqual({risk: '2'});
  });
});

describe('resolveInitialValues', () => {
  it('layers defaults < saved preferences < URL', () => {
    const {values, urlKeys} = resolveInitialValues(specs, {risk: '0.5', currency: 'GBP', pair: 'USDJPY'}, {currency: 'USD'});
    expect(values.risk).toBe('0.5'); // from prefs
    expect(values.currency).toBe('USD'); // URL beats prefs
    expect(values.pair).toBe('EURUSD'); // pair is not a remembered preference here
    expect(values.balance).toBe('10000'); // default
    expect(urlKeys).toEqual(['currency']);
  });

  it('ignores corrupt or empty saved preferences', () => {
    const {values} = resolveInitialValues(specs, {risk: '', currency: 'XXX'}, {});
    expect(values.risk).toBe('1');
    expect(values.currency).toBe('USD');
  });
});
