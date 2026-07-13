import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Zod schema to validate classification output
const classificationResultSchema = z.object({
  category: z.enum(["medical", "fire", "accident", "crime", "flood", "utility", "public_service", "infrastructure", "other"]),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  summary: z.string(),
  suggestedAction: z.string(),
  citizenAdvice: z.string(),
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
  if (process.env.NODE_ENV === 'test') {
    return {
      category: (process.env.MOCK_CATEGORY as any) || 'utility',
      urgency: (process.env.MOCK_URGENCY as any) || 'critical',
      summary: 'Mocked summary description of the report.',
      suggestedAction: 'Mocked recommended action.',
      citizenAdvice: 'Mocked safety guidance for the citizen.',
      confidence: 0.95,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_gemini_api_key' || apiKey.trim() === '') {
    throw new Error('AI_CLASSIFICATION_FAILED');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as active in this environment
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: 'You are an emergency-report triage classifier for CrisisDesk AI. Given a citizen\'s report (which may be in Bangla, English, or mixed), return ONLY a raw JSON object — no markdown, no explanation — matching: { "category": one of ["medical","fire","accident","crime","flood","utility","public_service","infrastructure","other"], "urgency": one of ["low","medium","high","critical"], "summary": a one-sentence English summary of the report, "suggestedAction": a short recommended action for responders, "citizenAdvice": a short reassuring first-aid or immediate safety instruction (in simple English) advising what the reporter should do right now in this situation before responders arrive, "confidence": a number between 0 and 1 }',
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

  // Set appropriate first-aid/safety advice based on category
  let citizenAdvice = 'Stay calm. Keep away from immediate danger. If safe, administer first-aid and wait for emergency services to arrive.';
  if (category === 'fire') {
    citizenAdvice = 'Evacuate the building immediately. Do not use elevators. If there is smoke, crawl low under it. Call the fire department.';
  } else if (category === 'medical') {
    citizenAdvice = 'If bleeding, apply direct pressure. Keep the person warm. Do not move them unless they are in immediate danger.';
  } else if (category === 'flood') {
    citizenAdvice = 'Move to higher ground. Avoid walking or driving through flood waters. Keep emergency contacts ready.';
  } else if (category === 'accident') {
    citizenAdvice = 'Keep clear of the road. Do not attempt to move severely injured people. Turn on hazard warning lights if driving.';
  } else if (category === 'crime') {
    citizenAdvice = 'Find a safe, locked place. Do not confront suspects. Observe details from a distance and wait for police.';
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
    citizenAdvice,
    confidence: 0.4,
  };
}

export async function getEmbedding(text: string): Promise<number[] | null> {
  // If running in a test environment, return null to bypass network request
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_gemini_api_key' || apiKey.trim() === '') {
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.warn('[Gemini Embedding Error] Failed to generate embedding:', error);
    return null;
  }
}

