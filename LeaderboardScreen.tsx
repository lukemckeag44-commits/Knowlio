import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeIn, Layout } from 'react-native-reanimated';
import { useAppStore } from '../lib/store';
import { useTheme } from '../lib/useTheme';

export function LeaderboardScreen() {
    const { user, leaderboard, achievements } = useAppStore();
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'achievements'>('leaderboard');

    // Insert current user into leaderboard and sort by XP descending
    const currentLeaderboard = [...leaderboard];
    const userRankIndex = currentLeaderboard.findIndex(u => u.id === user.id);

    if (userRankIndex === -1) {
        currentLeaderboard.push({
            id: user.id,
            name: user.name,
            xp: user.xp,
            avatar: '🎓'
        });
    } else {
        currentLeaderboard[userRankIndex].xp = user.xp;
    }

    const sortedLeaderboard = currentLeaderboard.sort((a, b) => b.xp - a.xp);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Rankings & Achievements</Text>
                <View style={styles.userStats}>
                    <View style={[styles.statBadge, { backgroundColor: theme.warning + '20' }]}>
                        <Ionicons name="star" size={16} color={theme.warning} />
                        <Text style={[styles.statText, { color: theme.warning }]}>{user.xp} XP</Text>
                    </View>
                </View>
            </View>

            <View style={[styles.tabs, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'leaderboard' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
                    onPress={() => setActiveTab('leaderboard')}
                >
                    <Text style={[styles.tabText, { color: theme.textMuted }, activeTab === 'leaderboard' && [styles.activeTabText, { color: theme.primary }]]}>
                        Leaderboard
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'achievements' && [styles.activeTab, { borderBottomColor: theme.primary }]]}
                    onPress={() => setActiveTab('achievements')}
                >
                    <Text style={[styles.tabText, { color: theme.textMuted }, activeTab === 'achievements' && [styles.activeTabText, { color: theme.primary }]]}>
                        Achievements
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {activeTab === 'leaderboard' ? (
                    <View style={styles.leaderboardList}>
                        {sortedLeaderboard.map((item, index) => {
                            const isCurrentUser = item.id === user.id;

                            let rankColor = '#6B7280';
                            if (index === 0) rankColor = '#F59E0B'; // Gold
                            if (index === 1) rankColor = '#94A3B8'; // Silver
                            if (index === 2) rankColor = '#B45309'; // Bronze

                            return (
                                <Animated.View
                                    key={`lb-${item.id}`}
                                    entering={FadeInUp.delay(index * 80).duration(400).springify()}
                                    layout={Layout.springify()}
                                >
                                    {isCurrentUser ? (
                                        <LinearGradient
                                            colors={[theme.primary + '20', theme.primary + '10']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={[styles.leaderboardRow, styles.currentUserRow]}
                                        >
                                            <View style={styles.rankContainer}>
                                                <Text style={[styles.rankText, { color: rankColor }]}>#{index + 1}</Text>
                                            </View>
                                            <View style={[styles.userAvatar, { backgroundColor: theme.background }]}>
                                                <Text style={styles.avatarText}>{item.avatar}</Text>
                                            </View>
                                            <View style={styles.userInfo}>
                                                <Text style={[styles.userName, styles.currentUserName, { color: theme.primary }]}>
                                                    You
                                                </Text>
                                            </View>
                                            <View style={styles.xpContainer}>
                                                <Text style={[styles.xpText, { color: theme.warning }]}>{item.xp} XP</Text>
                                            </View>
                                        </LinearGradient>
                                    ) : (
                                        <View style={[styles.leaderboardRow, { borderBottomColor: theme.border }]}>
                                            <div className="rankContainer" style={styles.rankContainer}>
                                                <Text style={[styles.rankText, { color: rankColor }]}>#{index + 1}</Text>
                                            </div>
                                            <View style={[styles.userAvatar, { backgroundColor: theme.background }]}>
                                                <Text style={styles.avatarText}>{item.avatar}</Text>
                                            </View>
                                            <View style={styles.userInfo}>
                                                <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
                                            </View>
                                            <View style={styles.xpContainer}>
                                                <Text style={[styles.xpText, { color: theme.warning }]}>{item.xp} XP</Text>
                                            </View>
                                        </View>
                                    )}
                                </Animated.View>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.achievementsGrid}>
                        {achievements.map((achievement, index) => {
                            const isUnlocked = user.unlockedAchievements.includes(achievement.id);

                            return (
                                <Animated.View
                                    key={`ach-${achievement.id}`}
                                    entering={FadeInUp.delay(index * 80).duration(400).springify()}
                                    layout={Layout.springify()}
                                    style={[styles.achievementCard, !isUnlocked && styles.lockedCard]}
                                >
                                    <View style={[styles.iconContainer, !isUnlocked && styles.lockedIconContainer, { backgroundColor: isUnlocked ? theme.primary + '20' : theme.background }]}>
                                        <Ionicons
                                            name={achievement.icon as any}
                                            size={32}
                                            color={isUnlocked ? theme.primary : theme.textMuted}
                                        />
                                    </View>
                                    <View style={styles.achievementInfo}>
                                        <Text style={[styles.achievementTitle, { color: theme.text }, !isUnlocked && [styles.lockedText, { color: theme.textMuted }]]}>
                                            {achievement.title}
                                        </Text>
                                        <Text style={[styles.achievementDesc, { color: theme.textSecondary }]}>{achievement.description}</Text>
                                        <View style={styles.rewardContainer}>
                                            <Ionicons name="star" size={14} color={isUnlocked ? theme.warning : theme.textMuted} />
                                            <Text style={[styles.rewardText, { color: theme.warning }, !isUnlocked && [styles.lockedRewardText, { color: theme.textMuted }]]}>
                                                +{achievement.xpReward} XP
                                            </Text>
                                        </View>
                                    </View>
                                    {!isUnlocked && (
                                        <View style={styles.lockOverlay}>
                                            <Ionicons name="lock-closed" size={20} color={theme.textMuted} />
                                        </View>
                                    )}
                                </Animated.View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    userStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 4,
    },
    statText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#B45309',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#3B82F6',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6B7280',
    },
    activeTabText: {
        color: '#3B82F6',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    leaderboardList: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#8a9ec1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    currentUserRow: {
        borderBottomWidth: 0,
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
    },
    rankText: {
        fontSize: 18,
        fontWeight: '700',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 12,
    },
    avatarText: {
        fontSize: 20,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    currentUserName: {
        color: '#1D4ED8',
        fontWeight: '700',
    },
    xpContainer: {
        alignItems: 'flex-end',
    },
    xpText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#F59E0B',
    },
    achievementsGrid: {
        gap: 16,
        paddingBottom: 20,
    },
    achievementCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 24,
        shadowColor: '#8a9ec1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 4,
    },
    lockedCard: {
        backgroundColor: '#FAFAFA',
        shadowOpacity: 0.04,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        opacity: 0.9,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    lockedIconContainer: {
        backgroundColor: '#F3F4F6',
    },
    achievementInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    achievementTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    lockedText: {
        color: '#9CA3AF',
    },
    achievementDesc: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    rewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rewardText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#B45309',
    },
    lockedRewardText: {
        color: '#9CA3AF',
    },
    lockOverlay: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
});
