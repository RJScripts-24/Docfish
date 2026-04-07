# Docfish Backend

Express + TypeScript API for invoice extraction, validation, prompt management, and metrics.

## Prerequisites

- Node.js 20+
- MongoDB instance

## Setup

1. Install dependencies:

	npm install

2. Create environment file:

	Copy `.env.example` to `.env` and fill required values.

3. Start development server:

	npm run dev

## Scripts

- `npm run dev` - Run with live reload
- `npm run build` - Compile TypeScript into `dist`
- `npm run start` - Run compiled server
- `npm run eval:dataset` - Run extraction evaluation for assignment dataset (15-20 PDFs)
- `npm run test` - Run Jest test suite
- `npm run lint` - Run ESLint

## API Base URL

- Local: `http://localhost:5000`
- Contract API: `http://localhost:5000/api/v1`
- Health check: `GET /health`


## Upload And OCR Controls

Optional environment variables:

- `UPLOAD_RATE_LIMIT_WINDOW_MS` (default `60000`)
- `UPLOAD_RATE_LIMIT_MAX` (default `30`)
- `OCR_MIN_TEXT_LENGTH` (default `40`)
- `OCR_MAX_PAGES` (default `3`)
- `OCR_ENABLE_PREPROCESS` (default `true`)
- `OCR_ENABLE_ROTATION_VARIANTS` (default `true`)

Upload endpoints supported:

- `POST /api/v1/documents` (preferred contract path)
- `POST /api/v1/documents/upload` (backward-compatible alias)

### Async Upload Contract

- Upload endpoints are asynchronous and return `202 Accepted`.
- Response contains upload job metadata immediately.
- Poll `GET /api/v1/uploads/{uploadId}/status` for processing progression.

### OCR Fallback Behavior

OCR is optional and environment-aware:

- Required tools for OCR fallback: `pdftoppm` and `tesseract`.
- Optional preprocessing/deskew/rotation variants: ImageMagick (`magick` or `convert`).
- If OCR dependencies are unavailable, extraction continues without crashing and documents are still moved into reviewable output where possible.

Extraction method is persisted and exposed via API as one of:

- `llm`
- `heuristic`
- `ocr_heuristic`
- `manual`

### Prompt Version Testing

Prompt test endpoint: `POST /api/v1/prompts/{id}/test`

- Executes using the selected prompt version.
- Uses the same model invocation style as extraction when model credentials are available.
- Returns degraded-mode metadata (`degradedMode`, `degradedModeReason`) when model-backed execution is unavailable and heuristic fallback is used.

## Assignment Dataset Evaluation

Use the folder `evaluation/dataset` for your 15-20 invoice PDFs and provide optional ground truth in `evaluation/ground-truth.json`.

- Template: `evaluation/ground-truth.template.json`
- Guide: `evaluation/README.md`
- Output reports: `evaluation/reports`

If your dataset PDFs cannot be committed, keep the tooling and docs in-repo, then attach generated report artifacts (`.json` + `.md`) separately for submission evidence.

