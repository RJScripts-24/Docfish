import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

export interface ParsedPdfResult {
  text: string;
  pageCount: number;
  info?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

const renderPage = async (pageData: any) => {
  const textContent = await pageData.getTextContent({ normalizeWhitespace: true });
  const items = (textContent.items || []) as Array<{
    str: string;
    transform: number[];
    width?: number;
  }>;

  if (!items.length) {
    return '';
  }

  const rows = new Map<number, Array<{ x: number; str: string }>>();

  for (const item of items) {
    const raw = (item.str || '').trim();

    if (!raw) {
      continue;
    }

    const x = Number(item.transform?.[4] || 0);
    const y = Number(item.transform?.[5] || 0);
    const rowKey = Math.round(y / 2) * 2;
    const row = rows.get(rowKey) || [];

    row.push({ x, str: raw });
    rows.set(rowKey, row);
  }

  const sortedRows = [...rows.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, row]) => row.sort((a, b) => a.x - b.x).map((cell) => cell.str).join(' '));

  return sortedRows.join('\n');
};

const normalizeParsedText = (text: string) =>
  text
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export async function parsePdf(filePath: string): Promise<ParsedPdfResult> {
  const buffer = await fs.readFile(filePath);
  const parsed = await pdfParse(buffer, {
    pagerender: renderPage,
  } as any);

  return {
    text: normalizeParsedText(parsed.text || ''),
    pageCount: parsed.numpages || 0,
    info: parsed.info as Record<string, unknown> | undefined,
    metadata: parsed.metadata as Record<string, unknown> | undefined,
  };
}

export async function extractTextFromPdf(filePath: string): Promise<string> {
  const result = await parsePdf(filePath);
  return result.text.replace(/\u0000/g, ' ').trim();
}