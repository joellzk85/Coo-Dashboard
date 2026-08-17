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
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

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

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

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

  // Auth & Cloud Sync States
  user: User | null;
  isAuthLoading: boolean;
  syncStatus: SyncStatus;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string, isSignUp?: boolean) => Promise<void>;
  signInWithSyncPasscode: (passcode: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  seedUserDataToCloud: () => Promise<void>;

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

  // Utilities
  resetToDemoData: () => Promise<void>;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => Promise<boolean>;
}

function cleanObject<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyId | 'all'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['2026-08', '2026-07']);

  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [companyGoals, setCompanyGoals] = useState<CompanyGoal[]>(INITIAL_COMPANY_GOALS);
  const [departmentGoals, setDepartmentGoals] = useState<DepartmentGoal[]>(INITIAL_DEPARTMENT_GOALS);
  const [sessions121, setSessions121] = useState<Session121[]>(INITIAL_121_SESSIONS);
  const [kpiGrades] = useState<MonthlyKPIGrade[]>(INITIAL_KPI_GRADES);
  const [activityLogs, setActivityLogs] = useState<ActivityImpactLog[]>(INITIAL_ACTIVITY_LOGS);
  const [reflections, setReflections] = useState<COOLearningReflection[]>(INITIAL_REFLECTIONS);
  const [readingLogs, setReadingLogs] = useState<ReadingLog[]>(INITIAL_READING_LOGS);
  const [personalGoalsAndBible, setPersonalGoalsAndBible] = useState<PersonalGoalAndBible[]>(INITIAL_PERSONAL_AND_BIBLE);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>(INITIAL_WELLNESS_LOGS);

  const toggleSelectedMonth = (month: string) => {
    setSelectedMonths(prev => {
      if (prev.includes(month)) {
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== month);
      }
      return [...prev, month];
    });
  };

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const activeUid = user ? user.uid : 'default_coo';

  // 2. Realtime Firestore Sync Listeners (works for authenticated users & default unauthenticated session)
  useEffect(() => {
    setSyncStatus('syncing');

    const uid = activeUid;
    const userRef = (colName: string) => collection(db, 'users', uid, colName);

    // Listeners array to cleanup on unmount or user change
    const unsubs: Array<() => void> = [];

    // Helper to set up realtime collection listener with auto-seeding ONLY on first-ever load
    const setupListener = <T extends { id: string }>(
      colName: string,
      initialData: T[],
      setState: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const col = userRef(colName);
      const seededMarkerRef = doc(db, 'users', uid, '_seeded', colName);

      const unsub = onSnapshot(
        col,
        async (snapshot) => {
          if (snapshot.empty) {
            const markerSnap = await getDoc(seededMarkerRef);
            if (markerSnap.exists()) {
              // Already seeded before — this is a real, intentional empty state (user deleted everything)
              setState([]);
              setSyncStatus('synced');
              return;
            }
            // First time ever for this collection — seed initial data to cloud
            setState(initialData);
            setSyncStatus('synced');
            try {
              const batch = writeBatch(db);
              initialData.forEach((item) => {
                const itemDocRef = doc(db, 'users', uid, colName, item.id);
                batch.set(itemDocRef, cleanObject(item));
              });
              batch.set(seededMarkerRef, { seededAt: new Date().toISOString() });
              await batch.commit();
            } catch (e) {
              console.error(`Error seeding ${colName} to cloud:`, e);
            }
          } else {
            const list: T[] = snapshot.docs.map((docSnap) => docSnap.data() as T);
            setState(list);
            setSyncStatus('synced');
          }
        },
        (error) => {
          console.error(`Firestore snapshot error for ${colName}:`, error);
          setState((prev) => (prev.length === 0 ? initialData : prev));
          setSyncStatus('error');
        }
      );
      unsubs.push(unsub);
    };

    setupListener('companyGoals', INITIAL_COMPANY_GOALS, setCompanyGoals);
    setupListener('departmentGoals', INITIAL_DEPARTMENT_GOALS, setDepartmentGoals);
    setupListener('sessions121', INITIAL_121_SESSIONS, setSessions121);
    setupListener('activityLogs', INITIAL_ACTIVITY_LOGS, setActivityLogs);
    setupListener('reflections', INITIAL_REFLECTIONS, setReflections);
    setupListener('readingLogs', INITIAL_READING_LOGS, setReadingLogs);
    setupListener('personalGoalsAndBible', INITIAL_PERSONAL_AND_BIBLE, setPersonalGoalsAndBible);
    setupListener('wellnessLogs', INITIAL_WELLNESS_LOGS, setWellnessLogs);

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [activeUid]);

  // Auth Methods
  const signInWithGoogle = async () => {
    try {
      setSyncStatus('syncing');
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string, isSignUp = false) => {
    try {
      setSyncStatus('syncing');
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
    } catch (err) {
      console.error('Email auth error:', err);
      throw err;
    }
  };

  const signInWithSyncPasscode = async (passcode: string) => {
    const cleanCode = passcode.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanCode) throw new Error('Please enter a valid passcode');
    const formattedEmail = `coo_${cleanCode}@dashboard.sync`;
    const formattedPass = `coo_pass_${cleanCode}_2026`;

    try {
      setSyncStatus('syncing');
      await signInWithEmailAndPassword(auth, formattedEmail, formattedPass);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Create the passcode account automatically
        await createUserWithEmailAndPassword(auth, formattedEmail, formattedPass);
      } else {
        throw err;
      }
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
  };

  const seedUserDataToCloud = async () => {
    setSyncStatus('syncing');
    const uid = activeUid;
    const batch = writeBatch(db);

    const seedCol = <T extends { id: string }>(colName: string, items: T[]) => {
      items.forEach((item) => {
        const d = doc(db, 'users', uid, colName, item.id);
        batch.set(d, cleanObject(item));
      });
    };

    seedCol('companyGoals', INITIAL_COMPANY_GOALS);
    seedCol('departmentGoals', INITIAL_DEPARTMENT_GOALS);
    seedCol('sessions121', INITIAL_121_SESSIONS);
    seedCol('activityLogs', INITIAL_ACTIVITY_LOGS);
    seedCol('reflections', INITIAL_REFLECTIONS);
    seedCol('readingLogs', INITIAL_READING_LOGS);
    seedCol('personalGoalsAndBible', INITIAL_PERSONAL_AND_BIBLE);
    seedCol('wellnessLogs', INITIAL_WELLNESS_LOGS);

    await batch.commit();
    setSyncStatus('synced');
  };

  // --- Company Goals Cloud CRUD ---
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
      await setDoc(doc(db, 'users', activeUid, 'companyGoals', id), cleanObject(newGoal));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error adding company goal:', err);
      setSyncStatus('error');
    }
  };

  const updateCompanyGoal = async (id: string, partial: Partial<CompanyGoal>) => {
    const existing = companyGoals.find((g) => g.id === id);
    if (!existing) return;
    const updated = {
      ...existing,
      ...partial,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCompanyGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'companyGoals', id), cleanObject(updated));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error updating company goal:', err);
      setSyncStatus('error');
    }
  };

  const deleteCompanyGoal = async (id: string) => {
    setCompanyGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'users', activeUid, 'companyGoals', id));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error deleting company goal:', err);
      setSyncStatus('error');
    }
  };

  const toggleCompanyMilestone = async (companyGoalId: string, milestoneId: string) => {
    const goal = companyGoals.find((g) => g.id === companyGoalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    await updateCompanyGoal(companyGoalId, { milestones: updatedMilestones });
  };

  // --- Department Goals Cloud CRUD ---
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
      await setDoc(doc(db, 'users', activeUid, 'departmentGoals', id), cleanObject(newGoal));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error adding department goal:', err);
      setSyncStatus('error');
    }
  };

  const updateDepartmentGoal = async (id: string, partial: Partial<DepartmentGoal>) => {
    const existing = departmentGoals.find((g) => g.id === id);
    if (!existing) return;
    const updated = {
      ...existing,
      ...partial,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setDepartmentGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'departmentGoals', id), cleanObject(updated));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error updating department goal:', err);
      setSyncStatus('error');
    }
  };

  const deleteDepartmentGoal = async (id: string) => {
    setDepartmentGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'users', activeUid, 'departmentGoals', id));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error deleting department goal:', err);
      setSyncStatus('error');
    }
  };

  const toggleDepartmentMilestone = async (deptGoalId: string, milestoneId: string) => {
    const goal = departmentGoals.find((g) => g.id === deptGoalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    await updateDepartmentGoal(deptGoalId, { milestones: updatedMilestones });
  };

  // --- 121 Sessions Cloud CRUD ---
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
      await setDoc(doc(db, 'users', activeUid, 'sessions121', id), cleanObject(newSession));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error adding 121 session:', err);
      setSyncStatus('error');
    }
  };

  const update121Session = async (id: string, partial: Partial<Session121>) => {
    const existing = sessions121.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    setSessions121((prev) => prev.map((s) => (s.id === id ? updated : s)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'sessions121', id), cleanObject(updated));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error updating 121 session:', err);
      setSyncStatus('error');
    }
  };

  const delete121Session = async (id: string) => {
    setSessions121((prev) => prev.filter((s) => s.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'users', activeUid, 'sessions121', id));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error deleting 121 session:', err);
      setSyncStatus('error');
    }
  };

  // --- Personal Wellness Logs Cloud CRUD ---
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
      await setDoc(doc(db, 'users', activeUid, 'wellnessLogs', id), cleanObject(newLog));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error adding wellness log:', err);
      setSyncStatus('error');
    }
  };

  const updateWellnessLog = async (id: string, partial: Partial<WellnessLog>) => {
    const existing = wellnessLogs.find((w) => w.id === id);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    setWellnessLogs((prev) => prev.map((w) => (w.id === id ? updated : w)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'wellnessLogs', id), cleanObject(updated));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error updating wellness log:', err);
      setSyncStatus('error');
    }
  };

  const deleteWellnessLog = async (id: string) => {
    setWellnessLogs((prev) => prev.filter((w) => w.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'users', activeUid, 'wellnessLogs', id));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error deleting wellness log:', err);
      setSyncStatus('error');
    }
  };

  // --- Activity Logs Cloud CRUD ---
  const addActivityLog = async (log: Omit<ActivityImpactLog, 'id'>) => {
    const id = `act_${Date.now()}`;
    const newLog: ActivityImpactLog = { ...log, id };
    setActivityLogs((prev) => [newLog, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'activityLogs', id), cleanObject(newLog));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error adding activity log:', err);
      setSyncStatus('error');
    }
  };

  const deleteActivityLog = async (id: string) => {
    setActivityLogs((prev) => prev.filter((a) => a.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'users', activeUid, 'activityLogs', id));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error deleting activity log:', err);
      setSyncStatus('error');
    }
  };

  // --- Reflections Cloud CRUD ---
  const addReflection = async (reflection: Omit<COOLearningReflection, 'id'>) => {
    const id = `ref_${Date.now()}`;
    const newRef: COOLearningReflection = { ...reflection, id };
    setReflections((prev) => [newRef, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'reflections', id), cleanObject(newRef));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error adding reflection:', err);
      setSyncStatus('error');
    }
  };

  const deleteReflection = async (id: string) => {
    setReflections((prev) => prev.filter((r) => r.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'users', activeUid, 'reflections', id));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error deleting reflection:', err);
      setSyncStatus('error');
    }
  };

  // --- Reading Logs Cloud CRUD ---
  const addReadingLog = async (log: Omit<ReadingLog, 'id'>) => {
    const id = `book_${Date.now()}`;
    const newLog: ReadingLog = { ...log, id };
    setReadingLogs((prev) => [newLog, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'readingLogs', id), cleanObject(newLog));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error adding reading log:', err);
      setSyncStatus('error');
    }
  };

  const updateReadingLog = async (id: string, partial: Partial<ReadingLog>) => {
    const existing = readingLogs.find((r) => r.id === id);
    if (!existing) return;
    const updated = { ...existing, ...partial };
    setReadingLogs((prev) => prev.map((r) => (r.id === id ? updated : r)));
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'readingLogs', id), cleanObject(updated));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error updating reading log:', err);
      setSyncStatus('error');
    }
  };

  const deleteReadingLog = async (id: string) => {
    setReadingLogs((prev) => prev.filter((r) => r.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'users', activeUid, 'readingLogs', id));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error deleting reading log:', err);
      setSyncStatus('error');
    }
  };

  // --- Personal Goal & Bible Cloud CRUD ---
  const addPersonalGoalOrBible = async (item: Omit<PersonalGoalAndBible, 'id'>) => {
    const id = `pb_${Date.now()}`;
    const newItem: PersonalGoalAndBible = { ...item, id };
    setPersonalGoalsAndBible((prev) => [newItem, ...prev]);
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'users', activeUid, 'personalGoalsAndBible', id), cleanObject(newItem));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error adding personal goal:', err);
      setSyncStatus('error');
    }
  };

  const togglePersonalGoalOrBible = async (id: string) => {
    const existing = personalGoalsAndBible.find((p) => p.id === id);
    if (!existing) return;
    const updated = { ...existing, completed: !existing.completed };
    setPersonalGoalsAndBible((prev) => prev.map((p) => (p.id === id ? updated : p)));
    try {
      setSyncStatus('syncing');
      await updateDoc(doc(db, 'users', activeUid, 'personalGoalsAndBible', id), {
        completed: updated.completed,
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error toggling personal goal:', err);
      setSyncStatus('error');
    }
  };

  const deletePersonalGoalOrBible = async (id: string) => {
    setPersonalGoalsAndBible((prev) => prev.filter((p) => p.id !== id));
    try {
      setSyncStatus('syncing');
      await deleteDoc(doc(db, 'users', activeUid, 'personalGoalsAndBible', id));
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error deleting personal goal:', err);
      setSyncStatus('error');
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

    // 3. Strategic Growth & Projects (Max 25 pts)
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

    const monthsSessions = sessions121.filter(
      s => monthsList.includes(s.monthYear) && (selectedCompany === 'all' || s.companyId === selectedCompany)
    );
    const totalCompleted121s = monthsSessions.filter(s => s.status === 'Completed').length;
    const target121sTotal = monthsList.length * 10;
    const cadenceExecutionPct = Math.min(100, Math.round((totalCompleted121s / target121sTotal) * 100));
    const avgEnergyRating = monthsSessions.length > 0
      ? Number((monthsSessions.reduce((acc, s) => acc + s.energyRating, 0) / monthsSessions.length).toFixed(1))
      : 4.5;

    const monthsActivities = activityLogs.filter(a => monthsList.some(m => a.date.startsWith(m)));
    const totalHrs = monthsActivities.reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactHrs = monthsActivities.filter(a => a.impactTag === 'High Impact').reduce((acc, a) => acc + a.hoursSpent, 0);
    const highImpactHoursRatioPct = totalHrs > 0 ? Math.round((highImpactHrs / totalHrs) * 100) : 75;

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

  // Reset to Demo Data in Cloud
  const resetToDemoData = async () => {
    await seedUserDataToCloud();
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
    if (!user) return false;
    try {
      const parsed = JSON.parse(jsonStr);
      setSyncStatus('syncing');
      const batch = writeBatch(db);

      const importCol = <T extends { id: string }>(colName: string, items: T[]) => {
        items.forEach((item) => {
          const d = doc(db, 'users', user.uid, colName, item.id);
          batch.set(d, cleanObject(item));
        });
      };

      if (parsed.companyGoals) importCol('companyGoals', parsed.companyGoals);
      if (parsed.departmentGoals) importCol('departmentGoals', parsed.departmentGoals);
      if (parsed.sessions121) importCol('sessions121', parsed.sessions121);
      if (parsed.activityLogs) importCol('activityLogs', parsed.activityLogs);
      if (parsed.reflections) importCol('reflections', parsed.reflections);
      if (parsed.readingLogs) importCol('readingLogs', parsed.readingLogs);
      if (parsed.personalGoalsAndBible) importCol('personalGoalsAndBible', parsed.personalGoalsAndBible);
      if (parsed.wellnessLogs) importCol('wellnessLogs', parsed.wellnessLogs);

      await batch.commit();
      setSyncStatus('synced');
      return true;
    } catch (e) {
      console.error('Failed to import JSON data to Cloud:', e);
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

        // Auth & Sync
        user,
        isAuthLoading,
        syncStatus,
        signInWithGoogle,
        signInWithEmail,
        signInWithSyncPasscode,
        signOutUser,
        seedUserDataToCloud,

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
