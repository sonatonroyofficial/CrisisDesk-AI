import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/server/db';
import Report from '@/lib/server/models/Report';

// GET /api/reports/stats/summary
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Counts
    const totalReports = await Report.countDocuments();
    const criticalReports = await Report.countDocuments({ urgency: 'critical' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    // Category aggregations
    const categoryAgg = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Urgency aggregations
    const urgencyAgg = await Report.aggregate([
      { $group: { _id: '$urgency', count: { $sum: 1 } } }
    ]);

    // Default distribution mapping to return structure even if empty
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

    // Fill distributions
    categoryAgg.forEach((item) => {
      const key = item._id;
      if (key && key in categoryBreakdown) {
        categoryBreakdown[key] = item.count;
      }
    });

    urgencyAgg.forEach((item) => {
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

    return NextResponse.json({ success: true, data: summaryData });
  } catch (error: any) {
    console.error('[GET /api/reports/stats/summary Error]:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
