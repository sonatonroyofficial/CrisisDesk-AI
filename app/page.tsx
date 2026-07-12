'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { api, Report } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import { 
  Send, 
  MapPin, 
  FileText, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function CitizenSubmitPage() {
  const { isAdmin } = useAuth();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [showAdvice, setShowAdvice] = useState(false);

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
    setShowAdvice(false);
    submitMutation.reset();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none">
      {/* Premium Ambient Background Light Glows */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Subtle Developer Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full flex items-center justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          
          {/* Left Column: Platform Branding & Features */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-800/40 rounded-full text-blue-400 text-xs font-semibold self-start shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Live Emergency Dispatch Portal</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
              AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-indigo-400">
                Crisis Dispatch
              </span>
            </h1>

            <p className="text-slate-400 text-sm md:text-[15px] leading-relaxed max-w-md">
              CrisisDesk AI integrates natural language understanding to immediately analyze, categorize, and deduplicate emergency reports from citizens—helping response teams prioritize life-saving actions.
            </p>

            {/* Premium Bullet Features list */}
            <div className="flex flex-col gap-6 mt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Real-Time Classification</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Instantly groups reports into fire, flood, utilities, or medical emergencies.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  <Zap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Automated Severity Triage</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Directs attention to critical threats first based on semantic description analysis.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Duplicate Incident Merging</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Correlates nearby reports to prevent dispatcher dashboard congestion.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Portal form card */}
          <div className="lg:col-span-7 w-full">
            {submittedReport ? (
              /* Success Screen */
              <div className="bg-slate-900/40 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl flex flex-col gap-6">
                <div className="flex items-center gap-4 text-emerald-400 mb-2">
                  <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-900/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Incident Report Filed</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Categorized and queued for response teams.</p>
                  </div>
                </div>

                {/* AI Triage Details Box */}
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-900 flex flex-col gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge type="status" value={submittedReport.status} />
                    <StatusBadge type="urgency" value={submittedReport.urgency} />
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI Generated Abstract</p>
                    <p className="text-sm font-medium text-slate-350 mt-1.5 italic leading-relaxed">
                      &ldquo;{submittedReport.summary || 'Summary processing pending.'}&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Category</p>
                      <p className="text-sm font-bold text-slate-200 capitalize mt-1">
                        {submittedReport.category ? submittedReport.category.replace('_', ' ') : 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Incident Location</p>
                      <p className="text-sm font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        {submittedReport.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Duplicate Merging Banner */}
                {submittedReport.possibleDuplicate && (
                  <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <p className="leading-relaxed">
                      <strong>Duplicate Detected:</strong> A similar incident was reported nearby. Our response coordinators are merging these files to coordinate assets.
                    </p>
                  </div>
                )}

                {/* What to do right now Button */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvice(!showAdvice)}
                    className="w-full py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 focus:outline-none rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-amber-500/5"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>{showAdvice ? 'Hide Safety Instructions' : 'What should I do right now? / এই মুহূর্তে আপনার করণীয় কী?'}</span>
                  </button>

                  {showAdvice && (
                    <div className="mt-3 p-5 bg-slate-950/50 border border-amber-500/20 rounded-2xl animate-fade-in select-text">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 select-none">
                        <HeartHandshake className="w-3.5 h-3.5" />
                        Immediate Action Guide
                      </h4>
                      <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap italic">
                        {submittedReport.citizenAdvice || "Stay calm. Keep away from immediate danger. If safe, administer first-aid and wait for emergency services to arrive."}
                      </p>
                    </div>
                  )}
                </div>

                 <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white font-semibold rounded-xl text-sm border border-slate-800 transition-all cursor-pointer text-center"
                  >
                    File Another Report
                  </button>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/10"
                    >
                      Go to Admin Console
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Submission Form */
              <div className="bg-slate-900/30 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-white/5 shadow-2xl">
                <div className="mb-8">
                  <h2 className="text-xl font-bold tracking-tight text-white">Emergency Citizen Portal</h2>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Provide precise location and incident details below. CrisisDesk AI parses and triages your report automatically.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Location input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      Incident Location <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dhanmondi Lake, near Bridge 3"
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 focus:border-blue-500/70 hover:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-650 transition-all"
                    />
                  </div>

                  {/* Description input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      Description of Emergency <span className="text-red-500 font-bold">*</span>
                    </label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is happening? (You can write in English, Bangla, or mixed)"
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-855 focus:border-blue-500/70 hover:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-650 transition-all resize-none"
                    />
                  </div>

                  {/* Optional Grid (Name / Phone) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter name"
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 focus:border-blue-500/70 hover:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-650 transition-all"
                      />
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        Contact Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="e.g. 017xxxxxxxx"
                        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-850 focus:border-blue-500/70 hover:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-650 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitMutation.isPending || !description || !location}
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-600 hover:to-rose-600 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-950/10 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" />
                    {submitMutation.isPending ? 'Submitting & Triaging...' : 'Submit Emergency Report'}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900/60 text-center text-[11px] text-slate-600 z-10 relative">
        <p>&copy; {new Date().getFullYear()} CrisisDesk AI. Citizen emergency reporting portal.</p>
      </footer>
    </div>
  );
}
