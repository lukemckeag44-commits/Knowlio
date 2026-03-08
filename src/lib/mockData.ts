import { User, Subject, FlashCardDeck, AITutor, ParentData, StudyPlan, LeaderboardUser, Achievement } from './types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@student.ca',
  grade: 11,
  plan: 'free',
  isParentMode: false,
  selectedTutor: 'sophia',
  studyStreak: 7,
  totalStudyTime: 4520,
  weeklyStudyTime: 840,
  aiAnalysesUsed: 2,
  lastResetDate: new Date().toISOString().split('T')[0],
  xp: 452,
  unlockedAchievements: ['first_session', '7_day_streak'],
};

export const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Mathematics',
    color: '#3B82F6',
    icon: 'calculator',
    assignments: [
      { id: '1', name: 'Unit Test - Quadratics', type: 'test', grade: 72, weight: 20, date: '2024-01-15', topics: ['Quadratic Equations', 'Factoring'] },
      { id: '2', name: 'Quiz - Linear Functions', type: 'quiz', grade: 85, weight: 10, date: '2024-01-20', topics: ['Linear Functions'] },
      { id: '3', name: 'Homework Set 1', type: 'assignment', grade: 95, weight: 5, date: '2024-01-10', topics: ['Algebra Basics'] },
      { id: '4', name: 'Midterm Exam', type: 'exam', grade: 68, weight: 25, date: '2024-02-01', topics: ['All Units'] },
    ],
  },
  {
    id: '2',
    name: 'English',
    color: '#10B981',
    icon: 'book',
    assignments: [
      { id: '5', name: 'Essay - Macbeth Analysis', type: 'assignment', grade: 82, weight: 20, date: '2024-01-18', topics: ['Literary Analysis', 'Essay Writing'] },
      { id: '6', name: 'Reading Comprehension Quiz', type: 'quiz', grade: 90, weight: 10, date: '2024-01-22', topics: ['Reading Comprehension'] },
      { id: '7', name: 'Grammar Test', type: 'test', grade: 78, weight: 15, date: '2024-01-25', topics: ['Grammar', 'Punctuation'] },
    ],
  },
  {
    id: '3',
    name: 'Science',
    color: '#8B5CF6',
    icon: 'flask',
    assignments: [
      { id: '8', name: 'Lab Report - Chemical Reactions', type: 'assignment', grade: 88, weight: 15, date: '2024-01-12', topics: ['Chemistry', 'Lab Skills'] },
      { id: '9', name: 'Unit Test - Forces', type: 'test', grade: 65, weight: 20, date: '2024-01-28', topics: ['Physics', 'Forces', 'Motion'] },
      { id: '10', name: 'Quiz - Periodic Table', type: 'quiz', grade: 92, weight: 10, date: '2024-01-08', topics: ['Chemistry', 'Elements'] },
    ],
  },
  {
    id: '4',
    name: 'History',
    color: '#F59E0B',
    icon: 'time',
    assignments: [
      { id: '11', name: 'Research Project - WWI', type: 'project', grade: 85, weight: 25, date: '2024-01-30', topics: ['World War I', 'Research'] },
      { id: '12', name: 'Quiz - Canadian Confederation', type: 'quiz', grade: 88, weight: 10, date: '2024-01-14', topics: ['Canadian History'] },
    ],
  },
  {
    id: '5',
    name: 'French',
    color: '#EF4444',
    icon: 'language',
    assignments: [
      { id: '13', name: 'Oral Presentation', type: 'assignment', grade: 75, weight: 20, date: '2024-01-26', topics: ['Speaking', 'Pronunciation'] },
      { id: '14', name: 'Written Test - Verbs', type: 'test', grade: 70, weight: 15, date: '2024-01-19', topics: ['Conjugation', 'Grammar'] },
    ],
  },
];

export const mockFlashCardDecks: FlashCardDeck[] = [
  {
    id: '1',
    name: 'Quadratic Equations',
    subjectId: '1',
    createdAt: '2024-01-20',
    cards: [
      { id: '1', subjectId: '1', question: 'What is the quadratic formula?', answer: 'x = (-b ± √(b² - 4ac)) / 2a', difficulty: 'medium', correctCount: 3, incorrectCount: 1 },
      { id: '2', subjectId: '1', question: 'What does the discriminant tell us?', answer: 'The discriminant (b² - 4ac) tells us the number of real solutions: positive = 2, zero = 1, negative = 0', difficulty: 'hard', correctCount: 1, incorrectCount: 2 },
      { id: '3', subjectId: '1', question: 'How do you factor x² + 5x + 6?', answer: '(x + 2)(x + 3)', difficulty: 'easy', correctCount: 5, incorrectCount: 0 },
    ],
  },
  {
    id: '2',
    name: 'Macbeth Key Themes',
    subjectId: '2',
    createdAt: '2024-01-18',
    cards: [
      { id: '4', subjectId: '2', question: 'What is the main theme of ambition in Macbeth?', answer: 'Unchecked ambition leads to destruction. Macbeth\'s desire for power corrupts him and leads to his downfall.', difficulty: 'medium', correctCount: 2, incorrectCount: 1 },
      { id: '5', subjectId: '2', question: 'What does "Fair is foul, and foul is fair" mean?', answer: 'Things are not what they seem. Appearances can be deceiving, and good can appear evil and vice versa.', difficulty: 'hard', correctCount: 1, incorrectCount: 3 },
    ],
  },
];

export const aiTutors: AITutor[] = [
  {
    id: 'sophia',
    name: 'Sophia',
    avatar: '👩‍🏫',
    personality: 'Warm and encouraging, celebrates every small win',
    specialties: ['Math', 'Science', 'Study Skills'],
    greeting: "Hey there! I'm Sophia, your study buddy! 🌟 Ready to crush those grades together?",
    style: 'encouraging',
  },
  {
    id: 'marcus',
    name: 'Marcus',
    avatar: '👨‍💼',
    personality: 'Structured and goal-oriented, keeps you accountable',
    specialties: ['Time Management', 'Test Prep', 'Organization'],
    greeting: "Hello! I'm Marcus. Let's set clear goals and achieve them systematically. What's our target today?",
    style: 'strict',
  },
  {
    id: 'luna',
    name: 'Luna',
    avatar: '🧙‍♀️',
    personality: 'Creative and fun, makes learning an adventure',
    specialties: ['English', 'History', 'Creative Writing'],
    greeting: "Hi friend! I'm Luna! ✨ Learning is an adventure, and I'm here to make it magical. What shall we explore?",
    style: 'friendly',
  },
  {
    id: 'kai',
    name: 'Kai',
    avatar: '🤖',
    personality: 'Data-driven and analytical, provides detailed insights',
    specialties: ['Analytics', 'Problem Solving', 'Logic'],
    greeting: "Greetings! I'm Kai. I analyze patterns in your learning to optimize your study efficiency. Let's examine your data.",
    style: 'analytical',
  },
];

export const mockParentData: ParentData = {
  childName: 'Alex Chen',
  gradeHistory: [
    { date: '2024-01-01', average: 75 },
    { date: '2024-01-08', average: 76 },
    { date: '2024-01-15', average: 74 },
    { date: '2024-01-22', average: 78 },
    { date: '2024-01-29', average: 79 },
    { date: '2024-02-05', average: 77 },
  ],
  studyConsistency: 78,
  timeSpentThisWeek: 840,
  areasNeedingAttention: ['Math - Timed Tests', 'French - Verb Conjugation', 'Science - Physics Concepts'],
  recentActivity: [
    { date: '2024-02-05', action: 'Completed 25 flashcards in Mathematics' },
    { date: '2024-02-04', action: 'Studied for 45 minutes - English Essay' },
    { date: '2024-02-03', action: 'Took practice quiz in Science' },
    { date: '2024-02-02', action: 'Created new flashcard deck for French' },
  ],
};

export const mockStudyPlan: StudyPlan = {
  id: '1',
  name: 'Math Midterm Prep',
  startDate: '2024-02-05',
  endDate: '2024-02-15',
  projectedGrade: 85,
  sessions: [
    { id: '1', subjectId: '1', date: '2024-02-05', duration: 45, topics: ['Quadratic Equations Review'], completed: true },
    { id: '2', subjectId: '1', date: '2024-02-06', duration: 30, topics: ['Practice Problems - Factoring'], completed: true },
    { id: '3', subjectId: '1', date: '2024-02-07', duration: 45, topics: ['Linear Functions'], completed: false },
    { id: '4', subjectId: '1', date: '2024-02-08', duration: 60, topics: ['Word Problems'], completed: false },
    { id: '5', subjectId: '1', date: '2024-02-09', duration: 30, topics: ['Quick Review'], completed: false },
  ],
};

export const mockLeaderboard: LeaderboardUser[] = [
  { id: '1', name: 'Alex Chen', xp: 452, avatar: '👦' },
  { id: '2', name: 'Sarah J.', xp: 620, avatar: '👩' },
  { id: '3', name: 'Michael T.', xp: 410, avatar: '👨' },
  { id: '4', name: 'Emma W.', xp: 385, avatar: '👩' },
  { id: '5', name: 'David L.', xp: 340, avatar: '👨' },
  { id: '6', name: 'James B.', xp: 512, avatar: '👦' },
  { id: '7', name: 'Emily R.', xp: 290, avatar: '👱‍♀️' },
];

export const mockAchievements: Achievement[] = [
  {
    id: 'first_session',
    title: 'First Step',
    description: 'Complete your first study session.',
    icon: 'footsteps',
    xpReward: 50,
    conditionType: 'firstSession',
    conditionTarget: 1,
  },
  {
    id: '7_day_streak',
    title: 'Consistency Key',
    description: 'Maintain a study streak for 7 consecutive days.',
    icon: 'flame',
    xpReward: 200,
    conditionType: 'streak',
    conditionTarget: 7,
  },
  {
    id: 'hour_study',
    title: 'Focused Mind',
    description: 'Study for a total of 60 minutes.',
    icon: 'hourglass',
    xpReward: 100,
    conditionType: 'studyTime',
    conditionTarget: 60,
  },
  {
    id: '100_flashcards',
    title: 'Memory Master',
    description: 'Review 100 flashcards.',
    icon: 'albums',
    xpReward: 150,
    conditionType: 'flashcards',
    conditionTarget: 100,
  },
  {
    id: '30_day_streak',
    title: 'Unstoppable',
    description: 'Maintain a study streak for 30 consecutive days.',
    icon: 'flash',
    xpReward: 1000,
    conditionType: 'streak',
    conditionTarget: 30,
  },
];
