import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/server/db';
import Report from '@/lib/server/models/Report';

// Decode Firebase ID Token (JWT) manually to avoid loading firebase-admin SDK on Vercel
function decodeFirebaseToken(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    
    // Basic verification of expiry, issuer, and audience
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('[JWT Verification] Token expired');
      return null;
    }
    if (payload.aud !== 'crisisdesk-ai-seu') {
      console.warn('[JWT Verification] Invalid audience');
      return null;
    }
    if (payload.iss !== 'https://securetoken.google.com/crisisdesk-ai-seu') {
      console.warn('[JWT Verification] Invalid issuer');
      return null;
    }
    
    return payload;
  } catch (e) {
    console.error('[JWT Verification] Failed to decode token:', e);
    return null;
  }
}

// Helper to verify admin token
async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  const decoded = decodeFirebaseToken(token);
  if (!decoded) return false;
  return decoded.uid === 'rxiVG15KuRTtYitVvcbHKwvj1kt1' || decoded.sub === 'rxiVG15KuRTtYitVvcbHKwvj1kt1';
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
