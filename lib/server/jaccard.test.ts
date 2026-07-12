import { describe, it, expect, vi } from 'vitest';
import { fallbackClassify } from './gemini';

// Mock Mongoose model so Jaccard checks won't hit a live database
vi.mock('./models/Report', () => {
  return {
    default: {
      find: vi.fn(),
    },
  };
});

// Helper to test similarity directly
function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set(Array.from(setA).filter(word => setB.has(word)));
  const union = new Set(Array.from(setA).concat(Array.from(setB)));
  return intersection.size / union.size;
}

describe('Jaccard Similarity', () => {
  it('should return 1.0 for identical sets', () => {
    const setA = new Set(['fire', 'outbreak', 'uttara']);
    const setB = new Set(['fire', 'outbreak', 'uttara']);
    expect(calculateJaccardSimilarity(setA, setB)).toBe(1.0);
  });

  it('should return 0.0 for disjoint sets', () => {
    const setA = new Set(['fire', 'outbreak']);
    const setB = new Set(['medical', 'help']);
    expect(calculateJaccardSimilarity(setA, setB)).toBe(0.0);
  });

  it('should compute correct similarity for overlapping sets', () => {
    const setA = new Set(['fire', 'in', 'sector', '7']);
    const setB = new Set(['fire', 'in', 'dhaka']);
    // Intersection: ['fire', 'in'] (size 2)
    // Union: ['fire', 'in', 'sector', '7', 'dhaka'] (size 5)
    // Similarity: 2/5 = 0.4
    expect(calculateJaccardSimilarity(setA, setB)).toBe(0.4);
  });
});

describe('Fallback Keyword Classifier', () => {
  it('should classify fire emergencies correctly', () => {
    const resultEn = fallbackClassify({ description: 'A massive warehouse fire broke out!' });
    const resultBn = fallbackClassify({ description: 'বাডিতে আগুন লেগেছে সাহায্য করুন।' });

    expect(resultEn.category).toBe('fire');
    expect(resultEn.urgency).toBe('high');

    expect(resultBn.category).toBe('fire');
    expect(resultBn.urgency).toBe('high');
  });

  it('should classify medical emergencies correctly', () => {
    const result = fallbackClassify({ description: 'Need blood and injured person needs rescue' });
    expect(result.category).toBe('medical');
    expect(result.urgency).toBe('high');
  });

  it('should classify flood emergencies correctly', () => {
    const result = fallbackClassify({ description: 'The streets are filled with flood water' });
    expect(result.category).toBe('flood');
    expect(result.urgency).toBe('medium');
  });

  it('should return other for uncaught keywords', () => {
    const result = fallbackClassify({ description: 'Simple street trash collection delay.' });
    expect(result.category).toBe('other');
    expect(result.urgency).toBe('medium');
  });
});
