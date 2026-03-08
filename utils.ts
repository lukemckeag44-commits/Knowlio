import { Subject, Assignment } from './types';

export const calculateWeightedAverage = (assignments: Assignment[]): number => {
  if (assignments.length === 0) return 0;
  
  const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = assignments.reduce((sum, a) => sum + (a.grade * a.weight), 0);
  return Math.round((weightedSum / totalWeight) * 10) / 10;
};

export const calculateOverallAverage = (subjects: Subject[]): number => {
  if (subjects.length === 0) return 0;
  
  const averages = subjects.map(s => calculateWeightedAverage(s.assignments));
  const validAverages = averages.filter(a => a > 0);
  
  if (validAverages.length === 0) return 0;
  return Math.round((validAverages.reduce((a, b) => a + b, 0) / validAverages.length) * 10) / 10;
};

export const getGradeColor = (grade: number): string => {
  if (grade >= 90) return '#10B981'; // green
  if (grade >= 80) return '#3B82F6'; // blue
  if (grade >= 70) return '#F59E0B'; // yellow
  if (grade >= 60) return '#F97316'; // orange
  return '#EF4444'; // red
};

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

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
};

export const getWeakestSubject = (subjects: Subject[]): Subject | null => {
  if (subjects.length === 0) return null;
  
  return subjects.reduce((weakest, current) => {
    const weakestAvg = calculateWeightedAverage(weakest.assignments);
    const currentAvg = calculateWeightedAverage(current.assignments);
    return currentAvg < weakestAvg ? current : weakest;
  });
};

export const analyzePatterns = (subjects: Subject[]): string[] => {
  const patterns: string[] = [];
  
  subjects.forEach(subject => {
    const tests = subject.assignments.filter(a => a.type === 'test' || a.type === 'exam');
    const homework = subject.assignments.filter(a => a.type === 'assignment');
    
    if (tests.length > 0 && homework.length > 0) {
      const testAvg = tests.reduce((sum, t) => sum + t.grade, 0) / tests.length;
      const hwAvg = homework.reduce((sum, h) => sum + h.grade, 0) / homework.length;
      
      if (hwAvg - testAvg > 15) {
        patterns.push(`${subject.name}: Strong on homework (${Math.round(hwAvg)}%) but struggling on tests (${Math.round(testAvg)}%). Focus on test-taking strategies.`);
      }
    }
  });
  
  return patterns;
};

export const generateProjectedGrade = (currentAverage: number, studyHours: number): number => {
  // Simple projection: each hour of focused study adds ~0.5-1 points
  const improvement = Math.min(studyHours * 0.7, 15); // Cap at 15 point improvement
  return Math.min(Math.round((currentAverage + improvement) * 10) / 10, 100);
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
