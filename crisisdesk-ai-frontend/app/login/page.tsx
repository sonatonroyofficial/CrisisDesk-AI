'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ShieldAlert, ArrowLeft, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Sign in using Firebase client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Enforce admin UID check on client-side
      if (user.uid !== 'rxiVG15KuRTtYitVvcbHKwvj1kt1') {
        throw new Error('Access denied: You are not registered as an authorized administrator.');
      }

      // Retrieve the Firebase JWT ID Token
      const token = await user.getIdToken();
      
      // Store the token globally via context
      login(token);
      
      // Redirect to protected dashboard
      router.push('/admin');
    } catch (err: any) {
      // Surface the actual Firebase error code for easier debugging
      const code = err?.code || '';
      let msg = `Authentication failed. (${code || err?.message || 'Unknown error'})`;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please verify your Firebase credentials.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Please wait a moment and try again.';
      } else if (code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is disabled in Firebase Console. Please enable it under Authentication → Sign-in method.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network error — please check your internet connection.';
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      {/* Back to Home Link */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors select-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Citizen Portal
      </Link>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-md">
        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-8 select-none">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-sm mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Admin Authentication</h2>
          <p className="text-xs text-slate-400 mt-1.5">Verify administrator credentials to access triage status tools.</p>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded-2xl flex items-start gap-2.5 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Authentication Failed</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sonaton.fl@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? 'Authenticating Session...' : 'Log In As Admin'}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 select-none">
        <p>&copy; {new Date().getFullYear()} CrisisDesk AI. Security console access.</p>
      </div>
    </div>
  );
}
