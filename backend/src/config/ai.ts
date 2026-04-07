import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Fail-safe validation to ensure the application doesn't silently fail during extraction
if (!process.env.GROQ_API_KEY) {
  console.warn(
    '⚠️ WARNING: GROQ_API_KEY is missing from environment variables. AI extraction will fail.'
  );
}

/**
 * Global AI Client Configuration
 * * Initializes the LLM client used by the extraction service.
 * We configure standard timeouts and retry logic here to handle 
 * varying processing times of different invoice sizes.
 */
const aiClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  
  // Best practice for take-homes: ensure network instability doesn't fail the extraction
  maxRetries: 3, 
  
  // Set a generous timeout (e.g., 45 seconds) because analyzing large tables in PDFs can take time
  timeout: 45 * 1000, 
});

export default aiClient;