# Docfish

> Turn messy documents into structured data.

Docfish ingests invoice PDFs, extracts structured fields using AI, validates the data, and serves everything through clean APIs and a dashboard. Built with a React frontend and a Node.js/Express backend.

---

## Screenshots

### Landing Page
![Landing Page](docs/images/Screenshot%202026-04-08%20045720.png)

### Authentication
![Authentication](docs/images/Screenshot%202026-04-08%20045825.png)

### Dashboard
![Dashboard](docs/images/Screenshot%202026-04-08%20045839.png)

### Invoice List
![Invoice List](docs/images/Screenshot%202026-04-08%20045921.png)

### Document Review
![Document Review](docs/images/Screenshot%202026-04-08%20045907.png)

### Prompt Management
![Prompt Management](docs/images/Screenshot%202026-04-08%20045803.png)

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- Radix UI + shadcn/ui components
- Recharts for analytics
- React Router v7

**Backend**
- Node.js 20 + Express + TypeScript
- MongoDB via Mongoose
- Groq API (OpenAI-compatible) for LLM extraction
- JWT + Google OAuth authentication
- Multer for file uploads
- OCR fallback via `pdftoppm` + `tesseract`

---

## Project Structure

```
docfish/
├── frontend/          # Vite React SPA
│   └── src/
│       ├── pages/     # Route-level page components
│       ├── components/# Feature + UI components
│       ├── lib/       # API client, types, session utils
│       └── hooks/     # Custom hooks (upload queue, etc.)
└── backend/           # Express API
    └── src/
        ├── controllers/
        ├── services/  # extraction, validation, prompt, auth, storage
        ├── models/    # Mongoose models (Document, Prompt, User)
        ├── routes/
        ├── middlewares/
        └── utils/     # pdfParser, ocrParser, normalizers
```

---

## Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- A [Groq API key](https://console.groq.com/) for LLM extraction
- (Optional) `pdftoppm`, `tesseract`, and ImageMagick for OCR fallback

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd docfish
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/docfish?retryWrites=true&w=majority
JWT_SECRET=your-strong-secret
JWT_EXPIRES_IN=7d

GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1

CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
```

Start the dev server:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`. Health check: `GET /health`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000` automatically.

---

## Environment Variables Reference

### Backend (required)

| Variable | Description |
|---|---|
| `PORT` | Server port (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `GROQ_API_KEY` | Groq API key for LLM extraction |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated |

### Backend (optional)

| Variable | Default | Description |
|---|---|---|
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model to use |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded files |
| `OCR_MIN_TEXT_LENGTH` | `40` | Min chars before OCR fallback triggers |
| `OCR_MAX_PAGES` | `3` | Max pages to OCR |
| `OCR_ENABLE_PREPROCESS` | `true` | Enable image preprocessing |
| `UPLOAD_RATE_LIMIT_MAX` | `30` | Max uploads per window |
| `UPLOAD_RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in ms |

### Frontend (optional)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `` (empty) | Override API base URL for production |
| `VITE_API_PROXY_TARGET` | `http://localhost:5000` | Vite proxy target |

---

## Available Scripts

### Backend

```bash
npm run dev          # Start with live reload (ts-node-dev)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled server
npm run test         # Run Jest test suite
npm run lint         # Run ESLint
npm run eval:dataset # Run extraction evaluation on dataset PDFs
```

### Frontend

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build to dist/
```

---

## API Overview

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/auth/guest` | Create guest session |
| `GET` | `/auth/google` | Initiate Google OAuth |
| `GET` | `/auth/me` | Get current user |
| `POST` | `/documents` | Upload invoice PDFs (async, returns `202`) |
| `GET` | `/documents` | List documents with pagination/search |
| `GET` | `/documents/:id` | Get document details |
| `PUT` | `/documents/:id` | Update extracted fields manually |
| `POST` | `/documents/:id/reprocess` | Reprocess a document |
| `DELETE` | `/documents/:id` | Delete a document |
| `GET` | `/uploads/:id/status` | Poll async upload job status |
| `GET` | `/analytics/metrics` | Dashboard metrics |
| `GET` | `/analytics/documents-over-time` | Chart data |
| `GET` | `/prompts` | List prompt versions |
| `POST` | `/prompts` | Create new prompt version |
| `POST` | `/prompts/:id/activate` | Set prompt as active |
| `POST` | `/prompts/:id/test` | Test prompt against sample text |
| `GET` | `/errors` | List validation errors |

Full OpenAPI spec: [`backend/docs/swagger.yaml`](backend/docs/swagger.yaml)

---

## How It Works

1. **Upload** — Drop one or more invoice PDFs. The backend returns `202 Accepted` immediately with upload job IDs.
2. **Extract** — The extraction service parses PDF text, then calls the Groq LLM with the active prompt template. If text is too short, OCR fallback kicks in automatically.
3. **Validate** — The validation service checks for missing fields, total mismatches, and format errors. Each result gets a confidence score.
4. **Review** — The Documents page shows all invoices with status, confidence, and processing time. Click any invoice to see the side-by-side PDF viewer and extracted fields editor.
5. **Prompt Management** — Create and version prompt templates in Settings. Test them against sample text before activating.

---

## Test Report

The system has been evaluated against a dataset of 10 invoice PDFs. Here are the results from the latest evaluation:

### Evaluation Summary

- Total PDFs processed: 10
- Extraction success rate: 100%
- Average processing time: 29 ms
- Extraction method: Heuristic (10 documents)

### Field Coverage

| Field | Coverage |
|---|---:|
| vendor_name | 100% |
| invoice_number | 90% |
| invoice_date | 80% |
| currency | 100% |
| total_amount | 100% |
| tax_amount | 0% |
| line_items | 100% |

### Validation Results

The system automatically validates extracted data and flags issues:

- Missing field errors: 13 occurrences
- Total mismatch errors: 2 occurrences
- Average confidence score: 75%

Full evaluation reports are available in `backend/evaluation/reports/`.

---

## Example Outputs

Here are three real examples of processed invoices showing the extracted structured data. For detailed JSON outputs, see [EXAMPLE_OUTPUTS.md](EXAMPLE_OUTPUTS.md).

### Example 1: Atlas Transport Ltd
- Currency: EUR
- Total Amount: 1505.12
- Confidence Score: 88%
- Processing Time: 1.8s

### Example 2: Evergreen Warehousing
- Currency: INR
- Total Amount: 1895.88
- Confidence Score: 76%
- Processing Time: 1.9s

### Example 3: Velocity Cargo Solutions
- Currency: USD
- Total Amount: 579.11
- Confidence Score: 76%
- Processing Time: 1.7s

These examples demonstrate:
- Successful extraction of vendor information, invoice numbers, and line items
- Multi-currency support (EUR, INR, USD)
- Automatic validation with confidence scoring
- Clear error reporting for missing fields
- Fast processing times (under 2 seconds per document)

---

## Running Tests

```bash
cd backend
npm run test
```

Tests live in `backend/tests/` split into `unit/` and `integration/`.

---

## Dataset Evaluation

To evaluate extraction accuracy against a set of PDFs:

1. Place PDFs in `backend/evaluation/dataset/`
2. Optionally add ground truth to `backend/evaluation/ground-truth.json` (see template)
3. Run:

```bash
cd backend
npm run eval:dataset
```

Reports are saved to `backend/evaluation/reports/`.

---

## OCR Setup (Optional)

For scanned or image-based PDFs, install:

```bash
# Ubuntu/Debian
sudo apt-get install poppler-utils tesseract-ocr imagemagick

# macOS
brew install poppler tesseract imagemagick
```

If these tools are not installed, extraction continues without OCR — documents are still processed using heuristic parsing.
