/** Nice round tick values between min and max. */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (max <= min) return [min];
  const rawStep = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const step = ([1, 2, 2.5, 5, 10].find((candidate) => candidate >= residual - 1e-9) ?? 10) * magnitude;
  const first = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let value = first; value <= max + step * 1e-9; value += step) ticks.push(Number(value.toPrecision(12)));
  return ticks;
}
