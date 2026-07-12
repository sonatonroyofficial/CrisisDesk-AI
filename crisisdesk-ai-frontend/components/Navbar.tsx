'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { ShieldAlert, LogOut, LogIn, LayoutDashboard, Database, Send } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout } = useAuth();

  // Don't render global navbar on the login page itself
  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  return (
    <header className="bg-slate-900 text-white py-4 px-6 md:px-12 flex items-center justify-between border-b border-slate-800 shadow-md select-none">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight leading-none">CrisisDesk AI</h1>
            <p className="text-[10px] text-slate-400 mt-1">Emergency Triage System</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {/* User Side Link */}
          <Link 
            href="/submit" 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${pathname === '/submit' ? 'text-white bg-blue-600/40 border border-blue-500/50' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
          >
            <Send className="w-4 h-4 text-blue-400" />
            <span>📢 Citizen Portal</span>
          </Link>

          <span className="h-4 w-px bg-slate-850" />

          {/* Admin Side Links */}
          <Link 
            href="/" 
            className={`flex items-center gap-1.5 transition-colors ${pathname === '/' ? 'text-blue-400 font-bold' : 'text-slate-350 hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Dashboard
          </Link>
          <Link 
            href="/reports" 
            className={`flex items-center gap-1.5 transition-colors ${pathname.startsWith('/reports') ? 'text-blue-400 font-bold' : 'text-slate-350 hover:text-white'}`}
          >
            <Database className="w-4 h-4" />
            Reports Directory
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Mobile quick links */}
        <div className="flex md:hidden items-center gap-3 text-xs font-semibold mr-2">
          <Link href="/submit" className={pathname === '/submit' ? 'text-blue-400' : 'text-slate-300'}>
            Report 📢
          </Link>
          <Link href="/" className={pathname === '/' ? 'text-blue-400' : 'text-slate-300'}>
            Dashboard
          </Link>
          <Link href="/reports" className={pathname.startsWith('/reports') ? 'text-blue-400' : 'text-slate-300'}>
            Directory
          </Link>
        </div>

        {/* Admin Session Panel */}
        {isAdmin ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-900/50">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Admin
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 border border-red-900 text-red-400 hover:bg-red-900 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            Admin Login
          </Link>
        )}
      </div>
    </header>
  );
}
