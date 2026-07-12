import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Port, MongoDB URI, and JWT Secret are required for database and server operations
const requiredEnv = ['PORT', 'MONGODB_URI', 'JWT_SECRET'] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`[Startup Error] Missing required environment variable: ${key}`);
  }
}

// GEMINI_API_KEY is optional on startup; if missing or invalid, log a warning but do not crash
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey || geminiApiKey === 'dummy_gemini_api_key' || geminiApiKey.trim() === '') {
  console.warn('[Startup Warning] GEMINI_API_KEY is missing or invalid. AI classification will use fallback classifier.');
}

export const env = {
  PORT: parseInt(process.env.PORT!, 10),
  MONGODB_URI: process.env.MONGODB_URI!,
  GEMINI_API_KEY: geminiApiKey || '',
  JWT_SECRET: process.env.JWT_SECRET!,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
};
