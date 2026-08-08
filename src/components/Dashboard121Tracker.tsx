import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Session121, Department } from '../types/dashboard';
import {
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ThumbsUp,
  ThumbsDown,
  CheckSquare,
  Square,
  Trash2,
  Star,
  Zap,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  FolderKanban
} from 'lucide-react';

interface Dashboard121TrackerProps {
  onOpenAdd121: () => void;
}

export const Dashboard121Tracker: React.FC<Dashboard121TrackerProps> = ({ onOpenAdd121 }) => {
  const {
    sessions121,
    departments,
    selectedCompany,
    selectedMonth,
    update121Session,
    delete121Session
  } = useDashboard();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  
  // Track collapsed state for month groups
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

  const toggleMonthCollapse = (monthKey: string) => {
    setCollapsedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  // Filter 121s based on selected company & search query
  const filteredSessions = sessions121.filter((s) => {
    const matchesCompany = selectedCompany === 'all' || s.companyId === selectedCompany;
    const matchesSearch =
      s.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCompany && matchesSearch;
  });

  // Group filtered sessions strictly by Month (monthYear e.g., "2026-08")
  const sessionsByMonth: Record<string, Session121[]> = {};
  filteredSessions.forEach(s => {
    const key = s.monthYear || s.date.substring(0, 7) || 'Uncategorized';
    if (!sessionsByMonth[key]) sessionsByMonth[key] = [];
    sessionsByMonth[key].push(s);
  });

  // Sort month keys descending (newest month first)
  const sortedMonthKeys = Object.keys(sessionsByMonth).sort((a, b) => b.localeCompare(a));

  // Cadence Compliance
  const neWeeklyDepts = departments.filter((d) => d.companyId === 'next_energy' && d.cadenceRequired === 'weekly');
  const neBosses = departments.filter((d) => d.cadenceRequired === 'monthly' && (d.companyId === 'next_energy' || d.companyId === 'group'));
  const naWeeklyDepts = departments.filter((d) => d.companyId === 'next_academy' && d.cadenceRequired === 'weekly');
  const naMonthlyDepts = departments.filter((d) => d.companyId === 'next_academy' && d.cadenceRequired === 'monthly');

  const checkCadenceStatus = (dept: Department) => {
    const personSessions = sessions121.filter(
      (s) =>
        (s.departmentId === dept.id || s.personName.toLowerCase().includes(dept.hod.toLowerCase())) &&
        s.monthYear === selectedMonth &&
        s.status === 'Completed'
    );

    const requiredTarget = dept.cadenceRequired === 'weekly' ? 4 : 1;
    const count = personSessions.length;
    const isCompliant = count >= requiredTarget;

    return { count, requiredTarget, isCompliant, lastSession: personSessions[0] };
  };

  const allDepts = departments.filter((d) => selectedCompany === 'all' || d.companyId === selectedCompany);
  const totalRequiredSessions = allDepts.reduce((acc, d) => acc + (d.cadenceRequired === 'weekly' ? 4 : 1), 0);
  const totalCompletedSessions = allDepts.reduce((acc, d) => acc + Math.min(d.cadenceRequired === 'weekly' ? 4 : 1, checkCadenceStatus(d).count), 0);
  const overallCompletionPercent = totalRequiredSessions > 0 ? Math.round((totalCompletedSessions / totalRequiredSessions) * 100) : 0;

  const toggleActionItem = (sessionId: string, actionItemId: string) => {
    const session = sessions121.find((s) => s.id === sessionId);
    if (!session) return;
    const updatedActionItems = session.actionItems.map((a) =>
      a.id === actionItemId ? { ...a, completed: !a.completed } : a
    );
    update121Session(sessionId, { actionItems: updatedActionItems });
  };

  // Helper to format month heading (e.g. "2026-08" -> "August 2026")
  const formatMonthTitle = (monthStr: string) => {
    if (monthStr === 'Uncategorized') return monthStr;
    const [year, month] = monthStr.split('-');
    if (!year || !month) return monthStr;
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* 1. Cadence Compliance Overview Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide">
                121 Cadence Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">Selected Active Month: {selectedMonth}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>1-on-1 Cadence Completion Rate & Metrics</span>
            </h2>
          </div>

          <button
            onClick={onOpenAdd121}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log New 121 Session</span>
          </button>
        </div>

        {/* Big Rate Gauge & Cadence Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase text-[10px] tracking-wider">Overall Cadence Score</span>
              <div className="text-3xl font-black text-blue-600 mt-1">
                {overallCompletionPercent}%
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {totalCompletedSessions} of {totalRequiredSessions} target 121s
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 flex items-center justify-center font-black text-xs text-blue-600 bg-white">
              {overallCompletionPercent}%
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-blue-700 font-bold text-xs uppercase text-[10px]">
              <Zap className="w-3.5 h-3.5 fill-blue-600 text-blue-600" /> Next Energy HODs (Weekly)
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {neWeeklyDepts.filter((d) => checkCadenceStatus(d).isCompliant).length} / {neWeeklyDepts.length} HODs
            </div>
            <p className="text-[11px] text-slate-500">Weekly cadence required (Michael, Ivonne, Trish, Sam/Alvin, Zalin, Shawna)</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-amber-700 font-bold text-xs uppercase text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Executive Bosses (Monthly)
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {neBosses.filter((d) => checkCadenceStatus(d).isCompliant).length} / {neBosses.length} Bosses
            </div>
            <p className="text-[11px] text-slate-500">CEO Lim Chze Hong & Group CEO Steven Chiew</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-1">
            <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs uppercase text-[10px]">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Next Academy Leadership
            </div>
            <div className="text-xl font-black text-slate-900 mt-1">
              {naWeeklyDepts.concat(naMonthlyDepts).filter((d) => checkCadenceStatus(d).isCompliant).length} / {naWeeklyDepts.length + naMonthlyDepts.length} Roles
            </div>
            <p className="text-[11px] text-slate-500">Weekly: Ying | Monthly: Chee Cai, Alif, Atiqa</p>
          </div>
        </div>
      </section>

      {/* 2. Team Member Cadence Matrix */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Cadence Compliance Matrix ({selectedMonth})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allDepts.map((d) => {
            const { count, requiredTarget, isCompliant, lastSession } = checkCadenceStatus(d);
            const isEnergy = d.companyId === 'next_energy' || d.companyId === 'group';

            return (
              <div
                key={d.id}
                className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isEnergy ? 'bg-blue-600' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="font-bold text-xs text-slate-900">{d.hod}</span>
                    <span className="text-[11px] text-slate-500 font-medium">({d.name})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Role: {d.roleTitle} • Cadence: <span className="capitalize text-slate-700 font-bold">{d.cadenceRequired}</span>
                  </div>
                  {lastSession && (
                    <div className="text-[10px] text-slate-400 mt-1">
                      Last 121: {lastSession.date}
                    </div>
                  )}
                </div>

                <div className="text-right flex flex-col items-end">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                      isCompliant
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isCompliant ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Compliant
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-600" /> Pending ({count}/{requiredTarget})
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Grouped 121 Session History strictly by Month */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-blue-600" />
              <span>1-on-1 Session Archives (Grouped by Month)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sessions organized chronologically into collapsible monthly folders. Expand or collapse past months to keep view structured.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search person, role or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-900 pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {sortedMonthKeys.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No 121 sessions logged matching your search query.</p>
            <button
              onClick={onOpenAdd121}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Log Session Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedMonthKeys.map((monthKey) => {
              const monthSessions = sessionsByMonth[monthKey];
              const isCollapsed = collapsedMonths[monthKey];
              const formattedTitle = formatMonthTitle(monthKey);

              return (
                <div key={monthKey} className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  {/* Collapsible Month Header */}
                  <div
                    onClick={() => toggleMonthCollapse(monthKey)}
                    className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <h4 className="font-bold text-sm text-slate-100">{formattedTitle}</h4>
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {monthSessions.length} {monthSessions.length === 1 ? 'Session' : 'Sessions'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                      <span>{isCollapsed ? 'Expand Month' : 'Collapse Month'}</span>
                      {isCollapsed ? <ChevronDown className="w-4 h-4 text-blue-400" /> : <ChevronUp className="w-4 h-4 text-blue-400" />}
                    </div>
                  </div>

                  {/* Month Sessions List */}
                  {!isCollapsed && (
                    <div className="p-4 space-y-4 bg-slate-50/50">
                      {monthSessions.map((session) => {
                        const isExpanded = expandedSessionId === session.id;
                        const isEnergy = session.companyId === 'next_energy' || session.companyId === 'group';

                        return (
                          <div
                            key={session.id}
                            className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 space-y-3 transition-all shadow-2xs"
                          >
                            {/* Session Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white ${
                                    isEnergy ? 'bg-blue-600' : 'bg-emerald-600'
                                  }`}
                                >
                                  {session.personName.charAt(0)}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 text-sm">{session.personName}</h4>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                        isEnergy
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {session.role}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                                    <span>Date: {session.date}</span>
                                    <span>•</span>
                                    <span className="capitalize">Cadence: {session.cadence}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Energy Rating Stars & Action controls */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase">Energy:</span>
                                  <div className="flex items-center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-3 h-3 ${
                                          star <= session.energyRating
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-slate-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <button
                                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                                >
                                  {isExpanded ? 'Hide Details' : 'View Notes'}
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this 1-on-1 session entry?')) {
                                      delete121Session(session.id);
                                    }
                                  }}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                  title="Delete session"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Summary snippet */}
                            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <span className="font-bold text-slate-900">Notes: </span>
                              {session.notes}
                            </p>

                            {/* Expanded Content: Ups & Downs + Action Items */}
                            {isExpanded && (
                              <div className="pt-3 border-t border-slate-100 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Sentiment Ups (Highs) */}
                                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                                    <h5 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Sentiment Highs & Ups
                                    </h5>
                                    {session.sentimentUps.length === 0 ? (
                                      <p className="text-xs text-slate-500 font-medium">No highs recorded.</p>
                                    ) : (
                                      <ul className="space-y-1 text-xs text-slate-800 list-disc list-inside font-medium">
                                        {session.sentimentUps.map((up, idx) => (
                                          <li key={idx} className="leading-snug">{up}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>

                                  {/* Sentiment Downs (Lows) */}
                                  <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200 space-y-2">
                                    <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" /> Sentiment Lows & Blockers
                                    </h5>
                                    {session.sentimentDowns.length === 0 ? (
                                      <p className="text-xs text-slate-500 font-medium">No blockers recorded.</p>
                                    ) : (
                                      <ul className="space-y-1 text-xs text-slate-800 list-disc list-inside font-medium">
                                        {session.sentimentDowns.map((down, idx) => (
                                          <li key={idx} className="leading-snug">{down}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                </div>

                                {/* Action Items Checklist */}
                                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> Follow-up Action Items & Deadlines
                                  </h5>

                                  {session.actionItems.length === 0 ? (
                                    <p className="text-xs text-slate-500 font-medium">No action items assigned.</p>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {session.actionItems.map((item) => (
                                        <div
                                          key={item.id}
                                          onClick={() => toggleActionItem(session.id, item.id)}
                                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs border ${
                                            item.completed
                                              ? 'bg-slate-100/60 text-slate-400 line-through border-slate-200/50'
                                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100/80'
                                          }`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <button className="text-blue-600 focus:outline-none">
                                              {item.completed ? (
                                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                                              ) : (
                                                <Square className="w-4 h-4 text-slate-400" />
                                              )}
                                            </button>
                                            <span className="font-medium">{item.task}</span>
                                          </div>

                                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                            <span>Owner: <strong className="text-slate-900">{item.owner}</strong></span>
                                            <span className="flex items-center gap-1 font-medium">
                                              <Clock className="w-3 h-3 text-slate-400" /> Due: {item.deadline}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
