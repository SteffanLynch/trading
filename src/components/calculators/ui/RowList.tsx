import clsx from 'clsx';
import {MAX_ROWS} from '../../../utils/calculators/rows';
import {parseNumber} from '../../../utils/calculators/format';
import styles from './ui.module.css';

export interface RowColumn {
  label: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
}

interface Props {
  columns: RowColumn[];
  rows: string[][];
  onChange: (rows: string[][]) => void;
  addLabel: string;
  /** What to call a row in screen-reader labels, e.g. "Entry". */
  rowName: string;
  minRows?: number;
}

/** An editable list of rows with an "add" button. Cells stay strings so an empty cell is "not filled in yet". */
export function RowList({columns, rows, onChange, addLabel, rowName, minRows = 1}: Props) {
  const template = `${columns.map(() => 'minmax(0, 1fr)').join(' ')} 2.2rem`;
  const setCell = (rowIndex: number, cellIndex: number, value: string) =>
    onChange(rows.map((row, r) => (r === rowIndex ? row.map((cell, c) => (c === cellIndex ? value : cell)) : row)));

  return (
    <div className={styles.rowList}>
      <div className={styles.rowHead} style={{gridTemplateColumns: template}} aria-hidden="true">
        {columns.map((column) => (
          <span key={column.label}>{column.label}</span>
        ))}
        <span />
      </div>
      {rows.map((row, rowIndex) => (
        <div className={styles.rowItem} style={{gridTemplateColumns: template}} key={rowIndex}>
          {columns.map((column, cellIndex) => {
            const value = row[cellIndex] ?? '';
            const bad = value.trim() !== '' && Number.isNaN(parseNumber(value));
            return (
              <div className={clsx(styles.control, bad && styles.invalid)} key={column.label}>
                {column.prefix && <span className={clsx(styles.affix, styles.prefix)} aria-hidden="true">{column.prefix}</span>}
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={value}
                  placeholder={column.placeholder}
                  aria-label={`${rowName} ${rowIndex + 1}: ${column.label}`}
                  aria-invalid={bad ? true : undefined}
                  onChange={(event) => setCell(rowIndex, cellIndex, event.target.value)}
                />
                {column.suffix && <span className={clsx(styles.affix, styles.suffix)} aria-hidden="true">{column.suffix}</span>}
              </div>
            );
          })}
          <button
            type="button"
            className={styles.rowRemove}
            aria-label={`Remove ${rowName.toLowerCase()} ${rowIndex + 1}`}
            disabled={rows.length <= minRows}
            onClick={() => onChange(rows.filter((_, r) => r !== rowIndex))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className={styles.addRow} disabled={rows.length >= MAX_ROWS} onClick={() => onChange([...rows, columns.map(() => '')])}>
        + {addLabel}
      </button>
    </div>
  );
}
