import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../lib/store';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { useTheme } from '../lib/useTheme';
import { getAIWeaknessAnalysis } from '../lib/api';
import { WeaknessAnalysis } from '../lib/types';

export const AnalyzeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, subjects, incrementAIUsage } = useAppStore();
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<WeaknessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const canAnalyze = user.plan !== 'free' || user.aiAnalysesUsed < 3;
  const remainingAnalyses = user.plan === 'free' ? 3 - user.aiAnalysesUsed : 'Unlimited';

  const handleAnalyze = async (subjectOverride?: string) => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    incrementAIUsage();

    try {
      const topic = subjectOverride || selectedSubject || inputText || 'general study skills';
      // Pass the student's actual grade data for personalised analysis
      const result = await getAIWeaknessAnalysis(topic, subjects);
      setAnalysis(result);
    } catch (error) {
      // Graceful fallback
      setAnalysis({
        topic: subjectOverride || selectedSubject || inputText || 'Study Skills',
        weakness: 'Could not connect to AI right now. Please check your internet and try again.',
        strategies: ['Review your class notes', 'Practice past questions', 'Ask your teacher for help'],
        practiceQuestions: ['What are the key concepts?', 'Can you explain this in your own words?'],
        explanation: 'Please try again in a moment.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAnalyze = (subjectName: string) => {
    setSelectedSubject(subjectName);
    setInputText('');
    handleAnalyze(subjectName); // pass name directly — avoids state race condition
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>AI Weakness Analyzer</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Find your weak points and get targeted help</Text>
          </View>

          {/* Usage Card */}
          {user.plan === 'free' && (
            <Card style={styles.usageCard}>
              <View style={styles.usageHeader}>
                <Ionicons name="sparkles" size={20} color={theme.primary} />
                <Text style={[styles.usageTitle, { color: theme.text }]}>AI Analyses</Text>
                <View style={[styles.usageBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.usageBadgeText, { color: theme.primary }]}>{remainingAnalyses} left</Text>
                </View>
              </View>
              <ProgressBar progress={(user.aiAnalysesUsed / 3) * 100} color={theme.primary} />
              {!canAnalyze && (
                <TouchableOpacity style={styles.upgradePrompt} onPress={() => navigation.navigate('Upgrade')}>
                  <Text style={[styles.upgradePromptText, { color: theme.primary }]}>Upgrade for unlimited analyses →</Text>
                </TouchableOpacity>
              )}
            </Card>
          )}

          {/* Quick Analyze */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Analyze Subject</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.subjectChip,
                    { borderColor: subject.color, backgroundColor: theme.card },
                    selectedSubject === subject.name && { backgroundColor: subject.color + '20' },
                  ]}
                  onPress={() => handleQuickAnalyze(subject.name)}
                >
                  <View style={[styles.subjectDot, { backgroundColor: subject.color }]} />
                  <Text style={[styles.subjectChipText, selectedSubject === subject.name && { color: subject.color }]}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Or Describe Your Problem</Text>
            <Card style={styles.inputCard}>
              <TextInput
                style={[styles.textInput, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Paste questions you got wrong, or describe what you're struggling with..."
                value={inputText}
                onChangeText={(text) => {
                  setInputText(text);
                  setSelectedSubject(null);
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={theme.textMuted}
              />
            </Card>

            <View style={styles.examplesContainer}>
              <Text style={[styles.examplesTitle, { color: theme.textSecondary }]}>Examples:</Text>
              <TouchableOpacity onPress={() => setInputText('I keep getting quadratic equations wrong on tests')}>
                <Text style={[styles.exampleText, { color: theme.primary }]}>• "I keep getting quadratic equations wrong on tests"</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setInputText('My essay structure is weak according to my teacher')}>
                <Text style={[styles.exampleText, { color: theme.primary }]}>• "My essay structure is weak according to my teacher"</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setInputText('I don\'t understand forces and motion in physics')}>
                <Text style={[styles.exampleText, { color: theme.primary }]}>• "I don't understand forces and motion in physics"</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={isAnalyzing ? 'Analyzing...' : 'Analyze My Weakness'}
              onPress={() => handleAnalyze()}
              disabled={(!inputText.trim() && !selectedSubject) || !canAnalyze || isAnalyzing}
              loading={isAnalyzing}
              icon={<Ionicons name="analytics" size={20} color="#FFFFFF" />}
              style={styles.analyzeButton}
            />
          </View>

          {/* Analysis Results */}
          {analysis && (
            <View style={styles.resultsSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Analysis Results</Text>

              {/* Topic */}
              <Card style={styles.resultCard}>
                <View style={[styles.resultHeader, { borderBottomColor: theme.border }]}>
                  <View style={[styles.resultIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name="book" size={20} color={theme.primary} />
                  </View>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>Topic Identified</Text>
                </View>
                <Text style={[styles.resultText, { color: theme.textSecondary }]}>{analysis.topic}</Text>
              </Card>

              {/* Weakness */}
              <Card style={[styles.resultCard, styles.weaknessCard]}>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: theme.danger + '20' }]}>
                    <Ionicons name="alert-circle" size={20} color={theme.danger} />
                  </View>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>Your Weakness</Text>
                </View>
                <Text style={[styles.resultText, { color: theme.textSecondary }]}>{analysis.weakness}</Text>
              </Card>

              {/* Strategies */}
              <Card style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: theme.success + '20' }]}>
                    <Ionicons name="bulb" size={20} color={theme.success} />
                  </View>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>Targeted Strategies</Text>
                </View>
                {analysis.strategies.map((strategy, index) => (
                  <View key={index} style={styles.strategyItem}>
                    <Text style={styles.strategyNumber}>{index + 1}</Text>
                    <Text style={styles.strategyText}>{strategy}</Text>
                  </View>
                ))}
              </Card>

              {/* Practice Questions */}
              <Card style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: theme.secondary + '20' }]}>
                    <Ionicons name="help-circle" size={20} color={theme.secondary} />
                  </View>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>Practice Questions</Text>
                </View>
                {analysis.practiceQuestions.map((question, index) => (
                  <View key={index} style={styles.questionItem}>
                    <Text style={styles.questionNumber}>Q{index + 1}</Text>
                    <Text style={styles.questionText}>{question}</Text>
                  </View>
                ))}
              </Card>

              {/* Explanation */}
              <Card style={[styles.resultCard, styles.explanationCard]}>
                <View style={styles.resultHeader}>
                  <View style={[styles.resultIcon, { backgroundColor: theme.warning + '20' }]}>
                    <Ionicons name="school" size={20} color={theme.warning} />
                  </View>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>Quick Concept Review</Text>
                </View>
                <Text style={[styles.explanationText, { color: theme.warning }]}>{analysis.explanation}</Text>
              </Card>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <Button
                  title="Create Flashcards"
                  onPress={() => navigation.navigate('Flashcards')}
                  variant="outline"
                  icon={<Ionicons name="albums" size={18} color="#3B82F6" />}
                  style={styles.actionButton}
                />
                <Button
                  title="Study Plan"
                  onPress={() => navigation.navigate('StudyPlan')}
                  icon={<Ionicons name="calendar" size={18} color="#FFFFFF" />}
                  style={styles.actionButton}
                />
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
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
  usageCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  usageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  usageTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  usageBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  usageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  upgradePrompt: {
    marginTop: 12,
  },
  upgradePromptText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  inputCard: {
    padding: 0,
  },
  textInput: {
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 120,
    lineHeight: 22,
  },
  examplesContainer: {
    marginTop: 12,
  },
  examplesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 13,
    color: '#3B82F6',
    marginBottom: 4,
  },
  analyzeButton: {
    marginTop: 16,
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  resultCard: {
    marginBottom: 12,
  },
  weaknessCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  strategyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  strategyNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
  },
  strategyText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8B5CF6',
    marginRight: 10,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  explanationCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  explanationText: {
    fontSize: 15,
    color: '#78350F',
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
