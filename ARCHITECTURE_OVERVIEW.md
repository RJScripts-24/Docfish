# Docfish Architecture Overview

## Scope
This document summarizes the current architecture of the Docfish workspace, including the React frontend, Express API backend, persistence, and external integrations.

## Detailed Architecture Diagram

```mermaid
flowchart LR
    U[User Browser]

    subgraph FE[Frontend - Vite React SPA]
        MAIN[main.tsx]
        APP[App.tsx + AuthProvider]
        ROUTER[routes.tsx + ProtectedRoute]
        PAGES[Feature Pages: Upload Documents Review Analytics Errors Settings]
        UQ[useUploadQueue hook]
        API[lib/api.ts typed client]
        SES[lib/session.ts token storage]
    end

    U --> MAIN --> APP --> ROUTER --> PAGES
    APP --> SES
    PAGES --> API
    PAGES --> UQ
    UQ --> API

    subgraph BE[Backend - Node Express TypeScript]
        IDX[index.ts]
        APPX[app.ts bootstrap]
        MW[Middleware chain: cors helmet morgan json auth rate-limit multer]
        V1[v1.routes.ts]
        LEG[Legacy routes]
        C1[apiV1.controller.ts]
        C2[auth document metrics prompt controllers]
        MAP[utils/apiContractMappers.ts]
    end

    IDX --> APPX --> MW
    MW --> V1 --> C1
    MW --> LEG --> C2
    C1 --> MAP
    API -->|JWT REST| V1

    subgraph SRV[Domain Services]
        AS[auth.service.ts]
        ES[extraction.service.ts]
        VS[validation.service.ts]
        PS[prompt.service.ts]
        SS[storage.service.ts]
    end

    C1 --> AS
    C1 --> ES
    C1 --> VS
    C1 --> PS
    C1 --> SS
    C2 --> AS
    C2 --> ES
    C2 --> PS

    subgraph UT[Processing Utilities]
        PDF[pdfParser.ts]
        OCR[ocrParser.ts]
        NORM[normalizers.ts]
    end

    ES --> PDF
    ES --> OCR
    ES --> NORM
    VS --> NORM

    subgraph DATA[Persistence]
        DM[Document.model.ts]
        PM[Prompt.model.ts]
        UM[User.model.ts]
        MDB[(MongoDB)]
        FS[(uploads and uploads/results)]
    end

    C1 --> DM
    C1 --> PM
    AS --> UM
    ES --> DM
    PS --> PM
    DM --> MDB
    PM --> MDB
    UM --> MDB
    SS --> FS
    APPX -->|static /uploads| FS

    subgraph EXT[External Dependencies]
        GROQ[Groq OpenAI-compatible API]
        GOOG[Google OAuth]
        OCRBIN[pdftoppm tesseract ImageMagick optional]
    end

    ES --> GROQ
    C1 --> GOOG
    OCR --> OCRBIN
```

## Detailed Processing Pipeline

```mermaid
flowchart TB
    A[UploadPage selects PDFs] --> B[POST /api/v1/documents]
    B --> C[upload middleware stores files in uploads/]
    C --> D[Document created with status UPLOADED]
    D --> E[202 Accepted with upload jobs]
    E --> F[Frontend polls GET /api/v1/uploads/:id/status]

    D --> G[extractionService.processDocument]
    G --> H[pdfParser extracts text]
    H --> I{Text below threshold and accurate mode}
    I -->|Yes| J[ocrParser fallback]
    I -->|No| K[LLM or heuristic extraction]
    J --> K

    K --> L[validationService normalize and validate]
    L --> M[Update document: extractedData confidence validationErrors method]
    M --> N[storageService writes uploads/results/docId.json]
    N --> O[Status becomes PROCESSED or FAILED]
    O --> P[Documents and Review pages render results]
```

## Key Architectural Characteristics
- Asynchronous ingestion: Non-blocking upload contract with polling-based status updates.
- Graceful degradation: Heuristic and OCR fallback paths prevent hard failure when model or parsing quality is limited.
- Contract-driven API: Centralized API v1 routes with mappers translating internal models to frontend contract objects.
- Modular backend services: Auth, extraction, validation, storage, and prompt workflows are separated by responsibility.
