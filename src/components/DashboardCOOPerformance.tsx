import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  MonthlyKPIGrade,
  ActivityImpactLog,
  COOLearningReflection,
  ReadingLog,
  PersonalGoalAndBible
} from '../types/dashboard';
import {
  Award,
  BookOpen,
  BookMarked,
  Zap,
  TrendingUp,
  Sliders,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  Calendar,
  Layers,
  Heart,
  Lightbulb,
  Clock,
  PieChart,
  Brain,
  Bookmark
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
    kpiGrades,
    saveKPIGrade,
    activityLogs,
    deleteActivityLog,
    reflections,
    deleteReflection,
    readingLogs,
    updateReadingLog,
    deleteReadingLog,
    personalGoalsAndBible,
    togglePersonalGoalOrBible,
    deletePersonalGoalOrBible,
  } = useDashboard();

  // Find existing grade for selected month or initialize defaults
  const currentGradeObj = kpiGrades.find((g) => g.monthYear === selectedMonth) || {
    id: `kpi_${selectedMonth.replace('-', '_')}`,
    monthYear: selectedMonth,
    overallScore: 85,
    grade: 'A' as const,
    scores: {
      operationalExcellence: 21,
      teamLeadership: 22,
      strategicGrowth: 21,
      personalMastery: 21,
    },
    notes: {
      operationalExcellenceNote: '',
      teamLeadershipNote: '',
      strategicGrowthNote: '',
      personalMasteryNote: '',
    },
    reflections: '',
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  const [opScore, setOpScore] = useState(currentGradeObj.scores.operationalExcellence);
  const [teamScore, setTeamScore] = useState(currentGradeObj.scores.teamLeadership);
  const [stratScore, setStratScore] = useState(currentGradeObj.scores.strategicGrowth);
  const [masteryScore, setMasteryScore] = useState(currentGradeObj.scores.personalMastery);
  const [monthlyReflections, setMonthlyReflections] = useState(currentGradeObj.reflections || '');

  useEffect(() => {
    setOpScore(currentGradeObj.scores.operationalExcellence);
    setTeamScore(currentGradeObj.scores.teamLeadership);
    setStratScore(currentGradeObj.scores.strategicGrowth);
    setMasteryScore(currentGradeObj.scores.personalMastery);
    setMonthlyReflections(currentGradeObj.reflections || '');
  }, [selectedMonth, currentGradeObj]);

  const totalScore = opScore + teamScore + stratScore + masteryScore;

  const calculateGradeLetter = (score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' => {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const computedGrade = calculateGradeLetter(totalScore);

  const handleSaveGrade = () => {
    saveKPIGrade({
      monthYear: selectedMonth,
      overallScore: totalScore,
      grade: computedGrade,
      scores: {
        operationalExcellence: opScore,
        teamLeadership: teamScore,
        strategicGrowth: stratScore,
        personalMastery: masteryScore,
      },
      notes: {
        operationalExcellenceNote: currentGradeObj.notes.operationalExcellenceNote || '',
        teamLeadershipNote: currentGradeObj.notes.teamLeadershipNote || '',
        strategicGrowthNote: currentGradeObj.notes.strategicGrowthNote || '',
        personalMasteryNote: currentGradeObj.notes.personalMasteryNote || '',
      },
      reflections: monthlyReflections,
    });
  };

  // Activity Impact calculations
  const totalActivityHours = activityLogs.reduce((acc, l) => acc + l.hoursSpent, 0);
  const highImpactLogs = activityLogs.filter((l) => l.impactTag === 'High Impact');
  const highImpactHours = highImpactLogs.reduce((acc, l) => acc + l.hoursSpent, 0);
  const highImpactRatio = totalActivityHours > 0 ? Math.round((highImpactHours / totalActivityHours) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* 1. Monthly Self-Grading Engine */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                Monthly Self-Grading Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Month: {selectedMonth}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>COO Personal Performance Scorecard</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Score</span>
                <span className="text-2xl font-black text-blue-600">{totalScore} <span className="text-xs text-slate-500 font-medium">/ 100</span></span>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
                {computedGrade}
              </div>
            </div>

            <button
              onClick={handleSaveGrade}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all active:scale-95"
            >
              Save Performance Grade
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operational Excellence */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px]">
                <Zap className="w-3.5 h-3.5 text-blue-600" /> 1. Operational Excellence (Max 25)
              </span>
              <span className="text-sm font-black text-blue-600">{opScore} / 25</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={opScore}
              onChange={(e) => setOpScore(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Evaluates HOD cadence execution, project delivery speed, safety compliance, and zero breakdown SLAs.
            </p>
          </div>

          {/* Team Leadership */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px]">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> 2. Team Leadership & 121 Cadence (Max 25)
              </span>
              <span className="text-sm font-black text-emerald-600">{teamScore} / 25</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={teamScore}
              onChange={(e) => setTeamScore(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Evaluates 100% 121 completion rate, team psychological safety, sentiment ups/downs tracking, and follow-ups.
            </p>
          </div>

          {/* Strategic Growth */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 3. Strategic Growth & Projects (Max 25)
              </span>
              <span className="text-sm font-black text-amber-600">{stratScore} / 25</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={stratScore}
              onChange={(e) => setStratScore(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Evaluates commercial pipeline expansion, Next Academy talent synergy, and executive partner networking.
            </p>
          </div>

          {/* Personal Mastery */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px]">
                <Brain className="w-3.5 h-3.5 text-purple-600" /> 4. Personal Mastery & Learning (Max 25)
              </span>
              <span className="text-sm font-black text-purple-600">{masteryScore} / 25</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={masteryScore}
              onChange={(e) => setMasteryScore(Number(e.target.value))}
              className="w-full accent-purple-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Evaluates high-impact time allocation, executive reading execution, and personal/Bible study reflections.
            </p>
          </div>
        </div>

        {/* Monthly Strategic Reflection Note */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Monthly Executive Reflections & Summary Notes
          </label>
          <textarea
            rows={3}
            value={monthlyReflections}
            onChange={(e) => setMonthlyReflections(e.target.value)}
            placeholder="Record overall insights, operational wins, and focus areas for next month..."
            className="w-full bg-slate-50 text-xs text-slate-900 p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
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

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${book.progressPercent}%` }}
                  />
                </div>

                {/* What I Learned */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
                    What Did I Learn?
                  </span>
                  <p className="text-xs text-slate-700 font-medium">{book.learnings}</p>
                </div>

                {/* How to Apply */}
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
              <Heart className="w-5 h-5 text-rose-600" />
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
