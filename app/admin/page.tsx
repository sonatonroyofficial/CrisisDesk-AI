'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { api } from '@/lib/api';
import StatCard from '@/components/StatCard';
import CategoryBarChart from '@/components/CategoryBarChart';
import UrgencyPieChart from '@/components/UrgencyPieChart';
import { 
  FileText, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { isAdmin, isInitialized } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated (only after auth context is fully initialized)
  React.useEffect(() => {
    if (isInitialized && !isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, isInitialized, router]);

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['statsSummary'],
    queryFn: () => api.getStatsSummary(),
    enabled: isAdmin, // Only fetch stats if admin session is active
    refetchInterval: 10000,
  });

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Main Container */}
      <main className="flex-grow p-6 md:p-12 max-w-7xl mx-auto w-full">
        {/* Title Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">System Metrics Dashboard</h2>
            <p className="text-sm text-slate-500 mt-1">Real-time summaries and classification analysis of incoming citizen reports.</p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {isRefetching && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                Syncing...
              </span>
            )}
            
            <button 
              onClick={() => refetch()} 
              disabled={isLoading || isRefetching}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Callout */}
        {isError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Connection Failed</h4>
              <p className="text-xs mt-1">
                Unable to retrieve statistics from the backend server ({error instanceof Error ? error.message : 'Unknown Connection Error'}). 
                Please ensure your Express server is running on port 3000 and MongoDB is active.
              </p>
              <button 
                onClick={() => refetch()}
                className="mt-3 px-3 py-1 bg-red-100 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Loading / Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 h-28 animate-pulse flex flex-col justify-between">
                <div className="h-4 bg-slate-100 rounded w-2/3" />
                <div className="h-8 bg-slate-100 rounded w-1/3" />
              </div>
            ))
          ) : (
            <>
              <StatCard 
                title="Total Reports" 
                value={data?.totalReports || 0} 
                icon={<FileText className="w-6 h-6 text-slate-500" />}
                colorClass="text-slate-900"
              />
              <StatCard 
                title="Critical Incidents" 
                value={data?.criticalReports || 0} 
                icon={<AlertOctagon className="w-6 h-6 text-red-500 animate-pulse" />}
                colorClass="text-red-600"
              />
              <StatCard 
                title="Pending Triage" 
                value={data?.pendingReports || 0} 
                icon={<Clock className="w-6 h-6 text-amber-500" />}
                colorClass="text-amber-600"
              />
              <StatCard 
                title="Resolved Cases" 
                value={data?.resolvedReports || 0} 
                icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                colorClass="text-emerald-600"
              />
            </>
          )}
        </div>

        {/* Loading / Charts Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-white border border-slate-100 rounded-2xl animate-pulse" />
            <div className="h-96 bg-white border border-slate-100 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <CategoryBarChart data={data?.categoryBreakdown || {}} />
            </div>
            <div>
              <UrgencyPieChart data={data?.urgencyBreakdown || {}} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} CrisisDesk AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
