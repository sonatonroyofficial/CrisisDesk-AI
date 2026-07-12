import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Report from '../models/Report';
import { successResponse } from '../utils/ApiResponse';
import { classifyReport, fallbackClassify, ClassificationResult } from '../services/ai.service';
import { checkDuplicate } from '../services/duplicate.service';
import { AppError } from '../middlewares/errorHandler';

// Helper to escape regex special characters for safe query matching
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /api/reports
export async function createReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { description, location, contact, name, language } = req.body;

    const reportLang = language || 'unknown';
    let aiResult: ClassificationResult;

    try {
      // Attempt classification using the Gemini API
      aiResult = await classifyReport({
        description,
        location,
        language: reportLang,
      });
    } catch (error) {
      console.warn('[Report Controller] AI classification failed, using keyword-based fallback classifier.');
      try {
        // Execute the keyword fallback classifier
        aiResult = fallbackClassify({ description });
      } catch (fallbackError) {
        throw new AppError('AI classification failed. Please try again.', 500);
      }
    }

    // Check if this report is a duplicate of an existing one in the last 24 hours
    const duplicateCheck = await checkDuplicate({
      location,
      category: aiResult.category,
      description,
    });

    // Merge AI/fallback results and duplicate detection status into the new Report
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
      confidence: aiResult.confidence,
      possibleDuplicate: duplicateCheck.possibleDuplicate,
      matchedReportId: duplicateCheck.matchedReportId,
      status: 'pending', // Explicitly start in pending status
    });

    const savedReport = await newReport.save();

    return res.status(201).json(successResponse(savedReport));
  } catch (error) {
    next(error);
  }
}

// GET /api/reports (with filtering, pagination, and text search)
export async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, urgency, status, search, from, to, page, limit } = req.query;

    const query: any = {};

    // Exact match filters
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;

    // Free-text search on description or location case-insensitively
    if (search) {
      const searchRegex = new RegExp(escapeRegExp(String(search)), 'i');
      query.$or = [
        { description: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
      ];
    }

    // Date range filter
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(String(from));
      if (to) query.createdAt.$lte = new Date(String(to));
    }

    // Pagination defaults
    const pageNum = parseInt(String(page || 1), 10);
    const limitNum = parseInt(String(limit || 20), 10);
    const skip = (pageNum - 1) * limitNum;

    // Perform queries
    const [reports, total] = await Promise.all([
      Report.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Report.countDocuments(query),
    ]);

    return res.json(successResponse({ reports, total, page: pageNum, limit: limitNum }));
  } catch (error) {
    next(error);
  }
}

// GET /api/reports/:id
export async function getReportById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Report not found.', 404);
    }

    const report = await Report.findById(id);
    if (!report) {
      throw new AppError('Report not found.', 404);
    }

    return res.json(successResponse(report));
  } catch (error) {
    next(error);
  }
}

// PATCH /api/reports/:id/status
export async function updateReportStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Report not found.', 404);
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedReport) {
      throw new AppError('Report not found.', 404);
    }

    return res.json(successResponse(updatedReport));
  } catch (error) {
    next(error);
  }
}

// DELETE /api/reports/:id
export async function deleteReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Report not found.', 404);
    }

    const deletedReport = await Report.findByIdAndDelete(id);
    if (!deletedReport) {
      throw new AppError('Report not found.', 404);
    }

    return res.json(successResponse({ deleted: true }));
  } catch (error) {
    next(error);
  }
}
