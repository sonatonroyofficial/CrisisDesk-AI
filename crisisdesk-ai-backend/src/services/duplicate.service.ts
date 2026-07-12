import Report from '../models/Report';

// Helper to escape regex special characters
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper to clean text into a set of lowercased words
function getWords(text: string): Set<string> {
  const cleaned = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'–]/g, ' ');
  const words = cleaned.split(/\s+/).filter(w => w.length > 0);
  return new Set(words);
}

// Helper to calculate Jaccard Similarity between two sets of words
function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  
  const intersection = new Set([...setA].filter(word => setB.has(word)));
  const union = new Set([...setA, ...setB]);
  
  return intersection.size / union.size;
}

interface DuplicateCheckParams {
  location: string;
  category: string | null;
  description: string;
  excludeId?: any;
}

interface DuplicateCheckResult {
  possibleDuplicate: boolean;
  matchedReportId: any;
}

export async function checkDuplicate({
  location,
  category,
  description,
  excludeId,
}: DuplicateCheckParams): Promise<DuplicateCheckResult> {
  const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24 hours
  const escapedLocation = escapeRegExp(location.trim());

  // Query database for candidates
  const query: any = {
    category,
    location: { $regex: new RegExp('^\\s*' + escapedLocation + '\\s*$', 'i') },
    createdAt: { $gte: timeLimit },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const candidates = await Report.find(query);
  const newWords = getWords(description);

  for (const candidate of candidates) {
    const candidateWords = getWords(candidate.description);
    const similarity = calculateJaccardSimilarity(newWords, candidateWords);

    if (similarity > 0.6) {
      return {
        possibleDuplicate: true,
        matchedReportId: candidate._id,
      };
    }
  }

  return {
    possibleDuplicate: false,
    matchedReportId: null,
  };
}

/**
 * TODO: Bonus Upgrade
 * Replace the Jaccard similarity word-overlap check with Gemini text embeddings + Cosine Similarity.
 * 
 * Signature ready for future implementation:
 * 
 * export async function checkDuplicateEmbeddings({
 *   location,
 *   category,
 *   description,
 *   excludeId,
 * }: DuplicateCheckParams): Promise<DuplicateCheckResult> {
 *   // 1. Generate text embedding for new report description using text-embedding-004.
 *   // 2. Fetch candidates from database in last 24h with matching location/category.
 *   // 3. Compute cosine similarity between new embedding and candidate embeddings.
 *   // 4. Return matching report if similarity exceeds threshold (e.g. 0.8).
 *   return { possibleDuplicate: false, matchedReportId: null };
 * }
 */
