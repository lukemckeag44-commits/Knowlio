import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAppStore } from '../lib/store';
import { Card } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { SubjectCard } from '../components/SubjectCard';
import { ProgressBar } from '../components/ProgressBar';
import { MiniChart } from '../components/MiniChart';
import { UpgradeModal } from '../components/UpgradeModal';
import { QuickStudyModal } from '../components/QuickStudyModal';
import { Logo } from '../components/Logo';
import { calculateOverallAverage, formatTime, getGradeColor, generateProjectedGrade, getWeakestSubject } from '../lib/utils';
import { mockParentData } from '../lib/mockData';
import { useTheme } from '../lib/useTheme';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, subjects, toggleParentMode } = useAppStore();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showQuickStudy, setShowQuickStudy] = useState(false);

  const overallAverage = calculateOverallAverage(subjects);
  const projectedGrade = generateProjectedGrade(overallAverage, user.weeklyStudyTime / 60);
  const weakestSubject = getWeakestSubject(subjects);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const gradeHistory = mockParentData.gradeHistory.map(g => g.average);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Logo size={32} />
        <View style={styles.headerTextContainer}>
          <Text style={[styles.greeting, { color: theme.text }]}>
            {user.isParentMode ? 'Parent Dashboard' : `Hello, ${user.name.split(' ')[0]}`}
          </Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            {user.isParentMode ? `Monitoring ${mockParentData.childName}` : "Your academic workspace"}
          </Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <View style={[styles.modeToggle, { backgroundColor: theme.input }]}>
          <Text style={[styles.modeLabel, { color: theme.textSecondary }]}>Parent</Text>
          <Switch
            value={user.isParentMode}
            onValueChange={toggleParentMode}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={Platform.OS === 'ios' ? undefined : theme.card}
            ios_backgroundColor={theme.border}
          />
        </View>
      </View>
    </View>
  );

  if (user.isParentMode) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderHeader()}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          <Card style={styles.chartCard}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Grade Progression</Text>
              <View style={[styles.badge, { backgroundColor: theme.primary + '10' }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>Last 6 Weeks</Text>
              </View>
            </View>
            <MiniChart data={gradeHistory} width={340} height={140} showGrid color={theme.primary} />
            <View style={styles.chartLabels}>
              <Text style={[styles.chartLabel, { color: theme.textMuted }]}>6 weeks ago</Text>
              <Text style={[styles.chartLabel, { color: theme.textMuted }]}>Today</Text>
            </View>
          </Card>

          <View style={styles.statsGrid}>
            <StatCard
              icon="school"
              title="Overall Average"
              value={`${overallAverage}%`}
              subtitle="Current grade"
              color={theme.primary}
            />
            <StatCard
              icon="time"
              title="Study Time"
              value={formatTime(user.weeklyStudyTime)}
              subtitle="This week"
              color={theme.secondary}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              icon="flame"
              title="Study Streak"
              value={`${user.studyStreak} Days`}
              subtitle="Consistency"
              color={theme.warning}
            />
            <StatCard
              icon="trending-up"
              title="Growth Rate"
              value={`+${(overallAverage - 75).toFixed(1)}%`}
              subtitle="vs. Last Month"
              color={theme.success}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Attention Required</Text>
          <Card style={styles.attentionCard}>
            {mockParentData.areasNeedingAttention.map((area, index) => (
              <View key={index} style={[styles.attentionItem, index !== 0 && { borderTopColor: theme.border, borderTopWidth: 1 }]}>
                <View style={[styles.attentionDot, { backgroundColor: theme.warning }]} />
                <Text style={[styles.attentionText, { color: theme.textSecondary }]}>{area}</Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {renderHeader()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Main Performance Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <LinearGradient
            colors={[theme.primary, theme.primary + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainPerformanceCard}
          >
            <View style={styles.performanceInfo}>
              <Text style={styles.performanceLabel}>Current Average</Text>
              <Text style={styles.performanceValue}>{overallAverage}%</Text>
              <View style={styles.performanceProgressContainer}>
                <View style={[styles.performanceProgressBar, { width: `${overallAverage}%` }]} />
              </View>
            </View>
            <View style={styles.performanceStats}>
              <View style={styles.perfStatItem}>
                <Text style={styles.perfStatValue}>{projectedGrade}%</Text>
                <Text style={styles.perfStatLabel}>Projected</Text>
              </View>
              <View style={styles.perfStatDivider} />
              <View style={styles.perfStatItem}>
                <Text style={styles.perfStatValue}>{user.studyStreak}d</Text>
                <Text style={styles.perfStatLabel}>Streak</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setShowQuickStudy(true)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.warning + '15' }]}>
              <Ionicons name="flash" size={20} color={theme.warning} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>Quick Review</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="chatbubble-ellipses" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: theme.text }]}>Ask Tutor</Text>
          </TouchableOpacity>
        </View>

        {/* Subjects Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Subjects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Grades')}>
            <Text style={[styles.sectionLink, { color: theme.primary }]}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subjectsList}>
          {subjects.slice(0, 4).map((subject, index) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              delay={200 + index * 100}
              onPress={() => navigation.navigate('Grades', { subjectId: subject.id })}
            />
          ))}
        </View>

        {/* Upgrade Banner */}
        {user.plan === 'free' && (
          <TouchableOpacity activeOpacity={0.9} onPress={() => setShowUpgradeModal(true)}>
            <Card style={styles.upgradeCard}>
              <View style={styles.upgradeContent}>
                <View style={[styles.upgradeIcon, { backgroundColor: theme.primary + '15' }]}>
                  <Ionicons name="sparkles" size={24} color={theme.primary} />
                </View>
                <View style={styles.upgradeTextContainer}>
                  <Text style={[styles.upgradeTitle, { color: theme.text }]}>Knowlio Plus</Text>
                  <Text style={[styles.upgradeSubtitle, { color: theme.textSecondary }]}>Unlimited AI analysis & deep statistics</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
      </ScrollView>

      <UpgradeModal visible={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <QuickStudyModal visible={showQuickStudy} onClose={() => setShowQuickStudy(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTextContainer: { marginLeft: 12 },
  greeting: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  subGreeting: { fontSize: 13, fontWeight: '500' },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 8,
  },
  modeLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Main Performance Card
  mainPerformanceCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 6 },
    }),
  },
  performanceInfo: { marginBottom: 20 },
  performanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  performanceValue: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  performanceProgressContainer: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  performanceProgressBar: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },
  performanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
  },
  perfStatItem: { flex: 1, alignItems: 'center' },
  perfStatValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  perfStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },
  perfStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Quick Actions
  quickActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickActionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  quickActionText: { fontSize: 14, fontWeight: '600' },

  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  sectionLink: { fontSize: 14, fontWeight: '600' },
  subjectsList: { marginBottom: 24 },

  // Parent View Components
  chartCard: { marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  chartLabel: { fontSize: 11, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  attentionCard: { padding: 0, overflow: 'hidden' },
  attentionItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  attentionDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  attentionText: { fontSize: 14, fontWeight: '500', flex: 1 },

  // Upgrade Card
  upgradeCard: { marginTop: 8, borderStyle: 'dashed', borderWidth: 1.5 },
  upgradeContent: { flexDirection: 'row', alignItems: 'center' },
  upgradeIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  upgradeTextContainer: { flex: 1 },
  upgradeTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  upgradeSubtitle: { fontSize: 12, fontWeight: '500' },
});
