import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  UploadCloud,
  DownloadCloud,
  Activity,
  Database,
  Smartphone,
  Laptop,
  Tablet,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    syncStatus,
    lastSyncedAt,
    syncError,
    diagnostics,
    forceRefreshFromCloud,
    forcePushAllToCloud,
    testCloudConnection,
    cleanSlateAllData,
    resetToDemoData,
  } = useDashboard();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; latencyMs: number; message: string } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCleanSlate = async () => {
    if (window.confirm('Are you sure you want to Clean Slate? This will wipe all goals, logs, and sessions from Cloud Firestore and set a fresh, empty workspace.')) {
      setIsWiping(true);
      setActionNotice(null);
      const success = await cleanSlateAllData();
      setIsWiping(false);
      if (success) {
        setActionNotice('Clean slate complete! All records have been cleared to a clean workspace.');
      } else {
        setActionNotice('Failed to wipe data. Please check connection.');
      }
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset all goals and records back to initial demo dataset?')) {
      setIsWiping(true);
      setActionNotice(null);
      await resetToDemoData();
      setIsWiping(false);
      setActionNotice('Demo dataset loaded successfully.');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setActionNotice(null);
    const success = await forceRefreshFromCloud();
    setIsRefreshing(false);
    if (success) {
      setActionNotice('Successfully fetched the latest data from Cloud Firestore.');
    } else {
      setActionNotice('Failed to fetch from Cloud Firestore. Check connection.');
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    setActionNotice(null);
    const success = await forcePushAllToCloud();
    setIsPushing(false);
    if (success) {
      setActionNotice('Successfully synchronized all local items to Cloud Firestore.');
    } else {
      setActionNotice('Failed to push to Cloud Firestore.');
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testCloudConnection();
    setIsTesting(false);
    setTestResult(res);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Not synced yet';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Cross-Device Cloud Sync
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Single-user executive workspace synced in real-time across your phone, tablet, and desktop.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
              syncStatus === 'synced'
                ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                : syncStatus === 'syncing'
                ? 'bg-blue-950/30 border-blue-800/50 text-blue-200'
                : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {syncStatus === 'synced' && <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />}
              {syncStatus === 'syncing' && <RefreshCw className="w-6 h-6 text-blue-400 animate-spin shrink-0" />}
              {syncStatus === 'error' && <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />}
              <div>
                <div className="font-bold text-sm text-white">
                  {syncStatus === 'synced' && 'Real-Time Sync Connected & Active'}
                  {syncStatus === 'syncing' && 'Synchronizing with Cloud Firestore...'}
                  {syncStatus === 'error' && 'Sync Encountered an Error'}
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  Last cloud sync check: <span className="font-semibold text-white">{formatLastSync(lastSyncedAt)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleTest}
              disabled={isTesting}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              <Activity className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse text-blue-400' : 'text-slate-400'}`} />
              {isTesting ? 'Testing...' : 'Ping Test'}
            </button>
          </div>

          {/* Test or Action feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs border flex items-center justify-between ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                  : 'bg-red-950/40 border-red-800/60 text-red-300'
              }`}
            >
              <span className="font-medium">{testResult.message}</span>
              {testResult.success && (
                <span className="font-mono font-bold bg-emerald-900/60 px-2 py-0.5 rounded text-[11px]">
                  {testResult.latencyMs} ms
                </span>
              )}
            </div>
          )}

          {actionNotice && (
            <div className="p-3 rounded-lg text-xs border bg-blue-950/40 border-blue-800/60 text-blue-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
          )}

          {syncError && (
            <div className="p-3 rounded-lg text-xs border bg-red-950/40 border-red-800/60 text-red-300">
              <span className="font-bold">Error Details: </span>
              {syncError}
            </div>
          )}

          {/* Device Ecosystem */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Single-User Multi-Device Sync Engine
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 flex flex-col items-center gap-1.5">
                <Laptop className="w-5 h-5 text-blue-400" />
                <div className="text-xs font-bold text-slate-200">Laptop / Desktop</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                </div>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 flex flex-col items-center gap-1.5">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div className="text-xs font-bold text-slate-200">Mobile Phone</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                </div>
              </div>
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 flex flex-col items-center gap-1.5">
                <Tablet className="w-5 h-5 text-purple-400" />
                <div className="text-xs font-bold text-slate-200">Tablet / iPad</div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                </div>
              </div>
            </div>
          </div>

          {/* Live Records Count */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Synced Collections State</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Firestore Host</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Company Goals</div>
                <div className="text-sm font-bold text-white mt-0.5">{diagnostics.companyGoalsCount} items</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Dept Goals</div>
                <div className="text-sm font-bold text-white mt-0.5">{diagnostics.departmentGoalsCount} items</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">121 Sessions</div>
                <div className="text-sm font-bold text-white mt-0.5">{diagnostics.sessions121Count} items</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Activity Logs</div>
                <div className="text-sm font-bold text-white mt-0.5">{diagnostics.activityLogsCount} items</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Reflections</div>
                <div className="text-sm font-bold text-white mt-0.5">{diagnostics.reflectionsCount} items</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Reading Logs</div>
                <div className="text-sm font-bold text-white mt-0.5">{diagnostics.readingLogsCount} items</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Personal / Bible</div>
                <div className="text-sm font-bold text-white mt-0.5">{diagnostics.personalGoalsCount} items</div>
              </div>
              <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Wellness Logs</div>
                <div className="text-sm font-bold text-white mt-0.5">{diagnostics.wellnessLogsCount} items</div>
              </div>
            </div>
          </div>

          {/* Sync Control Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isWiping}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.98]"
            >
              <DownloadCloud className={`w-4 h-4 ${isRefreshing ? 'animate-bounce text-blue-400' : 'text-slate-400'}`} />
              {isRefreshing ? 'Fetching from Cloud...' : 'Force Refresh from Cloud'}
            </button>

            <button
              onClick={handlePush}
              disabled={isPushing || isWiping}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <UploadCloud className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
              {isPushing ? 'Pushing to Cloud...' : 'Force Push All to Cloud'}
            </button>
          </div>

          {/* Database Workspace Actions */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <button
              onClick={handleCleanSlate}
              disabled={isWiping}
              className="py-2 px-3 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              {isWiping ? 'Wiping...' : '🧹 Clean Slate (Wipe All to Zero)'}
            </button>

            <button
              onClick={handleResetDemo}
              disabled={isWiping}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors"
            >
              🔄 Load Demo Seed Data
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Database: <code className="text-slate-300 font-mono text-[11px]">ai-studio-cooexecutivedash</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
