'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Database, 
  Send, 
  LogOut, 
  LogIn,
  Menu,
  X,
  Lock,
  Search
} from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isInitialized, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Safe fallback if pathname is null
  const currentPath = pathname || '';

  // Check if current route belongs to Admin console
  const isAdminPage = currentPath.startsWith('/admin') || currentPath.startsWith('/reports');
  const showSidebar = isAdmin && isAdminPage;

  if (showSidebar) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Mobile Sticky Header */}
        <header className="bg-slate-900 text-white py-4 px-6 flex md:hidden items-center justify-between border-b border-slate-800 shadow-md sticky top-0 z-50 select-none">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-600 rounded-lg text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-sm font-bold tracking-tight">CrisisDesk AI</h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Sidebar Navigation */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out
          md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div>
            {/* Logo area */}
            <div className="p-6 border-b border-slate-850 flex items-center gap-3 select-none">
              <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight leading-none text-white">CrisisDesk AI</h1>
                <p className="text-[10px] text-slate-400 mt-1">Emergency Triage</p>
              </div>
            </div>

            {/* Menu Links */}
            <nav className="p-4 flex flex-col gap-2">
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 select-none">
                Admin Console
              </p>
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPath === '/admin' 
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20' 
                    : 'text-slate-355 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                Admin Dashboard
              </Link>
              <Link
                href="/reports"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  currentPath.startsWith('/reports') 
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20' 
                    : 'text-slate-355 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Database className="w-4 h-4 shrink-0" />
                Reports Directory
              </Link>

              <div className="h-px bg-slate-850 my-4" />

              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 select-none">
                Portals
              </p>
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-355 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <Send className="w-4 h-4 text-blue-400 shrink-0" />
                📢 Citizen Portal
              </Link>
            </nav>
          </div>

          {/* Session controls */}
          <div className="p-4 border-t border-slate-850 bg-slate-950/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/30 border border-slate-850 select-none">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-slate-200 truncate">Admin Session Active</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-950/20 hover:bg-red-900 border border-red-900/50 text-red-400 hover:text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout Session
            </button>
          </div>
        </aside>

        {/* Sidebar Mobile Overlay Backdrop */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
          />
        )}

        {/* Dynamic Page content */}
        <div className="flex-grow flex flex-col min-w-0">
          {children}
        </div>
      </div>
    );
  }

  // Citizen / Unauthenticated layout: Clean top brand header
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {currentPath !== '/login' && (
        <header className="bg-slate-900 text-white py-4 px-6 md:px-12 flex items-center justify-between border-b border-slate-800 shadow-md select-none sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight leading-none">CrisisDesk AI</h1>
              <p className="text-[10px] text-slate-400 mt-1">Emergency Triage System</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/track"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-all duration-200 shadow-sm cursor-pointer text-sm font-semibold flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Track Report</span>
            </Link>
            <Link
              href="/login"
              title="Admin Login"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-350 hover:text-white rounded-full transition-all duration-200 shadow-sm cursor-pointer"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>
        </header>
      )}
      <div className="flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
}
