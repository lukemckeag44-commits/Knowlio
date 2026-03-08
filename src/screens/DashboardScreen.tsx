import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { SubjectCard } from '@/components/SubjectCard';
import { MiniChart } from '@/components/MiniChart';
import { UpgradeModal } from '@/components/UpgradeModal';
import { QuickStudyModal } from '@/components/QuickStudyModal';
import { MilestoneModal } from '@/components/MilestoneModal';
import { Logo } from '@/components/Logo';
import { calculateOverallAverage, formatTime, generateProjectedGrade, getWeakestSubject } from '@/lib/utils';
import { mockParentData } from '@/lib/mockData';
import { useTheme } from '@/lib/useTheme';

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, subjects, toggleParentMode } = useAppStore();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showQuickStudy, setShowQuickStudy] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneData, setMilestoneData] = useState({ title: '', message: '', xpReward: 0, type: 'streak' as const });

  const overallAverage = calculateOverallAverage(subjects);
  const projectedGrade = generateProjectedGrade(overallAverage, user.weeklyStudyTime / 60);
  const weakestSubject = getWeakestSubject(subjects);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    // Check for streak milestone
    if (user.studyStreak === 7 && !user.unlockedAchievements.includes('7-day-streak')) {
      setMilestoneData({
        title: '7-Day Streak!',
        message: 'You\'ve studied for 7 days in a row. You\'re on fire!',
        xpReward: 500,
        type: 'streak'
      });
      setShowMilestone(true);
      // unlockAchievement('7-day-streak'); // Assuming this exists in store
    }
  }, [user.studyStreak]);

  const gradeHistory = mockParentData.gradeHistory.map(g => g.average);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Logo size={36} />
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {renderHeader()}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Performance Overview Card */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mainPerformanceCard}
          >
            <View style={styles.perfHeader}>
              <View>
                <Text style={styles.perfLabel}>Overall Average</Text>
                <Text style={styles.perfValue}>{overallAverage}%</Text>
              </View>
              <View style={styles.perfBadge}>
                <Ionicons name="trending-up" size={16} color="#FFF" />
                <Text style={styles.perfBadgeText}>+2.4%</Text>
              </View>
            </View>
            
            <View style={styles.perfProgressContainer}>
              <View style={[styles.perfProgressBar, { width: `${overallAverage}%` }]} />
            </View>

            <View style={styles.perfStats}>
              <View style={styles.perfStatItem}>
                <Text style={styles.perfStatValue}>{projectedGrade}%</Text>
                <Text style={styles.perfStatLabel}>Projected</Text>
              </View>
              <View style={styles.perfStatDivider} />
              <View style={styles.perfStatItem}>
                <Text style={styles.perfStatValue}>{user.studyStreak}d</Text>
                <Text style={styles.perfStatLabel}>Streak</Text>
              </View>
              <View style={styles.perfStatDivider} />
              <View style={styles.perfStatItem}>
                <Text style={styles.perfStatValue}>{formatTime(user.weeklyStudyTime)}</Text>
                <Text style={styles.perfStatLabel}>This Week</Text>
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

        {/* Insight Card */}
        <Card style={styles.insightCard} delay={600}>
          <View style={styles.insightHeader}>
            <View style={[styles.insightIcon, { backgroundColor: theme.success + '15' }]}>
              <Ionicons name="bulb" size={20} color={theme.success} />
            </View>
            <Text style={[styles.insightTitle, { color: theme.text }]}>AI Insight</Text>
          </View>
          <Text style={[styles.insightText, { color: theme.textSecondary }]}>
            You're doing great in {subjects[0].name}! Focusing 20% more time on {weakestSubject?.name || 'your weakest subject'} could boost your overall average to {(overallAverage + 1.5).toFixed(1)}%.
          </Text>
        </Card>
      </ScrollView>

      <UpgradeModal visible={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <QuickStudyModal visible={showQuickStudy} onClose={() => setShowQuickStudy(false)} />
      <MilestoneModal 
        visible={showMilestone} 
        onClose={() => setShowMilestone(false)} 
        {...milestoneData} 
      />
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
  greeting: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  subGreeting: { fontSize: 13, fontWeight: '600', opacity: 0.7 },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 8,
  },
  modeLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  mainPerformanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
      android: { elevation: 8 },
      web: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }
    }),
  },
  perfHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  perfLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  perfValue: { color: '#FFFFFF', fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  perfBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  perfBadgeText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  perfProgressContainer: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, marginBottom: 24, overflow: 'hidden' },
  perfProgressBar: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },
  perfStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 20 },
  perfStatItem: { alignItems: 'center' },
  perfStatValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  perfStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  perfStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },

  quickActionsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  quickActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1 },
  quickActionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  quickActionText: { fontSize: 15, fontWeight: '700' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  sectionLink: { fontSize: 14, fontWeight: '700' },
  subjectsList: { marginBottom: 24 },

  insightCard: { padding: 20, borderStyle: 'dashed' },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  insightIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontSize: 16, fontWeight: '800' },
  insightText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
