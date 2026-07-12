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

// PATCH /api/reports/[id]/status (Triage status update - ADMIN ONLY)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, message: 'Report not found.' }, { status: 404 });
    }

    // Verify admin credentials
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    const allowedStatuses = ['pending', 'in_review', 'assigned', 'resolved', 'rejected'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value. Allowed values: pending, in_review, assigned, resolved, rejected.' },
        { status: 400 }
      );
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedReport) {
      return NextResponse.json({ success: false, message: 'Report not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedReport });
  } catch (error: any) {
    console.error(`[PATCH /api/reports/${params.id}/status Error]:`, error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
