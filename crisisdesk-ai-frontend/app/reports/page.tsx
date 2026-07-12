'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import FilterBar from '@/components/FilterBar';
import StatusBadge from '@/components/StatusBadge';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function ReportsListPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated as admin
  React.useEffect(() => {
    if (!isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, router]);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch Reports list matching filters
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reportsList', { search, category, urgency, status, fromDate, toDate, page }],
    queryFn: () => api.getReports({
      search,
      category,
      urgency,
      status,
      from: fromDate ? new Date(fromDate).toISOString() : undefined,
      to: toDate ? new Date(toDate).toISOString() : undefined,
      page,
      limit
    }),
    enabled: isAdmin, // Only query backend if admin session is active
    placeholderData: (previousData) => previousData,
  });

  if (!isAdmin) {
    return null;
  }

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setUrgency('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const totalReports = data?.total || 0;
  const totalPages = Math.ceil(totalReports / limit) || 1;

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Main Container */}
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">Incident Directory</h2>
          <p className="text-sm text-slate-500 mt-1">Browse, filter, and inspect incoming emergency triage reports.</p>
        </div>

        {/* Filters bar */}
        <FilterBar
          search={search}
          setSearch={(val) => { setSearch(val); setPage(1); }}
          category={category}
          setCategory={(val) => { setCategory(val); setPage(1); }}
          urgency={urgency}
          setUrgency={(val) => { setUrgency(val); setPage(1); }}
          status={status}
          setStatus={(val) => { setStatus(val); setPage(1); }}
          fromDate={fromDate}
          setFromDate={(val) => { setFromDate(val); setPage(1); }}
          toDate={toDate}
          setToDate={(val) => { setToDate(val); setPage(1); }}
          onReset={handleResetFilters}
        />

        {/* Error Callout */}
        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl text-red-800 text-sm">
            <p className="font-bold">Error Loading Reports</p>
            <p className="text-xs mt-1">{error instanceof Error ? error.message : 'Unknown Connection Error'}</p>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-150 text-xs font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Urgency</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Duplicate?</th>
                  <th className="py-4 px-6">Submitted At</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-2/3" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-1/2" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-12" /></td>
                      <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                      <td className="py-4 px-6 text-right"><div className="h-4 bg-slate-100 rounded w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : data?.reports && data.reports.length > 0 ? (
                  data.reports.map((report) => (
                    <tr 
                      key={report._id} 
                      className="hover:bg-slate-50/50 transition-colors duration-150 group"
                    >
                      <td className="py-4 px-6 font-medium text-slate-900 max-w-xs truncate">
                        {report.location}
                      </td>
                      <td className="py-4 px-6 capitalize">
                        {report.category ? report.category.replace('_', ' ') : <span className="text-slate-300 italic">Unset</span>}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge type="urgency" value={report.urgency} />
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge type="status" value={report.status} />
                      </td>
                      <td className="py-4 px-6">
                        {report.possibleDuplicate ? (
                          <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-semibold border border-red-200">
                            <AlertTriangle className="w-3. h-3." />
                            Duplicate
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {new Date(report.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link 
                          href={`/reports/${report._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No reports found matching the active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="py-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 select-none">
            <span className="text-xs text-slate-500 font-medium">
              Showing Page <span className="font-bold text-slate-800">{page}</span> of <span className="font-bold text-slate-800">{totalPages}</span> ({totalReports} Total Reports)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={page === 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages || isLoading || totalReports === 0}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-slate-50/50">
        <p>&copy; {new Date().getFullYear()} CrisisDesk AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
