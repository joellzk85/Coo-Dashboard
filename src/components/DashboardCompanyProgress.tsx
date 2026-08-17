import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { CompanyGoal, DepartmentGoal } from '../types/dashboard';
import { EditGoalModal } from './Modals/EditGoalModal';
import {
  TrendingUp,
  Zap,
  GraduationCap,
  Plus,
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  Sparkles
} from 'lucide-react';

interface DashboardCompanyProgressProps {
  onOpenAddCompanyGoal: () => void;
  onOpenAddDeptGoal: () => void;
}

export const DashboardCompanyProgress: React.FC<DashboardCompanyProgressProps> = ({
  onOpenAddCompanyGoal,
  onOpenAddDeptGoal,
}) => {
  const {
    selectedCompany,
    companyGoals,
    departmentGoals,
    departments,
    toggleCompanyMilestone,
    toggleDepartmentMilestone,
    deleteCompanyGoal,
    deleteDepartmentGoal,
    resetToDemoData,
  } = useDashboard();

  const [editingGoal, setEditingGoal] = useState<{
    type: 'company' | 'department';
    data: CompanyGoal | DepartmentGoal;
  } | null>(null);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Company Big Goals & Milestone Tracker</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Macro-level strategic objectives for Next Energy & Next Academy. Click edit to dynamically modify goals or add deliverables.
            </p>
          </div>

          <button
            onClick={onOpenAddCompanyGoal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Company Big Goal</span>
          </button>
        </div>

        {filteredCompanyGoals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Company Big Goals Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No macro strategic goals are currently listed for this company filter. You can add a new big goal or restore default demo data.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenAddCompanyGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Big Goal
              </button>
              <button
                onClick={resetToDemoData}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Restore Demo Goals
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanyGoals.map((cg) => {
            const isEnergy = cg.companyId === 'next_energy';
            
            // Safe Next Energy progress calculation
            const targetVal = Math.max(0, Number(cg.targetValue) || 0);
            const currentVal = Math.max(0, Number(cg.currentValue) || 0);
            const progressPercent = targetVal > 0 
              ? Math.max(0, Math.min(100, Math.round((currentVal / targetVal) * 100))) 
              : 0;

            // Safe Next Academy progress calculation
            const revCurrent = Math.max(0, Number(cg.academyRevenueCurrent) || 0);
            const revTarget = Math.max(0, Number(cg.academyRevenueTarget) || 0);
            const revPercent = revTarget > 0 
              ? Math.max(0, Math.min(100, Math.round((revCurrent / revTarget) * 100))) 
              : 0;

            const daysCurrent = Math.max(0, Number(cg.academyTrainingDaysCurrent) || 0);
            const daysTarget = Math.max(0, Number(cg.academyTrainingDaysTarget) || 0);
            const daysPercent = daysTarget > 0 
              ? Math.max(0, Math.min(100, Math.round((daysCurrent / daysTarget) * 100))) 
              : 0;

            // Compute dynamic goal rating
            const completedMilestones = cg.milestones.filter(m => m.completed).length;
            const totalMilestones = cg.milestones.length;
            const milestonePct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

            let computedPct = 0;
            let hasGoalData = false;

            if (isEnergy) {
              hasGoalData = targetVal > 0 || totalMilestones > 0;
              computedPct = targetVal > 0 
                ? (totalMilestones > 0 ? Math.round(progressPercent * 0.7 + milestonePct * 0.3) : progressPercent)
                : milestonePct;
            } else {
              hasGoalData = revTarget > 0 || daysTarget > 0 || totalMilestones > 0;
              let metricsCount = 0;
              let metricsSum = 0;
              if (revTarget > 0) { metricsSum += revPercent; metricsCount++; }
              if (daysTarget > 0) { metricsSum += daysPercent; metricsCount++; }
              const metricsAvg = metricsCount > 0 ? metricsSum / metricsCount : 0;
              computedPct = metricsCount > 0
                ? (totalMilestones > 0 ? Math.round(metricsAvg * 0.7 + milestonePct * 0.3) : Math.round(metricsAvg))
                : milestonePct;
            }

            let rating = 'F';
            if (!hasGoalData && computedPct === 0) {
              rating = 'N/A';
            } else if (computedPct >= 90) {
              rating = 'A+';
            } else if (computedPct >= 75) {
              rating = 'A';
            } else if (computedPct >= 60) {
              rating = 'B';
            } else if (computedPct >= 45) {
              rating = 'C';
            } else if (computedPct >= 30) {
              rating = 'D';
            } else {
              rating = 'F';
            }

            return (
              <div
                key={cg.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-6 shadow-sm relative overflow-hidden transition-all"
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

                  <div className="flex items-center gap-2">
                    {/* Rating Badge */}
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                      <span className="text-xs text-slate-500 font-semibold uppercase text-[10px]">Rating:</span>
                      <span className={`text-sm font-black ${
                        rating === 'A+' || rating === 'A' ? 'text-emerald-600' :
                        rating === 'B' ? 'text-blue-600' :
                        rating === 'C' ? 'text-amber-600' :
                        rating === 'D' ? 'text-orange-600' :
                        rating === 'F' ? 'text-rose-600' : 'text-slate-400'
                      }`}>
                        {rating}
                      </span>
                    </div>

                    {/* Impact Level Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                        cg.impactLevel === 'High'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : cg.impactLevel === 'Low'
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {cg.impactLevel === 'High' ? '🔥 High Impact (1.5x)' : cg.impactLevel === 'Low' ? '🌱 Low Impact (0.5x)' : '⚡ Med Impact (1.0x)'}
                    </span>

                    {/* Edit Control */}
                    <button
                      onClick={() => setEditingGoal({ type: 'company', data: cg })}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Company Goal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this Company Goal?')) deleteCompanyGoal(cg.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-3 tracking-tight leading-snug">
                  {cg.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{cg.description}</p>

                {/* Progress Metric & Bar */}
                {cg.companyId === 'next_academy' ? (
                  <div className="mt-5 bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-amber-200/80 pb-2">
                      <span className="font-bold text-amber-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-amber-600" />
                        Next Academy Specific Metrics
                      </span>
                    </div>

                    {/* Revenue Target Metric */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-semibold">Revenue Target (RM):</span>
                        <span className="font-extrabold text-slate-900">
                          RM {revCurrent.toLocaleString()} / RM {revTarget.toLocaleString()}
                          <span className="text-amber-700 ml-1 font-bold">
                            ({revPercent}% COMPLETE)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${revPercent}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Training Volume Metric */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 font-semibold">Training Volume:</span>
                        <span className="font-extrabold text-slate-900">
                          {daysCurrent} / {daysTarget} Days Conducted
                          <span className="text-emerald-700 ml-1 font-bold">
                            ({daysPercent}% COMPLETE)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-emerald-200/70 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${daysPercent}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-amber-200/60">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" /> Target Date: {cg.targetDate}
                      </span>
                      <span className="font-medium">Last Updated: {cg.lastUpdated}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">{cg.targetMetric || 'Strategic Metric'}</span>
                      <div className="flex items-baseline gap-1 font-extrabold text-slate-900">
                        <span className="text-blue-600 text-base">{currentVal}</span>
                        <span>/ {targetVal} {cg.unit || ''}</span>
                        <span className="text-xs text-blue-600 font-bold ml-1">({progressPercent}% COMPLETE)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-blue-600"
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
                )}

                {/* Key Milestones checklist */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Key Executive Milestones
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {cg.milestones.filter(m => m.completed).length} / {cg.milestones.length}
                    </span>
                  </div>

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
        )}
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
              Active operational goals. Click edit on any card to amend titles, targets, or milestones dynamically.
            </p>
          </div>

          <button
            onClick={onOpenAddDeptGoal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Department Goal</span>
          </button>
        </div>

        {filteredDeptGoals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Department Goals Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No operational department goals found for the selected filter. You can add a new department goal or restore default demo data.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={onOpenAddDeptGoal}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Department Goal
              </button>
              <button
                onClick={resetToDemoData}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Restore Demo Goals
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeptGoals.map((dg) => {
            const isEnergy = dg.companyId === 'next_energy';

            return (
              <div
                key={dg.id}
                className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                          isEnergy
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {dg.departmentName} (HOD: {dg.hodName})
                      </span>

                      {/* Impact Level Badge */}
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                          dg.impactLevel === 'High'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : dg.impactLevel === 'Low'
                            ? 'bg-slate-50 text-slate-600 border-slate-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {dg.impactLevel === 'High' ? '🔥 High (1.5x)' : dg.impactLevel === 'Low' ? '🌱 Low (0.5x)' : '⚡ Med (1.0x)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {getStatusBadge(dg.status)}
                      <button
                        onClick={() => setEditingGoal({ type: 'department', data: dg })}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        title="Edit Department Goal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Delete this Department Goal?')) deleteDepartmentGoal(dg.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    {dg.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{dg.description}</p>

                  {/* Next Academy Specific Metric Breakdown or Standard Target Metric Box */}
                  {dg.companyId === 'next_academy' ? (
                    <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl space-y-2.5 text-xs">
                      <div className="font-bold text-amber-900 text-[11px] flex items-center gap-1.5 uppercase tracking-wider border-b border-amber-200/80 pb-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Next Academy Performance Metrics</span>
                      </div>
                      
                      {dg.academyRevenueTarget !== undefined ? (() => {
                        const dRevCur = Math.max(0, Number(dg.academyRevenueCurrent) || 0);
                        const dRevTar = Math.max(0, Number(dg.academyRevenueTarget) || 0);
                        const dRevPct = dRevTar > 0 ? Math.max(0, Math.min(100, Math.round((dRevCur / dRevTar) * 100))) : 0;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-600 font-semibold">Revenue Target (RM):</span>
                              <span className="font-bold text-slate-900">
                                RM {dRevCur.toLocaleString()} / RM {dRevTar.toLocaleString()}
                                <span className="text-amber-700 ml-1 font-bold">
                                  ({dRevPct}% COMPLETE)
                                </span>
                              </span>
                            </div>
                            <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${dRevPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })() : null}

                      {dg.academyTrainingDaysTarget !== undefined ? (() => {
                        const dDaysCur = Math.max(0, Number(dg.academyTrainingDaysCurrent) || 0);
                        const dDaysTar = Math.max(0, Number(dg.academyTrainingDaysTarget) || 0);
                        const dDaysPct = dDaysTar > 0 ? Math.max(0, Math.min(100, Math.round((dDaysCur / dDaysTar) * 100))) : 0;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-600 font-semibold">Training Volume:</span>
                              <span className="font-bold text-slate-900">
                                {dDaysCur} / {dDaysTar} Days Conducted
                                <span className="text-emerald-700 ml-1 font-bold">
                                  ({dDaysPct}% COMPLETE)
                                </span>
                              </span>
                            </div>
                            <div className="w-full bg-emerald-200/70 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${dDaysPct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })() : null}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">{dg.targetMetric}</span>
                        <span className="font-extrabold text-slate-900">{Math.max(0, Math.min(100, Number(dg.progressPercent) || 0))}%</span>
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
                          style={{ width: `${Math.max(0, Math.min(100, Number(dg.progressPercent) || 0))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Milestones checklist */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Key Deliverables
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {dg.milestones.filter(m => m.completed).length} / {dg.milestones.length}
                      </span>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {dg.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => toggleDepartmentMilestone(dg.id, m.id)}
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

                {/* Footer metadata */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-slate-400" /> Target: {dg.targetDate}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">Updated: {dg.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </section>

      {/* Edit Modal */}
      <EditGoalModal
        isOpen={editingGoal !== null}
        onClose={() => setEditingGoal(null)}
        goalToEdit={editingGoal}
      />
    </div>
  );
};
