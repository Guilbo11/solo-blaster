export function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollRange(min: number, max: number): number {
  const span = max - min + 1;
  return min + Math.floor(Math.random() * span);
}
