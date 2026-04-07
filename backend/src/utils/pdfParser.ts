import fs from 'fs/promises';
import zlib from 'zlib';
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

const decodeAscii85 = (input: string): Buffer => {
  const cleaned = input
    .replace(/\s+/g, '')
    .replace(/^<~/, '')
    .replace(/~>$/, '');

  const output: number[] = [];
  let group: number[] = [];

  for (const character of cleaned) {
    if (character === 'z' && group.length === 0) {
      output.push(0, 0, 0, 0);
      continue;
    }

    const code = character.charCodeAt(0);

    if (code < 33 || code > 117) {
      continue;
    }

    group.push(code - 33);

    if (group.length === 5) {
      let value = 0;
      for (const part of group) {
        value = value * 85 + part;
      }

      output.push((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255);
      group = [];
    }
  }

  if (group.length > 0) {
    const sourceLength = group.length;

    while (group.length < 5) {
      group.push(84);
    }

    let value = 0;
    for (const part of group) {
      value = value * 85 + part;
    }

    const bytes = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
    output.push(...bytes.slice(0, sourceLength - 1));
  }

  return Buffer.from(output);
};

const parseFilterChain = (dictionary: string): string[] => {
  const filterMatch = dictionary.match(/\/Filter\s*(\[[^\]]+\]|\/\w+)/);

  if (!filterMatch) {
    return [];
  }

  const rawFilter = filterMatch[1];
  const filters: string[] = [];
  const pattern = /\/(\w+)/g;
  let match = pattern.exec(rawFilter);

  while (match) {
    filters.push(match[1]);
    match = pattern.exec(rawFilter);
  }

  return filters;
};

const decodePdfLiteralString = (value: string): string => {
  let output = '';

  for (let index = 0; index < value.length; index += 1) {
    const current = value[index];

    if (current !== '\\') {
      output += current;
      continue;
    }

    const next = value[index + 1];

    if (!next) {
      break;
    }

    if (next === 'n') {
      output += '\n';
      index += 1;
      continue;
    }

    if (next === 'r') {
      output += '\r';
      index += 1;
      continue;
    }

    if (next === 't') {
      output += '\t';
      index += 1;
      continue;
    }

    if (next === 'b') {
      output += '\b';
      index += 1;
      continue;
    }

    if (next === 'f') {
      output += '\f';
      index += 1;
      continue;
    }

    if (next === '(' || next === ')' || next === '\\') {
      output += next;
      index += 1;
      continue;
    }

    if (next === '\n' || next === '\r') {
      index += 1;

      if (next === '\r' && value[index + 1] === '\n') {
        index += 1;
      }

      continue;
    }

    if (/[0-7]/.test(next)) {
      let octal = next;
      let cursor = index + 2;

      while (cursor < value.length && octal.length < 3 && /[0-7]/.test(value[cursor])) {
        octal += value[cursor];
        cursor += 1;
      }

      output += String.fromCharCode(parseInt(octal, 8));
      index = cursor - 1;
      continue;
    }

    output += next;
    index += 1;
  }

  return output;
};

const extractLiteralTextTokens = (content: string): string[] => {
  const tokens: string[] = [];

  const textOperators = [
    /\(((?:\\.|[^\\)])*)\)\s*Tj/g,
    /\[((?:[^\[\]]|\\\[|\\\])*)\]\s*TJ/g,
  ];

  for (const pattern of textOperators) {
    let match = pattern.exec(content);

    while (match) {
      if (pattern.source.endsWith('TJ')) {
        const inner = match[1];
        const innerPattern = /\(((?:\\.|[^\\)])*)\)/g;
        let innerMatch = innerPattern.exec(inner);

        while (innerMatch) {
          const decodedInner = decodePdfLiteralString(innerMatch[1]).trim();
          if (decodedInner) {
            tokens.push(decodedInner);
          }

          innerMatch = innerPattern.exec(inner);
        }
      } else {
        const decoded = decodePdfLiteralString(match[1]).trim();
        if (decoded) {
          tokens.push(decoded);
        }
      }

      match = pattern.exec(content);
    }
  }

  if (tokens.length > 0) {
    return tokens;
  }

  const fallbackPattern = /\(((?:\\.|[^\\)])*)\)/g;
  let fallbackMatch = fallbackPattern.exec(content);

  while (fallbackMatch) {
    const decoded = decodePdfLiteralString(fallbackMatch[1]).trim();
    if (decoded) {
      tokens.push(decoded);
    }

    fallbackMatch = fallbackPattern.exec(content);
  }

  return tokens;
};

const decodeStreamContent = (streamData: string, filters: string[]) => {
  let current: Buffer = Buffer.from(streamData, 'latin1');

  for (const filter of filters) {
    if (filter === 'ASCII85Decode') {
      current = decodeAscii85(current.toString('latin1')) as Buffer;
      continue;
    }

    if (filter === 'FlateDecode') {
      try {
        current = zlib.inflateSync(current);
      } catch (_error) {
        current = zlib.inflateRawSync(current);
      }
    }
  }

  return current.toString('latin1');
};

const parsePdfByStreamDecoding = (buffer: Buffer): ParsedPdfResult => {
  const source = buffer.toString('latin1');
  const streamPattern = /<<([\s\S]*?)>>\s*stream\r?\n([\s\S]*?)endstream/g;
  const tokens: string[] = [];
  let streamMatch = streamPattern.exec(source);

  while (streamMatch) {
    const dictionary = streamMatch[1] || '';
    const streamData = streamMatch[2] || '';

    try {
      const filters = parseFilterChain(dictionary);
      const decoded = decodeStreamContent(streamData, filters);
      const decodedTokens = extractLiteralTextTokens(decoded);

      if (decodedTokens.length > 0) {
        tokens.push(...decodedTokens);
      }
    } catch (_error) {
      // Ignore individual stream decode failures and continue with other streams.
    }

    streamMatch = streamPattern.exec(source);
  }

  const text = normalizeParsedText(tokens.join('\n'));

  if (!text) {
    throw new Error('Unable to recover text from PDF content streams');
  }

  const pageCountMatch = source.match(/\/Count\s+(\d+)/);
  const pageCount = pageCountMatch ? Number(pageCountMatch[1]) : 0;

  return {
    text,
    pageCount: Number.isFinite(pageCount) ? pageCount : 0,
    info: {
      parser: 'content-stream-fallback',
    },
  };
};

export async function parsePdf(filePath: string): Promise<ParsedPdfResult> {
  const buffer = await fs.readFile(filePath);

  try {
    const parsed = await pdfParse(buffer, {
      pagerender: renderPage,
    } as any);

    const normalizedText = normalizeParsedText(parsed.text || '');

    if (normalizedText) {
      return {
        text: normalizedText,
        pageCount: parsed.numpages || 0,
        info: parsed.info as Record<string, unknown> | undefined,
        metadata: parsed.metadata as Record<string, unknown> | undefined,
      };
    }

    return parsePdfByStreamDecoding(buffer);
  } catch (_primaryError) {
    return parsePdfByStreamDecoding(buffer);
  }
}

export async function extractTextFromPdf(filePath: string): Promise<string> {
  const result = await parsePdf(filePath);
  return result.text.replace(/\u0000/g, ' ').trim();
}