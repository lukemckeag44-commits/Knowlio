import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../lib/store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { useTheme } from '../lib/useTheme';
import { formatDate, generateUUID } from '../lib/utils';
import { StudySession, StudyPlan } from '../lib/types';

export const StudyPlanScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { studyPlan, setStudyPlan, toggleSessionComplete, subjects, user } = useAppStore();
  const theme = useTheme();
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  // Create plan form
  const [planName, setPlanName] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [testDate, setTestDate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const completedSessions = studyPlan?.sessions.filter(s => s.completed).length || 0;
  const totalSessions = studyPlan?.sessions.length || 0;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  const generateStudyPlan = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const subject = subjects.find(s => s.name === selectedSubject) || subjects[0];
      const hours = parseInt(hoursPerWeek) || 5;
      const sessionsCount = Math.min(hours * 2, 10);

      const topics = [
        'Review Core Concepts',
        'Practice Problems',
        'Weak Area Focus',
        'Timed Practice Test',
        'Error Analysis',
        'Formula Review',
        'Application Problems',
        'Quick Recap',
        'Final Review',
        'Mock Test',
      ];

      const sessions: StudySession[] = [];
      const startDate = new Date();

      for (let i = 0; i < sessionsCount; i++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(sessionDate.getDate() + i);

        sessions.push({
          id: generateUUID(),
          subjectId: subject?.id || '1',
          date: sessionDate.toISOString().split('T')[0],
          duration: 30 + Math.floor(Math.random() * 30),
          topics: [topics[i % topics.length]],
          completed: false,
        });
      }

      const newPlan: StudyPlan = {
        id: generateUUID(),
        name: planName || `${selectedSubject} Study Plan`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: testDate || new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sessions,
        projectedGrade: 85 + Math.floor(Math.random() * 10),
      };

      setStudyPlan(newPlan);
      setIsGenerating(false);
      setShowCreatePlan(false);
      setPlanName('');
      setSelectedSubject('');
      setTestDate('');
      setHoursPerWeek('');
    }, 2000);
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Smart Study Planner</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>AI-powered study schedules for better grades</Text>
        </View>

        {studyPlan ? (
          <>
            {/* Plan Overview */}
            <Card style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <View>
                  <Text style={[styles.planName, { color: theme.text }]}>{studyPlan.name}</Text>
                  <Text style={[styles.planDates, { color: theme.textSecondary }]}>
                    {formatDate(studyPlan.startDate)} - {formatDate(studyPlan.endDate)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.newPlanButton, { backgroundColor: theme.primary + '20' }]}
                  onPress={() => setShowCreatePlan(true)}
                >
                  <Ionicons name="add" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.text }]}>Progress</Text>
                  <Text style={[styles.progressValue, { color: theme.textMuted }]}>{completedSessions}/{totalSessions} sessions</Text>
                </View>
                <ProgressBar progress={progress} color={theme.success} height={10} />
              </View>

              <View style={[styles.projectionBox, { backgroundColor: theme.success + '20' }]}>
                <Ionicons name="trending-up" size={24} color={theme.success} />
                <View style={styles.projectionContent}>
                  <Text style={[styles.projectionLabel, { color: theme.success }]}>Projected Grade</Text>
                  <Text style={[styles.projectionValue, { color: theme.success }]}>{studyPlan.projectedGrade}%</Text>
                </View>
                <Text style={[styles.projectionNote, { color: theme.success }]}>If you follow this plan</Text>
              </View>
            </Card>

            {/* Sessions */}
            <View style={styles.sessionsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Study Sessions</Text>
              {studyPlan.sessions.map((session, index) => {
                const subject = subjects.find(s => s.id === session.subjectId);
                return (
                  <TouchableOpacity
                    key={session.id}
                    onPress={() => toggleSessionComplete(session.id)}
                  >
                    <Card style={[
                      styles.sessionCard,
                      session.completed && [styles.sessionCardComplete, { backgroundColor: theme.success + '10', borderColor: theme.success + '40' }],
                    ]}>
                      <View style={styles.sessionLeft}>
                        <View style={[
                          styles.sessionCheckbox,
                          { borderColor: theme.border },
                          session.completed && [styles.sessionCheckboxComplete, { backgroundColor: theme.success, borderColor: theme.success }],
                        ]}>
                          {session.completed && (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          )}
                        </View>
                        <View style={styles.sessionInfo}>
                          <Text style={[
                            styles.sessionTopic,
                            { color: theme.text },
                            session.completed && [styles.sessionTopicComplete, { color: theme.textMuted }],
                          ]}>
                            {session.topics[0]}
                          </Text>
                          <View style={styles.sessionMeta}>
                            <View style={[
                              styles.subjectTag,
                              { backgroundColor: (subject?.color || '#3B82F6') + '20' },
                            ]}>
                              <Text style={[
                                styles.subjectTagText,
                                { color: subject?.color || theme.primary },
                              ]}>
                                {subject?.name || 'Study'}
                              </Text>
                            </View>
                            <Text style={[styles.sessionDuration, { color: theme.textMuted }]}>{session.duration} min</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.sessionRight}>
                        <Text style={[styles.sessionDay, { color: theme.textSecondary }]}>{getDayName(session.date)}</Text>
                        <Text style={[styles.sessionDate, { color: theme.textMuted }]}>{formatDate(session.date)}</Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tips */}
            <Card style={[styles.tipsCard, { backgroundColor: theme.warning + '20', borderColor: theme.warning + '40' }]}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb" size={20} color={theme.warning} />
                <Text style={[styles.tipsTitle, { color: theme.warning }]}>Study Tips</Text>
              </View>
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Take a 5-minute break every 25 minutes (Pomodoro)</Text>
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Review your notes before starting each session</Text>
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>• Test yourself with flashcards after studying</Text>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.card }]}>
              <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Study Plan Yet</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Create a personalized study plan based on your upcoming tests and available time.
            </Text>
            <Button
              title="Create Study Plan"
              onPress={() => setShowCreatePlan(true)}
              icon={<Ionicons name="sparkles" size={18} color="#FFFFFF" />}
              style={styles.createButton}
            />
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Plan Modal */}
      <Modal visible={showCreatePlan} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Study Plan</Text>
              <TouchableOpacity onPress={() => setShowCreatePlan(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Plan Name (optional)</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
              placeholder="e.g., Math Midterm Prep"
              value={planName}
              onChangeText={setPlanName}
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Subject</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectSelector}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectOption,
                    { borderColor: theme.border, backgroundColor: theme.background },
                    selectedSubject === subject.name && {
                      backgroundColor: subject.color + '20',
                      borderColor: subject.color,
                    },
                  ]}
                  onPress={() => setSelectedSubject(subject.name)}
                >
                  <Text style={[
                    styles.subjectOptionText,
                    { color: theme.textSecondary },
                    selectedSubject === subject.name && { color: subject.color },
                  ]}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Test/Exam Date</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
              placeholder="YYYY-MM-DD"
              value={testDate}
              onChangeText={setTestDate}
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Available Study Hours Per Week</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
              placeholder="e.g., 5"
              value={hoursPerWeek}
              onChangeText={setHoursPerWeek}
              keyboardType="numeric"
              placeholderTextColor={theme.textMuted}
            />

            <Card style={[styles.aiNote, { backgroundColor: theme.primary + '20', borderColor: theme.primary + '40' }]}>
              <Ionicons name="sparkles" size={18} color={theme.primary} />
              <Text style={[styles.aiNoteText, { color: theme.textSecondary }]}>
                AI will generate an optimized study schedule based on your inputs and learning patterns.
              </Text>
            </Card>

            <Button
              title={isGenerating ? 'Generating Plan...' : 'Generate AI Study Plan'}
              onPress={generateStudyPlan}
              disabled={!selectedSubject || isGenerating}
              loading={isGenerating}
              icon={<Ionicons name="sparkles" size={18} color="#FFFFFF" />}
              style={styles.generateButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  overviewCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  planDates: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  newPlanButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  projectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  projectionContent: {
    flex: 1,
  },
  projectionLabel: {
    fontSize: 13,
    color: '#065F46',
  },
  projectionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  projectionNote: {
    fontSize: 11,
    color: '#047857',
    maxWidth: 80,
    textAlign: 'right',
  },
  sessionsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sessionCardComplete: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionCheckboxComplete: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTopic: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  sessionTopicComplete: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  subjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sessionDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionDay: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  sessionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  tipsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  tipText: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 6,
    lineHeight: 20,
  },
  emptyCard: {
    marginHorizontal: 20,
    marginTop: 24,
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  subjectSelector: {
    marginBottom: 16,
  },
  subjectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  subjectOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  aiNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    marginBottom: 16,
  },
  aiNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  generateButton: {
    marginTop: 8,
  },
});
