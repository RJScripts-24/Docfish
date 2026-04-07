# Example Invoice Extraction Outputs

This document contains real examples of processed invoices showing the complete extracted structured data from Docfish.

---

## Example 1: Atlas Transport Ltd

**Summary:**
- Vendor: Atlas Transport Ltd
- Invoice Number: DOC-23184
- Invoice Date: 2025-03-09
- Currency: EUR
- Total Amount: 1505.12
- Confidence Score: 88%
- Processing Time: 1829ms
- Extraction Method: LLM

**Full JSON Output:**

```json
{
  "extractedData": {
    "vendor_name": "Atlas Transport Ltd",
    "invoice_number": "DOC-23184",
    "invoice_date": "2025-03-09",
    "currency": "EUR",
    "total_amount": 1505.12,
    "tax_amount": null,
    "line_items": [
      {
        "description": "Last Mile Delivery",
        "quantity": 2,
        "unit_price": 202.36,
        "line_total": 404.72
      },
      {
        "description": "Fuel Surcharge",
        "quantity": 1,
        "unit_price": 446.83,
        "line_total": 446.83
      },
      {
        "description": "Fuel Surcharge",
        "quantity": 1,
        "unit_price": 145.81,
        "line_total": 145.81
      },
      {
        "description": "Custom Clearance",
        "quantity": 2,
        "unit_price": 253.88,
        "line_total": 507.76
      }
    ]
  },
  "validation": {
    "normalizedData": {
      "vendor_name": "Atlas Transport Ltd",
      "invoice_number": "DOC-23184",
      "invoice_date": "2025-03-09",
      "currency": "EUR",
      "total_amount": 1505.12,
      "tax_amount": null,
      "line_items": [
        {
          "description": "Last Mile Delivery",
          "quantity": 2,
          "unit_price": 202.36,
          "line_total": 404.72
        },
        {
          "description": "Fuel Surcharge",
          "quantity": 1,
          "unit_price": 446.83,
          "line_total": 446.83
        },
        {
          "description": "Fuel Surcharge",
          "quantity": 1,
          "unit_price": 145.81,
          "line_total": 145.81
        },
        {
          "description": "Custom Clearance",
          "quantity": 2,
          "unit_price": 253.88,
          "line_total": 507.76
        }
      ]
    },
    "confidenceScore": 0.88,
    "validationErrors": [
      {
        "field": "tax_amount",
        "message": "tax_amount is missing",
        "code": "MISSING_FIELD"
      }
    ],
    "isValid": false,
    "extractionMethod": "llm"
  },
  "rawText": "Atlas Transport Ltd\nInv #:\nDOC-23184\nInvoice Date:\n09/03/2025\nDescription\nQty\nUnit Price\nAmount\nLast Mile Delivery\n2\nEUR 202.36\nEUR 404.72\nFuel Surcharge\n1\nEUR 446.83\nEUR 446.83\nFuel Surcharge\n1\nEUR 145.81\nEUR 145.81\nCustom Clearance\n2\nEUR 253.88\nEUR 507.76\nTotal Amount: EUR 1505.12",
  "promptVersion": 1,
  "processingTimeMs": 1829,
  "extractionMethod": "llm",
  "manuallyEdited": false,
  "manualEdits": []
}
```

---

## Example 2: Evergreen Warehousing

**Summary:**
- Vendor: Evergreen Warehousing
- Invoice Number: DOC-88134
- Invoice Date: Not extracted
- Currency: INR
- Total Amount: 1895.88
- Confidence Score: 76%
- Processing Time: 1906ms
- Extraction Method: LLM

**Full JSON Output:**

```json
{
  "extractedData": {
    "vendor_name": "Evergreen Warehousing",
    "invoice_number": "DOC-88134",
    "invoice_date": null,
    "currency": "INR",
    "total_amount": 1895.88,
    "tax_amount": null,
    "line_items": [
      {
        "description": "Freight Charges",
        "quantity": 2,
        "unit_price": 305.66,
        "line_total": 611.32
      },
      {
        "description": "Custom Clearance",
        "quantity": 1,
        "unit_price": 487.07,
        "line_total": 487.07
      },
      {
        "description": "Warehouse Handling",
        "quantity": 3,
        "unit_price": 265.83,
        "line_total": 797.49
      }
    ]
  },
  "validation": {
    "normalizedData": {
      "vendor_name": "Evergreen Warehousing",
      "invoice_number": "DOC-88134",
      "invoice_date": null,
      "currency": "INR",
      "total_amount": 1895.88,
      "tax_amount": null,
      "line_items": [
        {
          "description": "Freight Charges",
          "quantity": 2,
          "unit_price": 305.66,
          "line_total": 611.32
        },
        {
          "description": "Custom Clearance",
          "quantity": 1,
          "unit_price": 487.07,
          "line_total": 487.07
        },
        {
          "description": "Warehouse Handling",
          "quantity": 3,
          "unit_price": 265.83,
          "line_total": 797.49
        }
      ]
    },
    "confidenceScore": 0.76,
    "validationErrors": [
      {
        "field": "invoice_date",
        "message": "invoice_date is missing",
        "code": "MISSING_FIELD"
      },
      {
        "field": "tax_amount",
        "message": "tax_amount is missing",
        "code": "MISSING_FIELD"
      }
    ],
    "isValid": false,
    "extractionMethod": "llm"
  },
  "rawText": "Evergreen Warehousing\nInvoice ID:\nDOC-88134\nDescription\nQty\nUnit Price\nAmount\nFreight Charges\n2\nINR 305.66\nINR 611.32\nCustom Clearance\n1\nINR 487.07\nINR 487.07\nWarehouse Handling\n3\nINR 265.83\nINR 797.49\nTotal Amount: INR 1895.88",
  "promptVersion": 1,
  "processingTimeMs": 1906,
  "extractionMethod": "llm",
  "manuallyEdited": false,
  "manualEdits": []
}
```

---

## Example 3: Velocity Cargo Solutions

**Summary:**
- Vendor: Velocity Cargo Solutions
- Invoice Number: BILL-96477
- Invoice Date: Not extracted
- Currency: USD
- Total Amount: 579.11
- Confidence Score: 76%
- Processing Time: 1690ms
- Extraction Method: LLM

**Full JSON Output:**

```json
{
  "extractedData": {
    "vendor_name": "Velocity Cargo Solutions",
    "invoice_number": "BILL-96477",
    "invoice_date": null,
    "currency": "USD",
    "total_amount": 579.11,
    "tax_amount": null,
    "line_items": [
      {
        "description": "Warehouse Handling",
        "quantity": 2,
        "unit_price": 257,
        "line_total": 514
      },
      {
        "description": "Warehouse Handling",
        "quantity": 1,
        "unit_price": 65.11,
        "line_total": 65.11
      }
    ]
  },
  "validation": {
    "normalizedData": {
      "vendor_name": "Velocity Cargo Solutions",
      "invoice_number": "BILL-96477",
      "invoice_date": null,
      "currency": "USD",
      "total_amount": 579.11,
      "tax_amount": null,
      "line_items": [
        {
          "description": "Warehouse Handling",
          "quantity": 2,
          "unit_price": 257,
          "line_total": 514
        },
        {
          "description": "Warehouse Handling",
          "quantity": 1,
          "unit_price": 65.11,
          "line_total": 65.11
        }
      ]
    },
    "confidenceScore": 0.76,
    "validationErrors": [
      {
        "field": "invoice_date",
        "message": "invoice_date is missing",
        "code": "MISSING_FIELD"
      },
      {
        "field": "tax_amount",
        "message": "tax_amount is missing",
        "code": "MISSING_FIELD"
      }
    ],
    "isValid": false,
    "extractionMethod": "llm"
  },
  "rawText": "Velocity Cargo Solutions\nInvoice ID: BILL-96477\nDescription Qty Unit Price Amount\nWarehouse Handling 2 USD 257.0 USD 514.0\nWarehouse Handling 1 USD 65.11 USD 65.11\nTotal Amount: USD 579.11",
  "promptVersion": 1,
  "processingTimeMs": 1690,
  "extractionMethod": "llm",
  "manuallyEdited": false,
  "manualEdits": []
}
```

---

## Key Observations

### Successful Extractions
- All three invoices successfully extracted vendor names, invoice numbers, and line items
- Multi-currency support demonstrated (EUR, INR, USD)
- Line item details including quantities, unit prices, and totals accurately captured

### Validation Errors
- Missing `tax_amount` field is common across all examples
- Some invoices missing `invoice_date` field
- System correctly identifies and flags these issues with appropriate error codes

### Performance
- Average processing time: ~1.8 seconds per document
- Confidence scores range from 76% to 88%
- All extractions used LLM method (Groq API)

### Data Quality
- Raw text extraction shows clean parsing from PDF
- Normalized data maintains consistency
- Validation engine provides actionable feedback for data quality improvement
