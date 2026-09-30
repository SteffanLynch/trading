import {incomplete, invalid, isNum, ok, type Calc} from './result';

export interface EntryRow {
  price: number | null;
  quantity: number | null;
}

export interface AverageEntryOptions {
  /** Optional market price, to show the open profit or loss on the combined position. */
  currentPrice?: number | null;
  direction?: 'long' | 'short';
}

export interface AverageEntryValue {
  entries: {price: number; quantity: number; cost: number; sharePct: number}[];
  totalQuantity: number;
  totalCost: number;
  /** Quantity-weighted average price: the true average entry. */
  averagePrice: number;
  /** Plain mean of the prices, shown to explain why the weighted figure differs. */
  simpleAverage: number;
  lowestPrice: number;
  highestPrice: number;
  open: {currentPrice: number; pnl: number; pnlPct: number} | null;
}

/** Average price of several entries: total cost divided by total quantity. Empty rows are ignored. */
export function averageEntry(rows: EntryRow[], options: AverageEntryOptions = {}): Calc<AverageEntryValue> {
  const touched = rows.filter((row) => row.price !== null || row.quantity !== null);
  if (touched.length === 0) return incomplete();
  if (touched.some((row) => !isNum(row.price) || !isNum(row.quantity))) return incomplete();

  const complete = touched as {price: number; quantity: number}[];
  if (complete.some((row) => row.price <= 0 || row.quantity <= 0)) return invalid('Every price and quantity must be greater than zero.');

  const totalQuantity = complete.reduce((sum, row) => sum + row.quantity, 0);
  const totalCost = complete.reduce((sum, row) => sum + row.price * row.quantity, 0);
  if (!Number.isFinite(totalCost)) return invalid('These numbers are too large to calculate.');
  const averagePrice = totalCost / totalQuantity;
  const prices = complete.map((row) => row.price);

  let open: AverageEntryValue['open'] = null;
  if (isNum(options.currentPrice) && options.currentPrice > 0) {
    const sign = options.direction === 'short' ? -1 : 1;
    const pnl = (options.currentPrice - averagePrice) * totalQuantity * sign;
    open = {currentPrice: options.currentPrice, pnl, pnlPct: (pnl / totalCost) * 100};
  }

  return ok({
    entries: complete.map((row) => ({price: row.price, quantity: row.quantity, cost: row.price * row.quantity, sharePct: (row.quantity / totalQuantity) * 100})),
    totalQuantity,
    totalCost,
    averagePrice,
    simpleAverage: prices.reduce((sum, price) => sum + price, 0) / prices.length,
    lowestPrice: Math.min(...prices),
    highestPrice: Math.max(...prices),
    open,
  });
}
