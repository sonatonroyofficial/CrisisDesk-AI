'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import { 
  ShieldAlert, 
  ArrowLeft, 
  AlertTriangle, 
  User, 
  Phone, 
  Globe, 
  Clock, 
  MapPin, 
  Lock, 
  Calendar,
  Layers,
  Sparkles,
  PlaySquare,
  Activity
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Check admin login status on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeToken = localStorage.getItem('crisisdesk_admin_token');
      setToken(activeToken);
      setIsAdmin(!!activeToken);
    }
  }, []);

  // Fetch Report Details
  const { data: report, isLoading, isError, error } = useQuery({
    queryKey: ['reportDetails', id],
    queryFn: () => api.getReportById(id),
    enabled: !!id,
  });

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: string) => api.updateReportStatus(id, newStatus),
    onSuccess: (updatedReport) => {
      // Invalidate query to refetch updated state
      queryClient.setQueryData(['reportDetails', id], updatedReport);
      queryClient.invalidateQueries({ queryKey: ['reportsList'] });
      queryClient.invalidateQueries({ queryKey: ['statsSummary'] });
    },
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatusMutation.mutate(e.target.value);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('crisisdesk_admin_token');
      setToken(null);
      setIsAdmin(false);
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 animate-pulse">
        <header className="bg-slate-900 h-16 w-full border-b border-slate-800" />
        <main className="flex-grow p-6 md:p-12 max-w-5xl mx-auto w-full">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 h-96 bg-white border border-slate-100 rounded-2xl" />
            <div className="h-80 bg-white border border-slate-100 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
        <header className="bg-slate-900 text-white py-4 px-6 flex items-center justify-between">
          <span className="font-bold">CrisisDesk AI</span>
          <Link href="/reports" className="flex items-center gap-1.5 text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to List
          </Link>
        </header>
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Report Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            {error instanceof Error ? error.message : 'The requested emergency report could not be found or has an invalid identifier.'}
          </p>
          <Link href="/reports" className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Return to Reports Directory
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6 md:px-12 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CrisisDesk AI</h1>
            <p className="text-xs text-slate-400">Report Inspector Console</p>
          </div>
        </div>

        <Link 
          href="/reports" 
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-sm font-medium rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to List</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-grow p-6 md:p-12 max-w-6xl mx-auto w-full">
        {/* Possible Duplicate Warning Banner */}
        {report.possibleDuplicate && report.matchedReportId && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Potential Duplicate Flagged</h4>
                <p className="text-xs mt-0.5">This report shares high textual similarity (&gt; 60%) with another recent report.</p>
              </div>
            </div>
            <Link 
              href={`/reports/${report.matchedReportId}`}
              className="self-start sm:self-center px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-xs font-bold rounded-xl border border-amber-250 transition-colors cursor-pointer shrink-0"
            >
              Inspect Original Report
            </Link>
          </div>
        )}

        {/* Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-350">{report._id}</span>
              <StatusBadge type="status" value={report.status} />
              <StatusBadge type="urgency" value={report.urgency} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 mt-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {report.location}
            </h2>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details (Left Col) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* AI Triage Classification Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                AI Triage Classification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 pb-6 border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-400">Classified Category</p>
                  <p className="text-lg font-bold text-slate-800 capitalize mt-1">
                    {report.category ? report.category.replace('_', ' ') : 'Unset'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Assigned Urgency</p>
                  <p className="text-lg font-bold text-slate-800 capitalize mt-1">
                    {report.urgency || 'Unset'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Model Confidence</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">
                    {report.confidence !== null ? `${(report.confidence * 100).toFixed(0)}%` : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400">Incident Abstract Summary (English)</p>
                <p className="text-sm font-medium text-slate-700 mt-2 bg-slate-50 p-4 rounded-xl leading-relaxed italic border border-slate-100">
                  &ldquo;{report.summary || 'AI classification pending or failed.'}&rdquo;
                </p>
              </div>
            </div>

            {/* Incident Description Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Original Incident Description</h3>
              <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>

            {/* Responder Suggested Action */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Recommended Response Protocol</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {report.suggestedAction || 'Deploy standard responders for verification.'}
              </p>
            </div>
          </div>

          {/* Right Column: Metadata & Admin Panel */}
          <div className="flex flex-col gap-6">
            
            {/* Admin Triage Status Controller Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Administrative Actions
              </h3>

              {isAdmin ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500 font-medium">Update Report Status</label>
                    <select
                      value={report.status}
                      onChange={handleStatusChange}
                      disabled={updateStatusMutation.isPending}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer capitalize disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="assigned">Assigned</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  {updateStatusMutation.isPending && (
                    <span className="text-[10px] text-blue-600 font-semibold animate-pulse self-end">Updating Status...</span>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="mt-2 text-center text-xs font-bold text-red-600 hover:text-red-800 transition-colors w-full cursor-pointer"
                  >
                    Logout Admin Session
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col items-center text-center gap-3">
                  <p className="text-xs text-slate-500 leading-normal">
                    You are currently viewing this record as a guest. Log in to change status.
                  </p>
                  <Link 
                    href="/login"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-950 transition-colors w-full"
                  >
                    Log In as Admin
                  </Link>
                </div>
              )}
            </div>

            {/* Reporter Information */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Reporter Information</h3>
              
              <ul className="flex flex-col gap-4 text-sm">
                <li className="flex items-center gap-3 text-slate-700">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Name</p>
                    <p className="font-semibold text-slate-800 mt-1">{report.name || 'Anonymous'}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Contact</p>
                    <p className="font-semibold text-slate-800 mt-1">{report.contact || 'No contact provided'}</p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Language</p>
                    <p className="font-semibold text-slate-800 mt-1 uppercase">{report.language}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Chronology & Metadata */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Chronology</h3>
              
              <ul className="flex flex-col gap-4 text-sm">
                <li className="flex items-center gap-3 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Created At</p>
                    <p className="font-semibold text-slate-800 mt-1 text-xs">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-none">Last Updated</p>
                    <p className="font-semibold text-slate-800 mt-1 text-xs">
                      {new Date(report.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400 mt-12 bg-white">
        <p>&copy; {new Date().getFullYear()} CrisisDesk AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
