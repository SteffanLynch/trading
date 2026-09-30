/**
 * Rows for "add another" tools, stored in one string so they survive a shared link:
 * "10:100,12:200" is two rows of two cells. Cells never contain commas or colons.
 */

export const MAX_ROWS = 20;

const cleanCell = (cell: string) => cell.replace(/[,:\s]/g, '');

export function encodeRows(rows: string[][]): string {
  return rows.map((row) => row.map(cleanCell).join(':')).join(',');
}

/** Turns a stored string back into rows with exactly `columns` cells each. An empty string is one blank row. */
export function decodeRows(text: string, columns: number): string[][] {
  const parts = text === '' ? [''] : text.split(',');
  return parts.slice(0, MAX_ROWS).map((part) => {
    const cells = part.split(':').slice(0, columns);
    while (cells.length < columns) cells.push('');
    return cells;
  });
}
