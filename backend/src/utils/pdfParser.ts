import fs from 'fs/promises';
import pdfParse from 'pdf-parse';

export interface ParsedPdfResult {
  text: string;
  pageCount: number;
  info?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export async function parsePdf(filePath: string): Promise<ParsedPdfResult> {
  const buffer = await fs.readFile(filePath);
  const parsed = await pdfParse(buffer);

  return {
    text: parsed.text || '',
    pageCount: parsed.numpages || 0,
    info: parsed.info as Record<string, unknown> | undefined,
    metadata: parsed.metadata as Record<string, unknown> | undefined,
  };
}

export async function extractTextFromPdf(filePath: string): Promise<string> {
  const result = await parsePdf(filePath);
  return result.text.replace(/\u0000/g, ' ').trim();
}