import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl } from 'react-native';
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
import { calculateOverallAverage, calculateWeightedAverage, formatTime, getGradeColor, generateProjectedGrade, getWeakestSubject } from '../lib/utils';
import { mockParentData } from '../lib/mockData';
import { useTheme } from '../lib/useTheme';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, subjects, studyPlan, toggleParentMode, setPlan } = useAppStore();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [newSubjectColor, setNewSubjectColor] = useState(theme.primary);
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

  if (user.isParentMode) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Parent Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>Parent Dashboard</Text>
              <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Monitoring {mockParentData.childName}</Text>
            </View>
            <View style={styles.modeToggle}>
              <Text style={[styles.modeLabel, { color: theme.textSecondary }]}>Parent</Text>
              <Switch
                value={user.isParentMode}
                onValueChange={toggleParentMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.card}
              />
            </View>
          </View>

          {/* Grade Trend */}
          <Card style={styles.chartCard}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Grade Trend</Text>
            <MiniChart data={gradeHistory} width={320} height={120} showGrid />
            <View style={styles.chartLabels}>
              <Text style={styles.chartLabel}>6 weeks ago</Text>
              <Text style={styles.chartLabel}>Today</Text>
            </View>
          </Card>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="time"
              title="Weekly Time"
              value={formatTime(user.weeklyStudyTime)}
              subtitle="This week"
            />
            <StatCard
              icon="flame"
              title="Current Streak"
              value={`${user.studyStreak} Days`}
              subtitle={user.studyStreak > 0 ? "Keep it up! 🔥" : "Start today!"}
            />
          </View>

          {/* Parent Stats */}
          <View style={styles.statsRow}>
            <StatCard
              title="Current Average"
              value={`${overallAverage}%`}
              icon="school"
              iconColor={theme.primary}
              trend={overallAverage > 75 ? 'up' : 'down'}
              trendValue={`${Math.abs(overallAverage - 75).toFixed(1)}%`}
            />
            <StatCard
              title="Study Time"
              value={formatTime(mockParentData.timeSpentThisWeek)}
              icon="time"
              iconColor={theme.success}
              subtitle="This week"
            />
          </View>

          <View style={styles.statsRow}>
            <StatCard
              title="Consistency"
              value={`${mockParentData.studyConsistency}%`}
              icon="trending-up"
              iconColor={theme.secondary}
              subtitle="Study habits"
            />
            <StatCard
              title="Study Streak"
              value={`${user.studyStreak} days`}
              icon="flame"
              iconColor={theme.warning}
            />
          </View>

          {/* Areas Needing Attention */}
          <Card style={styles.attentionCard}>
            <View style={styles.attentionHeader}>
              <Ionicons name="alert-circle" size={20} color={theme.warning} />
              <Text style={[styles.attentionTitle, { color: theme.text }]}>Areas Needing Attention</Text>
            </View>
            {mockParentData.areasNeedingAttention.map((area, index) => (
              <View key={index} style={styles.attentionItem}>
                <View style={[styles.attentionDot, { backgroundColor: theme.warning }]} />
                <Text style={[styles.attentionText, { color: theme.textSecondary }]}>{area}</Text>
              </View>
            ))}
          </Card>

          {/* Recent Activity */}
          <Card style={styles.activityCard}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Recent Activity</Text>
            {mockParentData.recentActivity.map((activity, index) => (
              <View key={index} style={[styles.activityItem, { borderBottomColor: theme.border }]}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, { color: theme.text }]}>{activity.action}</Text>
                  <Text style={[styles.activityDate, { color: theme.textMuted }]}>{activity.date}</Text>
                </View>
              </View>
            ))}
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Hey, {user.name.split(' ')[0]}! 👋</Text>
            <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>Let's crush those grades today</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.modeToggle}>
              <Text style={[styles.modeLabel, { color: theme.textSecondary }]}>Parent</Text>
              <Switch
                value={user.isParentMode}
                onValueChange={toggleParentMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.card}
              />
            </View>
          </View>
        </View>

        {/* Plan Badge */}
        {user.plan === 'free' && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => setShowUpgradeModal(true)}>
            <LinearGradient
              colors={[theme.warning, theme.warning + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upgradeBanner}
            >
              <View style={styles.upgradeBannerContent}>
                <View style={styles.upgradeIconContainer}>
                  <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.upgradeBannerText}>
                  <Text style={styles.upgradeBannerTitle}>Unlock Your Potential</Text>
                  <Text style={styles.upgradeBannerSubtitle}>Upgrade to Plus for unlimited stats & AI</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Main Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.mainStatsContainer}>
          <Card style={styles.averageCard}>
            <Text style={[styles.averageLabel, { color: theme.textSecondary }]}>Current Average</Text>
            <Text style={[styles.averageValue, { color: getGradeColor(overallAverage) }]}>
              {overallAverage}%
            </Text>
            <ProgressBar progress={overallAverage} color={getGradeColor(overallAverage)} height={8} />
          </Card>

          <Card style={styles.projectionCard}>
            <View style={styles.projectionHeader}>
              <View style={[styles.projectionIconContainer, { backgroundColor: theme.secondary + '20' }]}>
                <Ionicons name="trending-up" size={18} color={theme.secondary} />
              </View>
              <Text style={[styles.projectionLabel, { color: theme.secondary }]}>Grade Growth</Text>
            </View>
            <Text style={[styles.projectionValue, { color: theme.secondary }]}>{projectedGrade}%</Text>
            <Text style={[styles.projectionSubtext, { color: theme.secondary }]}>Projected future average</Text>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(200).duration(400).springify()} style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => setShowQuickStudy(true)}
          >
            <LinearGradient colors={[theme.warning + '40', theme.warning + '20']} style={styles.quickActionIcon}>
              <Ionicons name="flash" size={28} color={theme.warning} />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Quick Study</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Chat')}
          >
            <LinearGradient colors={[theme.primary + '40', theme.primary + '20']} style={styles.quickActionIcon}>
              <Ionicons name="chatbubbles" size={28} color={theme.primary} />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>AI Tutor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Flashcards')}
          >
            <LinearGradient colors={[theme.success + '40', theme.success + '20']} style={styles.quickActionIcon}>
              <Ionicons name="albums" size={28} color={theme.success} />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Flashcards</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Analyze')}
          >
            <LinearGradient colors={[theme.secondary + '40', theme.secondary + '20']} style={styles.quickActionIcon}>
              <Ionicons name="analytics" size={28} color={theme.secondary} />
            </LinearGradient>
            <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>Analyze</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            title="Study Streak"
            value={`${user.studyStreak} days`}
            icon="flame"
            iconColor="#F59E0B"
            delay={300}
          />
          <StatCard
            title="This Week"
            value={formatTime(user.weeklyStudyTime)}
            icon="time"
            iconColor="#3B82F6"
            subtitle="study time"
            delay={350}
          />
        </View>

        {/* Weakness Alert */}
        {weakestSubject && (
          <TouchableOpacity onPress={() => navigation.navigate('Analyze')}>
            <Card style={styles.weaknessCard}>
              <View style={styles.weaknessHeader}>
                <View style={styles.weaknessIcon}>
                  <Ionicons name="warning" size={20} color={theme.danger} />
                </View>
                <View style={styles.weaknessContent}>
                  <Text style={[styles.weaknessTitle, { color: theme.danger }]}>Focus Area</Text>
                  <Text style={[styles.weaknessText, { color: theme.danger }]}>
                    {weakestSubject.name} ({calculateWeightedAverage(weakestSubject.assignments)}%) needs attention
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            </Card>
          </TouchableOpacity>
        )}

        {/* Study Plan Preview */}
        {studyPlan && (
          <Card style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Today's Study Plan</Text>
              <TouchableOpacity onPress={() => navigation.navigate('StudyPlan')}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {studyPlan.sessions.slice(0, 3).map((session) => (
              <View key={session.id} style={styles.planItem}>
                <View style={[styles.planDot, session.completed && styles.planDotComplete]} />
                <View style={styles.planContent}>
                  <Text style={[styles.planTopic, { color: theme.text }, session.completed && styles.planTopicComplete]}>
                    {session.topics[0]}
                  </Text>
                  <Text style={[styles.planDuration, { color: theme.textSecondary }]}>{session.duration} min</Text>
                </View>
                {session.completed && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                )}
              </View>
            ))}
          </Card>
        )}

        {/* Subjects */}
        <View style={styles.subjectsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Subjects</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Grades')}>
              <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {subjects.slice(0, 3).map((subject, index) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onPress={() => navigation.navigate('Grades', { subjectId: subject.id })}
              delay={400 + (index * 100)}
            />
          ))}
        </View>

        {/* AI Usage */}
        {user.plan === 'free' && (
          <Card style={styles.usageCard}>
            <View style={styles.usageHeader}>
              <Ionicons name="sparkles" size={20} color={theme.primary} />
              <Text style={[styles.usageTitle, { color: theme.text }]}>AI Analyses</Text>
            </View>
            <View style={styles.usageBar}>
              <ProgressBar progress={(user.aiAnalysesUsed / 3) * 100} color={theme.primary} />
            </View>
            <Text style={[styles.usageText, { color: theme.textSecondary }]}>
              {user.aiAnalysesUsed}/3 used this week
            </Text>
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSelectPlan={setPlan}
        currentPlan={user.plan}
      />

      <QuickStudyModal
        visible={showQuickStudy}
        onClose={() => setShowQuickStudy(false)}
        subject={weakestSubject?.name || 'Math'}
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Chat')}
      >
        <LinearGradient
          colors={[theme.primary, theme.primary + 'DD']}
          style={styles.floatingButton}
        >
          <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
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
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  subGreeting: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 6,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  upgradeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  upgradeIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 12,
  },
  upgradeBannerText: {
    gap: 2,
  },
  upgradeBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  upgradeBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  mainStatsContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  averageCard: {
    padding: 20,
  },
  averageLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  averageValue: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 12,
  },
  projectionCard: {
    padding: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  projectionIconContainer: {
    backgroundColor: '#D1FAE5',
    padding: 6,
    borderRadius: 8,
  },
  projectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  projectionValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
  },
  projectionSubtext: {
    fontSize: 13,
    color: '#047857',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickAction: {
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8a9ec1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  weaknessCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  weaknessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weaknessIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weaknessContent: {
    flex: 1,
    marginLeft: 12,
  },
  weaknessTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  weaknessText: {
    fontSize: 13,
    color: '#B91C1C',
    marginTop: 2,
  },
  planCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  planDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  planDotComplete: {
    backgroundColor: '#10B981',
  },
  planContent: {
    flex: 1,
    marginLeft: 12,
  },
  planTopic: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  planTopicComplete: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  planDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  subjectsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
  },
  usageBar: {
    marginBottom: 8,
  },
  usageText: {
    fontSize: 13,
    color: '#6B7280',
  },
  chartCard: {
    marginHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  attentionCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  attentionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  attentionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  attentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  attentionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginRight: 10,
  },
  attentionText: {
    fontSize: 14,
    color: '#4B5563',
  },
  activityCard: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 40,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1F2937',
  },
  activityDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  loader: {
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
