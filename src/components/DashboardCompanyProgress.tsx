import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CompanyGoal, DepartmentGoal, Milestone } from '../types/dashboard';
import {
  TrendingUp,
  Zap,
  GraduationCap,
  Plus,
  CheckSquare,
  Square,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Building2,
  UserCheck
} from 'lucide-react';

interface DashboardCompanyProgressProps {
  onOpenAddGoal: () => void;
}

export const DashboardCompanyProgress: React.FC<DashboardCompanyProgressProps> = ({ onOpenAddGoal }) => {
  const {
    selectedCompany,
    companyGoals,
    departmentGoals,
    departments,
    updateCompanyGoal,
    updateDepartmentGoal,
    deleteDepartmentGoal,
  } = useDashboard();

  const [editingGoal, setEditingGoal] = useState<DepartmentGoal | null>(null);

  // Filter goals based on selected company tab
  const filteredCompanyGoals = companyGoals.filter(
    (cg) => selectedCompany === 'all' || cg.companyId === selectedCompany
  );

  const filteredDeptGoals = departmentGoals.filter(
    (dg) => selectedCompany === 'all' || dg.companyId === selectedCompany
  );

  // Group dept goals by company
  const nextEnergyDepts = departments.filter((d) => d.companyId === 'next_energy');
  const nextAcademyDepts = departments.filter((d) => d.companyId === 'next_academy');

  const toggleCompanyMilestone = (goalId: string, milestoneId: string) => {
    const goal = companyGoals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    updateCompanyGoal(goalId, { milestones: updatedMilestones });
  };

  const toggleDeptMilestone = (goalId: string, milestoneId: string) => {
    const goal = departmentGoals.find((g) => g.id === goalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    // Recalculate progress % based on milestones completed
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
    const newStatus =
      newProgress === 100 ? 'Completed' : newProgress >= 70 ? 'On Track' : 'At Risk';

    updateDepartmentGoal(goalId, {
      milestones: updatedMilestones,
      progressPercent: newProgress,
      status: newStatus,
    });
  };

  const getStatusBadge = (status: DepartmentGoal['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
          </span>
        );
      case 'On Track':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-600" /> On Track
          </span>
        );
      case 'At Risk':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-600" /> At Risk
          </span>
        );
      case 'Behind':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-rose-600" /> Behind
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Executive Summary & Company Big Goal Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Company Big Goals & Milestone Tracker</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Macro-level strategic objectives for Next Energy & Next Academy with overall progress ratings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCompanyGoals.map((cg) => {
            const isEnergy = cg.companyId === 'next_energy';
            const progressPercent = Math.min(
              100,
              Math.round((cg.currentValue / cg.targetValue) * 100)
            );

            return (
              <div
                key={cg.id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                        isEnergy
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isEnergy ? <Zap className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                      {isEnergy ? 'Next Energy' : 'Next Academy'}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500 font-semibold uppercase text-[10px]">Overall Rating:</span>
                    <span className="text-sm font-black text-blue-600">{cg.overallRating}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-3 tracking-tight leading-snug">
                  {cg.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{cg.description}</p>

                {/* Progress Metric & Bar */}
                <div className="mt-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">{cg.targetMetric}</span>
                    <div className="flex items-baseline gap-1 font-extrabold text-slate-900">
                      <span className="text-blue-600 text-base">{cg.currentValue}</span>
                      <span>/ {cg.targetValue} {cg.unit}</span>
                      <span className="text-xs text-blue-600 font-bold ml-1">({progressPercent}% COMPLETE)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isEnergy
                          ? 'bg-blue-600'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" /> Target Date: {cg.targetDate}
                    </span>
                    <span className="font-medium">Last Updated: {cg.lastUpdated}</span>
                  </div>
                </div>

                {/* Key Milestones checklist */}
                <div className="mt-5 space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Executive Milestones
                  </h4>

                  <div className="space-y-1.5">
                    {cg.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => toggleCompanyMilestone(cg.id, m.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                          m.completed
                            ? 'bg-slate-50/60 text-slate-400 line-through border-slate-200/50'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100/80'
                        }`}
                      >
                        <button className="mt-0.5 text-blue-600 focus:outline-none">
                          {m.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <span className="text-xs font-medium leading-snug">{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. HOD & Department Leadership Directory */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Department HOD & Leadership Structure</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Designated Heads of Department (HODs) and Assistant HODs across Next Energy & Next Academy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Energy Depts */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm pb-2 border-b border-slate-200">
              <Zap className="w-4 h-4 fill-blue-600 text-blue-600" />
              <span>Next Energy Departments (6 HODs)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {nextEnergyDepts.map((d) => (
                <div key={d.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-900">{d.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    HOD: <span className="text-blue-600 font-semibold">{d.hod}</span>
                    {d.ahod && <span className="text-slate-400"> (AHOD: {d.ahod})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Academy Depts */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm pb-2 border-b border-slate-200">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Next Academy Team (4 Key Roles)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {nextAcademyDepts.map((d) => (
                <div key={d.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="font-bold text-slate-900">{d.name}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Lead: <span className="text-emerald-600 font-semibold">{d.hod}</span> ({d.roleTitle})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Departmental Goal Tracker Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>Departmental Goal Tracker</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active operational goals, target completion dates, and milestone progress per department.
            </p>
          </div>

          <button
            onClick={onOpenAddGoal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Department Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeptGoals.map((dg) => {
            const isEnergy = dg.companyId === 'next_energy';

            return (
              <div
                key={dg.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isEnergy
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {dg.departmentName} (HOD: {dg.hodName})
                    </span>

                    {getStatusBadge(dg.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    {dg.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{dg.description}</p>

                  {/* Target metric box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">{dg.targetMetric}</span>
                      <span className="font-extrabold text-slate-900">{dg.progressPercent}%</span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          dg.status === 'Completed'
                            ? 'bg-emerald-500'
                            : dg.status === 'At Risk'
                            ? 'bg-amber-500'
                            : dg.status === 'Behind'
                            ? 'bg-rose-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${dg.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones checklist */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Deliverables
                    </span>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {dg.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => toggleDeptMilestone(dg.id, m.id)}
                          className={`flex items-start gap-2 p-1.5 rounded cursor-pointer text-xs border ${
                            m.completed
                              ? 'bg-slate-50 text-slate-400 line-through border-slate-100'
                              : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <button className="mt-0.5 text-blue-600 focus:outline-none">
                            {m.completed ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                          <span className="leading-tight">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer metadata & Delete */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" /> Target: {dg.targetDate}
                  </div>

                  <button
                    onClick={() => deleteDepartmentGoal(dg.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
