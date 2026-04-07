export function createId(length = 9): string {
  return Math.random().toString(36).slice(2, 2 + length);
}
