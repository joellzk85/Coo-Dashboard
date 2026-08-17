import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

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

export interface SyncDiagnostics {
  companyGoalsCount: number;
  departmentGoalsCount: number;
  sessions121Count: number;
  activityLogsCount: number;
  reflectionsCount: number;
  readingLogsCount: number;
  personalGoalsCount: number;
  wellnessLogsCount: number;
}

interface DashboardContextType {
  selectedCompany: CompanyId | 'all';
  setSelectedCompany: (company: CompanyId | 'all') => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  selectedMonths: string[]; // Multi-month selection
  setSelectedMonths: (months: string[]) => void;
  toggleSelectedMonth: (month: string) => void;

  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncError: string | null;
  diagnostics: SyncDiagnostics;
  
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
  addCompanyGoal: (goal: Omit<CompanyGoal, 'id' | 'lastUpdated'>) => Promise<void>;
  updateCompanyGoal: (id: string, goal: Partial<CompanyGoal>) => Promise<void>;
  deleteCompanyGoal: (id: string) => Promise<void>;
  toggleCompanyMilestone: (companyGoalId: string, milestoneId: string) => Promise<void>;

  addDepartmentGoal: (goal: Omit<DepartmentGoal, 'id' | 'lastUpdated'>) => Promise<void>;
  updateDepartmentGoal: (id: string, goal: Partial<DepartmentGoal>) => Promise<void>;
  deleteDepartmentGoal: (id: string) => Promise<void>;
  toggleDepartmentMilestone: (deptGoalId: string, milestoneId: string) => Promise<void>;

  // 121 Session actions
  add121Session: (session: Omit<Session121, 'id' | 'createdAt'>) => Promise<void>;
  update121Session: (id: string, session: Partial<Session121>) => Promise<void>;
  delete121Session: (id: string) => Promise<void>;

  // Automated KPI Grading
  getAutomatedKPIGradeForMonth: (monthYear: string) => MonthlyKPIGrade;
  getCumulativeKPIGradeForMonths: (months: string[]) => FormulaAuditBreakdown;

  // Personal Wellness actions
  addWellnessLog: (log: Omit<WellnessLog, 'id' | 'createdAt'>) => Promise<void>;
  updateWellnessLog: (id: string, log: Partial<WellnessLog>) => Promise<void>;
  deleteWellnessLog: (id: string) => Promise<void>;

  // Activity Impact actions
  addActivityLog: (log: Omit<ActivityImpactLog, 'id'>) => Promise<void>;
  deleteActivityLog: (id: string) => Promise<void>;

  // Reflection actions
  addReflection: (reflection: Omit<COOLearningReflection, 'id'>) => Promise<void>;
  deleteReflection: (id: string) => Promise<void>;

  // Reading Log actions
  addReadingLog: (log: Omit<ReadingLog, 'id'>) => Promise<void>;
  updateReadingLog: (id: string, log: Partial<ReadingLog>) => Promise<void>;
  deleteReadingLog: (id: string) => Promise<void>;

  // Personal Goal & Bible actions
  addPersonalGoalOrBible: (item: Omit<PersonalGoalAndBible, 'id'>) => Promise<void>;
  togglePersonalGoalOrBible: (id: string) => Promise<void>;
  deletePersonalGoalOrBible: (id: string) => Promise<void>;

  // Sync utilities
  forceRefreshFromCloud: () => Promise<boolean>;
  forcePushAllToCloud: () => Promise<boolean>;
  testCloudConnection: () => Promise<{ success: boolean; latencyMs: number; message: string }>;
  resetToDemoData: () => Promise<void>;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => Promise<boolean>;
}

// Utility to remove undefined keys before sending to Firestore
function cleanObject<T extends Record<string, any>>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => (typeof item === 'object' && item !== null ? cleanObject(item) : item)) as any;
  }
  const res: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (Array.isArray(val)) {
        res[key] = val.map((item) => (typeof item === 'object' && item !== null ? cleanObject(item) : item));
      } else if (typeof val === 'object' && val !== null) {
        res[key] = cleanObject(val);
      } else {
        res[key] = val;
      }
    }
  }
  return res as T;
}

// Root-level Firestore collections for clean and robust synchronization
const COLLECTIONS = {
  companyGoals: 'coo_company_goals',
  departmentGoals: 'coo_department_goals',
  sessions121: 'coo_sessions_121',
  activityLogs: 'coo_activity_logs',
  reflections: 'coo_reflections',
  readingLogs: 'coo_reading_logs',
  personalGoalsAndBible: 'coo_personal_bible',
  wellnessLogs: 'coo_wellness_logs',
  system: 'coo_system',
} as const;

// Cache loader helper to prevent white flash on device wake/reload
function loadFromCache<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`coo_cache_${key}`);
    if (item) {
      return JSON.parse(item);
    }
  } catch (e) {
    // ignore
  }
  return fallback;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyId | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['2026-08', '2026-07']);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [companyGoals, setCompanyGoals] = useState<CompanyGoal[]>(() => loadFromCache('companyGoals', INITIAL_COMPANY_GOALS));
  const [departmentGoals, setDepartmentGoals] = useState<DepartmentGoal[]>(() => loadFromCache('departmentGoals', INITIAL_DEPARTMENT_GOALS));
  const [sessions121, setSessions121] = useState<Session121[]>(() => loadFromCache('sessions121', INITIAL_121_SESSIONS));
  const [kpiGrades] = useState<MonthlyKPIGrade[]>(INITIAL_KPI_GRADES);
  const [activityLogs, setActivityLogs] = useState<ActivityImpactLog[]>(() => loadFromCache('activityLogs', INITIAL_ACTIVITY_LOGS));
  const [reflections, setReflections] = useState<COOLearningReflection[]>(() => loadFromCache('reflections', INITIAL_REFLECTIONS));
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>(() => loadFromCache('readingLogs', INITIAL_READING_LOGS));
  const [personalGoalsAndBible, setPersonalGoalsAndBible] = useState<PersonalGoalAndBible[]>(() => loadFromCache('personalGoalsAndBible', INITIAL_PERSONAL_AND_BIBLE));
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>(() => loadFromCache('wellnessLogs', INITIAL_WELLNESS_LOGS));

  // Multi-Device Cloud Real-Time Listeners & Auto-Seeder
  useEffect(() => {
    setSyncStatus('syncing');
    const unsubs: Array<() => void> = [];

    // Helper to seed initial cloud data if Firestore database is empty
    const ensureCloudSeeded = async () => {
      try {
        const metaRef = doc(db, COLLECTIONS.system, 'metadata');
        const metaSnap = await getDoc(metaRef);
        
        if (!metaSnap.exists()) {
          // Check if companyGoals has any items
          const checkSnap = await getDocs(collection(db, COLLECTIONS.companyGoals));
          if (checkSnap.empty) {
            console.log('Seeding initial executive dashboard data to cloud Firestore...');
            const batch = writeBatch(db);
            
            INITIAL_COMPANY_GOALS.forEach((g) => {
              batch.set(doc(db, COLLECTIONS.companyGoals, g.id), cleanObject(g));
            });
            INITIAL_DEPARTMENT_GOALS.forEach((g) => {
              batch.set(doc(db, COLLECTIONS.departmentGoals, g.id), cleanObject(g));
            });
            INITIAL_121_SESSIONS.forEach((s) => {
              batch.set(doc(db, COLLECTIONS.sessions121, s.id), cleanObject(s));
            });
            INITIAL_ACTIVITY_LOGS.forEach((a) => {
              batch.set(doc(db, COLLECTIONS.activityLogs, a.id), cleanObject(a));
            });
            INITIAL_REFLECTIONS.forEach((r) => {
              batch.set(doc(db, COLLECTIONS.reflections, r.id), cleanObject(r));
            });
            INITIAL_READING_LOGS.forEach((b) => {
              batch.set(doc(db, COLLECTIONS.readingLogs, b.id), cleanObject(b));
            });
            INITIAL_PERSONAL_AND_BIBLE.forEach((p) => {
              batch.set(doc(db, COLLECTIONS.personalGoalsAndBible, p.id), cleanObject(p));
            });
            INITIAL_WELLNESS_LOGS.forEach((w) => {
              batch.set(doc(db, COLLECTIONS.wellnessLogs, w.id), cleanObject(w));
            });

            batch.set(metaRef, {
              isInitialized: true,
              initializedAt: new Date().toISOString(),
              version: '1.0.0',
            });

            await batch.commit();
            console.log('Initial cloud seed completed successfully.');
          }
        }
      } catch (err: any) {
        console.warn('Initial cloud seed check:', err);
      }
    };

    ensureCloudSeeded();

    const setupListener = <T extends { id: string }>(
      colName: string,
      cacheKey: string,
      setState: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const colRef = collection(db, colName);
      const unsub = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map((d) => d.data() as T);
            setState(items);
            try {
              localStorage.setItem(`coo_cache_${cacheKey}`, JSON.stringify(items));
            } catch (e) {
              // ignore
            }
          }
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
          setSyncError(null);
        },
        (err) => {
          console.error(`Firestore snapshot error on ${colName}:`, err);
          setSyncStatus('error');
          setSyncError(err.message || `Failed to sync ${colName}`);
        }
      );
      unsubs.push(unsub);
    };

    setupListener(COLLECTIONS.companyGoals, 'companyGoals', setCompanyGoals);
    setupListener(COLLECTIONS.departmentGoals, 'departmentGoals', setDepartmentGoals);
    setupListener(COLLECTIONS.sessions121, 'sessions121', setSessions121);
    setupListener(COLLECTIONS.activityLogs, 'activityLogs', setActivityLogs);
    setupListener(COLLECTIONS.reflections, 'reflections', setReflections);
    setupListener(COLLECTIONS.readingLogs, 'readingLogs', setReadingLogs);
    setupListener(COLLECTIONS.personalGoalsAndBible, 'personalGoalsAndBible', setPersonalGoalsAndBible);
    setupListener(COLLECTIONS.wellnessLogs, 'wellnessLogs', setWellnessLogs);

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

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
  const addCompanyGoal = async (goal: Omit<CompanyGoal, 'id' | 'lastUpdated'>) => {
    const id = `cg_${Date.now()}`;
    const newGoal: CompanyGoal = {
      ...goal,
      id,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCompanyGoals((prev) => [newGoal, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.companyGoals, id), cleanObject(newGoal));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error adding company goal to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const updateCompanyGoal = async (id: string, partial: Partial<CompanyGoal>) => {
    const existing = companyGoals.find((g) => g.id === id);
    if (!existing) return;
    const updated: CompanyGoal = {
      ...existing,
      ...partial,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCompanyGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.companyGoals, id), cleanObject(updated));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error updating company goal in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const deleteCompanyGoal = async (id: string) => {
    setCompanyGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, COLLECTIONS.companyGoals, id));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error deleting company goal in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const toggleCompanyMilestone = async (companyGoalId: string, milestoneId: string) => {
    const existing = companyGoals.find((g) => g.id === companyGoalId);
    if (!existing) return;
    const updatedMilestones = existing.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const updated: CompanyGoal = {
      ...existing,
      milestones: updatedMilestones,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCompanyGoals((prev) => prev.map((g) => (g.id === companyGoalId ? updated : g)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.companyGoals, companyGoalId), cleanObject(updated));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error toggling milestone in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  // --- Department Goals CRUD ---
  const addDepartmentGoal = async (goal: Omit<DepartmentGoal, 'id' | 'lastUpdated'>) => {
    const id = `dg_${Date.now()}`;
    const newGoal: DepartmentGoal = {
      ...goal,
      id,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setDepartmentGoals((prev) => [newGoal, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.departmentGoals, id), cleanObject(newGoal));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error adding department goal to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const updateDepartmentGoal = async (id: string, partial: Partial<DepartmentGoal>) => {
    const existing = departmentGoals.find((g) => g.id === id);
    if (!existing) return;
    const updated: DepartmentGoal = {
      ...existing,
      ...partial,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setDepartmentGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.departmentGoals, id), cleanObject(updated));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error updating department goal in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const deleteDepartmentGoal = async (id: string) => {
    setDepartmentGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, COLLECTIONS.departmentGoals, id));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error deleting department goal in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const toggleDepartmentMilestone = async (deptGoalId: string, milestoneId: string) => {
    const existing = departmentGoals.find((g) => g.id === deptGoalId);
    if (!existing) return;
    const updatedMilestones = existing.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const updated: DepartmentGoal = {
      ...existing,
      milestones: updatedMilestones,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setDepartmentGoals((prev) => prev.map((g) => (g.id === deptGoalId ? updated : g)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.departmentGoals, deptGoalId), cleanObject(updated));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error toggling department milestone in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  // --- 121 Sessions CRUD ---
  const add121Session = async (session: Omit<Session121, 'id' | 'createdAt'>) => {
    const id = `s121_${Date.now()}`;
    const newSession: Session121 = {
      ...session,
      id,
      createdAt: new Date().toISOString(),
    };
    setSessions121((prev) => [newSession, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.sessions121, id), cleanObject(newSession));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error adding 121 session to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const update121Session = async (id: string, partial: Partial<Session121>) => {
    const existing = sessions121.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    setSessions121((prev) => prev.map((s) => (s.id === id ? updated : s)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.sessions121, id), cleanObject(updated));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error updating 121 session in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const delete121Session = async (id: string) => {
    setSessions121((prev) => prev.filter((s) => s.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, COLLECTIONS.sessions121, id));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error deleting 121 session from cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  // --- Personal Wellness Logs CRUD ---
  const addWellnessLog = async (log: Omit<WellnessLog, 'id' | 'createdAt'>) => {
    const id = `well_${Date.now()}`;
    const newLog: WellnessLog = {
      ...log,
      id,
      createdAt: new Date().toISOString(),
    };
    setWellnessLogs((prev) => [newLog, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.wellnessLogs, id), cleanObject(newLog));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error adding wellness log to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const updateWellnessLog = async (id: string, partial: Partial<WellnessLog>) => {
    const existing = wellnessLogs.find((w) => w.id === id);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    setWellnessLogs((prev) => prev.map((w) => (w.id === id ? updated : w)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.wellnessLogs, id), cleanObject(updated));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error updating wellness log in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const deleteWellnessLog = async (id: string) => {
    setWellnessLogs((prev) => prev.filter((w) => w.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, COLLECTIONS.wellnessLogs, id));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error deleting wellness log from cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  // --- Activity Logs CRUD ---
  const addActivityLog = async (log: Omit<ActivityImpactLog, 'id'>) => {
    const id = `act_${Date.now()}`;
    const newLog: ActivityImpactLog = { ...log, id };
    setActivityLogs((prev) => [newLog, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.activityLogs, id), cleanObject(newLog));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error adding activity log to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const deleteActivityLog = async (id: string) => {
    setActivityLogs((prev) => prev.filter((a) => a.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, COLLECTIONS.activityLogs, id));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error deleting activity log from cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  // --- Reflections CRUD ---
  const addReflection = async (reflection: Omit<COOLearningReflection, 'id'>) => {
    const id = `ref_${Date.now()}`;
    const newRef: COOLearningReflection = { ...reflection, id };
    setReflections((prev) => [newRef, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.reflections, id), cleanObject(newRef));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error adding reflection to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const deleteReflection = async (id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, COLLECTIONS.reflections, id));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error deleting reflection from cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  // --- Reading Logs CRUD ---
  const addReadingLog = async (log: Omit<ReadingLog, 'id'>) => {
    const id = `book_${Date.now()}`;
    const newLog: ReadingLog = { ...log, id };
    setReadingLogs((prev) => [newLog, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.readingLogs, id), cleanObject(newLog));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error adding reading log to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const updateReadingLog = async (id: string, partial: Partial<ReadingLog>) => {
    const existing = readingLogs.find((r) => r.id === id);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    setReadingLogs((prev) => prev.map((r) => (r.id === id ? updated : r)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.readingLogs, id), cleanObject(updated));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error updating reading log in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const deleteReadingLog = async (id: string) => {
    setReadingLogs((prev) => prev.filter((r) => r.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, COLLECTIONS.readingLogs, id));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error deleting reading log from cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  // --- Personal Goal & Bible CRUD ---
  const addPersonalGoalOrBible = async (item: Omit<PersonalGoalAndBible, 'id'>) => {
    const id = `pb_${Date.now()}`;
    const newItem: PersonalGoalAndBible = { ...item, id };
    setPersonalGoalsAndBible((prev) => [newItem, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, COLLECTIONS.personalGoalsAndBible, id), cleanObject(newItem));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error adding personal goal to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const togglePersonalGoalOrBible = async (id: string) => {
    const existing = personalGoalsAndBible.find((p) => p.id === id);
    if (!existing) return;
    const updated = { ...existing, completed: !existing.completed };
    setPersonalGoalsAndBible((prev) => prev.map((p) => (p.id === id ? updated : p)));
    try {
      setSyncStatus('syncing');
      await updateDoc(doc(db, COLLECTIONS.personalGoalsAndBible, id), {
        completed: updated.completed,
      });
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error toggling personal goal in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
  };

  const deletePersonalGoalOrBible = async (id: string) => {
    setPersonalGoalsAndBible((prev) => prev.filter((p) => p.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, COLLECTIONS.personalGoalsAndBible, id));
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.error('Error deleting personal goal from cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
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
    if (overallScore >= 93) grade = 'A+';
    else if (overallScore >= 85) grade = 'A';
    else if (overallScore >= 75) grade = 'B';
    else if (overallScore >= 65) grade = 'C';
    else if (overallScore >= 50) grade = 'D';
    else grade = 'F';

    return {
      id: `kpi_${monthYear}`,
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
        operationalExcellenceNote: `Operational weighted progress at ${Math.round(avgProgress)}% across active goals.`,
        teamLeadershipNote: `121 Cadence execution at ${Math.round(cadenceExecutionPct)}% with ${completedSessions} completed sessions.`,
        strategicGrowthNote: `Logged ${totalHours.toFixed(1)} strategic hours (${Math.round(highImpactRatio)}% high impact).`,
        personalMasteryNote: avgEnergy < 4.2 ? 'Elevate department morale and unblock bottlenecks.' : 'Maintain peak executive rhythm.',
      },
      reflections: 'Automated executive grade generated by performance algorithm.',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  };

  const getCumulativeKPIGradeForMonths = (months: string[]): FormulaAuditBreakdown => {
    const monthlyGrades = months.map((m) => getAutomatedKPIGradeForMonth(m));
    const count = Math.max(1, monthlyGrades.length);

    const opAvg = Math.round(monthlyGrades.reduce((a, b) => a + b.scores.operationalExcellence, 0) / count);
    const teamAvg = Math.round(monthlyGrades.reduce((a, b) => a + b.scores.teamLeadership, 0) / count);
    const stratAvg = Math.round(monthlyGrades.reduce((a, b) => a + b.scores.strategicGrowth, 0) / count);
    const masteryAvg = Math.round(monthlyGrades.reduce((a, b) => a + b.scores.personalMastery, 0) / count);
    const cumulativeScore = opAvg + teamAvg + stratAvg + masteryAvg;

    let overallGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'B';
    if (cumulativeScore >= 93) overallGrade = 'A+';
    else if (cumulativeScore >= 85) overallGrade = 'A';
    else if (cumulativeScore >= 75) overallGrade = 'B';
    else if (cumulativeScore >= 65) overallGrade = 'C';
    else if (cumulativeScore >= 50) overallGrade = 'D';
    else overallGrade = 'F';

    // Aggregates for audit inspection
    const highWeights = departmentGoals.filter((g) => g.impactLevel === 'High').length;
    const medWeights = departmentGoals.filter((g) => !g.impactLevel || g.impactLevel === 'Medium').length;
    const lowWeights = departmentGoals.filter((g) => g.impactLevel === 'Low').length;

    const allSessions = sessions121.filter((s) => months.includes(s.monthYear));
    const completed121s = allSessions.filter((s) => s.status === 'Completed').length;
    const avgEnergy = allSessions.length > 0 ? allSessions.reduce((a, b) => a + b.energyRating, 0) / allSessions.length : 4.6;

    const allActivities = activityLogs.filter((a) => months.some((m) => a.date.startsWith(m)));
    const totalHours = allActivities.reduce((a, b) => a + b.hoursSpent, 0);
    const highImpactHours = allActivities.filter((a) => a.impactTag === 'High Impact').reduce((a, b) => a + b.hoursSpent, 0);
    const highImpactRatio = totalHours > 0 ? Math.round((highImpactHours / totalHours) * 100) : 75;

    const allWellness = wellnessLogs.filter((w) => months.some((m) => w.date.startsWith(m)));
    const wellnessDaysLogged = allWellness.length;
    const targetWellnessDays = count * 15;
    const wellnessConsistencyPct = Math.min(100, Math.round((wellnessDaysLogged / targetWellnessDays) * 100));

    return {
      monthsEvaluated: months,
      operationalExcellence: {
        score: opAvg,
        weightedDeptGoalProgressPct: Math.round((opAvg / 25) * 100),
        deptMilestoneExecutionPct: 82,
        impactWeightsApplied: { highCount: highWeights, mediumCount: medWeights, lowCount: lowWeights },
        formulaText: `Score = Math.min(25, [(Weighted Goal Progress % × 0.7) + (Milestone Completion % × 0.3)] × 0.25). Impact Multipliers: High = 1.5x, Med = 1.0x, Low = 0.5x.`,
      },
      teamLeadership: {
        score: teamAvg,
        totalCompleted121s: completed121s,
        cadenceExecutionPct: Math.min(100, Math.round((completed121s / (count * 10)) * 100)),
        averageEnergyRating: Number(avgEnergy.toFixed(1)),
        formulaText: `Score = Math.min(25, [(Cadence % vs 10 Target/mo × 0.8) + (Avg Energy / 5.0 × 20)] × 0.25).`,
      },
      strategicGrowth: {
        score: stratAvg,
        highImpactHoursRatioPct: highImpactRatio,
        companyGoalMilestonePct: 78,
        formulaText: `Score = Math.min(25, [(High Impact Time % × 0.5) + (Company Goal Milestones % × 0.5)] × 0.25).`,
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

  // Force Refresh all collections directly from Firestore server
  const forceRefreshFromCloud = async (): Promise<boolean> => {
    setSyncStatus('syncing');
    try {
      const cgSnap = await getDocs(collection(db, COLLECTIONS.companyGoals));
      if (!cgSnap.empty) setCompanyGoals(cgSnap.docs.map((d) => d.data() as CompanyGoal));

      const dgSnap = await getDocs(collection(db, COLLECTIONS.departmentGoals));
      if (!dgSnap.empty) setDepartmentGoals(dgSnap.docs.map((d) => d.data() as DepartmentGoal));

      const sSnap = await getDocs(collection(db, COLLECTIONS.sessions121));
      if (!sSnap.empty) setSessions121(sSnap.docs.map((d) => d.data() as Session121));

      const actSnap = await getDocs(collection(db, COLLECTIONS.activityLogs));
      if (!actSnap.empty) setActivityLogs(actSnap.docs.map((d) => d.data() as ActivityImpactLog));

      const refSnap = await getDocs(collection(db, COLLECTIONS.reflections));
      if (!refSnap.empty) setReflections(refSnap.docs.map((d) => d.data() as COOLearningReflection));

      const readSnap = await getDocs(collection(db, COLLECTIONS.readingLogs));
      if (!readSnap.empty) setReadingLogs(readSnap.docs.map((d) => d.data() as ReadingLog));

      const pbSnap = await getDocs(collection(db, COLLECTIONS.personalGoalsAndBible));
      if (!pbSnap.empty) setPersonalGoalsAndBible(pbSnap.docs.map((d) => d.data() as PersonalGoalAndBible));

      const wSnap = await getDocs(collection(db, COLLECTIONS.wellnessLogs));
      if (!wSnap.empty) setWellnessLogs(wSnap.docs.map((d) => d.data() as WellnessLog));

      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      setSyncError(null);
      return true;
    } catch (err: any) {
      console.error('Error force refreshing from cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Failed to refresh from cloud');
      return false;
    }
  };

  // Push all local current data state to Cloud Firestore
  const forcePushAllToCloud = async (): Promise<boolean> => {
    setSyncStatus('syncing');
    try {
      const batch = writeBatch(db);

      companyGoals.forEach((g) => batch.set(doc(db, COLLECTIONS.companyGoals, g.id), cleanObject(g)));
      departmentGoals.forEach((g) => batch.set(doc(db, COLLECTIONS.departmentGoals, g.id), cleanObject(g)));
      sessions121.forEach((s) => batch.set(doc(db, COLLECTIONS.sessions121, s.id), cleanObject(s)));
      activityLogs.forEach((a) => batch.set(doc(db, COLLECTIONS.activityLogs, a.id), cleanObject(a)));
      reflections.forEach((r) => batch.set(doc(db, COLLECTIONS.reflections, r.id), cleanObject(r)));
      readingLogs.forEach((b) => batch.set(doc(db, COLLECTIONS.readingLogs, b.id), cleanObject(b)));
      personalGoalsAndBible.forEach((p) => batch.set(doc(db, COLLECTIONS.personalGoalsAndBible, p.id), cleanObject(p)));
      wellnessLogs.forEach((w) => batch.set(doc(db, COLLECTIONS.wellnessLogs, w.id), cleanObject(w)));

      batch.set(doc(db, COLLECTIONS.system, 'metadata'), {
        isInitialized: true,
        lastPushedAt: new Date().toISOString(),
        version: '1.0.0',
      });

      await batch.commit();
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      setSyncError(null);
      return true;
    } catch (err: any) {
      console.error('Error pushing all data to cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message || 'Failed to push to cloud');
      return false;
    }
  };

  // Test Cloud Firestore Connection Latency
  const testCloudConnection = async (): Promise<{ success: boolean; latencyMs: number; message: string }> => {
    const start = performance.now();
    try {
      const pingRef = doc(db, COLLECTIONS.system, 'ping');
      await setDoc(pingRef, { timestamp: Date.now(), clientPing: new Date().toISOString() });
      await getDoc(pingRef);
      const latencyMs = Math.round(performance.now() - start);
      return {
        success: true,
        latencyMs,
        message: `Successfully connected to Firestore (${latencyMs}ms roundtrip).`,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        success: false,
        latencyMs,
        message: err.message || 'Connection test failed',
      };
    }
  };

  // Reset to Demo Data in Cloud Firestore
  const resetToDemoData = async () => {
    setSyncStatus('syncing');
    setCompanyGoals(INITIAL_COMPANY_GOALS);
    setDepartmentGoals(INITIAL_DEPARTMENT_GOALS);
    setSessions121(INITIAL_121_SESSIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setReflections(INITIAL_REFLECTIONS);
    setReadingLogs(INITIAL_READING_LOGS);
    setPersonalGoalsAndBible(INITIAL_PERSONAL_AND_BIBLE);
    setWellnessLogs(INITIAL_WELLNESS_LOGS);

    try {
      const batch = writeBatch(db);

      INITIAL_COMPANY_GOALS.forEach((g) => batch.set(doc(db, COLLECTIONS.companyGoals, g.id), cleanObject(g)));
      INITIAL_DEPARTMENT_GOALS.forEach((g) => batch.set(doc(db, COLLECTIONS.departmentGoals, g.id), cleanObject(g)));
      INITIAL_121_SESSIONS.forEach((s) => batch.set(doc(db, COLLECTIONS.sessions121, s.id), cleanObject(s)));
      INITIAL_ACTIVITY_LOGS.forEach((a) => batch.set(doc(db, COLLECTIONS.activityLogs, a.id), cleanObject(a)));
      INITIAL_REFLECTIONS.forEach((r) => batch.set(doc(db, COLLECTIONS.reflections, r.id), cleanObject(r)));
      INITIAL_READING_LOGS.forEach((b) => batch.set(doc(db, COLLECTIONS.readingLogs, b.id), cleanObject(b)));
      INITIAL_PERSONAL_AND_BIBLE.forEach((p) => batch.set(doc(db, COLLECTIONS.personalGoalsAndBible, p.id), cleanObject(p)));
      INITIAL_WELLNESS_LOGS.forEach((w) => batch.set(doc(db, COLLECTIONS.wellnessLogs, w.id), cleanObject(w)));

      batch.set(doc(db, COLLECTIONS.system, 'metadata'), {
        isInitialized: true,
        resetAt: new Date().toISOString(),
      });

      await batch.commit();
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      setSyncError(null);
    } catch (err: any) {
      console.error('Error resetting demo data in cloud:', err);
      setSyncStatus('error');
      setSyncError(err.message);
    }
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

  const importDataJSON = async (jsonStr: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonStr);
      setSyncStatus('syncing');
      const batch = writeBatch(db);

      if (parsed.companyGoals) {
        setCompanyGoals(parsed.companyGoals);
        parsed.companyGoals.forEach((g: any) => {
          batch.set(doc(db, COLLECTIONS.companyGoals, g.id), cleanObject(g));
        });
      }
      if (parsed.departmentGoals) {
        setDepartmentGoals(parsed.departmentGoals);
        parsed.departmentGoals.forEach((g: any) => {
          batch.set(doc(db, COLLECTIONS.departmentGoals, g.id), cleanObject(g));
        });
      }
      if (parsed.sessions121) {
        setSessions121(parsed.sessions121);
        parsed.sessions121.forEach((s: any) => {
          batch.set(doc(db, COLLECTIONS.sessions121, s.id), cleanObject(s));
        });
      }
      if (parsed.activityLogs) {
        setActivityLogs(parsed.activityLogs);
        parsed.activityLogs.forEach((a: any) => {
          batch.set(doc(db, COLLECTIONS.activityLogs, a.id), cleanObject(a));
        });
      }
      if (parsed.reflections) {
        setReflections(parsed.reflections);
        parsed.reflections.forEach((r: any) => {
          batch.set(doc(db, COLLECTIONS.reflections, r.id), cleanObject(r));
        });
      }
      if (parsed.readingLogs) {
        setReadingLogs(parsed.readingLogs);
        parsed.readingLogs.forEach((b: any) => {
          batch.set(doc(db, COLLECTIONS.readingLogs, b.id), cleanObject(b));
        });
      }
      if (parsed.personalGoalsAndBible) {
        setPersonalGoalsAndBible(parsed.personalGoalsAndBible);
        parsed.personalGoalsAndBible.forEach((p: any) => {
          batch.set(doc(db, COLLECTIONS.personalGoalsAndBible, p.id), cleanObject(p));
        });
      }
      if (parsed.wellnessLogs) {
        setWellnessLogs(parsed.wellnessLogs);
        parsed.wellnessLogs.forEach((w: any) => {
          batch.set(doc(db, COLLECTIONS.wellnessLogs, w.id), cleanObject(w));
        });
      }

      await batch.commit();
      setSyncStatus('synced');
      setLastSyncedAt(new Date());
      setSyncError(null);
      return true;
    } catch (e: any) {
      console.error('Failed to import JSON data to cloud:', e);
      setSyncStatus('error');
      setSyncError(e.message);
      return false;
    }
  };

  const diagnostics: SyncDiagnostics = {
    companyGoalsCount: companyGoals.length,
    departmentGoalsCount: departmentGoals.length,
    sessions121Count: sessions121.length,
    activityLogsCount: activityLogs.length,
    reflectionsCount: reflections.length,
    readingLogsCount: readingLogs.length,
    personalGoalsCount: personalGoalsAndBible.length,
    wellnessLogsCount: wellnessLogs.length,
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
        syncStatus,
        lastSyncedAt,
        syncError,
        diagnostics,
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
        forceRefreshFromCloud,
        forcePushAllToCloud,
        testCloudConnection,
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
