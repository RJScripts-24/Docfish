export function showInfo(message: string): void {
  if (typeof window === 'undefined' || typeof window.alert !== 'function') {
    console.info(message);
    return;
  }

  window.alert(message);
}

export function confirmAction(message: string, fallback = false): boolean {
  if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
    return fallback;
  }

  return window.confirm(message);
}
