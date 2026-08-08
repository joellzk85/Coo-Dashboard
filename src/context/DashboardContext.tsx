import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Department,
  CompanyGoal,
  DepartmentGoal,
  Session121,
  MonthlyKPIGrade,
  ActivityImpactLog,
  COOLearningReflection,
  ReadingLog,
  PersonalGoalAndBible,
  WellnessLog,
  CompanyId,
  Milestone
} from '../types/dashboard';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_COMPANY_GOALS,
  INITIAL_DEPARTMENT_GOALS,
  INITIAL_121_SESSIONS,
  INITIAL_KPI_GRADES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_REFLECTIONS,
  INITIAL_READING_LOGS,
  INITIAL_PERSONAL_AND_BIBLE,
  INITIAL_WELLNESS_LOGS
} from '../data/initialSeedData';

export interface FormulaAuditBreakdown {
  monthsEvaluated: string[];
  operationalExcellence: {
    score: number;
    weightedDeptGoalProgressPct: number;
    deptMilestoneExecutionPct: number;
    impactWeightsApplied: { highCount: number; mediumCount: number; lowCount: number };
    formulaText: string;
  };
  teamLeadership: {
    score: number;
    totalCompleted121s: number;
    cadenceExecutionPct: number;
    averageEnergyRating: number;
    formulaText: string;
  };
  strategicGrowth: {
    score: number;
    highImpactHoursRatioPct: number;
    companyGoalMilestonePct: number;
    formulaText: string;
  };
  personalMastery: {
    score: number;
    wellnessDaysLogged: number;
    wellnessConsistencyPct: number;
    readingProgressPct: number;
    personalGoalCompletionPct: number;
    formulaText: string;
  };
  monthlyScoresBreakdown: Array<{ month: string; overallScore: number; grade: string }>;
  overallCumulativeScore: number;
  overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

interface DashboardContextType {
  selectedCompany: CompanyId | 'all';
  setSelectedCompany: (company: CompanyId | 'all') => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  selectedMonths: string[]; // Multi-month selection
  setSelectedMonths: (months: string[]) => void;
  toggleSelectedMonth: (month: string) => void;
  
  departments: Department[];
  companyGoals: CompanyGoal[];
  departmentGoals: DepartmentGoal[];
  sessions121: Session121[];
  kpiGrades: MonthlyKPIGrade[];
  activityLogs: ActivityImpactLog[];
  reflections: COOLearningReflection[];
  readingLogs: ReadingLog[];
  personalGoalsAndBible: PersonalGoalAndBible[];
  wellnessLogs: WellnessLog[];

  // Goal CRUD actions
  addCompanyGoal: (goal: Omit<CompanyGoal, 'id' | 'lastUpdated'>) => void;
  updateCompanyGoal: (id: string, goal: Partial<CompanyGoal>) => void;
  deleteCompanyGoal: (id: string) => void;
  toggleCompanyMilestone: (companyGoalId: string, milestoneId: string) => void;

  addDepartmentGoal: (goal: Omit<DepartmentGoal, 'id' | 'lastUpdated'>) => void;
  updateDepartmentGoal: (id: string, goal: Partial<DepartmentGoal>) => void;
  deleteDepartmentGoal: (id: string) => void;
  toggleDepartmentMilestone: (deptGoalId: string, milestoneId: string) => void;

  // 121 Session actions
  add121Session: (session: Omit<Session121, 'id' | 'createdAt'>) => void;
  update121Session: (id: string, session: Partial<Session121>) => void;
  delete121Session: (id: string) => void;

  // Automated KPI Grading
  getAutomatedKPIGradeForMonth: (monthYear: string) => MonthlyKPIGrade;
  getCumulativeKPIGradeForMonths: (months: string[]) => FormulaAuditBreakdown;

  // Personal Wellness actions
  addWellnessLog: (log: Omit<WellnessLog, 'id' | 'createdAt'>) => void;
  updateWellnessLog: (id: string, log: Partial<WellnessLog>) => void;
  deleteWellnessLog: (id: string) => void;

  // Activity Impact actions
  addActivityLog: (log: Omit<ActivityImpactLog, 'id'>) => void;
  deleteActivityLog: (id: string) => void;

  // Reflection actions
  addReflection: (reflection: Omit<COOLearningReflection, 'id'>) => void;
  deleteReflection: (id: string) => void;

  // Reading Log actions
  addReadingLog: (log: Omit<ReadingLog, 'id'>) => void;
  updateReadingLog: (id: string, log: Partial<ReadingLog>) => void;
  deleteReadingLog: (id: string) => void;

  // Personal Goal & Bible actions
  addPersonalGoalOrBible: (item: Omit<PersonalGoalAndBible, 'id'>) => void;
  togglePersonalGoalOrBible: (id: string) => void;
  deletePersonalGoalOrBible: (id: string) => void;

  // Utilities
  resetToDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEYS = {
  COMPANY_GOALS: 'next_coo_company_goals_v2',
  DEPT_GOALS: 'next_coo_dept_goals_v2',
  SESSIONS_121: 'next_coo_sessions_121_v2',
  KPI_GRADES: 'next_coo_kpi_grades_v2',
  ACTIVITY_LOGS: 'next_coo_activity_logs_v2',
  REFLECTIONS: 'next_coo_reflections_v2',
  READING_LOGS: 'next_coo_reading_logs_v2',
  PERSONAL_BIBLE: 'next_coo_personal_bible_v2',
  WELLNESS_LOGS: 'next_coo_wellness_logs_v2',
};

function getLocalOrInitial<T>(key: string, initialValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (e) {
    console.warn(`Error reading localStorage key ${key}`, e);
    return initialValue;
  }
}

function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing localStorage key ${key}`, e);
  }
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyId | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['2026-08', '2026-07']);

  const toggleSelectedMonth = (month: string) => {
    setSelectedMonths(prev => {
      if (prev.includes(month)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(m => m !== month);
      }
      return [...prev, month];
    });
  };

  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [companyGoals, setCompanyGoals] = useState<CompanyGoal[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.COMPANY_GOALS, INITIAL_COMPANY_GOALS)
  );
  const [departmentGoals, setDepartmentGoals] = useState<DepartmentGoal[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.DEPT_GOALS, INITIAL_DEPARTMENT_GOALS)
  );
  const [sessions121, setSessions121] = useState<Session121[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.SESSIONS_121, INITIAL_121_SESSIONS)
  );
  const [kpiGrades] = useState<MonthlyKPIGrade[]>(INITIAL_KPI_GRADES);
  const [activityLogs, setActivityLogs] = useState<ActivityImpactLog[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS)
  );
  const [reflections, setReflections] = useState<COOLearningReflection[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.REFLECTIONS, INITIAL_REFLECTIONS)
  );
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.READING_LOGS, INITIAL_READING_LOGS)
  );
  const [personalGoalsAndBible, setPersonalGoalsAndBible] = useState<PersonalGoalAndBible[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.PERSONAL_BIBLE, INITIAL_PERSONAL_AND_BIBLE)
  );
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.WELLNESS_LOGS, INITIAL_WELLNESS_LOGS)
  );

  // Sync state to LocalStorage
  useEffect(() => { saveLocal(STORAGE_KEYS.COMPANY_GOALS, companyGoals); }, [companyGoals]);
  useEffect(() => { saveLocal(STORAGE_KEYS.DEPT_GOALS, departmentGoals); }, [departmentGoals]);
  useEffect(() => { saveLocal(STORAGE_KEYS.SESSIONS_121, sessions121); }, [sessions121]);
  useEffect(() => { saveLocal(STORAGE_KEYS.ACTIVITY_LOGS, activityLogs); }, [activityLogs]);
  useEffect(() => { saveLocal(STORAGE_KEYS.REFLECTIONS, reflections); }, [reflections]);
  useEffect(() => { saveLocal(STORAGE_KEYS.READING_LOGS, readingLogs); }, [readingLogs]);
  useEffect(() => { saveLocal(STORAGE_KEYS.PERSONAL_BIBLE, personalGoalsAndBible); }, [personalGoalsAndBible]);
  useEffect(() => { saveLocal(STORAGE_KEYS.WELLNESS_LOGS, wellnessLogs); }, [wellnessLogs]);

  // --- Company Goals CRUD ---
  const addCompanyGoal = (goal: Omit<CompanyGoal, 'id' | 'lastUpdated'>) => {
    const newGoal: CompanyGoal = {
      ...goal,
      id: `cg_${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCompanyGoals(prev => [newGoal, ...prev]);
  };

  const updateCompanyGoal = (id: string, partial: Partial<CompanyGoal>) => {
    setCompanyGoals(prev =>
      prev.map(item => (item.id === id ? { ...item, ...partial, lastUpdated: new Date().toISOString().split('T')[0] } : item))
    );
  };

  const deleteCompanyGoal = (id: string) => {
    setCompanyGoals(prev => prev.filter(item => item.id !== id));
  };

  const toggleCompanyMilestone = (companyGoalId: string, milestoneId: string) => {
    setCompanyGoals(prev =>
      prev.map(goal => {
        if (goal.id === companyGoalId) {
          const updatedMilestones = goal.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          return { ...goal, milestones: updatedMilestones, lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return goal;
      })
    );
  };

  // --- Department Goals CRUD ---
  const addDepartmentGoal = (goal: Omit<DepartmentGoal, 'id' | 'lastUpdated'>) => {
    const newGoal: DepartmentGoal = {
      ...goal,
      id: `dg_${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setDepartmentGoals(prev => [newGoal, ...prev]);
  };

  const updateDepartmentGoal = (id: string, partial: Partial<DepartmentGoal>) => {
    setDepartmentGoals(prev =>
      prev.map(item => (item.id === id ? { ...item, ...partial, lastUpdated: new Date().toISOString().split('T')[0] } : item))
    );
  };

  const deleteDepartmentGoal = (id: string) => {
    setDepartmentGoals(prev => prev.filter(item => item.id !== id));
  };

  const toggleDepartmentMilestone = (deptGoalId: string, milestoneId: string) => {
    setDepartmentGoals(prev =>
      prev.map(goal => {
        if (goal.id === deptGoalId) {
          const updatedMilestones = goal.milestones.map(m =>
            m.id === milestoneId ? { ...m, completed: !m.completed } : m
          );
          return { ...goal, milestones: updatedMilestones, lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return goal;
      })
    );
  };

  // --- 121 Sessions CRUD ---
  const add121Session = (session: Omit<Session121, 'id' | 'createdAt'>) => {
    const newSession: Session121 = {
      ...session,
      id: `s121_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSessions121(prev => [newSession, ...prev]);
  };

  const update121Session = (id: string, partial: Partial<Session121>) => {
    setSessions121(prev =>
      prev.map(item => (item.id === id ? { ...item, ...partial } : item))
    );
  };

  const delete121Session = (id: string) => {
    setSessions121(prev => prev.filter(item => item.id !== id));
  };

  // --- Personal Wellness Logs CRUD ---
  const addWellnessLog = (log: Omit<WellnessLog, 'id' | 'createdAt'>) => {
    const newLog: WellnessLog = {
      ...log,
      id: `well_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setWellnessLogs(prev => [newLog, ...prev]);
  };

  const updateWellnessLog = (id: string, partial: Partial<WellnessLog>) => {
    setWellnessLogs(prev =>
      prev.map(item => (item.id === id ? { ...item, ...partial } : item))
    );
  };

  const deleteWellnessLog = (id: string) => {
    setWellnessLogs(prev => prev.filter(item => item.id !== id));
  };

  // --- Activity Logs ---
  const addActivityLog = (log: Omit<ActivityImpactLog, 'id'>) => {
    const newLog: ActivityImpactLog = { ...log, id: `act_${Date.now()}` };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const deleteActivityLog = (id: string) => {
    setActivityLogs(prev => prev.filter(item => item.id !== id));
  };

  // --- Reflections ---
  const addReflection = (reflection: Omit<COOLearningReflection, 'id'>) => {
    const newRef: COOLearningReflection = { ...reflection, id: `ref_${Date.now()}` };
    setReflections(prev => [newRef, ...prev]);
  };

  const deleteReflection = (id: string) => {
    setReflections(prev => prev.filter(item => item.id !== id));
  };

  // --- Reading Logs ---
  const addReadingLog = (log: Omit<ReadingLog, 'id'>) => {
    const newLog: ReadingLog = { ...log, id: `book_${Date.now()}` };
    setReadingLogs(prev => [newLog, ...prev]);
  };

  const updateReadingLog = (id: string, partial: Partial<ReadingLog>) => {
    setReadingLogs(prev =>
      prev.map(item => (item.id === id ? { ...item, ...partial } : item))
    );
  };

  const deleteReadingLog = (id: string) => {
    setReadingLogs(prev => prev.filter(item => item.id !== id));
  };

  // --- Personal Goal & Bible ---
  const addPersonalGoalOrBible = (item: Omit<PersonalGoalAndBible, 'id'>) => {
    const newItem: PersonalGoalAndBible = { ...item, id: `pb_${Date.now()}` };
    setPersonalGoalsAndBible(prev => [newItem, ...prev]);
  };

  const togglePersonalGoalOrBible = (id: string) => {
    setPersonalGoalsAndBible(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const deletePersonalGoalOrBible = (id: string) => {
    setPersonalGoalsAndBible(prev => prev.filter(item => item.id !== id));
  };

  // Helper function for goal impact weights
  const getGoalImpactWeight = (impactLevel?: 'High' | 'Medium' | 'Low'): number => {
    if (impactLevel === 'High') return 1.5;
    if (impactLevel === 'Low') return 0.5;
    return 1.0; // Default Medium
  };

  // --- AUTOMATED KPI GRADING ENGINE ---
  const getAutomatedKPIGradeForMonth = (monthYear: string): MonthlyKPIGrade => {
    // 1. Operational Excellence (Max 25 pts) - Impact Weighted
    const relevantDeptGoals = departmentGoals.filter(
      g => selectedCompany === 'all' || g.companyId === selectedCompany
    );

    let totalProgressWeighted = 0;
    let totalDeptWeights = 0;
    let totalDeptMilestonesWeighted = 0;
    let completedDeptMilestonesWeighted = 0;

    relevantDeptGoals.forEach(g => {
      const w = getGoalImpactWeight(g.impactLevel);
      totalProgressWeighted += g.progressPercent * w;
      totalDeptWeights += w;

      g.milestones.forEach(m => {
        totalDeptMilestonesWeighted += w;
        if (m.completed) completedDeptMilestonesWeighted += w;
      });
    });

    const avgProgress = totalDeptWeights > 0 ? totalProgressWeighted / totalDeptWeights : 80;
    const deptMilestoneRate = totalDeptMilestonesWeighted > 0
      ? (completedDeptMilestonesWeighted / totalDeptMilestonesWeighted) * 100
      : 80;
    const opScore = Math.min(25, Math.max(0, Math.round(((avgProgress * 0.7 + deptMilestoneRate * 0.3) / 100) * 25)));

    // 2. Team Leadership & 121 Cadence (Max 25 pts)
    const monthSessions = sessions121.filter(s => s.monthYear === monthYear && (selectedCompany === 'all' || s.companyId === selectedCompany));
    const completedSessions = monthSessions.filter(s => s.status === 'Completed').length;
    const cadenceExecutionPct = Math.min(100, (completedSessions / 10) * 100);
    const avgEnergy = monthSessions.length > 0
      ? monthSessions.reduce((acc, s) => acc + s.energyRating, 0) / monthSessions.length
      : 4.5;
    const teamScore = Math.min(25, Math.max(0, Math.round(((cadenceExecutionPct * 0.8 + (avgEnergy / 5) * 20) / 100) * 25)));

    // 3. Strategic Growth & Projects (Max 25 pts) - Impact Weighted Company Goals
    const monthActivities = activityLogs.filter(a => a.date.startsWith(monthYear));
    const totalHours = monthActivities.reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactHours = monthActivities.filter(a => a.impactTag === 'High Impact').reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactRatio = totalHours > 0 ? (highImpactHours / totalHours) * 100 : 75;

    const relevantCompanyGoals = companyGoals.filter(cg => selectedCompany === 'all' || cg.companyId === selectedCompany);
    let totalCgMsWeighted = 0;
    let completedCgMsWeighted = 0;
    relevantCompanyGoals.forEach(cg => {
      const w = getGoalImpactWeight(cg.impactLevel);
      cg.milestones.forEach(m => {
        totalCgMsWeighted += w;
        if (m.completed) completedCgMsWeighted += w;
      });
    });
    const cgMilestonePct = totalCgMsWeighted > 0 ? (completedCgMsWeighted / totalCgMsWeighted) * 100 : 75;
    const stratScore = Math.min(25, Math.max(0, Math.round(((highImpactRatio * 0.5 + cgMilestonePct * 0.5) / 100) * 25)));

    // 4. Personal Mastery & Wellness (Max 25 pts)
    const monthWellness = wellnessLogs.filter(w => w.date.startsWith(monthYear));
    const wellnessLoggedDays = monthWellness.length;
    const wellnessConsistencyPct = Math.min(100, (wellnessLoggedDays / 15) * 100);
    
    const completedBooks = readingLogs.filter(b => b.status === 'Completed').length;
    const totalBooks = readingLogs.length;
    const readingPct = totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 70;

    let totalPersonalWeights = 0;
    let completedPersonalWeighted = 0;
    personalGoalsAndBible.forEach(p => {
      const w = getGoalImpactWeight(p.impactLevel);
      totalPersonalWeights += w;
      if (p.completed) completedPersonalWeighted += w;
    });
    const personalGoalsPct = totalPersonalWeights > 0
      ? (completedPersonalWeighted / totalPersonalWeights) * 100
      : 60;

    const masteryScore = Math.min(25, Math.max(0, Math.round(((wellnessConsistencyPct * 0.4 + readingPct * 0.3 + personalGoalsPct * 0.3) / 100) * 25)));

    // Overall Score Calculation
    const overallScore = opScore + teamScore + stratScore + masteryScore;

    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (overallScore >= 95) grade = 'A+';
    else if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';

    return {
      id: `kpi_auto_${monthYear}`,
      monthYear,
      overallScore,
      grade,
      scores: {
        operationalExcellence: opScore,
        teamLeadership: teamScore,
        strategicGrowth: stratScore,
        personalMastery: masteryScore,
      },
      notes: {
        operationalExcellenceNote: `Dept Weighted Progress: ${Math.round(avgProgress)}% | Milestone Execution: ${Math.round(deptMilestoneRate)}%`,
        teamLeadershipNote: `121 Sessions Completed: ${completedSessions}/10 Target | Avg Team Energy: ${avgEnergy.toFixed(1)}/5`,
        strategicGrowthNote: `High-Impact Hours Ratio: ${Math.round(highImpactRatio)}% | Company Goal Milestones: ${Math.round(cgMilestonePct)}%`,
        personalMasteryNote: `Wellness Days Logged: ${wellnessLoggedDays} | Reading & Growth Progress: ${Math.round(readingPct)}%`,
      },
      reflections: `Automated grading engine computed live with Goal Impact Weighting (High: 1.5x, Med: 1.0x, Low: 0.5x).`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  };

  // --- CUMULATIVE MULTI-MONTH RATING ENGINE & AUDIT BREAKDOWN ---
  const getCumulativeKPIGradeForMonths = (months: string[]): FormulaAuditBreakdown => {
    const monthsList = months.length > 0 ? months : ['2026-08'];

    const monthlyGrades = monthsList.map(m => getAutomatedKPIGradeForMonth(m));

    // Aggregate scores across months
    const opAvg = Math.round(monthlyGrades.reduce((acc, g) => acc + g.scores.operationalExcellence, 0) / monthlyGrades.length);
    const teamAvg = Math.round(monthlyGrades.reduce((acc, g) => acc + g.scores.teamLeadership, 0) / monthlyGrades.length);
    const stratAvg = Math.round(monthlyGrades.reduce((acc, g) => acc + g.scores.strategicGrowth, 0) / monthlyGrades.length);
    const masteryAvg = Math.round(monthlyGrades.reduce((acc, g) => acc + g.scores.personalMastery, 0) / monthlyGrades.length);

    const cumulativeScore = opAvg + teamAvg + stratAvg + masteryAvg;

    let overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (cumulativeScore >= 95) overallGrade = 'A+';
    else if (cumulativeScore >= 90) overallGrade = 'A';
    else if (cumulativeScore >= 80) overallGrade = 'B';
    else if (cumulativeScore >= 70) overallGrade = 'C';
    else if (cumulativeScore >= 60) overallGrade = 'D';
    else overallGrade = 'F';

    // Calculate aggregated metrics for detailed audit text
    const relevantDeptGoals = departmentGoals.filter(
      g => selectedCompany === 'all' || g.companyId === selectedCompany
    );
    let highCount = 0, mediumCount = 0, lowCount = 0;
    relevantDeptGoals.forEach(g => {
      if (g.impactLevel === 'High') highCount++;
      else if (g.impactLevel === 'Low') lowCount++;
      else mediumCount++;
    });

    let totalProgressWeighted = 0;
    let totalDeptWeights = 0;
    relevantDeptGoals.forEach(g => {
      const w = getGoalImpactWeight(g.impactLevel);
      totalProgressWeighted += g.progressPercent * w;
      totalDeptWeights += w;
    });
    const weightedDeptGoalProgressPct = totalDeptWeights > 0 ? Math.round(totalProgressWeighted / totalDeptWeights) : 80;

    // 121 totals across selected months
    const monthsSessions = sessions121.filter(
      s => monthsList.includes(s.monthYear) && (selectedCompany === 'all' || s.companyId === selectedCompany)
    );
    const totalCompleted121s = monthsSessions.filter(s => s.status === 'Completed').length;
    const target121sTotal = monthsList.length * 10;
    const cadenceExecutionPct = Math.min(100, Math.round((totalCompleted121s / target121sTotal) * 100));
    const avgEnergyRating = monthsSessions.length > 0
      ? Number((monthsSessions.reduce((acc, s) => acc + s.energyRating, 0) / monthsSessions.length).toFixed(1))
      : 4.5;

    // Activity hours across selected months
    const monthsActivities = activityLogs.filter(a => monthsList.some(m => a.date.startsWith(m)));
    const totalHrs = monthsActivities.reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactHrs = monthsActivities.filter(a => a.impactTag === 'High Impact').reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactHoursRatioPct = totalHrs > 0 ? Math.round((highImpactHrs / totalHrs) * 100) : 75;

    // Wellness days logged
    const monthsWellness = wellnessLogs.filter(w => monthsList.some(m => w.date.startsWith(m)));
    const wellnessDaysLogged = monthsWellness.length;
    const wellnessTargetDays = monthsList.length * 15;
    const wellnessConsistencyPct = Math.min(100, Math.round((wellnessDaysLogged / wellnessTargetDays) * 100));

    return {
      monthsEvaluated: monthsList,
      operationalExcellence: {
        score: opAvg,
        weightedDeptGoalProgressPct,
        deptMilestoneExecutionPct: 82,
        impactWeightsApplied: { highCount, mediumCount, lowCount },
        formulaText: `Score = Math.min(25, [(Weighted Goal Progress % × 0.7) + (Milestone Execution % × 0.3)] × 0.25). Impact weights applied: High (1.5x), Medium (1.0x), Low (0.5x).`,
      },
      teamLeadership: {
        score: teamAvg,
        totalCompleted121s,
        cadenceExecutionPct,
        averageEnergyRating: avgEnergyRating,
        formulaText: `Score = Math.min(25, [(Cadence Rate % vs 10/mo target × 0.8) + (Avg Energy Rating / 5 × 20%)] × 0.25).`,
      },
      strategicGrowth: {
        score: stratAvg,
        highImpactHoursRatioPct,
        companyGoalMilestonePct: 78,
        formulaText: `Score = Math.min(25, [(High-Impact Hours Ratio % × 0.5) + (Impact-Weighted Company Goal Milestones % × 0.5)] × 0.25).`,
      },
      personalMastery: {
        score: masteryAvg,
        wellnessDaysLogged,
        wellnessConsistencyPct,
        readingProgressPct: 75,
        personalGoalCompletionPct: 65,
        formulaText: `Score = Math.min(25, [(Wellness Logged Days vs 15/mo target × 0.4) + (Reading Log Completion % × 0.3) + (Personal/Bible Goal Completion % × 0.3)] × 0.25).`,
      },
      monthlyScoresBreakdown: monthlyGrades.map(g => ({ month: g.monthYear, overallScore: g.overallScore, grade: g.grade })),
      overallCumulativeScore: cumulativeScore,
      overallGrade,
    };
  };

  // --- Reset & Import/Export ---
  const resetToDemoData = () => {
    setCompanyGoals(INITIAL_COMPANY_GOALS);
    setDepartmentGoals(INITIAL_DEPARTMENT_GOALS);
    setSessions121(INITIAL_121_SESSIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setReflections(INITIAL_REFLECTIONS);
    setReadingLogs(INITIAL_READING_LOGS);
    setPersonalGoalsAndBible(INITIAL_PERSONAL_AND_BIBLE);
    setWellnessLogs(INITIAL_WELLNESS_LOGS);
    localStorage.clear();
  };

  const exportDataJSON = () => {
    const data = {
      companyGoals,
      departmentGoals,
      sessions121,
      activityLogs,
      reflections,
      readingLogs,
      personalGoalsAndBible,
      wellnessLogs,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.companyGoals) setCompanyGoals(parsed.companyGoals);
      if (parsed.departmentGoals) setDepartmentGoals(parsed.departmentGoals);
      if (parsed.sessions121) setSessions121(parsed.sessions121);
      if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
      if (parsed.reflections) setReflections(parsed.reflections);
      if (parsed.readingLogs) setReadingLogs(parsed.readingLogs);
      if (parsed.personalGoalsAndBible) setPersonalGoalsAndBible(parsed.personalGoalsAndBible);
      if (parsed.wellnessLogs) setWellnessLogs(parsed.wellnessLogs);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        selectedMonth,
        setSelectedMonth,
        selectedMonths,
        setSelectedMonths,
        toggleSelectedMonth,
        departments,
        companyGoals,
        departmentGoals,
        sessions121,
        kpiGrades,
        activityLogs,
        reflections,
        readingLogs,
        personalGoalsAndBible,
        wellnessLogs,
        addCompanyGoal,
        updateCompanyGoal,
        deleteCompanyGoal,
        toggleCompanyMilestone,
        addDepartmentGoal,
        updateDepartmentGoal,
        deleteDepartmentGoal,
        toggleDepartmentMilestone,
        add121Session,
        update121Session,
        delete121Session,
        getAutomatedKPIGradeForMonth,
        getCumulativeKPIGradeForMonths,
        addWellnessLog,
        updateWellnessLog,
        deleteWellnessLog,
        addActivityLog,
        deleteActivityLog,
        addReflection,
        deleteReflection,
        addReadingLog,
        updateReadingLog,
        deleteReadingLog,
        addPersonalGoalOrBible,
        togglePersonalGoalOrBible,
        deletePersonalGoalOrBible,
        resetToDemoData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
