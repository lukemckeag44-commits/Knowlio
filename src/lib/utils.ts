import { Subject, Assignment } from './types';

/**
 * Calculate weighted average for a subject's assignments
 * @param {Assignment[]} assignments - Array of assignments
 * @returns {number} Weighted average rounded to 1 decimal place
 */
export const calculateWeightedAverage = (assignments: Assignment[]): number => {
  if (assignments.length === 0) return 0;
  
  const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = assignments.reduce((sum, a) => sum + (a.grade * a.weight), 0);
  return Math.round((weightedSum / totalWeight) * 10) / 10;
};

/**
 * Calculate overall average across all subjects
 * @param {Subject[]} subjects - Array of subjects
 * @returns {number} Overall average rounded to 1 decimal place
 */
export const calculateOverallAverage = (subjects: Subject[]): number => {
  if (subjects.length === 0) return 0;
  
  const averages = subjects.map(s => calculateWeightedAverage(s.assignments));
  const validAverages = averages.filter(a => a > 0);
  
  if (validAverages.length === 0) return 0;
  return Math.round((validAverages.reduce((a, b) => a + b, 0) / validAverages.length) * 10) / 10;
};

/**
 * Get color code for grade visualization
 * @param {number} grade - Grade percentage (0-100)
 * @returns {string} Hex color code
 */
export const getGradeColor = (grade: number): string => {
  if (grade >= 90) return '#10B981'; // green
  if (grade >= 80) return '#3B82F6'; // blue
  if (grade >= 70) return '#F59E0B'; // yellow
  if (grade >= 60) return '#F97316'; // orange
  return '#EF4444'; // red
};

/**
 * Convert numeric grade to letter grade
 * @param {number} grade - Grade percentage (0-100)
 * @returns {string} Letter grade (A+, A, A-, B+, etc.)
 */
export const getGradeLetter = (grade: number): string => {
  if (grade >= 90) return 'A+';
  if (grade >= 85) return 'A';
  if (grade >= 80) return 'A-';
  if (grade >= 77) return 'B+';
  if (grade >= 73) return 'B';
  if (grade >= 70) return 'B-';
  if (grade >= 67) return 'C+';
  if (grade >= 63) return 'C';
  if (grade >= 60) return 'C-';
  if (grade >= 57) return 'D+';
  if (grade >= 53) return 'D';
  if (grade >= 50) return 'D-';
  return 'F';
};

/**
 * Format minutes into human-readable time string
 * @param {number} minutes - Total minutes
 * @returns {string} Formatted time (e.g., "2h 30m")
 */
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Format ISO date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "Jan 15")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
};

/**
 * Find the subject with the lowest average grade
 * @param {Subject[]} subjects - Array of subjects
 * @returns {Subject|null} Subject with lowest average or null
 */
export const getWeakestSubject = (subjects: Subject[]): Subject | null => {
  if (subjects.length === 0) return null;
  
  return subjects.reduce((weakest, current) => {
    const weakestAvg = calculateWeightedAverage(weakest.assignments);
    const currentAvg = calculateWeightedAverage(current.assignments);
    return currentAvg < weakestAvg ? current : weakest;
  });
};

/**
 * Analyze learning patterns to identify strengths and weaknesses
 * Detects discrepancies between homework and test performance
 * @param {Subject[]} subjects - Array of subjects
 * @returns {string[]} Array of pattern insights
 */
export const analyzePatterns = (subjects: Subject[]): string[] => {
  const patterns: string[] = [];
  
  subjects.forEach(subject => {
    const tests = subject.assignments.filter(a => a.type === 'test' || a.type === 'exam');
    const homework = subject.assignments.filter(a => a.type === 'assignment');
    const quizzes = subject.assignments.filter(a => a.type === 'quiz');
    
    if (tests.length > 0 && homework.length > 0) {
      const testAvg = tests.reduce((sum, t) => sum + t.grade, 0) / tests.length;
      const hwAvg = homework.reduce((sum, h) => sum + h.grade, 0) / homework.length;
      
      // Detect homework vs test performance gap
      if (hwAvg - testAvg > 15) {
        patterns.push(
          `${subject.name}: Strong homework performance (${Math.round(hwAvg)}%) but lower test scores (${Math.round(testAvg)}%). ` +
          `Recommendation: Practice test-taking strategies and time management.`
        );
      } else if (testAvg - hwAvg > 10) {
        patterns.push(
          `${subject.name}: Excellent test performance (${Math.round(testAvg)}%) despite lower homework grades (${Math.round(hwAvg)}%). ` +
          `Recommendation: Focus on consistent homework completion.`
        );
      }
    }

    // Detect improving or declining trends
    if (tests.length >= 3) {
      const recentTests = tests.slice(-3);
      const olderTests = tests.slice(0, -3);
      
      if (olderTests.length > 0) {
        const recentAvg = recentTests.reduce((sum, t) => sum + t.grade, 0) / recentTests.length;
        const olderAvg = olderTests.reduce((sum, t) => sum + t.grade, 0) / olderTests.length;
        const trend = recentAvg - olderAvg;
        
        if (trend > 5) {
          patterns.push(`${subject.name}: Improving trend detected! Recent tests (${Math.round(recentAvg)}%) show +${Math.round(trend)}% improvement.`);
        } else if (trend < -5) {
          patterns.push(`${subject.name}: Declining trend detected. Recent tests (${Math.round(recentAvg)}%) show ${Math.round(trend)}% decline. Consider extra support.`);
        }
      }
    }

    // Detect consistency issues
    if (quizzes.length >= 2) {
      const quizGrades = quizzes.map(q => q.grade);
      const quizAvg = quizGrades.reduce((a, b) => a + b, 0) / quizGrades.length;
      const variance = quizGrades.reduce((sum, g) => sum + Math.pow(g - quizAvg, 2), 0) / quizGrades.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev > 15) {
        patterns.push(
          `${subject.name}: Inconsistent quiz performance (std dev: ${Math.round(stdDev)}). ` +
          `Recommendation: Build stronger foundational knowledge and review concepts regularly.`
        );
      }
    }
  });
  
  return patterns;
};

/**
 * Generate a projected grade based on current average and study effort
 * Uses a data-driven model: each hour of focused study adds ~0.7 points
 * @param {number} currentAverage - Current grade percentage
 * @param {number} studyHours - Hours spent studying this week
 * @returns {number} Projected grade percentage (capped at 100)
 */
export const generateProjectedGrade = (currentAverage: number, studyHours: number): number => {
  // Base improvement: 0.7 points per hour of study
  // This is conservative and accounts for diminishing returns
  let improvement = studyHours * 0.7;
  
  // Apply diminishing returns: each additional hour has slightly less impact
  if (studyHours > 10) {
    improvement = (10 * 0.7) + ((studyHours - 10) * 0.4);
  }
  
  // Cap improvement at 15 points to prevent unrealistic projections
  improvement = Math.min(improvement, 15);
  
  // Calculate projected grade and cap at 100
  const projected = Math.min(Math.round((currentAverage + improvement) * 10) / 10, 100);
  
  return projected;
};

/**
 * Generate a UUID v4 identifier
 * @returns {string} UUID string
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Calculate achievement progress for a student
 * @param {number} studyTime - Total study time in minutes
 * @param {number} streak - Current study streak in days
 * @param {number} flashcardsReviewed - Number of flashcards reviewed
 * @returns {object} Achievement progress metrics
 */
export const calculateAchievementProgress = (
  studyTime: number,
  streak: number,
  flashcardsReviewed: number
): { studyTimeProgress: number; streakProgress: number; flashcardProgress: number } => {
  return {
    studyTimeProgress: Math.min((studyTime / 600) * 100, 100), // 10 hours = 100%
    streakProgress: Math.min((streak / 30) * 100, 100), // 30 days = 100%
    flashcardProgress: Math.min((flashcardsReviewed / 100) * 100, 100), // 100 cards = 100%
  };
};

/**
 * Estimate time needed to reach a target grade
 * @param {number} currentGrade - Current grade percentage
 * @param {number} targetGrade - Target grade percentage
 * @param {number} weeklyStudyHours - Average weekly study hours
 * @returns {number} Estimated weeks to reach target (0 if already at target)
 */
export const estimateTimeToTarget = (
  currentGrade: number,
  targetGrade: number,
  weeklyStudyHours: number
): number => {
  if (currentGrade >= targetGrade) return 0;
  
  const gradeGap = targetGrade - currentGrade;
  // Estimate: 0.7 points per hour, so 0.7 * 7 = 4.9 points per week
  const pointsPerWeek = Math.min(weeklyStudyHours * 0.7, 5);
  
  if (pointsPerWeek === 0) return Infinity;
  
  return Math.ceil(gradeGap / pointsPerWeek);
};
