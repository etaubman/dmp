/**
 * Generates mock sparkline and change data from a current value (for demo/placeholder until real time-series exists).
 * Seed can be used to vary the trend per metric (e.g. 0 = up, 1 = flat, 2 = down).
 */
export function mockSparklineFromValue(current: number, seed = 0): number[] {
  if (current <= 0) return [0, 0, 0, 0, 0];
  const spread = Math.max(1, Math.ceil(current * 0.25));
  const base = current - spread;
  // 5 points: slight trend so sparkline isn't flat
  const patterns: number[][] = [
    [base, base + spread * 0.4, base + spread * 0.7, base + spread * 0.9, current],
    [current, current, current, current * 0.98, current],
    [current, current * 0.92, current * 0.88, current * 0.95, current],
  ];
  const pattern = patterns[seed % 3];
  return pattern.map((v) => Math.round(Math.max(0, v)));
}

/**
 * Mock period-over-period change. Positive/negative/zero by seed.
 */
export function mockChangeFromValue(current: number, seed = 0): { change: number; changePercent: boolean } {
  if (current <= 0) return { change: 0, changePercent: false };
  const choices: { change: number; changePercent: boolean }[] = [
    { change: 1, changePercent: false },
    { change: 2, changePercent: false },
    { change: -1, changePercent: false },
    { change: 5, changePercent: true },
    { change: -3, changePercent: true },
    { change: 0, changePercent: false },
  ];
  return choices[seed % choices.length];
}
