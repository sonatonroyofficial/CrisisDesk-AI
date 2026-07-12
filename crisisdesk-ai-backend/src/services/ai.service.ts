import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { z } from 'zod';

// Zod schema to validate classification output
const classificationResultSchema = z.object({
  category: z.enum(["medical", "fire", "accident", "crime", "flood", "utility", "public_service", "infrastructure", "other"]),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  summary: z.string(),
  suggestedAction: z.string(),
  confidence: z.number().min(0).max(1),
});

export type ClassificationResult = z.infer<typeof classificationResultSchema>;

export async function classifyReport({
  description,
  location,
  language,
}: {
  description: string;
  location: string;
  language: string;
}): Promise<ClassificationResult> {
  // If running in a test environment, return a mock result immediately
  // to avoid network requests, latency, and rate-limiting timeouts
  if (process.env.NODE_ENV === 'test') {
    return {
      category: (process.env.MOCK_CATEGORY as any) || 'utility',
      urgency: (process.env.MOCK_URGENCY as any) || 'critical',
      summary: 'Mocked summary description of the report.',
      suggestedAction: 'Mocked recommended action.',
      confidence: 0.95,
    };
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_gemini_api_key' || apiKey.trim() === '') {
    throw new Error('AI_CLASSIFICATION_FAILED');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-3.5-flash as it is the active version in this environment
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: 'You are an emergency-report triage classifier for CrisisDesk AI. Given a citizen\'s report (which may be in Bangla, English, or mixed), return ONLY a raw JSON object — no markdown, no explanation — matching: { "category": one of ["medical","fire","accident","crime","flood","utility","public_service","infrastructure","other"], "urgency": one of ["low","medium","high","critical"], "summary": a one-sentence English summary of the report, "suggestedAction": a short recommended action for responders, "confidence": a number between 0 and 1 }',
    });

    const userPrompt = `Location: ${location}\nLanguage: ${language}\nDescription: ${description}`;

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    // Strip markdown code fences if present
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```[a-zA-Z]*\s*/, '');
      cleanJson = cleanJson.replace(/\s*```$/, '');
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    const validated = classificationResultSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.error('[AI Service Error] Gemini classification failed:', error);
    throw new Error('AI_CLASSIFICATION_FAILED');
  }
}

export function fallbackClassify({ description }: { description: string }): ClassificationResult {
  const descLower = description.toLowerCase();

  let category: ClassificationResult['category'] = 'other';
  let urgency: ClassificationResult['urgency'] = 'medium';

  // Keyword check for English and Bangla terms
  if (descLower.includes('fire') || descLower.includes('আগুন')) {
    category = 'fire';
    urgency = 'high';
  } else if (
    descLower.includes('blood') ||
    descLower.includes('injured') ||
    descLower.includes('রক্ত') ||
    descLower.includes('আহত')
  ) {
    category = 'medical';
    urgency = 'high';
  } else if (
    descLower.includes('flood') ||
    descLower.includes('বন্যা') ||
    descLower.includes('পানি')
  ) {
    category = 'flood';
    urgency = 'medium';
  } else if (descLower.includes('accident') || descLower.includes('দুর্ঘটনা')) {
    category = 'accident';
    urgency = 'high';
  } else if (
    descLower.includes('steal') ||
    descLower.includes('robbery') ||
    descLower.includes('চুরি') ||
    descLower.includes('ডাকাতি')
  ) {
    category = 'crime';
    urgency = 'medium';
  }

  // Summary: truncated version of description (up to 100 characters)
  const truncatedSummary = description.length > 100 
    ? description.substring(0, 97) + '...'
    : description;

  return {
    category,
    urgency,
    summary: truncatedSummary,
    suggestedAction: 'Dispatch relevant authority for verification.',
    confidence: 0.4,
  };
}
