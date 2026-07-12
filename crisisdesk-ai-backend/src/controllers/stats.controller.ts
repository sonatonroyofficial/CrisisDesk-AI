import { Request, Response, NextFunction } from 'express';
import Report from '../models/Report';
import { successResponse } from '../utils/ApiResponse';

// GET /api/reports/stats/summary
export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    // Retrieve counts
    const totalReports = await Report.countDocuments();
    const criticalReports = await Report.countDocuments({ urgency: 'critical' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    // Aggregate category distribution
    const categoryAgg = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Aggregate urgency distribution
    const urgencyAgg = await Report.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    // Initial breakdown maps containing all available categories and urgencies defaulted to 0
    const categoryBreakdown: Record<string, number> = {
      medical: 0,
      fire: 0,
      accident: 0,
      crime: 0,
      flood: 0,
      utility: 0,
      public_service: 0,
      infrastructure: 0,
      other: 0,
    };

    const urgencyBreakdown: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    // Fill category breakdown with DB aggregation results
    categoryAgg.forEach(item => {
      const key = item._id;
      if (key && key in categoryBreakdown) {
        categoryBreakdown[key] = item.count;
      }
    });

    // Fill urgency breakdown with DB aggregation results
    urgencyAgg.forEach(item => {
      const key = item._id;
      if (key && key in urgencyBreakdown) {
        urgencyBreakdown[key] = item.count;
      }
    });

    const summaryData = {
      totalReports,
      criticalReports,
      pendingReports,
      resolvedReports,
      categoryBreakdown,
      urgencyBreakdown,
    };

    return res.json(successResponse(summaryData));
  } catch (error) {
    next(error);
  }
}
export default getSummary;
