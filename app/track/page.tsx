'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, Report } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import { Search, MapPin, AlertCircle, Phone, Clock, FileText } from 'lucide-react';

export default function TrackReportPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['trackReport', searchQuery],
    queryFn: () => api.getReports({ contact: searchQuery }),
    enabled: !!searchQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      setSearchQuery(phoneNumber.trim());
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      
      <main className="flex-grow p-6 md:p-12 max-w-4xl mx-auto w-full relative z-10 flex flex-col gap-8 pt-20">
        
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <Search className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Track Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Report</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
            Enter the contact number you provided during your emergency report submission to check its real-time status.
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative z-20">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter contact number (e.g. 017xxxxxxxx)"
                className="w-full pl-11 pr-4 py-4 bg-slate-950/60 border border-slate-800 focus:border-blue-500/70 hover:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-500 transition-all select-text"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !phoneNumber.trim()}
              className="py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:from-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {searchQuery && (
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Results for: <span className="text-blue-400">{searchQuery}</span>
            </h2>

            {isLoading && (
              <div className="text-center py-16 text-slate-500">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="font-medium tracking-wide">Searching databases...</p>
              </div>
            )}

            {isError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
                <p className="text-red-300 font-medium text-lg">Failed to retrieve records.</p>
                <p className="text-red-400/70 mt-2 text-sm">Please try again later or contact support.</p>
              </div>
            )}

            {data && data.reports.length === 0 && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-12 flex flex-col items-center justify-center text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Search className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No Reports Found</h3>
                <p className="text-slate-400 max-w-sm text-sm leading-relaxed">
                  We could not find any reports matching this contact number. Make sure the number matches exactly what you entered during submission.
                </p>
              </div>
            )}

            {data && data.reports.length > 0 && (
              <div className="grid gap-6">
                {data.reports.map((report: Report) => (
                  <div key={report._id} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/80 rounded-3xl p-6 md:p-8 hover:border-slate-700 hover:bg-slate-900/80 transition-all shadow-xl select-text">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <StatusBadge type="status" value={report.status} />
                          <StatusBadge type="urgency" value={report.urgency} />
                          {report.category && (
                            <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              {report.category.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Submitted on {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="md:text-right bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 w-full md:w-auto">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Incident Location</p>
                        <p className="text-sm font-semibold text-slate-200 flex items-center md:justify-end gap-1.5 leading-snug">
                          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                          {report.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/50">
                      <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 select-none">
                        <FileText className="w-4 h-4 text-indigo-400" /> Incident Details
                      </h4>
                      <p className="text-sm md:text-base text-slate-300 leading-relaxed italic">
                        &quot;{report.summary || report.description}&quot;
                      </p>
                    </div>

                    {report.status === 'resolved' && (
                      <div className="mt-5 p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl text-emerald-400 text-sm flex items-start gap-3 shadow-inner">
                        <div className="w-5 h-5 rounded-full bg-emerald-900/60 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <p className="leading-relaxed font-medium">
                          This incident has been fully resolved by our emergency response team. Thank you for reporting.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
