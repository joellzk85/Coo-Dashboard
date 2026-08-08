import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { CompanyId, ActivityCategory } from '../../types/dashboard';
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
  Check
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  type: '121' | 'deptGoal' | 'activity' | 'journal' | 'book' | 'personalBible' | null;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, type, onClose }) => {
  const {
    departments,
    add121Session,
    addDepartmentGoal,
    addActivityLog,
    addReflection,
    addReadingLog,
    addPersonalGoalOrBible
  } = useDashboard();

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
      targetMetric: goalTargetMetric || 'Milestones Complete',
      progressPercent: 0,
      status: 'On Track',
      targetDate: goalTargetDate,
      impactLevel: goalImpactLevel,
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 shadow-xl relative space-y-5 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {type === '121' && <Users className="w-5 h-5 text-blue-600" />}
            {type === 'deptGoal' && <TrendingUp className="w-5 h-5 text-blue-600" />}
            {type === 'activity' && <Award className="w-5 h-5 text-blue-600" />}
            {type === 'journal' && <Zap className="w-5 h-5 text-purple-600" />}
            {type === 'book' && <BookOpen className="w-5 h-5 text-blue-600" />}
            {type === 'personalBible' && <Heart className="w-5 h-5 text-rose-600" />}

            <h3 className="text-lg font-bold text-slate-900">
              {type === '121' && 'Log 1-on-1 (121) Session'}
              {type === 'deptGoal' && 'Add Department Goal'}
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

        {/* Form 1: 121 Session */}
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

            <div className="pt-2 flex justify-end gap-2">
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

        {/* Form 2: Department Goal */}
        {type === 'deptGoal' && (
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

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-sm"
              >
                Add Dept Goal
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
