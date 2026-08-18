import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { CompanyId, ActivityCategory, GoalImpactLevel } from '../../types/dashboard';
import {
  X,
  Users,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
  Heart,
  Plus,
  Trash2,
  Check,
  Building2,
  GraduationCap,
  Sparkles,
  Target
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  type: 'companyGoal' | 'deptGoal' | '121' | 'activity' | 'journal' | 'book' | 'personalBible' | 'addHod' | null;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, type, onClose }) => {
  const {
    departments,
    addDepartment,
    addCompanyGoal,
    add121Session,
    addDepartmentGoal,
    addActivityLog,
    addReflection,
    addReadingLog,
    addPersonalGoalOrBible
  } = useDashboard();

  // Mode switcher for Goal Creation (Company Big Goal vs Department Goal)
  const [goalMode, setGoalMode] = useState<'company' | 'department'>('company');

  // Inline HOD Creator State (useful in 121 flow and for standalone addHod)
  const [showInlineAddHod, setShowInlineAddHod] = useState(false);
  const [newHodCompany, setNewHodCompany] = useState<CompanyId>('next_energy');
  const [newHodDeptName, setNewHodDeptName] = useState('');
  const [newHodName, setNewHodName] = useState('');
  const [newHodRoleTitle, setNewHodRoleTitle] = useState('');
  const [newHodAhod, setNewHodAhod] = useState('');
  const [newHodCadence, setNewHodCadence] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    if (type === 'companyGoal') {
      setGoalMode('company');
    } else if (type === 'deptGoal') {
      setGoalMode('department');
    } else if (type === 'addHod') {
      setShowInlineAddHod(true);
    }
  }, [type]);

  // Form states for Company Big Goal
  const [cgCompany, setCgCompany] = useState<CompanyId>('next_energy');
  const [cgTitle, setCgTitle] = useState('');
  const [cgDesc, setCgDesc] = useState('');
  const [cgImpactLevel, setCgImpactLevel] = useState<GoalImpactLevel>('High');
  const [cgTargetMetric, setCgTargetMetric] = useState('RM 20M Pipeline Value');
  const [cgCurrentVal, setCgCurrentVal] = useState<string>('0');
  const [cgTargetVal, setCgTargetVal] = useState<string>('20');
  const [cgUnit, setCgUnit] = useState<string>('RM Million');
  const [cgAcademyRevCurrent, setCgAcademyRevCurrent] = useState<string>('0');
  const [cgAcademyRevTarget, setCgAcademyRevTarget] = useState<string>('1000000');
  const [cgAcademyDaysCurrent, setCgAcademyDaysCurrent] = useState<string>('0');
  const [cgAcademyDaysTarget, setCgAcademyDaysTarget] = useState<string>('40');
  const [cgTargetDate, setCgTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [cgMilestones, setCgMilestones] = useState<string[]>(['']);

  // Form states for 121
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || '');
  const [sessionPersonName, setSessionPersonName] = useState(departments[0]?.hod || '');
  const [sessionRole, setSessionRole] = useState(departments[0]?.roleTitle || '');
  const [sessionCompany, setSessionCompany] = useState<CompanyId>(departments[0]?.companyId || 'next_energy');
  const [sessionCadence, setSessionCadence] = useState<'weekly' | 'monthly'>('weekly');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionUps, setSessionUps] = useState<string[]>(['']);
  const [sessionDowns, setSessionDowns] = useState<string[]>(['']);
  const [sessionActionItems, setSessionActionItems] = useState<Array<{ task: string; owner: string; deadline: string }>>([
    { task: '', owner: '', deadline: new Date().toISOString().split('T')[0] },
  ]);
  const [sessionEnergy, setSessionEnergy] = useState<number>(5);

  // Form states for Dept Goal
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTargetMetric, setGoalTargetMetric] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [goalMilestones, setGoalMilestones] = useState<string[]>(['']);
  const [goalImpactLevel, setGoalImpactLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [goalAcademyRevCurrent, setGoalAcademyRevCurrent] = useState<string>('0');
  const [goalAcademyRevTarget, setGoalAcademyRevTarget] = useState<string>('500000');
  const [goalAcademyDaysCurrent, setGoalAcademyDaysCurrent] = useState<string>('0');
  const [goalAcademyDaysTarget, setGoalAcademyDaysTarget] = useState<string>('40');

  // Form states for Activity
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState<ActivityCategory>('Meeting with Mentor');
  const [actImpactTag, setActImpactTag] = useState<'High Impact' | 'Low/No Impact'>('High Impact');
  const [actHours, setActHours] = useState<number>(2);
  const [actOutcome, setActOutcome] = useState('');
  const [actReflection, setActReflection] = useState('');

  // Form states for Journal
  const [jTitle, setJTitle] = useState('');
  const [jCategory, setJCategory] = useState<'Strategic Insight' | 'Leadership Lesson' | 'Operational Improvement' | 'Crisis Management'>('Leadership Lesson');
  const [jContent, setJContent] = useState('');
  const [jActionItems, setJActionItems] = useState<string[]>(['']);

  // Form states for Book
  const [bTitle, setBTitle] = useState('');
  const [bAuthor, setBAuthor] = useState('');
  const [bLearnings, setBLearnings] = useState('');
  const [bExecution, setBExecution] = useState('');

  // Form states for Personal/Bible
  const [pbCategory, setPbCategory] = useState<'Personal Goal' | 'Bible Learning'>('Bible Learning');
  const [pbTitle, setPbTitle] = useState('');
  const [pbRef, setPbRef] = useState('');
  const [pbReflections, setPbReflections] = useState('');
  const [pbActionSteps, setPbActionSteps] = useState('');

  if (!isOpen || !type) return null;

  const handleDeptSelect = (deptId: string) => {
    setSelectedDeptId(deptId);
    const d = departments.find((item) => item.id === deptId);
    if (d) {
      setSessionPersonName(d.hod);
      setSessionRole(d.roleTitle);
      setSessionCompany(d.companyId);
      setSessionCadence(d.cadenceRequired);
    }
  };

  const handleSubmitCompanyGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cgTitle.trim()) return;

    const isAcademy = cgCompany === 'next_academy';

    await addCompanyGoal({
      companyId: cgCompany,
      title: cgTitle.trim(),
      description: cgDesc.trim(),
      targetMetric: isAcademy ? 'Revenue & Training Days' : (cgTargetMetric.trim() || 'Contract Value'),
      currentValue: isAcademy ? 0 : (Number(cgCurrentVal) || 0),
      targetValue: isAcademy ? 100 : (Number(cgTargetVal) || 100),
      unit: isAcademy ? 'RM / Days' : (cgUnit.trim() || ''),
      targetDate: cgTargetDate,
      overallRating: 'B',
      impactLevel: cgImpactLevel,
      ...(isAcademy ? {
        academyRevenueCurrent: Number(cgAcademyRevCurrent) || 0,
        academyRevenueTarget: Number(cgAcademyRevTarget) || 1000000,
        academyTrainingDaysCurrent: Number(cgAcademyDaysCurrent) || 0,
        academyTrainingDaysTarget: Number(cgAcademyDaysTarget) || 40,
      } : {}),
      milestones: cgMilestones
        .filter((m) => m.trim() !== '')
        .map((m, i) => ({ id: `m_${Date.now()}_${i}`, title: m.trim(), completed: false })),
    });

    onClose();
  };

  const handleSubmit121 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionPersonName || !sessionNotes) return;

    add121Session({
      personName: sessionPersonName,
      role: sessionRole,
      departmentId: selectedDeptId,
      companyId: sessionCompany,
      cadence: sessionCadence,
      date: sessionDate,
      monthYear: sessionDate.substring(0, 7),
      status: 'Completed',
      notes: sessionNotes,
      sentimentUps: sessionUps.filter((u) => u.trim() !== ''),
      sentimentDowns: sessionDowns.filter((d) => d.trim() !== ''),
      actionItems: sessionActionItems
        .filter((a) => a.task.trim() !== '')
        .map((a, i) => ({
          id: `a_${Date.now()}_${i}`,
          task: a.task,
          owner: a.owner || sessionPersonName,
          deadline: a.deadline,
          completed: false,
        })),
      energyRating: sessionEnergy,
    });

    onClose();
  };

  const handleCreateInlineHod = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newHodName || !newHodDeptName) return;

    const newDeptId = `dept_${newHodDeptName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const newDept: Department = {
      id: newDeptId,
      name: newHodDeptName,
      companyId: newHodCompany,
      hod: newHodName,
      ahod: newHodAhod ? newHodAhod : undefined,
      roleTitle: newHodRoleTitle || `Head of ${newHodDeptName}`,
      cadenceRequired: newHodCadence,
    };

    addDepartment(newDept);

    // Auto-select this newly created HOD in the 121 session state
    setSelectedDeptId(newDept.id);
    setSessionPersonName(newDept.hod);
    setSessionRole(newDept.roleTitle);
    setSessionCompany(newDept.companyId);
    setSessionCadence(newDept.cadenceRequired);

    // Reset inline form fields
    setNewHodDeptName('');
    setNewHodName('');
    setNewHodRoleTitle('');
    setNewHodAhod('');
    setShowInlineAddHod(false);

    if (type === 'addHod') {
      onClose();
    }
  };

  const handleSubmitDeptGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle) return;

    const d = departments.find((item) => item.id === selectedDeptId) || departments[0];

    addDepartmentGoal({
      departmentId: d.id,
      departmentName: d.name,
      companyId: d.companyId,
      hodName: d.hod,
      title: goalTitle,
      description: goalDesc,
      targetMetric: d.companyId === 'next_academy' ? 'Next Academy Specific Metrics' : (goalTargetMetric || 'Milestones Complete'),
      progressPercent: 0,
      status: 'On Track',
      targetDate: goalTargetDate,
      impactLevel: goalImpactLevel,
      ...(d.companyId === 'next_academy' ? {
        academyRevenueCurrent: Number(goalAcademyRevCurrent) || 0,
        academyRevenueTarget: Number(goalAcademyRevTarget) || 500000,
        academyTrainingDaysCurrent: Number(goalAcademyDaysCurrent) || 0,
        academyTrainingDaysTarget: Number(goalAcademyDaysTarget) || 40,
      } : {}),
      milestones: goalMilestones
        .filter((m) => m.trim() !== '')
        .map((m, i) => ({ id: `m_${Date.now()}_${i}`, title: m, completed: false })),
    });

    onClose();
  };

  const handleSubmitActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actTitle) return;

    addActivityLog({
      date: new Date().toISOString().split('T')[0],
      title: actTitle,
      category: actCategory,
      impactTag: actImpactTag,
      hoursSpent: actHours,
      outcome: actOutcome,
      reflections: actReflection,
    });

    onClose();
  };

  const handleSubmitJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jTitle || !jContent) return;

    addReflection({
      date: new Date().toISOString().split('T')[0],
      title: jTitle,
      category: jCategory,
      content: jContent,
      actionItems: jActionItems.filter((i) => i.trim() !== ''),
    });

    onClose();
  };

  const handleSubmitBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle) return;

    addReadingLog({
      title: bTitle,
      author: bAuthor || 'Unknown Author',
      status: 'Reading',
      progressPercent: 25,
      learnings: bLearnings,
      execution: bExecution,
    });

    onClose();
  };

  const handleSubmitPersonalBible = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pbTitle) return;

    addPersonalGoalOrBible({
      category: pbCategory,
      title: pbTitle,
      referenceOrFocus: pbRef,
      reflections: pbReflections,
      actionSteps: pbActionSteps,
      targetDate: new Date().toISOString().split('T')[0],
      completed: false,
    });

    onClose();
  };

  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl relative space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {(type === 'companyGoal' || type === 'deptGoal') && (
              goalMode === 'company' ? (
                <Building2 className="w-5 h-5 text-blue-600" />
              ) : (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              )
            )}
            {type === '121' && <Users className="w-5 h-5 text-blue-600" />}
            {type === 'addHod' && <Users className="w-5 h-5 text-indigo-600" />}
            {type === 'activity' && <Award className="w-5 h-5 text-blue-600" />}
            {type === 'journal' && <Zap className="w-5 h-5 text-purple-600" />}
            {type === 'book' && <BookOpen className="w-5 h-5 text-blue-600" />}
            {type === 'personalBible' && <Heart className="w-5 h-5 text-rose-600" />}

            <h3 className="text-lg font-bold text-slate-900">
              {(type === 'companyGoal' || type === 'deptGoal') && (
                goalMode === 'company' ? 'Add Company Big Goal' : 'Add Department Goal'
              )}
              {type === '121' && 'Log 1-on-1 (121) Session'}
              {type === 'addHod' && 'Add New HOD / Department Head'}
              {type === 'activity' && 'Log Activity Impact'}
              {type === 'journal' && 'Add Strategic Reflection'}
              {type === 'book' && 'Add Book to Reading Log'}
              {type === 'personalBible' && 'Add Personal / Bible Goal'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal Type Switcher Tabs (when creating goals) */}
        {(type === 'companyGoal' || type === 'deptGoal') && (
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setGoalMode('company')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                goalMode === 'company'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>🏢 Company Big Goal (Macro Objective)</span>
            </button>

            <button
              type="button"
              onClick={() => setGoalMode('department')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                goalMode === 'department'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>⚡ Department Goal (HOD Operational)</span>
            </button>
          </div>
        )}

        {/* Form: Company Big Goal */}
        {(type === 'companyGoal' || type === 'deptGoal') && goalMode === 'company' && (
          <form onSubmit={handleSubmitCompanyGoal} className="space-y-4 text-xs text-slate-700 font-medium">
            {/* Target Company Selector */}
            <div>
              <label className="font-bold text-slate-900 block mb-1.5">Target Company Entity</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCgCompany('next_energy')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    cgCompany === 'next_energy'
                      ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${cgCompany === 'next_energy' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-extrabold text-xs">Next Energy</div>
                    <div className="text-[10px] text-slate-500 font-normal">Solar EPC & Asset Growth</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCgCompany('next_academy')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                    cgCompany === 'next_academy'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <GraduationCap className={`w-4 h-4 ${cgCompany === 'next_academy' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-extrabold text-xs">Next Academy</div>
                    <div className="text-[10px] text-slate-500 font-normal">Revenue & Training Days</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">Company Big Goal Title</label>
              <input
                type="text"
                value={cgTitle}
                onChange={(e) => setCgTitle(e.target.value)}
                placeholder={
                  cgCompany === 'next_academy'
                    ? 'e.g. Next Academy Regional Training Expansion & Revenue Growth'
                    : 'e.g. H2 2026 Commercial Solar EPC Pipeline & Market Leadership'
                }
                required
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-xs font-semibold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">Strategic Objective & Context</label>
              <textarea
                rows={2}
                value={cgDesc}
                onChange={(e) => setCgDesc(e.target.value)}
                placeholder="Key strategic outcomes, revenue drivers, and group impact..."
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-xs"
              />
            </div>

            {/* Impact Level */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">Strategic Weight / Impact Level</label>
              <select
                value={cgImpactLevel}
                onChange={(e) => setCgImpactLevel(e.target.value as GoalImpactLevel)}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium text-xs"
              >
                <option value="High">🔥 High Impact (1.5x Multiplier - Critical Executive Priority)</option>
                <option value="Medium">⚡ Medium Impact (1.0x Multiplier - Standard Strategic Goal)</option>
                <option value="Low">🌱 Low Impact (0.5x Multiplier - Supporting Initiative)</option>
              </select>
            </div>

            {/* Target Metrics depending on Company */}
            {cgCompany === 'next_academy' ? (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
                <div className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>Academy Macro Revenue & Training Volume Targets</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Current Revenue (RM)</label>
                    <input
                      type="number"
                      value={cgAcademyRevCurrent}
                      onChange={(e) => setCgAcademyRevCurrent(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white p-2 rounded-lg border border-emerald-300 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Target Revenue (RM)</label>
                    <input
                      type="number"
                      value={cgAcademyRevTarget}
                      onChange={(e) => setCgAcademyRevTarget(e.target.value)}
                      placeholder="1000000"
                      className="w-full bg-white p-2 rounded-lg border border-emerald-300 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Days Conducted</label>
                    <input
                      type="number"
                      value={cgAcademyDaysCurrent}
                      onChange={(e) => setCgAcademyDaysCurrent(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white p-2 rounded-lg border border-emerald-300 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Target Training Days</label>
                    <input
                      type="number"
                      value={cgAcademyDaysTarget}
                      onChange={(e) => setCgAcademyDaysTarget(e.target.value)}
                      placeholder="40"
                      className="w-full bg-white p-2 rounded-lg border border-emerald-300 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
                <div className="font-extrabold text-blue-950 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-blue-700" />
                  <span>Next Energy Target Metrics</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Target Metric Name</label>
                    <input
                      type="text"
                      value={cgTargetMetric}
                      onChange={(e) => setCgTargetMetric(e.target.value)}
                      placeholder="e.g. Contract Pipeline"
                      className="w-full bg-white p-2 rounded-lg border border-blue-300 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Current Progress</label>
                    <input
                      type="number"
                      value={cgCurrentVal}
                      onChange={(e) => setCgCurrentVal(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white p-2 rounded-lg border border-blue-300 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Target Goal Value</label>
                    <input
                      type="number"
                      value={cgTargetVal}
                      onChange={(e) => setCgTargetVal(e.target.value)}
                      placeholder="25"
                      className="w-full bg-white p-2 rounded-lg border border-blue-300 text-slate-900 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block text-[11px] mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    value={cgUnit}
                    onChange={(e) => setCgUnit(e.target.value)}
                    placeholder="e.g. RM Million, MWp, Signed Deals"
                    className="w-full bg-white p-2 rounded-lg border border-blue-300 text-slate-900 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Target Completion Date */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">Target Completion Date</label>
              <input
                type="date"
                value={cgTargetDate}
                onChange={(e) => setCgTargetDate(e.target.value)}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white text-xs"
              />
            </div>

            {/* Key Milestones */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block mb-1">Key Deliverables & Milestones</label>
              {cgMilestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => {
                      const copy = [...cgMilestones];
                      copy[idx] = e.target.value;
                      setCgMilestones(copy);
                    }}
                    placeholder={`e.g. Milestone ${idx + 1}: Finalize partner onboarding`}
                    className="w-full bg-slate-50 p-2 rounded-lg border border-slate-300 text-slate-900 focus:bg-white text-xs"
                  />
                  {cgMilestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setCgMilestones(cgMilestones.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCgMilestones([...cgMilestones, ''])}
                className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create Company Big Goal
              </button>
            </div>
          </form>
        )}

        {/* Form: Department Goal */}
        {(type === 'companyGoal' || type === 'deptGoal') && goalMode === 'department' && (
          <form onSubmit={handleSubmitDeptGoal} className="space-y-4 text-xs text-slate-700 font-medium">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Select Department</label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (HOD: {d.hod} - {d.companyId === 'next_energy' ? 'Next Energy' : 'Next Academy'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Goal Title</label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. H2 Commercial Solar Pipeline Expansion"
                required
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Description & Objective</label>
              <textarea
                rows={2}
                value={goalDesc}
                onChange={(e) => setGoalDesc(e.target.value)}
                placeholder="Key outcomes expected..."
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Goal Impact Level (Weights in Rating Engine)</label>
              <select
                value={goalImpactLevel}
                onChange={(e) => setGoalImpactLevel(e.target.value as any)}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
              >
                <option value="High">🔥 High Impact (1.5x Multiplier)</option>
                <option value="Medium">⚡ Medium Impact (1.0x Multiplier)</option>
                <option value="Low">🌱 Low Impact (0.5x Multiplier)</option>
              </select>
            </div>

            {departments.find(d => d.id === selectedDeptId)?.companyId === 'next_academy' ? (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
                <div className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                  🎓 Next Academy Specific Metrics
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Current Revenue (RM)</label>
                    <input
                      type="number"
                      value={goalAcademyRevCurrent}
                      onChange={(e) => setGoalAcademyRevCurrent(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-amber-300 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Target Revenue (RM)</label>
                    <input
                      type="number"
                      value={goalAcademyRevTarget}
                      onChange={(e) => setGoalAcademyRevTarget(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-amber-300 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Days Conducted</label>
                    <input
                      type="number"
                      value={goalAcademyDaysCurrent}
                      onChange={(e) => setGoalAcademyDaysCurrent(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-amber-300 text-slate-900 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block text-[11px] mb-1">Target Training Days</label>
                    <input
                      type="number"
                      value={goalAcademyDaysTarget}
                      onChange={(e) => setGoalAcademyDaysTarget(e.target.value)}
                      className="w-full bg-white p-2 rounded-lg border border-amber-300 text-slate-900 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg border border-amber-300 text-slate-900 text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Target Metric</label>
                  <input
                    type="text"
                    value={goalTargetMetric}
                    onChange={(e) => setGoalTargetMetric(e.target.value)}
                    placeholder="e.g. RM 10M Signed Contracts"
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Key Milestones for Dept Goal */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block mb-1">Key Department Milestones</label>
              {goalMilestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={m}
                    onChange={(e) => {
                      const copy = [...goalMilestones];
                      copy[idx] = e.target.value;
                      setGoalMilestones(copy);
                    }}
                    placeholder={`e.g. Milestone ${idx + 1}: Finalize partner onboarding`}
                    className="w-full bg-slate-50 p-2 rounded-lg border border-slate-300 text-slate-900 focus:bg-white text-xs"
                  />
                  {goalMilestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setGoalMilestones(goalMilestones.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setGoalMilestones([...goalMilestones, ''])}
                className="text-[11px] text-emerald-600 font-bold hover:underline flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Milestone
              </button>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Department Goal
              </button>
            </div>
          </form>
        )}

        {/* Form: 121 Session */}
        {type === '121' && (
          <form onSubmit={handleSubmit121} className="space-y-4 text-xs text-slate-700 font-medium">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Select Department / HOD</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => handleDeptSelect(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.hod} ({d.name} - {d.companyId === 'next_energy' ? 'Next Energy' : 'Next Academy'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Session Date</label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Meeting Notes & Key Summary</label>
              <textarea
                rows={3}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Key topics discussed, strategic decisions, updates..."
                required
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Sentiment Ups & Downs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-emerald-700 block mb-1">Sentiment Highs / Ups</label>
                {sessionUps.map((up, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={up}
                    onChange={(e) => {
                      const copy = [...sessionUps];
                      copy[idx] = e.target.value;
                      setSessionUps(copy);
                    }}
                    placeholder="e.g. Closed RM 1.5M contract"
                    className="w-full bg-slate-50 p-2 rounded-lg border border-slate-300 text-slate-900 mb-1 focus:bg-white focus:border-emerald-600"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setSessionUps([...sessionUps, ''])}
                  className="text-[11px] text-emerald-700 font-bold hover:underline"
                >
                  + Add High
                </button>
              </div>

              <div>
                <label className="font-bold text-rose-700 block mb-1">Sentiment Lows / Blockers</label>
                {sessionDowns.map((down, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={down}
                    onChange={(e) => {
                      const copy = [...sessionDowns];
                      copy[idx] = e.target.value;
                      setSessionDowns(copy);
                    }}
                    placeholder="e.g. Client legal approval delay"
                    className="w-full bg-slate-50 p-2 rounded-lg border border-slate-300 text-slate-900 mb-1 focus:bg-white focus:border-rose-600"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setSessionDowns([...sessionDowns, ''])}
                  className="text-[11px] text-rose-700 font-bold hover:underline"
                >
                  + Add Blocker
                </button>
              </div>
            </div>

            {/* Energy Rating */}
            <div>
              <label className="font-bold text-slate-900 block mb-1">Session Energy Rating (1 to 5)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSessionEnergy(star)}
                    className={`px-3 py-1 rounded-lg border text-xs font-bold transition-all ${
                      sessionEnergy >= star
                        ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-2xs'
                        : 'bg-slate-50 text-slate-500 border-slate-300'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors shadow-sm"
              >
                Save 121 Session
              </button>
            </div>
          </form>
        )}

        {/* Form 3: Activity Impact Log */}
        {type === 'activity' && (
          <form onSubmit={handleSubmitActivity} className="space-y-4 text-xs text-slate-700 font-medium">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Activity Title</label>
              <input
                type="text"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                placeholder="e.g. FMM Industry Networking Dinner"
                required
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-900 block mb-1">Category</label>
                <select
                  value={actCategory}
                  onChange={(e) => setActCategory(e.target.value as ActivityCategory)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="Meeting with Mentor">Meeting with Mentor</option>
                  <option value="Networking">Networking</option>
                  <option value="Department Review">Department Review</option>
                  <option value="Strategic Planning">Strategic Planning</option>
                  <option value="Vendor Negotiation">Vendor Negotiation</option>
                  <option value="Process Optimization">Process Optimization</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Impact Tag</label>
                <select
                  value={actImpactTag}
                  onChange={(e) => setActImpactTag(e.target.value as any)}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="High Impact">High Impact</option>
                  <option value="Low/No Impact">Low/No Impact</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Hours Spent</label>
              <input
                type="number"
                step="0.5"
                value={actHours}
                onChange={(e) => setActHours(Number(e.target.value))}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Key Outcome & Reflections</label>
              <textarea
                rows={2}
                value={actOutcome}
                onChange={(e) => setActOutcome(e.target.value)}
                placeholder="What was achieved?"
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-sm">
                Log Activity
              </button>
            </div>
          </form>
        )}

        {/* Form 4: Journal */}
        {type === 'journal' && (
          <form onSubmit={handleSubmitJournal} className="space-y-4 text-xs text-slate-700 font-medium">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Reflection Title</label>
              <input
                type="text"
                value={jTitle}
                onChange={(e) => setJTitle(e.target.value)}
                placeholder="e.g. Predictable Cadence in Executive Operations"
                required
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Reflection Content</label>
              <textarea
                rows={4}
                value={jContent}
                onChange={(e) => setJContent(e.target.value)}
                placeholder="Detailed strategic thoughts..."
                required
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-sm">
                Save Reflection
              </button>
            </div>
          </form>
        )}

        {/* Form 5: Book */}
        {type === 'book' && (
          <form onSubmit={handleSubmitBook} className="space-y-4 text-xs text-slate-700 font-medium">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Book Title</label>
              <input
                type="text"
                value={bTitle}
                onChange={(e) => setBTitle(e.target.value)}
                placeholder="e.g. The Great CEO Within"
                required
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Author</label>
              <input
                type="text"
                value={bAuthor}
                onChange={(e) => setBAuthor(e.target.value)}
                placeholder="e.g. Matt Mochary"
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">What Did I Learn?</label>
              <textarea
                rows={2}
                value={bLearnings}
                onChange={(e) => setBLearnings(e.target.value)}
                placeholder="Key takeaways..."
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">How To Apply to Next Energy / Academy?</label>
              <textarea
                rows={2}
                value={bExecution}
                onChange={(e) => setBExecution(e.target.value)}
                placeholder="Actionable execution steps..."
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-sm">
                Save Book
              </button>
            </div>
          </form>
        )}

        {/* Form 6: Personal/Bible */}
        {type === 'personalBible' && (
          <form onSubmit={handleSubmitPersonalBible} className="space-y-4 text-xs text-slate-700 font-medium">
            <div>
              <label className="font-bold text-slate-900 block mb-1">Category</label>
              <select
                value={pbCategory}
                onChange={(e) => setPbCategory(e.target.value as any)}
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="Bible Learning">Bible Learning</option>
                <option value="Personal Goal">Personal Goal</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Title</label>
              <input
                type="text"
                value={pbTitle}
                onChange={(e) => setPbTitle(e.target.value)}
                placeholder="e.g. Wisdom in Executive Stewardship & Humility"
                required
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Scripture Reference or Focus Area</label>
              <input
                type="text"
                value={pbRef}
                onChange={(e) => setPbRef(e.target.value)}
                placeholder="e.g. Proverbs 16:3 & Colossians 3:23"
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">Reflections & Action Steps</label>
              <textarea
                rows={3}
                value={pbReflections}
                onChange={(e) => setPbReflections(e.target.value)}
                placeholder="Personal reflections..."
                className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-sm">
                Save Goal
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
