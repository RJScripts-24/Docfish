import { normalizeCurrency, normalizeDate, normalizeNumber } from '../utils/normalizers';

export interface LineItem {
  description: string;
  quantity: number | null;
  unit_price: number | null;
  line_total: number | null;
}

export interface ExtractedInvoiceData {
  vendor_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  currency: string | null;
  total_amount: number | null;
  tax_amount: number | null;
  line_items: LineItem[];
}

export interface ValidationErrorItem {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  normalizedData: ExtractedInvoiceData;
  confidenceScore: number;
  validationErrors: ValidationErrorItem[];
  isValid: boolean;
}

class ValidationService {
  private readonly requiredFields: Array<keyof ExtractedInvoiceData> = [
    'vendor_name',
    'invoice_number',
    'invoice_date',
    'currency',
    'total_amount',
  ];

  private roundToTwo(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  private approximatelyEqual(a: number, b: number, tolerance = 1) {
    return Math.abs(a - b) <= tolerance;
  }

  private normalizeLineItems(items: any[] = []): LineItem[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => ({
      description: String(item?.description || '').trim(),
      quantity:
        item?.quantity === undefined || item?.quantity === null || item?.quantity === ''
          ? null
          : normalizeNumber(item.quantity),
      unit_price:
        item?.unit_price === undefined || item?.unit_price === null || item?.unit_price === ''
          ? null
          : normalizeNumber(item.unit_price),
      line_total:
        item?.line_total === undefined || item?.line_total === null || item?.line_total === ''
          ? null
          : normalizeNumber(item.line_total),
    }));
  }

  normalizeExtractedData(data: Partial<ExtractedInvoiceData>): ExtractedInvoiceData {
    return {
      vendor_name: data.vendor_name ? String(data.vendor_name).trim() : null,
      invoice_number: data.invoice_number ? String(data.invoice_number).trim() : null,
      invoice_date: data.invoice_date ? normalizeDate(String(data.invoice_date)) : null,
      currency: data.currency ? normalizeCurrency(String(data.currency)) : null,
      total_amount:
        data.total_amount === undefined || data.total_amount === null || data.total_amount === ''
          ? null
          : this.roundToTwo(normalizeNumber(data.total_amount)),
      tax_amount:
        data.tax_amount === undefined || data.tax_amount === null || data.tax_amount === ''
          ? null
          : this.roundToTwo(normalizeNumber(data.tax_amount)),
      line_items: this.normalizeLineItems(data.line_items as any[]),
    };
  }

  validate(data: Partial<ExtractedInvoiceData>): ValidationResult {
    const normalizedData = this.normalizeExtractedData(data);
    const validationErrors: ValidationErrorItem[] = [];

    for (const field of this.requiredFields) {
      const value = normalizedData[field];

      if (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        validationErrors.push({
          field,
          message: `${field} is missing`,
          code: 'MISSING_FIELD',
        });
      }
    }

    if (normalizedData.invoice_date && Number.isNaN(Date.parse(normalizedData.invoice_date))) {
      validationErrors.push({
        field: 'invoice_date',
        message: 'invoice_date is invalid',
        code: 'INVALID_DATE',
      });
    }

    if (normalizedData.line_items.length > 0) {
      normalizedData.line_items.forEach((item, index) => {
        if (!item.description) {
          validationErrors.push({
            field: `line_items.${index}.description`,
            message: 'Line item description is missing',
            code: 'MISSING_LINE_ITEM_DESCRIPTION',
          });
        }

        if (item.quantity !== null && item.quantity < 0) {
          validationErrors.push({
            field: `line_items.${index}.quantity`,
            message: 'Line item quantity cannot be negative',
            code: 'INVALID_QUANTITY',
          });
        }

        if (item.unit_price !== null && item.unit_price < 0) {
          validationErrors.push({
            field: `line_items.${index}.unit_price`,
            message: 'Line item unit price cannot be negative',
            code: 'INVALID_UNIT_PRICE',
          });
        }

        if (item.line_total !== null && item.line_total < 0) {
          validationErrors.push({
            field: `line_items.${index}.line_total`,
            message: 'Line item total cannot be negative',
            code: 'INVALID_LINE_TOTAL',
          });
        }
      });
    }

    const summedLineItems = this.roundToTwo(
      normalizedData.line_items.reduce((sum, item) => sum + (item.line_total || 0), 0)
    );

    if (
      normalizedData.total_amount !== null &&
      normalizedData.line_items.length > 0 &&
      !this.approximatelyEqual(summedLineItems, normalizedData.total_amount)
    ) {
      validationErrors.push({
        field: 'total_amount',
        message: `Sum of line items (${summedLineItems}) does not match total_amount (${normalizedData.total_amount})`,
        code: 'TOTAL_MISMATCH',
      });
    }

    const missingFieldCount = validationErrors.filter(
      (error) => error.code === 'MISSING_FIELD'
    ).length;
    const mismatchCount = validationErrors.length - missingFieldCount;
    const rawScore = 1 - missingFieldCount * 0.12 - mismatchCount * 0.08;
    const confidenceScore = Math.max(0, Math.min(1, Number(rawScore.toFixed(2))));

    return {
      normalizedData,
      confidenceScore,
      validationErrors,
      isValid: validationErrors.length === 0,
    };
  }
}

export default new ValidationService();