import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { User, Subject, FlashCardDeck, ChatMessage, StudyPlan, PlanType, Assignment, FlashCard, LeaderboardUser, Achievement } from './types';
import { mockUser, mockSubjects, mockFlashCardDecks, mockStudyPlan, mockLeaderboard, mockAchievements } from './mockData';
import { generateUUID } from './utils';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AppState {
  // User
  user: User;
  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  toggleParentMode: () => void;
  setPlan: (plan: PlanType) => void;
  setSelectedTutor: (tutorId: string) => void;
  incrementAIUsage: () => void;
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;

  // Subjects
  subjects: Subject[];
  addSubject: (name: string, color: string, icon: string) => void;
  addAssignment: (subjectId: string, assignment: Omit<Assignment, 'id'>) => void;
  deleteAssignment: (subjectId: string, assignmentId: string) => void;

  // Flashcards
  flashCardDecks: FlashCardDeck[];
  addFlashCardDeck: (name: string, subjectId: string) => void;
  addFlashCard: (deckId: string, question: string, answer: string) => void;
  updateFlashCardScore: (deckId: string, cardId: string, correct: boolean) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  clearChat: () => void;

  // Study Plan
  studyPlan: StudyPlan | null;
  setStudyPlan: (plan: StudyPlan) => void;
  toggleSessionComplete: (sessionId: string) => void;

  // Study Time
  addStudyTime: (minutes: number) => void;

  // Leaderboard & Achievements
  leaderboard: LeaderboardUser[];
  achievements: Achievement[];
  addXP: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
}

// Custom storage for Zustand persist middleware
const createStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (name: string) => {
        try {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        } catch (e) {
          console.error('LocalStorage getItem error:', e);
          return null;
        }
      },
      setItem: (name: string, value: any) => {
        try {
          localStorage.setItem(name, JSON.stringify(value));
        } catch (e) {
          console.error('LocalStorage setItem error:', e);
        }
      },
      removeItem: (name: string) => {
        try {
          localStorage.removeItem(name);
        } catch (e) {
          console.error('LocalStorage removeItem error:', e);
        }
      },
    };
  } else {
    // For native platforms, use AsyncStorage
    return {
      getItem: async (name: string) => {
        try {
          const item = await SecureStore.getItemAsync(name);
          return item ? JSON.parse(item) : null;
        } catch (e) {
          console.error('SecureStore getItem error:', e);
          return null;
        }
      },
      setItem: async (name: string, value: any) => {
        try {
          await SecureStore.setItemAsync(name, JSON.stringify(value));
        } catch (e) {
          console.error('SecureStore setItem error:', e);
        }
      },
      removeItem: async (name: string) => {
        try {
          await SecureStore.deleteItemAsync(name);
        } catch (e) {
          console.error('SecureStore removeItem error:', e);
        }
      },
    };
  }
};

type AppStateWithoutActions = Omit<AppState, keyof {
  setUser: any;
  updateUser: any;
  toggleParentMode: any;
  setPlan: any;
  setSelectedTutor: any;
  incrementAIUsage: any;
  setDarkMode: any;
  addSubject: any;
  addAssignment: any;
  deleteAssignment: any;
  addFlashCardDeck: any;
  addFlashCard: any;
  updateFlashCardScore: any;
  addChatMessage: any;
  clearChat: any;
  setStudyPlan: any;
  toggleSessionComplete: any;
  addStudyTime: any;
  addXP: any;
  unlockAchievement: any;
}>;

export const useAppStore = create<AppState>()(
  persist(
    (set: any) => ({
      // User
      user: mockUser,
      setUser: (user: User) => set({ user }),
      updateUser: (data: Partial<User>) => set((state: AppState) => ({ user: { ...state.user, ...data } })),
      toggleParentMode: () => set((state: AppState) => ({
        user: { ...state.user, isParentMode: !state.user.isParentMode }
      })),
      setPlan: (plan: PlanType) => set((state: AppState) => ({
        user: { ...state.user, plan }
      })),
      setSelectedTutor: (tutorId: string) => set((state: AppState) => ({
        user: { ...state.user, selectedTutor: tutorId }
      })),
      incrementAIUsage: () => set((state: AppState) => ({
        user: { ...state.user, aiAnalysesUsed: state.user.aiAnalysesUsed + 1 }
      })),
      darkMode: false,
      setDarkMode: (enabled: boolean) => set({ darkMode: enabled }),

      // Subjects
      subjects: mockSubjects,
      addSubject: (name: string, color: string, icon: string) => set((state: AppState) => ({
        subjects: [...state.subjects, {
          id: generateUUID(),
          name,
          color,
          icon,
          assignments: [],
        }]
      })),
      addAssignment: (subjectId: string, assignment: Omit<Assignment, 'id'>) => set((state: AppState) => ({
        subjects: state.subjects.map(s =>
          s.id === subjectId
            ? { ...s, assignments: [...s.assignments, { ...assignment, id: generateUUID() }] }
            : s
        )
      })),
      deleteAssignment: (subjectId: string, assignmentId: string) => set((state: AppState) => ({
        subjects: state.subjects.map(s =>
          s.id === subjectId
            ? { ...s, assignments: s.assignments.filter(a => a.id !== assignmentId) }
            : s
        )
      })),

      // Flashcards
      flashCardDecks: mockFlashCardDecks,
      addFlashCardDeck: (name: string, subjectId: string) => set((state: AppState) => ({
        flashCardDecks: [...state.flashCardDecks, {
          id: generateUUID(),
          name,
          subjectId,
          cards: [],
          createdAt: new Date().toISOString(),
        }]
      })),
      addFlashCard: (deckId: string, question: string, answer: string) => set((state: AppState) => ({
        flashCardDecks: state.flashCardDecks.map(d =>
          d.id === deckId
            ? {
              ...d,
              cards: [...d.cards, {
                id: generateUUID(),
                subjectId: d.subjectId,
                question,
                answer,
                difficulty: 'medium' as const,
                correctCount: 0,
                incorrectCount: 0,
              }]
            }
            : d
        )
      })),
      updateFlashCardScore: (deckId: string, cardId: string, correct: boolean) => set((state: AppState) => ({
        flashCardDecks: state.flashCardDecks.map(d =>
          d.id === deckId
            ? {
              ...d,
              cards: d.cards.map(c =>
                c.id === cardId
                  ? {
                    ...c,
                    correctCount: correct ? c.correctCount + 1 : c.correctCount,
                    incorrectCount: correct ? c.incorrectCount : c.incorrectCount + 1,
                    lastReviewed: new Date().toISOString(),
                  }
                  : c
              )
            }
            : d
        )
      })),

      // Chat
      chatMessages: [],
      addChatMessage: (role: 'user' | 'assistant', content: string) => set((state: AppState) => ({
        chatMessages: [...state.chatMessages, {
          id: generateUUID(),
          role,
          content,
          timestamp: new Date().toISOString(),
        }]
      })),
      clearChat: () => set({ chatMessages: [] }),

      // Study Plan
      studyPlan: mockStudyPlan,
      setStudyPlan: (plan: StudyPlan) => set({ studyPlan: plan }),
      toggleSessionComplete: (sessionId: string) => set((state: AppState) => ({
        studyPlan: state.studyPlan ? {
          ...state.studyPlan,
          sessions: state.studyPlan.sessions.map(s =>
            s.id === sessionId ? { ...s, completed: !s.completed } : s
          )
        } : null
      })),

      // Study Time
      addStudyTime: (minutes: number) => set((state: AppState) => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = state.user.lastStudyDate;
        let newStreak = state.user.studyStreak;

        // Award XP for studying: 5 XP per minute on average
        const xpReward = minutes * 5;

        if (!lastDate) {
          newStreak = 1;
        } else if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isYesterday = lastDate === yesterday.toISOString().split('T')[0];

          if (isYesterday) {
            newStreak += 1;
          } else {
            newStreak = 1; // streak broken
          }
        }

        return {
          user: {
            ...state.user,
            totalStudyTime: state.user.totalStudyTime + minutes,
            weeklyStudyTime: state.user.weeklyStudyTime + minutes,
            studyStreak: newStreak,
            lastStudyDate: today,
            xp: state.user.xp + xpReward,
          }
        };
      }),

      // Leaderboard & Achievements
      leaderboard: mockLeaderboard,
      achievements: mockAchievements,
      addXP: (amount: number) => set((state: AppState) => ({
        user: { ...state.user, xp: state.user.xp + amount }
      })),
      unlockAchievement: (achievementId: string) => set((state: AppState) => {
        if (state.user.unlockedAchievements.includes(achievementId)) {
          return state; // Already unlocked
        }
        const achievement = state.achievements.find(a => a.id === achievementId);
        if (!achievement) return state;

        return {
          user: {
            ...state.user,
            xp: state.user.xp + achievement.xpReward,
            unlockedAchievements: [...state.user.unlockedAchievements, achievementId]
          }
        };
      }),
    }),
    {
      name: 'knowlio-app-storage',
      storage: createStorage() as any,
      partialize: (state: AppState) => ({
        user: state.user,
        subjects: state.subjects,
        flashCardDecks: state.flashCardDecks,
        studyPlan: state.studyPlan,
        darkMode: state.darkMode,
        leaderboard: state.leaderboard,
        achievements: state.achievements,
      }),
    } as PersistOptions<AppState>
  )
);

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  userEmail: string | null;
  isLoggedIn: boolean;
  setLogin: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set: any) => ({
      userEmail: null,
      isLoggedIn: false,

      setLogin: async (email: string) => {
        if (Platform.OS === 'web') {
          try {
            localStorage.setItem('user_email', email);
          } catch (e) {
            console.error('Local storage is not available:', e);
          }
        } else {
          await SecureStore.setItemAsync('user_email', email);
        }
        set({ userEmail: email, isLoggedIn: true });
      },

      logout: async () => {
        if (Platform.OS === 'web') {
          try {
            localStorage.removeItem('user_email');
          } catch (e) {
            console.error('Local storage is not available:', e);
          }
        } else {
          await SecureStore.deleteItemAsync('user_email');
        }
        set({ userEmail: null, isLoggedIn: false });
      },
    }),
    {
      name: 'knowlio-auth-storage',
      storage: createStorage() as any,
    } as PersistOptions<AuthState>
  )
);
