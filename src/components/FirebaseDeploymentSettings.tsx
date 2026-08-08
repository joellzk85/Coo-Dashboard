import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  Settings,
  Database,
  Github,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  FileCode,
  Terminal,
  ShieldCheck,
  Zap,
  GraduationCap
} from 'lucide-react';

export const FirebaseDeploymentSettings: React.FC = () => {
  const {
    isFirebaseSynced,
    exportDataJSON,
    importDataJSON,
    resetToDemoData
  } = useDashboard();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadBackup = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Next_Energy_COO_Dashboard_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const success = importDataJSON(importJsonText);
    if (success) {
      setImportStatus('Data imported successfully!');
      setImportJsonText('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Error importing data. Please check JSON format.');
    }
  };

  const firebaseJsonContent = `{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}`;

  const githubWorkflowContent = `name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '\${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '\${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: next-coo-dashboard`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Firebase & GitHub Architecture Header */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-xl">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Firebase Hosting & GitHub Actions Setup</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full production deployment pipeline for Next Energy & Next Academy COO Executive Dashboard.
              </p>
            </div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
            isFirebaseSynced
              ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}>
            <Database className="w-4 h-4" />
            <span>{isFirebaseSynced ? 'Firestore Live Synced' : 'Local Persistence (Hybrid Mode)'}</span>
          </div>
        </div>
      </section>

      {/* 2. Deployment File Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* firebase.json */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">1. firebase.json (Hosting Spec)</h3>
            </div>
            <button
              onClick={() => copyToClipboard(firebaseJsonContent, 'firebaseJson')}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              {copiedField === 'firebaseJson' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'firebaseJson' ? 'Copied' : 'Copy Spec'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Routes single-page application requests to <code className="text-emerald-300">index.html</code> for React client routing.
          </p>
          <pre className="bg-slate-950 text-[11px] text-emerald-300 p-3 rounded-xl border border-slate-800 overflow-x-auto font-mono">
            {firebaseJsonContent}
          </pre>
        </section>

        {/* GitHub Actions Workflow */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">2. GitHub Actions CI/CD Workflow</h3>
            </div>
            <button
              onClick={() => copyToClipboard(githubWorkflowContent, 'githubWorkflow')}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              {copiedField === 'githubWorkflow' ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'githubWorkflow' ? 'Copied' : 'Copy Workflow'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Saved at <code className="text-cyan-300">.github/workflows/firebase-hosting-merge.yml</code> for automated deployment on push to main.
          </p>
          <pre className="bg-slate-950 text-[11px] text-cyan-300 p-3 rounded-xl border border-slate-800 overflow-x-auto font-mono">
            {githubWorkflowContent}
          </pre>
        </section>
      </div>

      {/* 3. Data Management & Backup */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Executive Data Backup, Export & Import</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export & Reset */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-slate-200">Export & Backup State</h4>
            <p className="text-xs text-slate-400">
              Download complete snapshot of company goals, department goals, 121 sessions, KPI grades, and activity logs.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleDownloadBackup}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Backup</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('Reset all goals, 121s, and logs back to initial demo seed data?')) {
                    resetToDemoData();
                  }
                }}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Seed Data</span>
              </button>
            </div>
          </div>

          {/* Import JSON */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-bold text-slate-200">Import Data Snapshot</h4>
            <p className="text-xs text-slate-400">Paste JSON string below to restore snapshot:</p>

            <textarea
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Paste exported JSON here..."
              className="w-full bg-slate-900 text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={handleImportSubmit}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Snapshot</span>
              </button>

              {importStatus && (
                <span className="text-xs font-semibold text-emerald-400">{importStatus}</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
