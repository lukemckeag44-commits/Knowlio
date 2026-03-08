import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Subject } from '@/lib/types';
import { calculateWeightedAverage, getGradeColor, getGradeLetter } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import { Card } from './Card';
import { PressableScene } from './PressableScene';
import { useTheme } from '@/lib/useTheme';

interface SubjectCardProps {
  subject: Subject;
  onPress?: () => void;
  delay?: number;
}

const SubjectCardComponent: React.FC<SubjectCardProps> = ({ subject, onPress, delay = 0 }) => {
  const theme = useTheme();

  // Memoize grade calculations to prevent unnecessary re-renders
  const { average, gradeColor, gradeLetter } = useMemo(() => {
    const avg = calculateWeightedAverage(subject.assignments);
    return {
      average: avg,
      gradeColor: getGradeColor(avg),
      gradeLetter: getGradeLetter(avg),
    };
  }, [subject.assignments]);

  // Memoize icon name mapping
  const getIconName = useMemo(() => {
    return (icon: string): keyof typeof Ionicons.glyphMap => {
      const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
        calculator: 'calculator',
        book: 'book',
        flask: 'flask',
        time: 'time',
        language: 'language',
        globe: 'globe',
        musical_notes: 'musical-notes',
        fitness: 'fitness',
        brush: 'brush',
        code: 'code-slash',
      };
      return iconMap[icon] || 'school';
    };
  }, []);

  return (
    <PressableScene onPress={onPress}>
      <Card style={styles.card} delay={delay}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: subject.color + '20' }]}>
            <Ionicons name={getIconName(subject.icon)} size={24} color={subject.color} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.subjectName, { color: theme.text }]}>{subject.name}</Text>
            <Text style={[styles.assignmentCount, { color: theme.textSecondary }]}>
              {subject.assignments.length} assignment{subject.assignments.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.gradeContainer}>
            <Text style={[styles.grade, { color: gradeColor }]}>{average > 0 ? `${average}%` : '--'}</Text>
            <Text style={[styles.gradeLetter, { color: gradeColor }]}>{average > 0 ? gradeLetter : '--'}</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <ProgressBar progress={average} color={gradeColor} />
        </View>
      </Card>
    </PressableScene>
  );
};

export const SubjectCard = React.memo(SubjectCardComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders if subject data hasn't changed
  return (
    prevProps.delay === nextProps.delay &&
    prevProps.onPress === nextProps.onPress &&
    JSON.stringify(prevProps.subject) === JSON.stringify(nextProps.subject)
  );
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  assignmentCount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  gradeContainer: {
    alignItems: 'flex-end',
  },
  grade: {
    fontSize: 20,
    fontWeight: '700',
  },
  gradeLetter: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 12,
  },
});
