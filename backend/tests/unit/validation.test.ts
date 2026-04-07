import validationService from '../../src/services/validation.service';

describe('validationService', () => {
  describe('normalizeExtractedData', () => {
    it('normalizes invoice fields into the expected shapes', () => {
      const result = validationService.normalizeExtractedData({
        vendor_name: '  Acme Corp  ',
        invoice_number: ' INV-1001 ',
        invoice_date: '12/03/2026',
        currency: 'rs',
        total_amount: '1,250.50',
        tax_amount: '$50.00',
        line_items: [
          {
            description: ' Consulting ',
            quantity: '2',
            unit_price: '500.25',
            line_total: '1000.50',
          },
        ],
      });

      expect(result).toEqual({
        vendor_name: 'Acme Corp',
        invoice_number: 'INV-1001',
        invoice_date: '2026-03-12',
        currency: 'INR',
        total_amount: 1250.5,
        tax_amount: 50,
        line_items: [
          {
            description: 'Consulting',
            quantity: 2,
            unit_price: 500.25,
            line_total: 1000.5,
          },
        ],
      });
    });
  });

  describe('validate', () => {
    it('returns isValid true when invoice data is consistent', () => {
      const result = validationService.validate({
        vendor_name: 'Acme Corp',
        invoice_number: 'INV-1001',
        invoice_date: '2026-03-12',
        currency: 'USD',
        total_amount: 150,
        tax_amount: 10,
        line_items: [
          {
            description: 'Line 1',
            quantity: 1,
            unit_price: 50,
            line_total: 50,
          },
          {
            description: 'Line 2',
            quantity: 2,
            unit_price: 50,
            line_total: 100,
          },
        ],
      });

      expect(result.isValid).toBe(true);
      expect(result.validationErrors).toEqual([]);
      expect(result.confidenceScore).toBe(1);
    });

    it('detects missing required fields', () => {
      const result = validationService.validate({
        vendor_name: null,
        invoice_number: null,
        invoice_date: null,
        currency: null,
        total_amount: null,
        tax_amount: null,
        line_items: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'vendor_name', code: 'MISSING_FIELD' }),
          expect.objectContaining({ field: 'invoice_number', code: 'MISSING_FIELD' }),
          expect.objectContaining({ field: 'invoice_date', code: 'MISSING_FIELD' }),
          expect.objectContaining({ field: 'currency', code: 'MISSING_FIELD' }),
          expect.objectContaining({ field: 'total_amount', code: 'MISSING_FIELD' }),
          expect.objectContaining({ field: 'tax_amount', code: 'MISSING_FIELD' }),
          expect.objectContaining({ field: 'line_items', code: 'MISSING_FIELD' }),
        ])
      );
      expect(result.confidenceScore).toBeLessThan(1);
    });

    it('detects total mismatch when line items do not add up', () => {
      const result = validationService.validate({
        vendor_name: 'Acme Corp',
        invoice_number: 'INV-1002',
        invoice_date: '2026-03-12',
        currency: 'USD',
        total_amount: 500,
        tax_amount: 0,
        line_items: [
          {
            description: 'Service A',
            quantity: 1,
            unit_price: 100,
            line_total: 100,
          },
          {
            description: 'Service B',
            quantity: 1,
            unit_price: 150,
            line_total: 150,
          },
        ],
      });

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'total_amount', code: 'TOTAL_MISMATCH' }),
        ])
      );
    });

    it('flags invalid line items', () => {
      const result = validationService.validate({
        vendor_name: 'Acme Corp',
        invoice_number: 'INV-1003',
        invoice_date: '2026-03-12',
        currency: 'USD',
        total_amount: 100,
        tax_amount: 0,
        line_items: [
          {
            description: '',
            quantity: -1,
            unit_price: -20,
            line_total: -20,
          },
        ],
      });

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'line_items.0.description',
            code: 'MISSING_LINE_ITEM_DESCRIPTION',
          }),
          expect.objectContaining({
            field: 'line_items.0.quantity',
            code: 'INVALID_QUANTITY',
          }),
          expect.objectContaining({
            field: 'line_items.0.unit_price',
            code: 'INVALID_UNIT_PRICE',
          }),
          expect.objectContaining({
            field: 'line_items.0.line_total',
            code: 'INVALID_LINE_TOTAL',
          }),
        ])
      );
    });

    it('handles invalid dates as missing normalized dates', () => {
      const result = validationService.validate({
        vendor_name: 'Acme Corp',
        invoice_number: 'INV-1004',
        invoice_date: 'not-a-date',
        currency: 'USD',
        total_amount: 100,
        tax_amount: 0,
        line_items: [],
      });

      expect(result.isValid).toBe(false);
      expect(result.validationErrors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'invoice_date', code: 'MISSING_FIELD' }),
        ])
      );
    });
  });
});