export function showInfo(message: string): void {
  alert(message);
}

export function confirmAction(message: string): boolean {
  return confirm(message);
}
