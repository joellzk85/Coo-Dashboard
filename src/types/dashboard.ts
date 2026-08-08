export type CompanyId = 'next_energy' | 'next_academy' | 'group';

export interface Department {
  id: string;
  companyId: CompanyId;
  name: string;
  hod: string;
  ahod?: string;
  cadenceRequired: 'weekly' | 'monthly';
  roleTitle: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
}

export interface CompanyGoal {
  id: string;
  companyId: CompanyId;
  title: string;
  description: string;
  targetMetric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  targetDate: string;
  overallRating: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  milestones: Milestone[];
  lastUpdated: string;
}

export interface DepartmentGoal {
  id: string;
  departmentId: string;
  departmentName: string;
  companyId: CompanyId;
  hodName: string;
  title: string;
  description: string;
  targetMetric: string;
  progressPercent: number;
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
  targetDate: string;
  milestones: Milestone[];
  lastUpdated: string;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  deadline: string;
  completed: boolean;
}

export interface Session121 {
  id: string;
  personName: string;
  role: string;
  departmentId: string;
  companyId: CompanyId;
  cadence: 'weekly' | 'monthly';
  date: string; // YYYY-MM-DD
  monthYear: string; // YYYY-MM
  status: 'Completed' | 'Scheduled' | 'Overdue' | 'Rescheduled';
  notes: string;
  sentimentUps: string[]; // Highs / Positives
  sentimentDowns: string[]; // Lows / Challenges
  actionItems: ActionItem[];
  energyRating: number; // 1 to 5
  createdAt: string;
}

export interface MonthlyKPIGrade {
  id: string;
  monthYear: string; // YYYY-MM
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  scores: {
    operationalExcellence: number; // max 25
    teamLeadership: number; // max 25
    strategicGrowth: number; // max 25
    personalMastery: number; // max 25
  };
  notes: {
    operationalExcellenceNote: string;
    teamLeadershipNote: string;
    strategicGrowthNote: string;
    personalMasteryNote: string;
  };
  reflections: string;
  lastUpdated: string;
}

export type ActivityCategory =
  | 'Meeting with Mentor'
  | 'Networking'
  | 'Department Review'
  | 'Strategic Planning'
  | 'Vendor Negotiation'
  | 'Process Optimization'
  | 'Other';

export interface ActivityImpactLog {
  id: string;
  date: string;
  title: string;
  category: ActivityCategory;
  impactTag: 'High Impact' | 'Low/No Impact';
  hoursSpent: number;
  outcome: string;
  reflections: string;
}

export interface COOLearningReflection {
  id: string;
  date: string;
  title: string;
  category: 'Strategic Insight' | 'Leadership Lesson' | 'Operational Improvement' | 'Crisis Management';
  content: string;
  actionItems: string[];
}

export interface ReadingLog {
  id: string;
  title: string;
  author: string;
  status: 'Reading' | 'Completed' | 'Want to Read';
  progressPercent: number;
  learnings: string; // "What did I learn"
  execution: string; // "How to apply"
  dateCompleted?: string;
}

export interface PersonalGoalAndBible {
  id: string;
  category: 'Personal Goal' | 'Bible Learning';
  title: string;
  referenceOrFocus: string; // Scripture reference or goal focus area
  reflections: string;
  actionSteps: string;
  targetDate: string;
  completed: boolean;
}
