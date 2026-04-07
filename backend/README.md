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
- `npm run test` - Run Jest test suite
- `npm run lint` - Run ESLint

## API Base URL

- Local: `http://localhost:5000`
- Health check: `GET /health`

