import Report from './models/Report';

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
  
  const intersection = new Set(Array.from(setA).filter(word => setB.has(word)));
  const union = new Set(Array.from(setA).concat(Array.from(setB)));
  
  return intersection.size / union.size;
}

// Helper to calculate Cosine Similarity between two numeric vectors
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface DuplicateCheckParams {
  location: string;
  category: string | null;
  description: string;
  newEmbedding?: number[] | null;
  excludeId?: any;
}

interface DuplicateCheckResult {
  possibleDuplicate: boolean;
  matchedReportId: any;
  duplicateReason?: string;
}

export async function checkDuplicate({
  location,
  category,
  description,
  newEmbedding,
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

  // 1. Try advanced duplicate check using Gemini Text Embeddings (if available)
  if (newEmbedding && newEmbedding.length > 0) {
    for (const candidate of candidates) {
      if (candidate.embedding && candidate.embedding.length === newEmbedding.length) {
        const similarity = calculateCosineSimilarity(newEmbedding, candidate.embedding);
        
        // Threshold: 0.85 indicates high semantic similarity
        if (similarity > 0.85) {
          console.log(`[Duplicate Check] Embedding Cosine Similarity match: ${similarity.toFixed(4)}`);
          return {
            possibleDuplicate: true,
            matchedReportId: candidate._id,
            duplicateReason: `AI Semantic Match (${(similarity * 100).toFixed(1)}%). Another similar incident was reported from this location in the last 24 hours.`,
          };
        }
      }
    }
  }

  // 2. Fallback: Word-overlap Jaccard Similarity check
  const newWords = getWords(description);

  for (const candidate of candidates) {
    const candidateWords = getWords(candidate.description);
    const similarity = calculateJaccardSimilarity(newWords, candidateWords);

    if (similarity > 0.6) {
      console.log(`[Duplicate Check] Fallback Jaccard Word-Overlap match: ${similarity.toFixed(4)}`);
      return {
        possibleDuplicate: true,
        matchedReportId: candidate._id,
        duplicateReason: `High Text Overlap (${(similarity * 100).toFixed(1)}%). Another similar incident was reported from this location in the last 24 hours.`,
      };
    }
  }

  return {
    possibleDuplicate: false,
    matchedReportId: null,
  };
}
