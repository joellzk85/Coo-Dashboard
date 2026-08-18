import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  TrendingUp,
  Building2,
  Users,
  Award,
  Zap,
  GraduationCap,
  Plus,
  Calendar,
  Layers,
  HeartPulse,
  RotateCcw,
  Cloud,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'goals' | 'roadmap' | '121s' | 'wellness' | 'performance';
  setActiveTab: (tab: 'goals' | 'roadmap' | '121s' | 'wellness' | 'performance') => void;
  onOpenQuickAdd: (type: '121' | 'companyGoal' | 'deptGoal' | 'activity' | 'journal' | 'addHod') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenQuickAdd }) => {
  const {
    selectedCompany,
    setSelectedCompany,
    selectedMonth,
    setSelectedMonth,
    syncStatus,
    resetToDemoData
  } = useDashboard();

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Brand & Companies */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black tracking-wider text-lg shadow-sm">
                <Zap className="w-5 h-5 fill-white" />
                <span>NEXT GROUP</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">COO Executive Dashboard</h1>
                  <span className="bg-slate-800 text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-slate-700">
                    Leadership Suite
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-blue-400">
                    <Zap className="w-3 h-3" /> Next Energy
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <GraduationCap className="w-3 h-3" /> Next Academy
                  </span>
                </div>
              </div>
            </div>

            {/* Controls: Live Sync Badge + Company Filter + Month Selector + Quick Add */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Live Auto-Sync Status Badge */}
              <div
                title="All changes are automatically synced to Cloud Firestore in real-time across all your devices."
                className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs shadow-sm select-none"
              >
                {syncStatus === 'synced' && (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Cloud className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                    <span className="text-[11px] font-semibold text-emerald-400">Live Auto-Sync</span>
                  </>
                )}
                {syncStatus === 'syncing' && (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span className="text-[11px] font-semibold text-blue-400">Auto-Syncing...</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-semibold text-amber-400">Sync Reconnecting...</span>
                  </>
                )}
              </div>

              {/* Company Selector Pills */}
              <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
                <button
                  onClick={() => setSelectedCompany('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedCompany === 'all'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Companies
                </button>
                <button
                  onClick={() => setSelectedCompany('next_energy')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    selectedCompany === 'next_energy'
                      ? 'bg-blue-950 text-blue-300 border border-blue-700/60 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-blue-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Next Energy
                </button>
                <button
                  onClick={() => setSelectedCompany('next_academy')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    selectedCompany === 'next_academy'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Next Academy
                </button>
              </div>

              {/* Month Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
                />
              </div>

              {/* Quick Action Dropdown */}
              <div className="relative group">
                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Quick Log</span>
                </button>

                <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 hidden group-hover:block z-50">
                  <button
                    onClick={() => onOpenQuickAdd('companyGoal')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-blue-400 flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold">🏢 Add Big Goal (Company)</span>
                  </button>
                  <button
                    onClick={() => onOpenQuickAdd('deptGoal')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-blue-400 flex items-center gap-2"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>⚡ Add Department Goal</span>
                  </button>
                  <button
                    onClick={() => onOpenQuickAdd('121')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-blue-400 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Log 121 Session</span>
                  </button>
                  <button
                    onClick={() => onOpenQuickAdd('addHod')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-blue-400 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold">👥 Add New HOD / Leader</span>
                  </button>
                  <button
                    onClick={() => onOpenQuickAdd('activity')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-blue-400 flex items-center gap-2"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Log Activity Impact</span>
                  </button>
                  <button
                    onClick={() => onOpenQuickAdd('journal')}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 hover:text-blue-400 flex items-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span>Strategic Journal</span>
                  </button>
                </div>
              </div>

              {/* Reset Demo Data Button */}
              <button
                onClick={() => {
                  if (window.confirm('Reset cloud and local state back to original demo seed data?')) resetToDemoData();
                }}
                title="Reset data to defaults"
                className="p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>

          {/* Tab Navigation Row */}
          <nav className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'goals'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>1. Company & Department Goals</span>
            </button>

            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'roadmap'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Executive Roadmap</span>
            </button>

            <button
              onClick={() => setActiveTab('121s')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === '121s'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>3. 121 Session Tracker</span>
            </button>

            <button
              onClick={() => setActiveTab('wellness')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'wellness'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span>4. Personal Wellness</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>5. COO KPI Scorecard</span>
            </button>
          </nav>
        </div>
      </header>
    </>
  );
};
