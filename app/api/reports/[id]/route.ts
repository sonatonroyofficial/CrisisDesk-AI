import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/server/db';
import Report from '@/lib/server/models/Report';
import '@/lib/server/firebaseAdmin'; // Initialize Firebase Admin SDK
import { getAuth } from 'firebase-admin/auth';

// Helper to verify admin token via Firebase Admin SDK
async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    // Enforce authorized admin UID check
    return decodedToken.uid === 'rxiVG15KuRTtYitVvcbHKwvj1kt1';
  } catch (err) {
    console.error('[Firebase Admin Token Verification Failed]:', err);
    return false;
  }
}

// GET /api/reports/[id] (Retrieve a single report details)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    console.error(`[GET /api/reports/${params.id} Error]:`, error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/reports/[id] (Delete a report - ADMIN ONLY)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    // Verify admin credentials
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const deletedReport = await Report.findByIdAndDelete(id);
    if (!deletedReport) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    console.error(`[DELETE /api/reports/${params.id} Error]:`, error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
