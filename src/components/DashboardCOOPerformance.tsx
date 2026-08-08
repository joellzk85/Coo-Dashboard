import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  Award,
  BookOpen,
  Zap,
  TrendingUp,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  HeartPulse,
  Lightbulb,
  Clock,
  PieChart,
  Brain,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface DashboardCOOPerformanceProps {
  onOpenAddActivity: () => void;
  onOpenAddJournal: () => void;
  onOpenAddBook: () => void;
  onOpenAddPersonalBible: () => void;
}

export const DashboardCOOPerformance: React.FC<DashboardCOOPerformanceProps> = ({
  onOpenAddActivity,
  onOpenAddJournal,
  onOpenAddBook,
  onOpenAddPersonalBible,
}) => {
  const {
    selectedMonth,
    getAutomatedKPIGradeForMonth,
    activityLogs,
    deleteActivityLog,
    reflections,
    deleteReflection,
    readingLogs,
    deleteReadingLog,
    personalGoalsAndBible,
    togglePersonalGoalOrBible,
    deletePersonalGoalOrBible,
    wellnessLogs,
  } = useDashboard();

  // Get current automated KPI grade
  const autoGrade = getAutomatedKPIGradeForMonth(selectedMonth);

  // Activity Impact calculations
  const totalActivityHours = activityLogs.reduce((acc, l) => acc + l.hoursSpent, 0);
  const highImpactLogs = activityLogs.filter((l) => l.impactTag === 'High Impact');
  const highImpactHours = highImpactLogs.reduce((acc, l) => acc + l.hoursSpent, 0);
  const highImpactRatio = totalActivityHours > 0 ? Math.round((highImpactHours / totalActivityHours) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 1. Automated Monthly KPI Grading Engine */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Automated Dynamic KPI Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Month: {selectedMonth}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>COO Executive Grade & Performance Scorecard</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Grade is calculated automatically from real-time daily inputs (121 cadence, goal progress, high-impact hours, and wellness consistency).
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 text-white px-5 py-3 rounded-2xl border border-slate-800 shadow-md">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Automated Score</span>
              <span className="text-2xl font-black text-blue-400">{autoGrade.overallScore} <span className="text-xs text-slate-400 font-medium">/ 100</span></span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              {autoGrade.grade}
            </div>
          </div>
        </div>

        {/* 4 Pillars Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Operational Excellence */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase text-[10px]">
                Operational Excellence
              </span>
              <span className="text-sm font-black text-blue-600">{autoGrade.scores.operationalExcellence} / 25</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(autoGrade.scores.operationalExcellence / 25) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Driven by department goal completion % & SLA execution.
            </p>
          </div>

          {/* Pillar 2: Team Leadership */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase text-[10px]">
                121 Leadership Cadence
              </span>
              <span className="text-sm font-black text-emerald-600">{autoGrade.scores.teamLeadership} / 25</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(autoGrade.scores.teamLeadership / 25) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Driven by 121 session execution rate for Next Energy & Academy.
            </p>
          </div>

          {/* Pillar 3: Strategic Growth */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase text-[10px]">
                Strategic Time & Impact
              </span>
              <span className="text-sm font-black text-amber-600">{autoGrade.scores.strategicGrowth} / 25</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(autoGrade.scores.strategicGrowth / 25) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Driven by High-Impact activity hours vs noise/distractions.
            </p>
          </div>

          {/* Pillar 4: Personal Mastery */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase text-[10px]">
                Wellness & Mastery
              </span>
              <span className="text-sm font-black text-purple-600">{autoGrade.scores.personalMastery} / 25</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${(autoGrade.scores.personalMastery / 25) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Driven by daily exercise, nutrition, and learning logs.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Activity Impact Log */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              <span>Activity Impact Log (High Impact vs Low/No Impact)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks executive time allocation to maximize high-yield strategic activities over low-impact noise.
            </p>
          </div>

          <button
            onClick={onOpenAddActivity}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Activity Impact</span>
          </button>
        </div>

        {/* High Impact Ratio Gauge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <span className="text-xs text-slate-500 font-bold uppercase text-[10px]">High-Impact Time Ratio</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{highImpactRatio}%</div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{highImpactHours} hrs of {totalActivityHours} hrs total</p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl">
            <span className="text-xs text-emerald-800 font-bold uppercase text-[10px]">High Impact Activities</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{highImpactLogs.length}</div>
            <p className="text-[11px] text-emerald-800 font-medium">Mentorship, Networking, Strategic Planning</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <span className="text-xs text-slate-500 font-bold uppercase text-[10px]">Low / No Impact Activities</span>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {activityLogs.length - highImpactLogs.length}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Distractions, ad-hoc admin, non-strategic tasks</p>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {activityLogs.map((log) => {
            const isHigh = log.impactTag === 'High Impact';
            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 hover:border-blue-300 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                        isHigh
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {log.impactTag}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{log.title}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">{log.outcome}</p>
                  {log.reflections && (
                    <p className="text-[11px] text-slate-500 italic">
                      Reflection: "{log.reflections}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto text-xs text-slate-500">
                  <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-semibold">
                    {log.category}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> {log.hoursSpent} hrs
                  </span>
                  <button
                    onClick={() => deleteActivityLog(log.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete activity log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. COO Learning & Reflections Journal */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <span>COO Learning & Strategic Reflections Journal</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reflections on leadership, operational improvements, and crisis management takeaways.
            </p>
          </div>

          <button
            onClick={onOpenAddJournal}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Journal Entry</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reflections.map((ref) => (
            <div
              key={ref.id}
              className="bg-slate-50 border border-slate-200 hover:border-purple-300 p-5 rounded-xl space-y-3 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  {ref.category}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{ref.date}</span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{ref.title}</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 font-medium">
                {ref.content}
              </p>

              {ref.actionItems.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Execution Action Steps
                  </span>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside font-medium">
                    {ref.actionItems.map((item, idx) => (
                      <li key={idx} className="leading-snug">{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-right pt-2">
                <button
                  onClick={() => deleteReflection(ref.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 ml-auto font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Entry
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Book & Reading Log */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span>Book & Reading Log ("What I Learned" & "How To Apply")</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks executive reading list with direct application strategies for Next Energy & Next Academy.
            </p>
          </div>

          <button
            onClick={onOpenAddBook}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Book Log</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {readingLogs.map((book) => (
            <div
              key={book.id}
              className="bg-white border border-slate-200 hover:border-blue-300 p-5 rounded-xl space-y-3 flex flex-col justify-between transition-all shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      book.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : book.status === 'Reading'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {book.status} ({book.progressPercent}%)
                  </span>

                  <button
                    onClick={() => deleteReadingLog(book.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{book.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">by {book.author}</p>
                </div>

                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${book.progressPercent}%` }}
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
                    What Did I Learn?
                  </span>
                  <p className="text-xs text-slate-700 font-medium">{book.learnings}</p>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                    How To Apply to Next Energy / Academy
                  </span>
                  <p className="text-xs text-slate-800 font-medium">{book.execution}</p>
                </div>
              </div>

              {book.dateCompleted && (
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                  Completed on: {book.dateCompleted}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Personal Goals & Bible Learning */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-rose-600" />
              <span>Personal Goals & Bible Learning Reflections</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal growth milestones, executive stamina, and spiritual wisdom reflections.
            </p>
          </div>

          <button
            onClick={onOpenAddPersonalBible}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Personal / Bible Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {personalGoalsAndBible.map((item) => {
            const isBible = item.category === 'Bible Learning';
            return (
              <div
                key={item.id}
                className="bg-slate-50 border border-slate-200 hover:border-blue-300 p-5 rounded-xl space-y-3 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                      isBible
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {item.category}
                  </span>

                  <button
                    onClick={() => togglePersonalGoalOrBible(item.id)}
                    className="text-xs text-blue-600 font-bold flex items-center gap-1 focus:outline-none"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>{item.completed ? 'Completed' : 'Mark Done'}</span>
                  </button>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-blue-600 font-semibold mt-0.5">{item.referenceOrFocus}</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Reflections & Insights
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{item.reflections}</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Practical Action Steps
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{item.actionSteps}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
                  <span>Target Date: {item.targetDate}</span>
                  <button
                    onClick={() => deletePersonalGoalOrBible(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
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
