import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/server/db';
import Report from '@/lib/server/models/Report';
import { classifyReport, fallbackClassify, getEmbedding } from '@/lib/server/gemini';
import { checkDuplicate } from '@/lib/server/jaccard';
import { isRateLimited } from '@/lib/server/rateLimiter';

// Helper to escape regex special characters for safe query matching
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/reports (Lists reports with filters, search, and pagination)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const urgency = searchParams.get('urgency');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const contact = searchParams.get('contact');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const query: any = {};

    // Exact matches
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;
    if (contact) query.contact = contact;

    // Search query on description and location
    if (search) {
      const searchRegex = new RegExp(escapeRegExp(search), 'i');
      query.$or = [
        { description: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
      ];
    }

    // Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // Pagination
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      Report.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Report.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reports,
        total,
        page: pageNum,
        limit: limitNum,
      }
    });
  } catch (error: any) {
    console.error('[GET /api/reports Error]:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/reports (Public citizen report submission)
export async function POST(req: NextRequest) {
  try {
    // Check Rate Limiting
    const limitCheck = isRateLimited(req);
    const headers = {
      'X-RateLimit-Limit': String(limitCheck.limit),
      'X-RateLimit-Remaining': String(limitCheck.remaining),
      'X-RateLimit-Reset': String(limitCheck.reset),
    };

    if (limitCheck.limited) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    await connectDB();

    const { description, location, urgency, name, contact, language } = await req.json();

    if (!description || !location || !contact) {
      return NextResponse.json({ success: false, message: 'Description, location, and contact number are required.' }, { status: 400 });
    }

    // Check if this contact number submitted a report in the last 24 hours
    if (contact && contact.trim() !== '') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentReport = await Report.findOne({
        contact: contact.trim(),
        createdAt: { $gte: twentyFourHoursAgo }
      });

      if (recentReport) {
        return NextResponse.json(
          { success: false, message: 'You have already submitted a report in the last 24 hours. Please track your existing report or try again later. 😊' },
          { status: 429 }
        );
      }
    }

    const reportLang = language || 'unknown';
    let aiResult;

    try {
      // Attempt Gemini AI classification
      aiResult = await classifyReport({
        description,
        location,
        language: reportLang,
      });
    } catch (error) {
      console.warn('[API Route /reports] Gemini classification failed, using keyword fallback:', error);
      try {
        aiResult = fallbackClassify({ description });
      } catch (fallbackErr) {
        return NextResponse.json({ success: false, message: 'AI classification failed. Please try again.' }, { status: 500 });
      }
    }

    // Generate text embedding for new report
    let embeddingVal = null;
    try {
      embeddingVal = await getEmbedding(description);
    } catch (err) {
      console.warn('[API Route /reports] Failed to generate embedding:', err);
    }

    // Run advanced duplicate matching with Jaccard fallback
    const duplicateCheck = await checkDuplicate({
      location,
      category: aiResult.category,
      description,
      newEmbedding: embeddingVal,
    });

    const newReport = new Report({
      description,
      location,
      contact,
      name,
      language: reportLang,
      category: aiResult.category,
      urgency: aiResult.urgency,
      summary: aiResult.summary,
      suggestedAction: aiResult.suggestedAction,
      citizenAdvice: aiResult.citizenAdvice,
      confidence: aiResult.confidence,
      possibleDuplicate: duplicateCheck.possibleDuplicate,
      matchedReportId: duplicateCheck.matchedReportId,
      duplicateReason: duplicateCheck.duplicateReason,
      embedding: embeddingVal,
      status: 'pending',
    });

    const savedReport = await newReport.save();

    return NextResponse.json({ success: true, data: savedReport }, { status: 201, headers });
  } catch (error: any) {
    console.error('[POST /api/reports Error]:', error);
    // Return headers in error too if defined, otherwise regular 500
    const limitCheck = isRateLimited(req);
    const errorHeaders = {
      'X-RateLimit-Limit': String(limitCheck.limit),
      'X-RateLimit-Remaining': String(limitCheck.remaining),
      'X-RateLimit-Reset': String(limitCheck.reset),
    };
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500, headers: errorHeaders });
  }
}
