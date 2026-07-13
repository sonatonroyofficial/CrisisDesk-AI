import mongoose, { Schema, Document } from 'mongoose';

export type LanguageType = 'bn' | 'en' | 'unknown';
export type CategoryType = 'medical' | 'fire' | 'accident' | 'crime' | 'flood' | 'utility' | 'public_service' | 'infrastructure' | 'other';
export type UrgencyType = 'low' | 'medium' | 'high' | 'critical';
export type StatusType = 'pending' | 'in_review' | 'assigned' | 'resolved' | 'rejected';

export interface IReport extends Document {
  name?: string;
  contact?: string;
  location: string;
  description: string;
  language: LanguageType;
  category: CategoryType | null;
  urgency: UrgencyType | null;
  summary: string | null;
  suggestedAction: string | null;
  citizenAdvice: string | null;
  confidence: number | null;
  possibleDuplicate: boolean;
  matchedReportId: mongoose.Types.ObjectId | null;
  duplicateReason?: string | null;
  status: StatusType;
  embedding?: number[] | null;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema<IReport>(
  {
    name: {
      type: String,
      default: null,
    },
    contact: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ['bn', 'en', 'unknown'],
      default: 'unknown',
    },
    category: {
      type: String,
      enum: ['medical', 'fire', 'accident', 'crime', 'flood', 'utility', 'public_service', 'infrastructure', 'other', null],
      default: null,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', null],
      default: null,
    },
    summary: {
      type: String,
      default: null,
    },
    suggestedAction: {
      type: String,
      default: null,
    },
    citizenAdvice: {
      type: String,
      default: null,
    },
    confidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },
    possibleDuplicate: {
      type: Boolean,
      default: false,
    },
    matchedReportId: {
      type: Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },
    duplicateReason: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_review', 'assigned', 'resolved', 'rejected'],
      default: 'pending',
    },
    embedding: {
      type: [Number],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Add a text index on description, ignoring 'language' field for override
ReportSchema.index({ description: 'text' }, { language_override: 'none' });

// Add a compound index on (location, category, createdAt)
ReportSchema.index({ location: 1, category: 1, createdAt: 1 });

// Check if model already compiled to prevent OverwriteModelError in Next.js development HMR
export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
