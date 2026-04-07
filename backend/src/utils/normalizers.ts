const CURRENCY_MAP: Record<string, string> = {
  INR: 'INR',
  RS: 'INR',
  RSINR: 'INR',
  INRR: 'INR',
  RUPEES: 'INR',
  RUPEE: 'INR',
  USD: 'USD',
  DOLLAR: 'USD',
  DOLLARS: 'USD',
  CAD: 'CAD',
  CANADIANDOLLAR: 'CAD',
  CANADIANDOLLARS: 'CAD',
  SGD: 'SGD',
  SINGAPOREDOLLAR: 'SGD',
  SINGAPOREDOLLARS: 'SGD',
  AUD: 'AUD',
  AUSTRALIANDOLLAR: 'AUD',
  AUSTRALIANDOLLARS: 'AUD',
  EUR: 'EUR',
  EURO: 'EUR',
  EUROS: 'EUR',
  GBP: 'GBP',
  POUND: 'GBP',
  POUNDS: 'GBP',
};

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== 'string') {
    return 0;
  }

  const cleaned = value
    .trim()
    .replace(/[, ]+/g, '')
    .replace(/[^\d.-]/g, '');

  if (!cleaned) {
    return 0;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeCurrency(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const cleaned = normalizeWhitespace(value).toUpperCase();

  if (cleaned.includes('₹')) {
    return 'INR';
  }

  if (/\bRS\.?\b/i.test(cleaned)) {
    return 'INR';
  }

  if (/S\$/i.test(cleaned) || /\bSGD\b/i.test(cleaned)) {
    return 'SGD';
  }

  if (/A\$/i.test(cleaned) || /\bAUD\b/i.test(cleaned)) {
    return 'AUD';
  }

  if (/C\$/i.test(cleaned) || /\bCAD\b/i.test(cleaned)) {
    return 'CAD';
  }

  if (cleaned.includes('$')) {
    return 'USD';
  }

  if (cleaned.includes('€')) {
    return 'EUR';
  }

  if (cleaned.includes('£')) {
    return 'GBP';
  }

  const compact = cleaned.replace(/[^A-Z]/g, '');
  return CURRENCY_MAP[compact] || compact || null;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function toIsoDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${pad(month)}-${pad(day)}`;
}

function normalizeTwoDigitYear(year: number): number {
  return year >= 70 ? 1900 + year : 2000 + year;
}

export function normalizeDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const input = normalizeWhitespace(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  let match = input.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    const rawYear = Number(match[3]);
    const year = match[3].length === 2 ? normalizeTwoDigitYear(rawYear) : rawYear;
    const monthFirst = toIsoDate(year, first, second);
    const dayFirst = toIsoDate(year, second, first);
    return dayFirst || monthFirst;
  }

  match = input.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (match) {
    return toIsoDate(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

export function normalizeInvoiceNumber(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const cleaned = normalizeWhitespace(value)
    .replace(/^invoice\s*(number|no|#)?\s*[:\-]?\s*/i, '')
    .replace(/^bill\s*(id|number|#)?\s*[:\-]?\s*/i, '')
    .replace(/^inv\s*#?\s*[:\-]?\s*/i, '')
    .trim();

  return cleaned || null;
}

export function normalizeText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const cleaned = normalizeWhitespace(value);
  return cleaned || null;
}