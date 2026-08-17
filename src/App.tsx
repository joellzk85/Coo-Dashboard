import React, { useState } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { Navbar } from './components/Navbar';
import { DashboardCompanyProgress } from './components/DashboardCompanyProgress';
import { DashboardRoadmap } from './components/DashboardRoadmap';
import { Dashboard121Tracker } from './components/Dashboard121Tracker';
import { DashboardWellness } from './components/DashboardWellness';
import { DashboardCOOPerformance } from './components/DashboardCOOPerformance';
import { QuickAddModal } from './components/Modals/QuickAddModal';

export function DashboardApp() {
  const [activeTab, setActiveTab] = useState<'goals' | 'roadmap' | '121s' | 'wellness' | 'performance'>('goals');
  const [modalType, setModalType] = useState<'121' | 'deptGoal' | 'activity' | 'journal' | 'book' | 'personalBible' | null>(null);

  const handleOpenQuickAdd = (type: '121' | 'deptGoal' | 'activity' | 'journal') => {
    setModalType(type);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickAdd={handleOpenQuickAdd}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'goals' && (
            <DashboardCompanyProgress onOpenAddGoal={() => setModalType('deptGoal')} />
          )}

          {activeTab === 'roadmap' && (
            <DashboardRoadmap />
          )}

          {activeTab === '121s' && (
            <Dashboard121Tracker onOpenAdd121={() => setModalType('121')} />
          )}

          {activeTab === 'wellness' && (
            <DashboardWellness />
          )}

          {activeTab === 'performance' && (
            <DashboardCOOPerformance
              onOpenAddActivity={() => setModalType('activity')}
              onOpenAddJournal={() => setModalType('journal')}
              onOpenAddBook={() => setModalType('book')}
              onOpenAddPersonalBible={() => setModalType('personalBible')}
            />
          )}
        </main>
      </div>

      {/* Realtime Footer Status Bar from Professional Polish Theme */}
      <footer className="mt-12 bg-slate-900 text-white border-t border-slate-800 py-3.5 px-4 sm:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Executive Workspace • Local Storage Active
              </span>
            </div>
            <div className="h-3.5 w-px bg-slate-700 hidden sm:block"></div>
            <div className="text-[11px] text-slate-300 hidden md:block">
              <span className="text-slate-400">Executive Scope:</span> Next Energy & Next Academy Operations
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Next Group Executive Dashboard © 2026
          </div>
        </div>
      </footer>

      <QuickAddModal
        isOpen={modalType !== null}
        type={modalType}
        onClose={() => setModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardApp />
    </DashboardProvider>
  );
}
