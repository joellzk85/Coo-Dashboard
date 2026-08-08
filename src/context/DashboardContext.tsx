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
  INITIAL_PERSONAL_AND_BIBLE
} from '../data/initialSeedData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

interface DashboardContextType {
  selectedCompany: CompanyId | 'all';
  setSelectedCompany: (company: CompanyId | 'all') => void;
  selectedMonth: string; // YYYY-MM
  setSelectedMonth: (month: string) => void;
  
  departments: Department[];
  companyGoals: CompanyGoal[];
  departmentGoals: DepartmentGoal[];
  sessions121: Session121[];
  kpiGrades: MonthlyKPIGrade[];
  activityLogs: ActivityImpactLog[];
  reflections: COOLearningReflection[];
  readingLogs: ReadingLog[];
  personalGoalsAndBible: PersonalGoalAndBible[];

  // Real-time / connection state
  isFirebaseSynced: boolean;
  isOnline: boolean;

  // Goal actions
  addCompanyGoal: (goal: Omit<CompanyGoal, 'id' | 'lastUpdated'>) => void;
  updateCompanyGoal: (id: string, goal: Partial<CompanyGoal>) => void;
  deleteCompanyGoal: (id: string) => void;

  addDepartmentGoal: (goal: Omit<DepartmentGoal, 'id' | 'lastUpdated'>) => void;
  updateDepartmentGoal: (id: string, goal: Partial<DepartmentGoal>) => void;
  deleteDepartmentGoal: (id: string) => void;

  // 121 Session actions
  add121Session: (session: Omit<Session121, 'id' | 'createdAt'>) => void;
  update121Session: (id: string, session: Partial<Session121>) => void;
  delete121Session: (id: string) => void;

  // KPI Grading actions
  saveKPIGrade: (grade: Omit<MonthlyKPIGrade, 'id' | 'lastUpdated'>) => void;

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
  COMPANY_GOALS: 'next_coo_company_goals_v1',
  DEPT_GOALS: 'next_coo_dept_goals_v1',
  SESSIONS_121: 'next_coo_sessions_121_v1',
  KPI_GRADES: 'next_coo_kpi_grades_v1',
  ACTIVITY_LOGS: 'next_coo_activity_logs_v1',
  REFLECTIONS: 'next_coo_reflections_v1',
  READING_LOGS: 'next_coo_reading_logs_v1',
  PERSONAL_BIBLE: 'next_coo_personal_bible_v1',
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
  const [kpiGrades, setKpiGrades] = useState<MonthlyKPIGrade[]>(() =>
    getLocalOrInitial(STORAGE_KEYS.KPI_GRADES, INITIAL_KPI_GRADES)
  );
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

  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);
  const [isOnline] = useState<boolean>(true);

  // Sync to local storage
  useEffect(() => { saveLocal(STORAGE_KEYS.COMPANY_GOALS, companyGoals); }, [companyGoals]);
  useEffect(() => { saveLocal(STORAGE_KEYS.DEPT_GOALS, departmentGoals); }, [departmentGoals]);
  useEffect(() => { saveLocal(STORAGE_KEYS.SESSIONS_121, sessions121); }, [sessions121]);
  useEffect(() => { saveLocal(STORAGE_KEYS.KPI_GRADES, kpiGrades); }, [kpiGrades]);
  useEffect(() => { saveLocal(STORAGE_KEYS.ACTIVITY_LOGS, activityLogs); }, [activityLogs]);
  useEffect(() => { saveLocal(STORAGE_KEYS.REFLECTIONS, reflections); }, [reflections]);
  useEffect(() => { saveLocal(STORAGE_KEYS.READING_LOGS, readingLogs); }, [readingLogs]);
  useEffect(() => { saveLocal(STORAGE_KEYS.PERSONAL_BIBLE, personalGoalsAndBible); }, [personalGoalsAndBible]);

  // Optional Firestore Real-time Listeners
  useEffect(() => {
    let unsubscribeCompanyGoals: () => void;
    try {
      unsubscribeCompanyGoals = onSnapshot(
        collection(db, 'companyGoals'),
        (snapshot) => {
          if (!snapshot.empty) {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompanyGoal));
            setCompanyGoals(items);
            setIsFirebaseSynced(true);
          }
        },
        (error) => {
          console.info('Firestore offline mode or fallback to local state:', error.message);
          setIsFirebaseSynced(false);
        }
      );
    } catch {
      setIsFirebaseSynced(false);
    }
    return () => {
      if (unsubscribeCompanyGoals) unsubscribeCompanyGoals();
    };
  }, []);

  // Sync Helper to Firestore
  const syncToFirestore = async (collectionName: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, collectionName, id), data, { merge: true });
    } catch (e) {
      // Local fallback is already updated
    }
  };

  const deleteFromFirestore = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      // Local fallback handled
    }
  };

  // Company Goals
  const addCompanyGoal = (goal: Omit<CompanyGoal, 'id' | 'lastUpdated'>) => {
    const newGoal: CompanyGoal = {
      ...goal,
      id: `cg_${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCompanyGoals(prev => [newGoal, ...prev]);
    syncToFirestore('companyGoals', newGoal.id, newGoal);
  };

  const updateCompanyGoal = (id: string, partial: Partial<CompanyGoal>) => {
    setCompanyGoals(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...partial, lastUpdated: new Date().toISOString().split('T')[0] };
          syncToFirestore('companyGoals', id, updated);
          return updated;
        }
        return item;
      })
    );
  };

  const deleteCompanyGoal = (id: string) => {
    setCompanyGoals(prev => prev.filter(item => item.id !== id));
    deleteFromFirestore('companyGoals', id);
  };

  // Department Goals
  const addDepartmentGoal = (goal: Omit<DepartmentGoal, 'id' | 'lastUpdated'>) => {
    const newGoal: DepartmentGoal = {
      ...goal,
      id: `dg_${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setDepartmentGoals(prev => [newGoal, ...prev]);
    syncToFirestore('departmentGoals', newGoal.id, newGoal);
  };

  const updateDepartmentGoal = (id: string, partial: Partial<DepartmentGoal>) => {
    setDepartmentGoals(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...partial, lastUpdated: new Date().toISOString().split('T')[0] };
          syncToFirestore('departmentGoals', id, updated);
          return updated;
        }
        return item;
      })
    );
  };

  const deleteDepartmentGoal = (id: string) => {
    setDepartmentGoals(prev => prev.filter(item => item.id !== id));
    deleteFromFirestore('departmentGoals', id);
  };

  // 121 Sessions
  const add121Session = (session: Omit<Session121, 'id' | 'createdAt'>) => {
    const newSession: Session121 = {
      ...session,
      id: `s121_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSessions121(prev => [newSession, ...prev]);
    syncToFirestore('sessions121', newSession.id, newSession);
  };

  const update121Session = (id: string, partial: Partial<Session121>) => {
    setSessions121(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...partial };
          syncToFirestore('sessions121', id, updated);
          return updated;
        }
        return item;
      })
    );
  };

  const delete121Session = (id: string) => {
    setSessions121(prev => prev.filter(item => item.id !== id));
    deleteFromFirestore('sessions121', id);
  };

  // KPI Grades
  const saveKPIGrade = (grade: Omit<MonthlyKPIGrade, 'id' | 'lastUpdated'>) => {
    const id = `kpi_${grade.monthYear.replace('-', '_')}`;
    const newGrade: MonthlyKPIGrade = {
      ...grade,
      id,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setKpiGrades(prev => {
      const filtered = prev.filter(item => item.monthYear !== grade.monthYear);
      return [newGrade, ...filtered];
    });
    syncToFirestore('kpiGrades', id, newGrade);
  };

  // Activity Logs
  const addActivityLog = (log: Omit<ActivityImpactLog, 'id'>) => {
    const newLog: ActivityImpactLog = {
      ...log,
      id: `act_${Date.now()}`,
    };
    setActivityLogs(prev => [newLog, ...prev]);
    syncToFirestore('activityLogs', newLog.id, newLog);
  };

  const deleteActivityLog = (id: string) => {
    setActivityLogs(prev => prev.filter(item => item.id !== id));
    deleteFromFirestore('activityLogs', id);
  };

  // Reflections
  const addReflection = (reflection: Omit<COOLearningReflection, 'id'>) => {
    const newRef: COOLearningReflection = {
      ...reflection,
      id: `ref_${Date.now()}`,
    };
    setReflections(prev => [newRef, ...prev]);
    syncToFirestore('reflections', newRef.id, newRef);
  };

  const deleteReflection = (id: string) => {
    setReflections(prev => prev.filter(item => item.id !== id));
    deleteFromFirestore('reflections', id);
  };

  // Reading Logs
  const addReadingLog = (log: Omit<ReadingLog, 'id'>) => {
    const newLog: ReadingLog = {
      ...log,
      id: `book_${Date.now()}`,
    };
    setReadingLogs(prev => [newLog, ...prev]);
    syncToFirestore('readingLogs', newLog.id, newLog);
  };

  const updateReadingLog = (id: string, partial: Partial<ReadingLog>) => {
    setReadingLogs(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...partial };
          syncToFirestore('readingLogs', id, updated);
          return updated;
        }
        return item;
      })
    );
  };

  const deleteReadingLog = (id: string) => {
    setReadingLogs(prev => prev.filter(item => item.id !== id));
    deleteFromFirestore('readingLogs', id);
  };

  // Personal Goal & Bible
  const addPersonalGoalOrBible = (item: Omit<PersonalGoalAndBible, 'id'>) => {
    const newItem: PersonalGoalAndBible = {
      ...item,
      id: `pb_${Date.now()}`,
    };
    setPersonalGoalsAndBible(prev => [newItem, ...prev]);
    syncToFirestore('personalGoalsAndBible', newItem.id, newItem);
  };

  const togglePersonalGoalOrBible = (id: string) => {
    setPersonalGoalsAndBible(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, completed: !item.completed };
          syncToFirestore('personalGoalsAndBible', id, updated);
          return updated;
        }
        return item;
      })
    );
  };

  const deletePersonalGoalOrBible = (id: string) => {
    setPersonalGoalsAndBible(prev => prev.filter(item => item.id !== id));
    deleteFromFirestore('personalGoalsAndBible', id);
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setCompanyGoals(INITIAL_COMPANY_GOALS);
    setDepartmentGoals(INITIAL_DEPARTMENT_GOALS);
    setSessions121(INITIAL_121_SESSIONS);
    setKpiGrades(INITIAL_KPI_GRADES);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setReflections(INITIAL_REFLECTIONS);
    setReadingLogs(INITIAL_READING_LOGS);
    setPersonalGoalsAndBible(INITIAL_PERSONAL_AND_BIBLE);
    localStorage.clear();
  };

  const exportDataJSON = () => {
    const data = {
      companyGoals,
      departmentGoals,
      sessions121,
      kpiGrades,
      activityLogs,
      reflections,
      readingLogs,
      personalGoalsAndBible,
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
      if (parsed.kpiGrades) setKpiGrades(parsed.kpiGrades);
      if (parsed.activityLogs) setActivityLogs(parsed.activityLogs);
      if (parsed.reflections) setReflections(parsed.reflections);
      if (parsed.readingLogs) setReadingLogs(parsed.readingLogs);
      if (parsed.personalGoalsAndBible) setPersonalGoalsAndBible(parsed.personalGoalsAndBible);
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
        departments,
        companyGoals,
        departmentGoals,
        sessions121,
        kpiGrades,
        activityLogs,
        reflections,
        readingLogs,
        personalGoalsAndBible,
        isFirebaseSynced,
        isOnline,
        addCompanyGoal,
        updateCompanyGoal,
        deleteCompanyGoal,
        addDepartmentGoal,
        updateDepartmentGoal,
        deleteDepartmentGoal,
        add121Session,
        update121Session,
        delete121Session,
        saveKPIGrade,
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
