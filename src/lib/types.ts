// Knowlio Types

export type PlanType = 'free' | 'plus' | 'pro';

export interface User {
  id: string;
  name: string;
  email: string;
  grade: number;
  plan: PlanType;
  isParentMode: boolean;
  selectedTutor: string;
  studyStreak: number;
  totalStudyTime: number;
  weeklyStudyTime: number;
  aiAnalysesUsed: number;
  lastResetDate: string;
  lastStudyDate?: string;
  xp: number;
  unlockedAchievements: string[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  xp: number;
  avatar?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  conditionType: 'studyTime' | 'streak' | 'flashcards' | 'firstSession';
  conditionTarget: number;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  assignments: Assignment[];
}

export interface Assignment {
  id: string;
  name: string;
  type: 'test' | 'quiz' | 'assignment' | 'project' | 'exam';
  grade: number;
  weight: number;
  date: string;
  topics?: string[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  date: string;
  duration: number;
  topics: string[];
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  sessions: StudySession[];
  projectedGrade: number;
}

export interface FlashCard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  correctCount: number;
  incorrectCount: number;
}

export interface FlashCardDeck {
  id: string;
  name: string;
  subjectId: string;
  cards: FlashCard[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AITutor {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  specialties: string[];
  greeting: string;
  style: 'encouraging' | 'strict' | 'friendly' | 'analytical';
}

export interface WeaknessAnalysis {
  topic: string;
  weakness: string;
  strategies: string[];
  practiceQuestions: string[];
  explanation: string;
}

export interface ParentData {
  childName: string;
  gradeHistory: { date: string; average: number }[];
  studyConsistency: number;
  timeSpentThisWeek: number;
  areasNeedingAttention: string[];
  recentActivity: { date: string; action: string }[];
}
