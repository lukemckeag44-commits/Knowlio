import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SubjectCard } from '@/components/SubjectCard';
import { ProgressBar } from '@/components/ProgressBar';
import { useTheme } from '@/lib/useTheme';
import { calculateWeightedAverage, calculateOverallAverage, getGradeColor, getGradeLetter, formatDate, analyzePatterns } from '@/lib/utils';
import { Assignment } from '@/lib/types';

export const GradesScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { subjects, addSubject, addAssignment, deleteAssignment } = useAppStore();
  const theme = useTheme();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(route.params?.subjectId || null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  // New subject form
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(theme.primary);

  // New assignment form
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentGrade, setAssignmentGrade] = useState('');
  const [assignmentWeight, setAssignmentWeight] = useState('');
  const [assignmentType, setAssignmentType] = useState<Assignment['type']>('assignment');

  const colors = [theme.primary, theme.success, theme.secondary, theme.warning, theme.danger, theme.accent, theme.info || '#06B6D4', '#84CC16'];
  const assignmentTypes: Assignment['type'][] = ['assignment', 'quiz', 'test', 'exam', 'project'];

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const overallAverage = calculateOverallAverage(subjects);
  const patterns = analyzePatterns(subjects);
  const subjectPatterns = selectedSubject ? analyzePatterns([selectedSubject]) : [];

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      addSubject(newSubjectName.trim(), newSubjectColor, 'school');
      setNewSubjectName('');
      setShowAddSubject(false);
    }
  };

  const handleAddAssignment = () => {
    if (selectedSubjectId && assignmentName.trim() && assignmentGrade && assignmentWeight) {
      addAssignment(selectedSubjectId, {
        name: assignmentName.trim(),
        grade: parseFloat(assignmentGrade),
        weight: parseFloat(assignmentWeight),
        type: assignmentType,
        date: new Date().toISOString().split('T')[0],
      });
      setAssignmentName('');
      setAssignmentGrade('');
      setAssignmentWeight('');
      setShowAddAssignment(false);
    }
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: () => {
            if (selectedSubjectId) {
              deleteAssignment(selectedSubjectId, assignmentId);
            }
          }
        },
      ]
    );
  };

  if (selectedSubject) {
    const subjectAverage = calculateWeightedAverage(selectedSubject.assignments);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setSelectedSubjectId(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{selectedSubject.name}</Text>
          <TouchableOpacity onPress={() => setShowAddAssignment(true)} style={styles.addButton}>
            <Ionicons name="add" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* AI Insights for Subject */}
          {subjectPatterns.length > 0 && (
            <Animated.View entering={FadeInDown.delay(100)}>
              <Card style={[styles.subjectInsightCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary + '30' }]}>
                <View style={styles.insightHeader}>
                  <View style={[styles.insightIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name="bulb" size={20} color={theme.primary} />
                  </View>
                  <Text style={[styles.insightTitle, { color: theme.primary }]}>Tutor Recommendation</Text>
                </View>
                <Text style={[styles.insightText, { color: theme.textSecondary }]}>
                  {subjectPatterns[0]}
                </Text>
              </Card>
            </Animated.View>
          )}

          {/* Subject Stats */}
          <Card style={styles.subjectStatsCard}>
            <View style={styles.subjectStatsRow}>
              <View style={styles.subjectStatItem}>
                <Text style={[styles.subjectStatLabel, { color: theme.textMuted }]}>Average</Text>
                <Text style={[styles.subjectStatValue, { color: getGradeColor(subjectAverage) }]}>
                  {subjectAverage > 0 ? `${subjectAverage}%` : '--'}
                </Text>
              </View>
              <View style={styles.subjectStatItem}>
                <Text style={[styles.subjectStatLabel, { color: theme.textMuted }]}>Grade</Text>
                <Text style={[styles.subjectStatValue, { color: getGradeColor(subjectAverage) }]}>
                  {subjectAverage > 0 ? getGradeLetter(subjectAverage) : '--'}
                </Text>
              </View>
              <View style={styles.subjectStatItem}>
                <Text style={[styles.subjectStatLabel, { color: theme.textMuted }]}>Items</Text>
                <Text style={[styles.subjectStatValue, { color: theme.text }]}>{selectedSubject.assignments.length}</Text>
              </View>
            </View>
            <ProgressBar progress={subjectAverage} color={getGradeColor(subjectAverage)} height={10} />
          </Card>

          {/* Assignments List */}
          <View style={styles.assignmentsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Assignments</Text>
            {selectedSubject.assignments.length === 0 ? (
              <Animated.View entering={FadeInUp.delay(100).duration(400).springify()} layout={Layout.springify()}>
                <Card style={styles.emptyCard}>
                  <Ionicons name="document-text-outline" size={40} color={theme.textMuted} />
                  <Text style={[styles.emptyText, { color: theme.text }]}>No assignments yet</Text>
                  <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Add your first grade to get started</Text>
                  <Button title="Add Assignment" onPress={() => setShowAddAssignment(true)} style={{ marginTop: 16 }} />
                </Card>
              </Animated.View>
            ) : (
              selectedSubject.assignments.map((assignment, index) => (
                <Animated.View
                  key={`asgn-${assignment.id}`}
                  entering={FadeInUp.delay(index * 80).duration(400).springify()}
                  layout={Layout.springify()}
                >
                  <TouchableOpacity
                    onLongPress={() => handleDeleteAssignment(assignment.id)}
                    activeOpacity={0.8}
                  >
                    <Card style={styles.assignmentCard}>
                      <View style={styles.assignmentHeader}>
                        <View style={styles.assignmentInfo}>
                          <Text style={[styles.assignmentName, { color: theme.text }]}>{assignment.name}</Text>
                          <View style={styles.assignmentMeta}>
                            <View style={[styles.typeBadge, { backgroundColor: theme.background }]}>
                              <Text style={[styles.typeText, { color: theme.textSecondary }]}>{assignment.type.toUpperCase()}</Text>
                            </View>
                            <Text style={[styles.assignmentDate, { color: theme.textMuted }]}>{formatDate(assignment.date)}</Text>
                          </View>
                        </View>
                        <View style={styles.assignmentGradeContainer}>
                          <Text style={[styles.assignmentGrade, { color: getGradeColor(assignment.grade) }]}>
                            {assignment.grade}%
                          </Text>
                          <Text style={[styles.assignmentWeight, { color: theme.textMuted }]}>{assignment.weight}% weight</Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Add Assignment Modal */}
        <Modal visible={showAddAssignment} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Add Assignment</Text>
                <TouchableOpacity onPress={() => setShowAddAssignment(false)}>
                  <Ionicons name="close" size={24} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Assignment Name</Text>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                placeholder="e.g., Unit Test - Quadratics"
                value={assignmentName}
                onChangeText={setAssignmentName}
                placeholderTextColor={theme.textMuted}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {assignmentTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      { backgroundColor: theme.background },
                      assignmentType === type && [styles.typeOptionSelected, { backgroundColor: theme.primary }],
                    ]}
                    onPress={() => setAssignmentType(type)}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      { color: theme.textSecondary },
                      assignmentType === type && { color: '#FFFFFF' },
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Grade (%)</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                    placeholder="85"
                    value={assignmentGrade}
                    onChangeText={setAssignmentGrade}
                    keyboardType="numeric"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Weight (%)</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                    placeholder="10"
                    value={assignmentWeight}
                    onChangeText={setAssignmentWeight}
                    keyboardType="numeric"
                    placeholderTextColor={theme.textMuted}
                  />
                </View>
              </View>

              <Button
                title="Add Assignment"
                onPress={handleAddAssignment}
                disabled={!assignmentName.trim() || !assignmentGrade || !assignmentWeight}
                style={styles.modalButton}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>Grade Tracker</Text>
          <TouchableOpacity onPress={() => setShowAddSubject(true)} style={styles.addButton}>
            <Ionicons name="add-circle" size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Overall Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
          <LinearGradient
            colors={theme.darkMode ? [theme.card, theme.card] : ['#FFFFFF', theme.background]}
            style={styles.overallCardWrapper}
          >
            <Card style={styles.overallCard}>
              <Text style={[styles.overallLabel, { color: theme.textSecondary }]}>Overall Average</Text>
              <Text style={[styles.overallValue, { color: getGradeColor(overallAverage) }]}>
                {overallAverage > 0 ? `${overallAverage}%` : '--'}
              </Text>
              <ProgressBar progress={overallAverage} color={getGradeColor(overallAverage)} height={8} />
            </Card>
          </LinearGradient>
        </Animated.View>

        {/* AI Insights */}
        {patterns.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}>
            <Card style={[styles.insightsCard, { backgroundColor: theme.warning + '20', borderColor: theme.warning + '40' }]}>
              <View style={styles.insightsHeader}>
                <View style={[styles.insightsIconWrapper, { backgroundColor: theme.warning + '20' }]}>
                  <Ionicons name="bulb-outline" size={20} color={theme.warning} />
                </View>
                <Text style={[styles.insightsTitle, { color: theme.warning }]}>AI Insights</Text>
              </View>
              {patterns.map((pattern, index) => (
                <Text key={index} style={[styles.insightText, { color: theme.textSecondary }]}>
                  💡 {pattern}
                </Text>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Subjects List */}
        <View style={styles.subjectsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Subjects</Text>
          {subjects.length === 0 ? (
            <Animated.View entering={FadeInUp.delay(300).duration(400).springify()}>
              <Card style={styles.emptyCard}>
                <Ionicons name="school-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyText, { color: theme.text }]}>No subjects yet</Text>
                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Add your first subject to start tracking</Text>
                <Button title="Add Subject" onPress={() => setShowAddSubject(true)} style={{ marginTop: 16 }} />
              </Card>
            </Animated.View>
          ) : (
            subjects.map((subject, index) => (
              <Animated.View
                key={`subj-${subject.id}`}
                entering={FadeInUp.delay(300 + index * 100).duration(400).springify()}
                layout={Layout.springify()}
              >
                <SubjectCard
                  subject={subject}
                  onPress={() => setSelectedSubjectId(subject.id)}
                />
              </Animated.View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Subject Modal */}
      <Modal visible={showAddSubject} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Subject</Text>
              <TouchableOpacity onPress={() => setShowAddSubject(false)}>
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Subject Name</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
              placeholder="e.g., Mathematics"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Color</Text>
            <View style={styles.colorPicker}>
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newSubjectColor === color && [styles.colorOptionSelected, { borderColor: theme.text }],
                  ]}
                  onPress={() => setNewSubjectColor(color)}
                >
                  {newSubjectColor === color && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Add Subject"
              onPress={handleAddSubject}
              disabled={!newSubjectName.trim()}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  backButton: {
    padding: 4,
  },
  addButton: {
    padding: 8,
  },
  overallCardWrapper: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 24,
    shadowColor: '#8a9ec1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  overallCard: {
    padding: 24,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  overallLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  overallValue: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 12,
  },
  insightsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  insightsIconWrapper: {
    padding: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  insightText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 8,
  },
  subjectsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  subjectStatsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 24,
  },
  subjectInsightCard: { padding: 20, marginHorizontal: 20, marginBottom: 20, borderStyle: 'dashed' },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  insightIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontSize: 16, fontWeight: '800' },
  insightText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  subjectStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  subjectStatItem: {
    alignItems: 'center',
  },
  subjectStatLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  subjectStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  assignmentsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  assignmentCard: {
    marginBottom: 10,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  assignmentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  typeBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  assignmentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  assignmentGradeContainer: {
    alignItems: 'flex-end',
  },
  assignmentGrade: {
    fontSize: 20,
    fontWeight: '700',
  },
  assignmentWeight: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#1F2937',
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
  modalButton: {
    marginTop: 8,
  },
});
