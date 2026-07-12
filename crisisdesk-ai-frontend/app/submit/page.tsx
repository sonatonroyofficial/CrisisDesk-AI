'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api, Report } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import { 
  ShieldAlert, 
  Send, 
  MapPin, 
  FileText, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function CitizenSubmitPage() {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  const submitMutation = useMutation({
    mutationFn: () => api.createReport({
      description,
      location,
      name: name || undefined,
      contact: contact || undefined,
      language: 'en',
    }),
    onSuccess: (data) => {
      setSubmittedReport(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !location) return;
    submitMutation.mutate();
  };

  const handleReset = () => {
    setDescription('');
    setLocation('');
    setName('');
    setContact('');
    setSubmittedReport(null);
    submitMutation.reset();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <main className="flex-grow p-6 md:p-12 max-w-3xl mx-auto w-full flex flex-col justify-center">
        {submittedReport ? (
          /* Success Screen */
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md flex flex-col gap-6">
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Report Submitted Successfully</h2>
                <p className="text-xs text-slate-400">Classified and triaged by CrisisDesk AI in real-time.</p>
              </div>
            </div>

            {/* AI Classification Summary Card */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 flex flex-col gap-4">
              <div className="flex items-center gap-2 flex-wrap select-none">
                <StatusBadge type="status" value={submittedReport.status} />
                <StatusBadge type="urgency" value={submittedReport.urgency} />
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Summary Abstract</p>
                <p className="text-sm font-medium text-slate-700 mt-1 italic leading-relaxed">
                  &ldquo;{submittedReport.summary || 'Triage summary failed or pending.'}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category</p>
                  <p className="text-sm font-bold text-slate-800 capitalize mt-0.5">
                    {submittedReport.category ? submittedReport.category.replace('_', ' ') : 'Unset'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    {submittedReport.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Duplicate Flag Alert */}
            {submittedReport.possibleDuplicate && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>Notice:</strong> This incident matches an existing report within our Jaccard threshold. Our dispatch team is merging this with the active response file.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 transition-all cursor-pointer"
              >
                File Another Report
              </button>
              <Link
                href="/"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Emergency Citizen Portal</h2>
              <p className="text-sm text-slate-500 mt-1">Submit public safety concerns, hazards, or incidents for immediate AI classification and response triage.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Incident Location <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Banani Road 11, near Sector 4 Market"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Description of Emergency <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is happening? Describe the situation (You can write in English, Bangla, or mixed)"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Optional Grid (Name / Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Contact Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="e.g. +8801900000000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitMutation.isPending || !description || !location}
                className="w-full py-3 mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitMutation.isPending ? 'Submitting & Classifying Triage...' : 'Submit Emergency Report'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
        <p>&copy; {new Date().getFullYear()} CrisisDesk AI. Citizen emergency reporting portal.</p>
      </footer>
    </div>
  );
}
