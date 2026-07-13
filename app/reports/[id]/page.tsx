'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import { 
  ArrowLeft, 
  AlertTriangle, 
  User, 
  Phone, 
  Globe, 
  Clock, 
  MapPin, 
  Lock, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    category: '',
    urgency: '',
    location: '',
    description: '',
    name: '',
    contact: ''
  });

  const { token, isAdmin, isInitialized, logout } = useAuth();

  // Redirect to login if not authenticated as admin
  useEffect(() => {
    if (isInitialized && !isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, isInitialized, router]);

  // Fetch Report Details
  const { data: report, isLoading, isError, error } = useQuery({
    queryKey: ['reportDetails', id],
    queryFn: () => api.getReportById(id),
    enabled: !!id && isAdmin,
  });

  useEffect(() => {
    if (report) {
      setEditForm({
        category: report.category || '',
        urgency: report.urgency || '',
        location: report.location || '',
        description: report.description || '',
        name: report.name || '',
        contact: report.contact || ''
      });
    }
  }, [report]);

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

  const updateReportMutation = useMutation({
    mutationFn: (data: any) => api.updateReport(id, data),
    onSuccess: (updatedReport) => {
      queryClient.setQueryData(['reportDetails', id], updatedReport);
      queryClient.invalidateQueries({ queryKey: ['reportsList'] });
      queryClient.invalidateQueries({ queryKey: ['statsSummary'] });
      setIsEditing(false);
    }
  });

  const deleteReportMutation = useMutation({
    mutationFn: () => api.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportsList'] });
      queryClient.invalidateQueries({ queryKey: ['statsSummary'] });
      router.push('/reports');
    }
  });

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateStatusMutation.mutate(e.target.value);
  };

  const handleSaveEdit = () => {
    updateReportMutation.mutate(editForm);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      deleteReportMutation.mutate();
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 animate-pulse">
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
        <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Report Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            {error instanceof Error ? error.message : 'The requested emergency report could not be found.'}
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
      {/* Main Container */}
      <main className="flex-grow p-6 md:p-12 max-w-6xl mx-auto w-full">
        {/* Breadcrumb Back Button */}
        <div className="mb-6 select-none">
          <Link 
            href="/reports" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Directory
          </Link>
        </div>

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
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-xs font-bold rounded-xl border border-amber-250 transition-colors cursor-pointer"
            >
              Inspect Original Report
            </Link>
          </div>
        )}

        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap select-none">
            <span className="text-xs font-mono bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg border border-slate-350">{report._id}</span>
            <StatusBadge type="status" value={report.status} />
            <StatusBadge type="urgency" value={report.urgency} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 mt-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {report.location}
          </h2>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details (Left Col) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {isEditing ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-2">Edit Report Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      <option value="">Unset</option>
                      <option value="medical">Medical</option>
                      <option value="fire">Fire</option>
                      <option value="accident">Accident</option>
                      <option value="crime">Crime</option>
                      <option value="flood">Flood</option>
                      <option value="utility">Utility</option>
                      <option value="public_service">Public Service</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Urgency</label>
                    <select
                      value={editForm.urgency}
                      onChange={(e) => setEditForm({ ...editForm, urgency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      <option value="">Unset</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500">Description</label>
                  <textarea
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Reporter Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500">Contact Number</label>
                    <input
                      type="text"
                      value={editForm.contact}
                      onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateReportMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {updateReportMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
                  
                  <div className="h-px bg-slate-100 w-full my-1" />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Details'}
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteReportMutation.isPending}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deleteReportMutation.isPending ? 'Deleting...' : 'Delete Report'}
                    </button>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="mt-2 text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors w-full cursor-pointer border-none bg-transparent"
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
