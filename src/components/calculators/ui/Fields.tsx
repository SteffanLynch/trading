import {useId, type ReactNode} from 'react';
import clsx from 'clsx';
import {formatNumber, groupDigits, parseNumber} from '../../../utils/calculators/format';
import styles from './ui.module.css';

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: ReactNode;
  placeholder?: string;
  /** Add thousands separators when the field loses focus (10000 -> 10,000). */
  group?: boolean;
  /** A validation message from the calculator, shown in place of the format check. */
  error?: string | null;
  disabled?: boolean;
}

/** A text box for numbers. Stays a string so an empty box is "not filled in yet", never 0. */
export function NumberField({label, value, onChange, prefix, suffix, hint, placeholder, group = false, error, disabled}: NumberFieldProps) {
  const id = useId();
  const parsed = parseNumber(value);
  const badFormat = value.trim() !== '' && Number.isNaN(parsed);
  const message = error ?? (badFormat ? 'Enter a number, like 1250 or 1.25' : null);
  const describedBy = [hint ? `${id}-hint` : null, message ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={clsx(styles.field, message && styles.invalid)}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control}>
        {prefix && (
          <span className={clsx(styles.affix, styles.prefix)} aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={message ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            if (!group) return;
            const grouped = groupDigits(value);
            if (grouped !== value) onChange(grouped);
          }}
        />
        {suffix && (
          <span className={clsx(styles.affix, styles.suffix)} aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {hint && (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {message && (
        <p className={styles.error} id={`${id}-error`}>
          {message}
        </p>
      )}
    </div>
  );
}

export interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: Option[];
  groups?: {label: string; options: Option[]}[];
  hint?: ReactNode;
}

export function SelectField({label, value, onChange, options, groups, hint}: SelectFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control}>
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined}>
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {groups?.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      {hint && (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}

interface SegmentedProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  hint?: ReactNode;
}

export function Segmented({label, value, onChange, options, hint}: SegmentedProps) {
  const name = useId();
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.segmented}>
        {options.map((option) => (
          <label key={option.value}>
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </fieldset>
  );
}

interface SliderFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  hint?: ReactNode;
}

/** A slider paired with an exact-entry box. The box may hold values beyond the slider's range. */
export function SliderField({label, value, onChange, min, max, step, suffix = '%', hint}: SliderFieldProps) {
  const id = useId();
  const parsed = parseNumber(value);
  const current = parsed !== null && Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : min;
  // Decimals actually present in the step (0.25 -> 2). Deriving from log10 would round 0.25 to one place.
  const decimals = (String(step).split('.')[1] ?? '').length;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={`${id}-number`}>
        {label}
      </label>
      <div className={styles.sliderRow}>
        <input
          className={styles.range}
          type="range"
          aria-label={`${label} slider`}
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(event) => onChange(String(Number(Number(event.target.value).toFixed(decimals))))}
        />
        <div className={clsx(styles.control, Number.isNaN(parsed) && styles.invalid)}>
          <input
            id={`${id}-number`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={value}
            aria-invalid={Number.isNaN(parsed) ? true : undefined}
            onChange={(event) => onChange(event.target.value)}
          />
          <span className={clsx(styles.affix, styles.suffix)} aria-hidden="true">
            {suffix}
          </span>
        </div>
      </div>
      <div className={styles.rangeScale} aria-hidden="true">
        <span>
          {formatNumber(min, decimals)}
          {suffix}
        </span>
        <span>
          {formatNumber(max, decimals)}
          {suffix}
        </span>
      </div>
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}

interface DisclosureProps {
  title?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** "Advanced options" — keeps beginners' first view to the few inputs that matter. */
export function Disclosure({title = 'Advanced options', children, defaultOpen = false}: DisclosureProps) {
  return (
    <details className={styles.advanced} open={defaultOpen || undefined}>
      <summary>{title}</summary>
      <div className={styles.advancedBody}>{children}</div>
    </details>
  );
}

export function FieldRow({children}: {children: ReactNode}) {
  return <div className={styles.fieldRow}>{children}</div>;
}
