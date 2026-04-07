# Dataset Evaluation Guide

## What "15-20 invoice dataset" means

Your assignment expects you to test the system on a realistic batch of invoices, not just one or two files.

Use at least 15 and preferably around 20 PDFs with variety:

- Different templates/layouts (different vendors)
- Different invoice number labels such as Invoice No, Bill ID, Inv #
- Multiple line items on several invoices
- Some invoices with missing fields (date, tax, currency, etc.)
- Some noisy/irregular cases (slight skew, table inconsistencies)

## Folder Layout

- Put PDFs in evaluation/dataset/
- Put ground truth in evaluation/ground-truth.json (optional but recommended)
- Reports are written to evaluation/reports/

## Ground Truth Format

Use the template in evaluation/ground-truth.template.json.

Each key can be:

- file name (example: sample-01.pdf)
- or file stem (example: sample-01)
- or relative path from evaluation/dataset

Supported fields:

- vendor_name
- invoice_number
- invoice_date
- currency
- total_amount
- tax_amount
- line_items[] with description, quantity, unit_price, line_total

## Run Evaluation

1. Add files to evaluation/dataset
2. Copy evaluation/ground-truth.template.json to evaluation/ground-truth.json and fill values
3. Run from backend folder:

   npm run eval:dataset

Optional environment variables:

- EVAL_DISABLE_LLM=true (forces deterministic/hybrid fallback path)
- EVAL_DATASET_DIR=custom/path/to/pdfs
- EVAL_GROUND_TRUTH=custom/path/to/ground-truth.json
- EVAL_OUTPUT_DIR=custom/path/to/reports
- EVAL_AMOUNT_TOLERANCE=1

## Output

The script generates:

- evaluation/reports/evaluation-<timestamp>.json
- evaluation/reports/evaluation-<timestamp>.md

These include:

- extraction success rate
- average processing time
- field coverage
- field accuracy (when ground truth exists)
- validation error frequency
- per-document outcome
- extraction path usage (`llm`, `heuristic`, `ocr_heuristic`, `manual`)

## Interpreting OCR/Fallback Evidence

The report now includes extraction-path usage counts.

- High `llm` count: model-backed extraction dominated
- Non-zero `ocr_heuristic`: OCR fallback path was used for low-text/scan-like PDFs
- Non-zero `heuristic`: model or parsing fallback path occurred

Use this section as explicit benchmark evidence when discussing noisy/scanned invoice handling.

## Submission Note (When PDFs Cannot Be Committed)

If your 15-20 invoice dataset cannot be included in the repository:

1. Keep this evaluation workflow and script in repo
2. Run `npm run eval:dataset` locally on the real dataset
3. Attach generated report files from `evaluation/reports` to your assignment submission
