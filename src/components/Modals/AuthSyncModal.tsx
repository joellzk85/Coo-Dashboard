import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Cloud,
  X,
  Smartphone,
  Key,
  Mail,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  LogOut,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';

interface AuthSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthSyncModal: React.FC<AuthSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    signInWithGoogle,
    signInWithEmail,
    signInWithSyncPasscode,
    signOutUser,
    syncStatus,
    seedUserDataToCloud
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<'passcode' | 'google' | 'email'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter a passcode');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithSyncPasscode(passcode);
      setSuccessMsg(`Successfully connected to Cloud Sync Passcode: "${passcode.trim()}"`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to sync with passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail(email, password, isSignUp);
      setSuccessMsg(isSignUp ? 'Account created and synced!' : 'Signed in successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transition-all duration-200 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl shadow-md text-white">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Cross-Device Cloud Sync
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sync COO Dashboard instantly between PC, Phone, and Tablet
              </p>
            </div>
          </div>

          {/* Current Device Status */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud Sync Active
              </span>
            </div>

            <div className="text-slate-400 text-[11px] font-mono">
              {user?.email ? user.email : user?.isAnonymous ? `Guest ID: ${user.uid.slice(0, 8)}...` : 'Connecting...'}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sync Mode Selector Tabs */}
          <div>
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600 gap-1">
              <button
                onClick={() => { setActiveTab('passcode'); setError(null); }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'passcode'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Sync Passcode</span>
              </button>

              <button
                onClick={() => { setActiveTab('google'); setError(null); }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'google'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Google Account</span>
              </button>

              <button
                onClick={() => { setActiveTab('email'); setError(null); }}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'email'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-slate-600" />
                <span>Email Login</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Sync Passcode */}
          {activeTab === 'passcode' && (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-xl text-xs text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  Pair PC & Phone in 1-Click
                </div>
                <p className="leading-relaxed text-blue-800">
                  Create or enter a shared passcode (e.g. <span className="font-mono bg-blue-100 px-1 py-0.5 rounded text-blue-950 font-bold">COO-2026</span>). Enter the same code on your phone to instantly sync all dashboard goals, 121 logs, and wellness entries!
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Your Sync Passcode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="e.g. MY-COO-DASHBOARD-2026"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                <span>Connect & Sync Device</span>
              </button>
            </form>
          )}

          {/* Tab 2: Google Sign-In */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl text-xs text-amber-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Secure Google Authentication
                </div>
                <p className="leading-relaxed text-amber-800">
                  Sign in with your Google account on PC and Phone. All your data will automatically attach to your Google profile and update in real time.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </button>
            </div>
          )}

          {/* Tab 3: Email & Password */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="coo@company.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Register"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                <span>{isSignUp ? 'Create Cloud Account' : 'Sign In & Sync'}</span>
              </button>
            </form>
          )}

          {/* Account Details & Management Footer */}
          <div className="pt-4 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Active User ID:</span>
                <span className="font-mono text-[10px] text-slate-500 break-all">{user?.uid}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUid}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-medium text-[11px] flex items-center gap-1 transition-colors shrink-0 ml-2"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={seedUserDataToCloud}
                className="text-xs text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer"
              >
                Re-seed Demo Data to Cloud
              </button>

              {user && !user.isAnonymous && (
                <button
                  type="button"
                  onClick={signOutUser}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
