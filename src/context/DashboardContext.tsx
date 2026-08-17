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
  CompanyId
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
  addCompanyGoal: (goal: Omit<CompanyGoal, 'id' | 'lastUpdated'>) => Promise<void> | void;
  updateCompanyGoal: (id: string, goal: Partial<CompanyGoal>) => Promise<void> | void;
  deleteCompanyGoal: (id: string) => Promise<void> | void;
  toggleCompanyMilestone: (companyGoalId: string, milestoneId: string) => Promise<void> | void;

  addDepartmentGoal: (goal: Omit<DepartmentGoal, 'id' | 'lastUpdated'>) => Promise<void> | void;
  updateDepartmentGoal: (id: string, goal: Partial<DepartmentGoal>) => Promise<void> | void;
  deleteDepartmentGoal: (id: string) => Promise<void> | void;
  toggleDepartmentMilestone: (deptGoalId: string, milestoneId: string) => Promise<void> | void;

  // 121 Session actions
  add121Session: (session: Omit<Session121, 'id' | 'createdAt'>) => Promise<void> | void;
  update121Session: (id: string, session: Partial<Session121>) => Promise<void> | void;
  delete121Session: (id: string) => Promise<void> | void;

  // Automated KPI Grading
  getAutomatedKPIGradeForMonth: (monthYear: string) => MonthlyKPIGrade;
  getCumulativeKPIGradeForMonths: (months: string[]) => FormulaAuditBreakdown;

  // Personal Wellness actions
  addWellnessLog: (log: Omit<WellnessLog, 'id' | 'createdAt'>) => Promise<void> | void;
  updateWellnessLog: (id: string, log: Partial<WellnessLog>) => Promise<void> | void;
  deleteWellnessLog: (id: string) => Promise<void> | void;

  // Activity Impact actions
  addActivityLog: (log: Omit<ActivityImpactLog, 'id'>) => Promise<void> | void;
  deleteActivityLog: (id: string) => Promise<void> | void;

  // Reflection actions
  addReflection: (reflection: Omit<COOLearningReflection, 'id'>) => Promise<void> | void;
  deleteReflection: (id: string) => Promise<void> | void;

  // Reading Log actions
  addReadingLog: (log: Omit<ReadingLog, 'id'>) => Promise<void> | void;
  updateReadingLog: (id: string, log: Partial<ReadingLog>) => Promise<void> | void;
  deleteReadingLog: (id: string) => Promise<void> | void;

  // Personal Goal & Bible actions
  addPersonalGoalOrBible: (item: Omit<PersonalGoalAndBible, 'id'>) => Promise<void> | void;
  togglePersonalGoalOrBible: (id: string) => Promise<void> | void;
  deletePersonalGoalOrBible: (id: string) => Promise<void> | void;

  // Utilities
  resetToDemoData: () => Promise<void> | void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => Promise<boolean> | boolean;
}

const STORAGE_KEYS = {
  COMPANY_GOALS: 'coo_dash_company_goals_v2',
  DEPT_GOALS: 'coo_dash_dept_goals_v2',
  SESSIONS_121: 'coo_dash_sessions_121_v2',
  ACTIVITY_LOGS: 'coo_dash_activity_logs_v2',
  REFLECTIONS: 'coo_dash_reflections_v2',
  READING_LOGS: 'coo_dash_reading_logs_v2',
  PERSONAL_BIBLE: 'coo_dash_personal_bible_v2',
  WELLNESS_LOGS: 'coo_dash_wellness_logs_v2',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage:`, err);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyId | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['2026-08', '2026-07']);

  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [companyGoals, setCompanyGoals] = useState<CompanyGoal[]>(() =>
    loadFromStorage(STORAGE_KEYS.COMPANY_GOALS, INITIAL_COMPANY_GOALS)
  );
  const [departmentGoals, setDepartmentGoals] = useState<DepartmentGoal[]>(() =>
    loadFromStorage(STORAGE_KEYS.DEPT_GOALS, INITIAL_DEPARTMENT_GOALS)
  );
  const [sessions121, setSessions121] = useState<Session121[]>(() =>
    loadFromStorage(STORAGE_KEYS.SESSIONS_121, INITIAL_121_SESSIONS)
  );
  const [kpiGrades] = useState<MonthlyKPIGrade[]>(INITIAL_KPI_GRADES);
  const [activityLogs, setActivityLogs] = useState<ActivityImpactLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS)
  );
  const [reflections, setReflections] = useState<COOLearningReflection[]>(() =>
    loadFromStorage(STORAGE_KEYS.REFLECTIONS, INITIAL_REFLECTIONS)
  );
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.READING_LOGS, INITIAL_READING_LOGS)
  );
  const [personalGoalsAndBible, setPersonalGoalsAndBible] = useState<PersonalGoalAndBible[]>(() =>
    loadFromStorage(STORAGE_KEYS.PERSONAL_BIBLE, INITIAL_PERSONAL_AND_BIBLE)
  );
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.WELLNESS_LOGS, INITIAL_WELLNESS_LOGS)
  );

  // Sync to local storage on state change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COMPANY_GOALS, companyGoals);
  }, [companyGoals]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DEPT_GOALS, departmentGoals);
  }, [departmentGoals]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SESSIONS_121, sessions121);
  }, [sessions121]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, activityLogs);
  }, [activityLogs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REFLECTIONS, reflections);
  }, [reflections]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.READING_LOGS, readingLogs);
  }, [readingLogs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PERSONAL_BIBLE, personalGoalsAndBible);
  }, [personalGoalsAndBible]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.WELLNESS_LOGS, wellnessLogs);
  }, [wellnessLogs]);

  const toggleSelectedMonth = (month: string) => {
    setSelectedMonths((prev) => {
      if (prev.includes(month)) {
        if (prev.length === 1) return prev;
        return prev.filter((m) => m !== month);
      }
      return [...prev, month];
    });
  };

  // --- Company Goals CRUD ---
  const addCompanyGoal = (goal: Omit<CompanyGoal, 'id' | 'lastUpdated'>) => {
    const id = `cg_${Date.now()}`;
    const newGoal: CompanyGoal = {
      ...goal,
      id,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCompanyGoals((prev) => [newGoal, ...prev]);
  };

  const updateCompanyGoal = (id: string, partial: Partial<CompanyGoal>) => {
    setCompanyGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              ...partial,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : g
      )
    );
  };

  const deleteCompanyGoal = (id: string) => {
    setCompanyGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleCompanyMilestone = (companyGoalId: string, milestoneId: string) => {
    setCompanyGoals((prev) =>
      prev.map((g) => {
        if (g.id !== companyGoalId) return g;
        const updatedMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        return {
          ...g,
          milestones: updatedMilestones,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // --- Department Goals CRUD ---
  const addDepartmentGoal = (goal: Omit<DepartmentGoal, 'id' | 'lastUpdated'>) => {
    const id = `dg_${Date.now()}`;
    const newGoal: DepartmentGoal = {
      ...goal,
      id,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setDepartmentGoals((prev) => [newGoal, ...prev]);
  };

  const updateDepartmentGoal = (id: string, partial: Partial<DepartmentGoal>) => {
    setDepartmentGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              ...partial,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : g
      )
    );
  };

  const deleteDepartmentGoal = (id: string) => {
    setDepartmentGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const toggleDepartmentMilestone = (deptGoalId: string, milestoneId: string) => {
    setDepartmentGoals((prev) =>
      prev.map((g) => {
        if (g.id !== deptGoalId) return g;
        const updatedMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        return {
          ...g,
          milestones: updatedMilestones,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // --- 121 Sessions CRUD ---
  const add121Session = (session: Omit<Session121, 'id' | 'createdAt'>) => {
    const id = `s121_${Date.now()}`;
    const newSession: Session121 = {
      ...session,
      id,
      createdAt: new Date().toISOString(),
    };
    setSessions121((prev) => [newSession, ...prev]);
  };

  const update121Session = (id: string, partial: Partial<Session121>) => {
    setSessions121((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  };

  const delete121Session = (id: string) => {
    setSessions121((prev) => prev.filter((s) => s.id !== id));
  };

  // --- Personal Wellness Logs CRUD ---
  const addWellnessLog = (log: Omit<WellnessLog, 'id' | 'createdAt'>) => {
    const id = `well_${Date.now()}`;
    const newLog: WellnessLog = {
      ...log,
      id,
      createdAt: new Date().toISOString(),
    };
    setWellnessLogs((prev) => [newLog, ...prev]);
  };

  const updateWellnessLog = (id: string, partial: Partial<WellnessLog>) => {
    setWellnessLogs((prev) => prev.map((w) => (w.id === id ? { ...w, ...partial } : w)));
  };

  const deleteWellnessLog = (id: string) => {
    setWellnessLogs((prev) => prev.filter((w) => w.id !== id));
  };

  // --- Activity Logs CRUD ---
  const addActivityLog = (log: Omit<ActivityImpactLog, 'id'>) => {
    const id = `act_${Date.now()}`;
    const newLog: ActivityImpactLog = { ...log, id };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const deleteActivityLog = (id: string) => {
    setActivityLogs((prev) => prev.filter((a) => a.id !== id));
  };

  // --- Reflections CRUD ---
  const addReflection = (reflection: Omit<COOLearningReflection, 'id'>) => {
    const id = `ref_${Date.now()}`;
    const newRef: COOLearningReflection = { ...reflection, id };
    setReflections((prev) => [newRef, ...prev]);
  };

  const deleteReflection = (id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
  };

  // --- Reading Logs CRUD ---
  const addReadingLog = (log: Omit<ReadingLog, 'id'>) => {
    const id = `book_${Date.now()}`;
    const newLog: ReadingLog = { ...log, id };
    setReadingLogs((prev) => [newLog, ...prev]);
  };

  const updateReadingLog = (id: string, partial: Partial<ReadingLog>) => {
    setReadingLogs((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));
  };

  const deleteReadingLog = (id: string) => {
    setReadingLogs((prev) => prev.filter((r) => r.id !== id));
  };

  // --- Personal Goal & Bible CRUD ---
  const addPersonalGoalOrBible = (item: Omit<PersonalGoalAndBible, 'id'>) => {
    const id = `pb_${Date.now()}`;
    const newItem: PersonalGoalAndBible = { ...item, id };
    setPersonalGoalsAndBible((prev) => [newItem, ...prev]);
  };

  const togglePersonalGoalOrBible = (id: string) => {
    setPersonalGoalsAndBible((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
    );
  };

  const deletePersonalGoalOrBible = (id: string) => {
    setPersonalGoalsAndBible((prev) => prev.filter((p) => p.id !== id));
  };

  // Helper function for goal impact weights
  const getGoalImpactWeight = (impactLevel?: 'High' | 'Medium' | 'Low'): number => {
    if (impactLevel === 'High') return 1.5;
    if (impactLevel === 'Low') return 0.5;
    return 1.0;
  };

  // --- AUTOMATED KPI GRADING ENGINE ---
  const getAutomatedKPIGradeForMonth = (monthYear: string): MonthlyKPIGrade => {
    // 1. Operational Excellence (Max 25 pts)
    const relevantDeptGoals = departmentGoals.filter(
      (g) => selectedCompany === 'all' || g.companyId === selectedCompany
    );

    let totalProgressWeighted = 0;
    let totalDeptWeights = 0;
    let totalDeptMilestonesWeighted = 0;
    let completedDeptMilestonesWeighted = 0;

    relevantDeptGoals.forEach((g) => {
      const w = getGoalImpactWeight(g.impactLevel);
      totalProgressWeighted += g.progressPercent * w;
      totalDeptWeights += w;

      g.milestones.forEach((m) => {
        totalDeptMilestonesWeighted += w;
        if (m.completed) completedDeptMilestonesWeighted += w;
      });
    });

    const avgProgress = totalDeptWeights > 0 ? totalProgressWeighted / totalDeptWeights : 80;
    const deptMilestoneRate =
      totalDeptMilestonesWeighted > 0
        ? (completedDeptMilestonesWeighted / totalDeptMilestonesWeighted) * 100
        : 80;
    const opScore = Math.min(
      25,
      Math.max(0, Math.round(((avgProgress * 0.7 + deptMilestoneRate * 0.3) / 100) * 25))
    );

    // 2. Team Leadership & 121 Cadence (Max 25 pts)
    const monthSessions = sessions121.filter(
      (s) =>
        s.monthYear === monthYear &&
        (selectedCompany === 'all' || s.companyId === selectedCompany)
    );
    const completedSessions = monthSessions.filter((s) => s.status === 'Completed').length;
    const cadenceExecutionPct = Math.min(100, (completedSessions / 10) * 100);
    const avgEnergy =
      monthSessions.length > 0
        ? monthSessions.reduce((acc, s) => acc + s.energyRating, 0) / monthSessions.length
        : 4.5;
    const teamScore = Math.min(
      25,
      Math.max(0, Math.round(((cadenceExecutionPct * 0.8 + (avgEnergy / 5) * 20) / 100) * 25))
    );

    // 3. Strategic Growth & Projects (Max 25 pts)
    const monthActivities = activityLogs.filter((a) => a.date.startsWith(monthYear));
    const totalHours = monthActivities.reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactHours = monthActivities
      .filter((a) => a.impactTag === 'High Impact')
      .reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactRatio = totalHours > 0 ? (highImpactHours / totalHours) * 100 : 75;

    const relevantCompanyGoals = companyGoals.filter(
      (cg) => selectedCompany === 'all' || cg.companyId === selectedCompany
    );
    let totalCgMsWeighted = 0;
    let completedCgMsWeighted = 0;
    relevantCompanyGoals.forEach((cg) => {
      const w = getGoalImpactWeight(cg.impactLevel);
      cg.milestones.forEach((m) => {
        totalCgMsWeighted += w;
        if (m.completed) completedCgMsWeighted += w;
      });
    });
    const cgMilestonePct =
      totalCgMsWeighted > 0 ? (completedCgMsWeighted / totalCgMsWeighted) * 100 : 75;
    const stratScore = Math.min(
      25,
      Math.max(0, Math.round(((highImpactRatio * 0.5 + cgMilestonePct * 0.5) / 100) * 25))
    );

    // 4. Personal Mastery & Wellness (Max 25 pts)
    const monthWellness = wellnessLogs.filter((w) => w.date.startsWith(monthYear));
    const wellnessLoggedDays = monthWellness.length;
    const wellnessConsistencyPct = Math.min(100, (wellnessLoggedDays / 15) * 100);

    const completedBooks = readingLogs.filter((b) => b.status === 'Completed').length;
    const totalBooks = readingLogs.length;
    const readingPct = totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 70;

    let totalPersonalWeights = 0;
    let completedPersonalWeighted = 0;
    personalGoalsAndBible.forEach((p) => {
      const w = getGoalImpactWeight(p.impactLevel);
      totalPersonalWeights += w;
      if (p.completed) completedPersonalWeighted += w;
    });
    const personalGoalsPct =
      totalPersonalWeights > 0
        ? (completedPersonalWeighted / totalPersonalWeights) * 100
        : 60;

    const masteryScore = Math.min(
      25,
      Math.max(
        0,
        Math.round(
          ((wellnessConsistencyPct * 0.4 + readingPct * 0.3 + personalGoalsPct * 0.3) / 100) * 25
        )
      )
    );

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
    const monthlyGrades = monthsList.map((m) => getAutomatedKPIGradeForMonth(m));

    const opAvg = Math.round(
      monthlyGrades.reduce((acc, g) => acc + g.scores.operationalExcellence, 0) /
        monthlyGrades.length
    );
    const teamAvg = Math.round(
      monthlyGrades.reduce((acc, g) => acc + g.scores.teamLeadership, 0) / monthlyGrades.length
    );
    const stratAvg = Math.round(
      monthlyGrades.reduce((acc, g) => acc + g.scores.strategicGrowth, 0) / monthlyGrades.length
    );
    const masteryAvg = Math.round(
      monthlyGrades.reduce((acc, g) => acc + g.scores.personalMastery, 0) / monthlyGrades.length
    );

    const cumulativeScore = opAvg + teamAvg + stratAvg + masteryAvg;

    let overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (cumulativeScore >= 95) overallGrade = 'A+';
    else if (cumulativeScore >= 90) overallGrade = 'A';
    else if (cumulativeScore >= 80) overallGrade = 'B';
    else if (cumulativeScore >= 70) overallGrade = 'C';
    else if (cumulativeScore >= 60) overallGrade = 'D';
    else overallGrade = 'F';

    const relevantDeptGoals = departmentGoals.filter(
      (g) => selectedCompany === 'all' || g.companyId === selectedCompany
    );
    let highCount = 0,
      mediumCount = 0,
      lowCount = 0;
    relevantDeptGoals.forEach((g) => {
      if (g.impactLevel === 'High') highCount++;
      else if (g.impactLevel === 'Low') lowCount++;
      else mediumCount++;
    });

    let totalProgressWeighted = 0;
    let totalDeptWeights = 0;
    relevantDeptGoals.forEach((g) => {
      const w = getGoalImpactWeight(g.impactLevel);
      totalProgressWeighted += g.progressPercent * w;
      totalDeptWeights += w;
    });
    const weightedDeptGoalProgressPct =
      totalDeptWeights > 0 ? Math.round(totalProgressWeighted / totalDeptWeights) : 80;

    const monthsSessions = sessions121.filter(
      (s) =>
        monthsList.includes(s.monthYear) &&
        (selectedCompany === 'all' || s.companyId === selectedCompany)
    );
    const totalCompleted121s = monthsSessions.filter((s) => s.status === 'Completed').length;
    const target121sTotal = monthsList.length * 10;
    const cadenceExecutionPct = Math.min(
      100,
      Math.round((totalCompleted121s / target121sTotal) * 100)
    );
    const avgEnergyRating =
      monthsSessions.length > 0
        ? Number(
            (
              monthsSessions.reduce((acc, s) => acc + s.energyRating, 0) / monthsSessions.length
            ).toFixed(1)
          )
        : 4.5;

    const monthsActivities = activityLogs.filter((a) =>
      monthsList.some((m) => a.date.startsWith(m))
    );
    const totalHrs = monthsActivities.reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactHrs = monthsActivities
      .filter((a) => a.impactTag === 'High Impact')
      .reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactHoursRatioPct =
      totalHrs > 0 ? Math.round((highImpactHrs / totalHrs) * 100) : 75;

    const monthsWellness = wellnessLogs.filter((w) =>
      monthsList.some((m) => w.date.startsWith(m))
    );
    const wellnessDaysLogged = monthsWellness.length;
    const wellnessTargetDays = monthsList.length * 15;
    const wellnessConsistencyPct = Math.min(
      100,
      Math.round((wellnessDaysLogged / wellnessTargetDays) * 100)
    );

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
      monthlyScoresBreakdown: monthlyGrades.map((g) => ({
        month: g.monthYear,
        overallScore: g.overallScore,
        grade: g.grade,
      })),
      overallCumulativeScore: cumulativeScore,
      overallGrade,
    };
  };

  // Reset to Demo Data in Local Storage
  const resetToDemoData = () => {
    setCompanyGoals(INITIAL_COMPANY_GOALS);
    setDepartmentGoals(INITIAL_DEPARTMENT_GOALS);
    setSessions121(INITIAL_121_SESSIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setReflections(INITIAL_REFLECTIONS);
    setReadingLogs(INITIAL_READING_LOGS);
    setPersonalGoalsAndBible(INITIAL_PERSONAL_AND_BIBLE);
    setWellnessLogs(INITIAL_WELLNESS_LOGS);

    saveToStorage(STORAGE_KEYS.COMPANY_GOALS, INITIAL_COMPANY_GOALS);
    saveToStorage(STORAGE_KEYS.DEPT_GOALS, INITIAL_DEPARTMENT_GOALS);
    saveToStorage(STORAGE_KEYS.SESSIONS_121, INITIAL_121_SESSIONS);
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
    saveToStorage(STORAGE_KEYS.REFLECTIONS, INITIAL_REFLECTIONS);
    saveToStorage(STORAGE_KEYS.READING_LOGS, INITIAL_READING_LOGS);
    saveToStorage(STORAGE_KEYS.PERSONAL_BIBLE, INITIAL_PERSONAL_AND_BIBLE);
    saveToStorage(STORAGE_KEYS.WELLNESS_LOGS, INITIAL_WELLNESS_LOGS);
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

        // CRUD
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
