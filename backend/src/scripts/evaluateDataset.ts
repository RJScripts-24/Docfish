import fs from 'fs/promises';
import path from 'path';
import extractionService, { ExtractionOutput } from '../services/extraction.service';
import { normalizeCurrency, normalizeDate } from '../utils/normalizers';

interface GroundTruthLineItem {
  description?: string | null;
  quantity?: number | string | null;
  unit_price?: number | string | null;
  line_total?: number | string | null;
  qty?: number | string | null;
  unitPrice?: number | string | null;
  lineTotal?: number | string | null;
  total?: number | string | null;
  amount?: number | string | null;
}

interface GroundTruthDocument {
  vendor_name?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  currency?: string | null;
  total_amount?: number | string | null;
  tax_amount?: number | string | null;
  line_items?: GroundTruthLineItem[];
}

type GroundTruthMap = Record<string, GroundTruthDocument>;

type FieldName =
  | 'vendor_name'
  | 'invoice_number'
  | 'invoice_date'
  | 'currency'
  | 'total_amount'
  | 'tax_amount'
  | 'line_items';

interface FieldScore {
  evaluated: number;
  matched: number;
}

interface NormalizedLineItem {
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  line_total: number | null;
}

interface DocumentComparison {
  evaluatedFieldCount: number;
  matchedFieldCount: number;
  fullyMatched: boolean;
  fieldResults: Record<
    string,
    {
      expected: unknown;
      actual: unknown;
      matched: boolean;
    }
  >;
  lineItems?: {
    expectedCount: number;
    actualCount: number;
    matchedCount: number;
    pass: boolean;
  };
}

interface DocumentEvaluation {
  fileName: string;
  relativePath: string;
  extractionSucceeded: boolean;
  extractionMethod?: ExtractionOutput['extractionMethod'];
  processingTimeMs: number | null;
  confidenceScore: number | null;
  validationErrorCodes: string[];
  extractedData?: ExtractionOutput['extractedData'];
  comparison?: DocumentComparison;
  errorMessage?: string;
}

const DATASET_DIR = process.env.EVAL_DATASET_DIR || path.resolve(process.cwd(), 'evaluation', 'dataset');
const GROUND_TRUTH_PATH =
  process.env.EVAL_GROUND_TRUTH || path.resolve(process.cwd(), 'evaluation', 'ground-truth.json');
const OUTPUT_DIR = process.env.EVAL_OUTPUT_DIR || path.resolve(process.cwd(), 'evaluation', 'reports');
const AMOUNT_TOLERANCE = Number(process.env.EVAL_AMOUNT_TOLERANCE || '1');
const RECOMMENDED_MIN_DOCS = 15;
const RECOMMENDED_MAX_DOCS = 20;

const REQUIRED_FIELDS: FieldName[] = [
  'vendor_name',
  'invoice_number',
  'invoice_date',
  'currency',
  'total_amount',
  'tax_amount',
  'line_items',
];

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

const roundToTwo = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const hasValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
};

const normalizeText = (value: unknown): string | null => {
  if (!hasValue(value)) {
    return null;
  }

  return String(value).replace(/\s+/g, ' ').trim().toLowerCase();
};

const normalizeInvoice = (value: unknown): string | null => {
  if (!hasValue(value)) {
    return null;
  }

  return String(value)
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/^(INVOICE(?:NO|NUMBER|ID)?|BILL(?:NO|NUMBER|ID)?|INV#?)[:\-]?/, '')
    .replace(/[^A-Z0-9\-\/]/g, '');
};

const parseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value)
    .trim()
    .replace(/[, ]+/g, '')
    .replace(/[^\d.-]/g, '');

  if (!cleaned) {
    return null;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const approximatelyEqual = (a: number | null, b: number | null, tolerance: number) => {
  if (a === null && b === null) {
    return true;
  }

  if (a === null || b === null) {
    return false;
  }

  return Math.abs(a - b) <= tolerance;
};

const normalizeLineItem = (item: GroundTruthLineItem | any): NormalizedLineItem => {
  const quantity = parseNumber(item?.quantity ?? item?.qty);
  const unitPrice = parseNumber(item?.unit_price ?? item?.unitPrice);
  const lineTotalRaw = parseNumber(item?.line_total ?? item?.lineTotal ?? item?.total ?? item?.amount);

  const lineTotal =
    lineTotalRaw !== null
      ? lineTotalRaw
      : quantity !== null && unitPrice !== null
      ? roundToTwo(quantity * unitPrice)
      : null;

  return {
    description: normalizeText(item?.description),
    quantity,
    unit_price: unitPrice,
    line_total: lineTotal,
  };
};

const compareLineItems = (
  expectedItems: GroundTruthLineItem[] = [],
  actualItems: GroundTruthLineItem[] = []
) => {
  const normalizedExpected = expectedItems.map(normalizeLineItem);
  const normalizedActual = actualItems.map(normalizeLineItem);
  const usedActualIndexes = new Set<number>();

  const itemMatches = (expected: NormalizedLineItem, actual: NormalizedLineItem) => {
    if (expected.description !== null && expected.description !== actual.description) {
      return false;
    }

    if (!approximatelyEqual(expected.quantity, actual.quantity, 0.01)) {
      return false;
    }

    if (!approximatelyEqual(expected.unit_price, actual.unit_price, AMOUNT_TOLERANCE)) {
      return false;
    }

    if (!approximatelyEqual(expected.line_total, actual.line_total, AMOUNT_TOLERANCE)) {
      return false;
    }

    return true;
  };

  let matchedCount = 0;

  for (const expectedItem of normalizedExpected) {
    let matchedIndex = -1;

    for (let index = 0; index < normalizedActual.length; index += 1) {
      if (usedActualIndexes.has(index)) {
        continue;
      }

      if (itemMatches(expectedItem, normalizedActual[index])) {
        matchedIndex = index;
        break;
      }
    }

    if (matchedIndex !== -1) {
      usedActualIndexes.add(matchedIndex);
      matchedCount += 1;
    }
  }

  const pass =
    normalizedExpected.length === normalizedActual.length && matchedCount === normalizedExpected.length;

  return {
    expectedCount: normalizedExpected.length,
    actualCount: normalizedActual.length,
    matchedCount,
    pass,
  };
};

const compareScalarField = (field: FieldName, expected: unknown, actual: unknown) => {
  if (field === 'vendor_name') {
    return normalizeText(expected) === normalizeText(actual);
  }

  if (field === 'invoice_number') {
    return normalizeInvoice(expected) === normalizeInvoice(actual);
  }

  if (field === 'invoice_date') {
    const expectedDate = hasValue(expected) ? normalizeDate(String(expected)) : null;
    const actualDate = hasValue(actual) ? normalizeDate(String(actual)) : null;
    return expectedDate === actualDate;
  }

  if (field === 'currency') {
    const expectedCurrency = hasValue(expected) ? normalizeCurrency(String(expected)) : null;
    const actualCurrency = hasValue(actual) ? normalizeCurrency(String(actual)) : null;
    return expectedCurrency === actualCurrency;
  }

  if (field === 'total_amount' || field === 'tax_amount') {
    return approximatelyEqual(parseNumber(expected), parseNumber(actual), AMOUNT_TOLERANCE);
  }

  return normalizeText(expected) === normalizeText(actual);
};

const buildComparison = (
  expected: GroundTruthDocument,
  actual: ExtractionOutput['extractedData'],
  fieldScores: Record<FieldName, FieldScore>
): DocumentComparison => {
  const fieldResults: DocumentComparison['fieldResults'] = {};
  let evaluatedFieldCount = 0;
  let matchedFieldCount = 0;

  for (const field of REQUIRED_FIELDS) {
    if (!hasOwn(expected, field)) {
      continue;
    }

    if (field === 'line_items') {
      const lineItemsResult = compareLineItems(expected.line_items || [], actual.line_items || []);
      fieldScores.line_items.evaluated += 1;
      evaluatedFieldCount += 1;

      if (lineItemsResult.pass) {
        fieldScores.line_items.matched += 1;
        matchedFieldCount += 1;
      }

      fieldResults.line_items = {
        expected: expected.line_items || [],
        actual: actual.line_items || [],
        matched: lineItemsResult.pass,
      };

      continue;
    }

    const matched = compareScalarField(field, (expected as any)[field], (actual as any)[field]);

    fieldScores[field].evaluated += 1;
    evaluatedFieldCount += 1;

    if (matched) {
      fieldScores[field].matched += 1;
      matchedFieldCount += 1;
    }

    fieldResults[field] = {
      expected: (expected as any)[field],
      actual: (actual as any)[field],
      matched,
    };
  }

  const lineItems = hasOwn(expected, 'line_items')
    ? compareLineItems(expected.line_items || [], actual.line_items || [])
    : undefined;

  return {
    evaluatedFieldCount,
    matchedFieldCount,
    fullyMatched: evaluatedFieldCount > 0 && evaluatedFieldCount === matchedFieldCount,
    fieldResults,
    lineItems,
  };
};

const pathExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (_error) {
    return false;
  }
};

const listPdfFiles = async (dirPath: string): Promise<string[]> => {
  if (!(await pathExists(dirPath))) {
    return [];
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const nested = await listPdfFiles(absolutePath);
      files.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      files.push(absolutePath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
};

const loadGroundTruth = async (filePath: string): Promise<GroundTruthMap> => {
  if (!(await pathExists(filePath))) {
    return {};
  }

  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('ground-truth.json must be an object keyed by file name');
  }

  return parsed as GroundTruthMap;
};

const getGroundTruthForFile = (groundTruth: GroundTruthMap, absolutePath: string) => {
  const fileName = path.basename(absolutePath);
  const fileStem = path.parse(fileName).name;
  const relativePath = path.relative(DATASET_DIR, absolutePath).replace(/\\/g, '/');

  return groundTruth[fileName] || groundTruth[fileStem] || groundTruth[relativePath] || null;
};

const createMarkdownReport = (report: any) => {
  const lines: string[] = [];

  lines.push('# Docfish Dataset Evaluation Report');
  lines.push('');
  lines.push(`Generated at: ${report.generatedAt}`);
  lines.push(`Dataset path: ${report.datasetPath}`);
  lines.push(`Ground truth path: ${report.groundTruthPath}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total PDFs: ${report.summary.totalDocuments}`);
  lines.push(`- Extraction succeeded: ${report.summary.processedDocuments}`);
  lines.push(`- Extraction failed: ${report.summary.failedDocuments}`);
  lines.push(`- Extraction success rate: ${report.summary.extractionSuccessRate}%`);
  lines.push(`- Avg processing time: ${report.summary.avgProcessingTimeMs} ms`);
  lines.push(`- Documents with ground truth: ${report.summary.documentsWithGroundTruth}`);
  lines.push(`- Fully matched documents (ground truth): ${report.summary.fullyMatchedDocuments}`);
  lines.push(
    `- Recommended benchmark range met (${RECOMMENDED_MIN_DOCS}-${RECOMMENDED_MAX_DOCS}): ${
      report.summary.meetsRecommendedBenchmarkRange ? 'yes' : 'no'
    }`
  );
  lines.push('');

  lines.push('## Extraction Path Usage');
  lines.push('');
  lines.push('| Extraction Method | Documents |');
  lines.push('| --- | ---: |');

  for (const [method, count] of Object.entries(report.extractionPathUsage as Record<string, number>)) {
    lines.push(`| ${method} | ${count} |`);
  }

  lines.push('');

  lines.push('## Field Accuracy (Ground Truth)');
  lines.push('');
  lines.push('| Field | Evaluated | Matched | Accuracy |');
  lines.push('| --- | ---: | ---: | ---: |');

  for (const [field, score] of Object.entries(
    report.fieldAccuracy as Record<string, { evaluated: number; matched: number; accuracy: number | null }>
  )) {
    lines.push(
      `| ${field} | ${score.evaluated} | ${score.matched} | ${score.accuracy}% |`
    );
  }

  lines.push('');
  lines.push('## Field Coverage (Extracted Values Present)');
  lines.push('');
  lines.push('| Field | Populated | Coverage |');
  lines.push('| --- | ---: | ---: |');

  for (const [field, coverage] of Object.entries(
    report.fieldCoverage as Record<string, { populated: number; coverage: number }>
  )) {
    lines.push(`| ${field} | ${coverage.populated} | ${coverage.coverage}% |`);
  }

  lines.push('');
  lines.push('## Validation Error Frequency');
  lines.push('');

  if (Object.keys(report.validationErrorFrequency).length === 0) {
    lines.push('- No validation errors were produced.');
  } else {
    lines.push('| Validation Code | Count |');
    lines.push('| --- | ---: |');
    for (const [code, count] of Object.entries(report.validationErrorFrequency)) {
      lines.push(`| ${code} | ${count} |`);
    }
  }

  lines.push('');
  lines.push('## Per-document Results');
  lines.push('');
  lines.push('| File | Extraction | Method | Confidence | Validation Errors | Fully Matched |');
  lines.push('| --- | --- | --- | ---: | ---: | --- |');

  for (const documentResult of report.documents) {
    const fullyMatched =
      documentResult.comparison && documentResult.comparison.evaluatedFieldCount > 0
        ? documentResult.comparison.fullyMatched
          ? 'yes'
          : 'no'
        : 'n/a';

    lines.push(
      `| ${documentResult.relativePath} | ${
        documentResult.extractionSucceeded ? 'ok' : 'failed'
      } | ${documentResult.extractionMethod || 'n/a'} | ${documentResult.confidenceScore ?? 'n/a'} | ${
        documentResult.validationErrorCodes.length
      } | ${fullyMatched} |`
    );
  }

  lines.push('');
  return lines.join('\n');
};

async function main() {
  await runDatasetEvaluation();
}

export async function runDatasetEvaluation() {
  if (process.env.EVAL_DISABLE_LLM === 'true') {
    delete process.env.GROQ_API_KEY;
  }

  const pdfFiles = await listPdfFiles(DATASET_DIR);

  if (pdfFiles.length === 0) {
    throw new Error(
      `No PDF files found in dataset directory: ${DATASET_DIR}. Add 15-20 invoices and run again.`
    );
  }

  const groundTruth = await loadGroundTruth(GROUND_TRUTH_PATH);

  const fieldScores: Record<FieldName, FieldScore> = {
    vendor_name: { evaluated: 0, matched: 0 },
    invoice_number: { evaluated: 0, matched: 0 },
    invoice_date: { evaluated: 0, matched: 0 },
    currency: { evaluated: 0, matched: 0 },
    total_amount: { evaluated: 0, matched: 0 },
    tax_amount: { evaluated: 0, matched: 0 },
    line_items: { evaluated: 0, matched: 0 },
  };

  const fieldCoverage: Record<FieldName, { populated: number }> = {
    vendor_name: { populated: 0 },
    invoice_number: { populated: 0 },
    invoice_date: { populated: 0 },
    currency: { populated: 0 },
    total_amount: { populated: 0 },
    tax_amount: { populated: 0 },
    line_items: { populated: 0 },
  };

  const validationErrorFrequency: Record<string, number> = {};
  const extractionPathUsage: Record<string, number> = {
    llm: 0,
    heuristic: 0,
    ocr_heuristic: 0,
    manual: 0,
  };
  const documents: DocumentEvaluation[] = [];

  let processingTimeTotal = 0;
  let processedDocuments = 0;
  let failedDocuments = 0;
  let documentsWithGroundTruth = 0;
  let fullyMatchedDocuments = 0;

  for (const filePath of pdfFiles) {
    const relativePath = path.relative(DATASET_DIR, filePath).replace(/\\/g, '/');
    const fileName = path.basename(filePath);

    try {
      const extraction = await extractionService.extractFromPdf(filePath);
      const extractionMethod = extraction.extractionMethod || 'heuristic';

      extractionPathUsage[extractionMethod] = (extractionPathUsage[extractionMethod] || 0) + 1;

      processedDocuments += 1;
      processingTimeTotal += extraction.processingTimeMs;

      for (const field of REQUIRED_FIELDS) {
        const value = (extraction.extractedData as any)[field];

        if (field === 'line_items') {
          if (Array.isArray(value) && value.length > 0) {
            fieldCoverage.line_items.populated += 1;
          }
          continue;
        }

        if (hasValue(value)) {
          fieldCoverage[field].populated += 1;
        }
      }

      for (const issue of extraction.validation.validationErrors) {
        validationErrorFrequency[issue.code] = (validationErrorFrequency[issue.code] || 0) + 1;
      }

      const expected = getGroundTruthForFile(groundTruth, filePath);
      let comparison: DocumentComparison | undefined;

      if (expected) {
        documentsWithGroundTruth += 1;
        comparison = buildComparison(expected, extraction.extractedData, fieldScores);

        if (comparison.fullyMatched) {
          fullyMatchedDocuments += 1;
        }
      }

      documents.push({
        fileName,
        relativePath,
        extractionSucceeded: true,
        extractionMethod,
        processingTimeMs: extraction.processingTimeMs,
        confidenceScore: extraction.validation.confidenceScore,
        validationErrorCodes: extraction.validation.validationErrors.map((item) => item.code),
        extractedData: extraction.extractedData,
        comparison,
      });
    } catch (error) {
      failedDocuments += 1;

      documents.push({
        fileName,
        relativePath,
        extractionSucceeded: false,
        extractionMethod: undefined,
        processingTimeMs: null,
        confidenceScore: null,
        validationErrorCodes: [],
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    console.log(`[eval] ${relativePath} processed`);
  }

  const totalDocuments = pdfFiles.length;
  const extractionSuccessRate =
    totalDocuments > 0 ? Number(((processedDocuments / totalDocuments) * 100).toFixed(1)) : 0;
  const avgProcessingTimeMs =
    processedDocuments > 0 ? Math.round(processingTimeTotal / processedDocuments) : 0;
  const meetsRecommendedBenchmarkRange =
    totalDocuments >= RECOMMENDED_MIN_DOCS && totalDocuments <= RECOMMENDED_MAX_DOCS;

  const fieldAccuracy = Object.fromEntries(
    REQUIRED_FIELDS.map((field) => {
      const evaluated = fieldScores[field].evaluated;
      const matched = fieldScores[field].matched;
      const accuracy = evaluated > 0 ? Number(((matched / evaluated) * 100).toFixed(1)) : null;
      return [field, { evaluated, matched, accuracy }];
    })
  );

  const fieldCoverageSummary = Object.fromEntries(
    REQUIRED_FIELDS.map((field) => {
      const populated = fieldCoverage[field].populated;
      const coverage =
        processedDocuments > 0 ? Number(((populated / processedDocuments) * 100).toFixed(1)) : 0;
      return [field, { populated, coverage }];
    })
  );

  const report = {
    generatedAt: new Date().toISOString(),
    datasetPath: DATASET_DIR,
    groundTruthPath: GROUND_TRUTH_PATH,
    amountTolerance: AMOUNT_TOLERANCE,
    llmDisabled: process.env.EVAL_DISABLE_LLM === 'true',
    summary: {
      totalDocuments,
      processedDocuments,
      failedDocuments,
      extractionSuccessRate,
      avgProcessingTimeMs,
      documentsWithGroundTruth,
      fullyMatchedDocuments,
      meetsRecommendedBenchmarkRange,
    },
    extractionPathUsage,
    fieldAccuracy,
    fieldCoverage: fieldCoverageSummary,
    validationErrorFrequency,
    documents,
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonReportPath = path.join(OUTPUT_DIR, `evaluation-${stamp}.json`);
  const markdownReportPath = path.join(OUTPUT_DIR, `evaluation-${stamp}.md`);

  await fs.writeFile(jsonReportPath, JSON.stringify(report, null, 2), 'utf-8');
  await fs.writeFile(markdownReportPath, createMarkdownReport(report), 'utf-8');

  console.log('');
  console.log('[eval] Dataset evaluation completed');
  console.log(`[eval] JSON report: ${jsonReportPath}`);
  console.log(`[eval] Markdown report: ${markdownReportPath}`);
  console.log(
    `[eval] Success rate: ${extractionSuccessRate}% (${processedDocuments}/${totalDocuments})`
  );
  console.log(`[eval] Avg processing time: ${avgProcessingTimeMs} ms`);
  console.log(`[eval] Extraction paths: ${JSON.stringify(extractionPathUsage)}`);

  return {
    report,
    jsonReportPath,
    markdownReportPath,
  };
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[eval] Dataset evaluation failed');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
