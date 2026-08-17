import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CompanyGoal, DepartmentGoal } from '../types/dashboard';
import {
  Calendar,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Zap,
  GraduationCap,
  Layers,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export const DashboardRoadmap: React.FC = () => {
  const {
    companyGoals,
    departmentGoals,
    selectedCompany,
    toggleCompanyMilestone,
    toggleDepartmentMilestone,
  } = useDashboard();

  // Visibility Controls State
  const [showCompanyGoals, setShowCompanyGoals] = useState<boolean>(true);
  const [showDeptGoals, setShowDeptGoals] = useState<boolean>(true);
  const [showMilestones, setShowMilestones] = useState<boolean>(true);

  // Status Filter Checkboxes
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([
    'On Track',
    'Completed',
    'At Risk',
    'Behind',
  ]);

  // Department Filter Checkboxes
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    'Sales',
    'Admin',
    'HR',
    'Projects',
    'Customer Service',
    'Marketing',
    'Management',
    'Training',
  ]);

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleDeptFilter = (dept: string) => {
    setSelectedDepts(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const selectAllFilters = () => {
    setSelectedStatuses(['On Track', 'Completed', 'At Risk', 'Behind']);
    setSelectedDepts(['Sales', 'Admin', 'HR', 'Projects', 'Customer Service', 'Marketing', 'Management', 'Training']);
    setShowCompanyGoals(true);
    setShowDeptGoals(true);
    setShowMilestones(true);
  };

  // Filter Company Goals
  const filteredCompanyGoals = companyGoals.filter(cg => {
    if (!showCompanyGoals) return false;
    if (selectedCompany !== 'all' && cg.companyId !== selectedCompany) return false;
    return true;
  });

  // Filter Department Goals
  const filteredDeptGoals = departmentGoals.filter(dg => {
    if (!showDeptGoals) return false;
    if (selectedCompany !== 'all' && dg.companyId !== selectedCompany) return false;
    if (!selectedStatuses.includes(dg.status)) return false;
    if (!selectedDepts.includes(dg.departmentName)) return false;
    return true;
  });

  // Quarter helper based on target date (e.g. 2026-09-30)
  const getQuarterCol = (targetDateStr: string) => {
    if (!targetDateStr) return 'Q3';
    const month = parseInt(targetDateStr.split('-')[1], 10);
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-widest">
              Executive Strategic Visualizer
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-500" />
            <span>Interactive 2026 Executive Roadmap</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Graphical timeline view of macro company goals, departmental deliverables, and target milestones across Q1-Q4. Use controls to filter metrics on the fly.
          </p>
        </div>

        <button
          onClick={selectAllFilters}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all self-start md:self-auto shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          <span>Reset Filters</span>
        </button>
      </div>

      {/* Visibility Toggle Options & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Roadmap Layer & Visibility Toggles</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Check / Uncheck layers to customize view</span>
        </div>

        {/* Checkbox Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Column 1: Object Types */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">1. Goal Level</span>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-slate-800 font-medium cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={showCompanyGoals}
                  onChange={e => setShowCompanyGoals(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Company Big Goals</span>
              </label>

              <label className="flex items-center gap-2 text-slate-800 font-medium cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={showDeptGoals}
                  onChange={e => setShowDeptGoals(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Department Goals</span>
              </label>

              <label className="flex items-center gap-2 text-slate-800 font-medium cursor-pointer hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={showMilestones}
                  onChange={e => setShowMilestones(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Key Deliverable Milestones</span>
              </label>
            </div>
          </div>

          {/* Column 2: Status Checkboxes */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">2. Goal Status</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: 'On Track', color: 'text-blue-600' },
                { name: 'Completed', color: 'text-emerald-600' },
                { name: 'At Risk', color: 'text-amber-600' },
                { name: 'Behind', color: 'text-rose-600' },
              ].map((st) => (
                <label key={st.name} className="flex items-center gap-2 text-slate-800 font-medium cursor-pointer hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(st.name)}
                    onChange={() => toggleStatusFilter(st.name)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span className={st.color}>{st.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Column 3: Department Checkboxes */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">3. Departments</span>
            <div className="grid grid-cols-2 gap-1.5">
              {['Sales', 'Admin', 'HR', 'Projects', 'Customer Service', 'Marketing', 'Management', 'Training'].map((dept) => (
                <label key={dept} className="flex items-center gap-1.5 text-slate-700 text-[11px] font-medium cursor-pointer hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={selectedDepts.includes(dept)}
                    onChange={() => toggleDeptFilter(dept)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span className="truncate">{dept}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Graphical Timeline / Roadmap Visualizer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 overflow-x-auto">
        {/* Timeline Quarter Grid Headers */}
        <div className="min-w-[800px]">
          <div className="grid grid-cols-4 gap-4 pb-3 border-b-2 border-slate-200 text-center font-bold text-xs uppercase tracking-wider text-slate-700">
            <div className="bg-slate-50 py-2 rounded-lg border border-slate-200">Q1 2026 (Jan - Mar)</div>
            <div className="bg-slate-50 py-2 rounded-lg border border-slate-200">Q2 2026 (Apr - Jun)</div>
            <div className="bg-blue-50 py-2 rounded-lg border border-blue-200 text-blue-700">Q3 2026 (Jul - Sep) ★ ACTIVE</div>
            <div className="bg-slate-50 py-2 rounded-lg border border-slate-200">Q4 2026 (Oct - Dec)</div>
          </div>

          {/* 1. Company Big Goals Lane */}
          {showCompanyGoals && filteredCompanyGoals.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Macro Company Big Goals</span>
              </div>

              {filteredCompanyGoals.map((cg) => {
                const targetQ = getQuarterCol(cg.targetDate);
                const cur = Math.max(0, Number(cg.currentValue) || 0);
                const tar = Math.max(0, Number(cg.targetValue) || 0);
                const progressPct = tar > 0 ? Math.max(0, Math.min(100, Math.round((cur / tar) * 100))) : 0;

                return (
                  <div key={cg.id} className="bg-slate-900 text-white rounded-xl p-4 shadow-md border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {cg.companyId === 'next_energy' ? 'Next Energy' : 'Next Academy'}
                        </span>
                        <h4 className="text-sm font-bold">{cg.title}</h4>
                      </div>
                      <span className="text-xs font-bold text-blue-400">Target: {targetQ} ({cg.targetDate})</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-300">
                        <span>{cg.targetMetric || 'Goal Metric'}: {cur} / {tar} {cg.unit || ''}</span>
                        <span className="font-bold text-blue-400">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                    </div>

                    {/* Milestones inside roadmap card */}
                    {showMilestones && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                        {cg.milestones.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => toggleCompanyMilestone(cg.id, m.id)}
                            className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700"
                          >
                            <input
                              type="checkbox"
                              checked={m.completed}
                              onChange={() => {}}
                              className="rounded text-blue-500 h-3.5 w-3.5"
                            />
                            <span className={m.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Departmental Goals Lane */}
          {showDeptGoals && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Department Operational Goals</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredDeptGoals.map((dg) => {
                  const targetQ = getQuarterCol(dg.targetDate);

                  return (
                    <div
                      key={dg.id}
                      className="bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl p-4 shadow-sm space-y-3 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            {dg.departmentName}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold">(HOD: {dg.hodName})</span>
                          <h4 className="text-sm font-bold text-slate-900">{dg.title}</h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            dg.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            dg.status === 'On Track' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            dg.status === 'At Risk' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            {dg.status}
                          </span>
                          <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            Deadline: {targetQ} ({dg.targetDate})
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>{dg.targetMetric}</span>
                          <span className="font-bold text-slate-900">{dg.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              dg.status === 'Completed' ? 'bg-emerald-500' :
                              dg.status === 'At Risk' ? 'bg-amber-500' :
                              dg.status === 'Behind' ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${dg.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Milestones inside Roadmap bar */}
                      {showMilestones && dg.milestones.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                          {dg.milestones.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => toggleDepartmentMilestone(dg.id, m.id)}
                              className="flex items-center gap-2 text-xs bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100/60"
                            >
                              <input
                                type="checkbox"
                                checked={m.completed}
                                onChange={() => {}}
                                className="rounded text-blue-600 h-3.5 w-3.5"
                              />
                              <span className={m.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                                {m.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredDeptGoals.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs italic">
                    No departmental goals match the selected roadmap filters. Try adjusting visibility options above.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
