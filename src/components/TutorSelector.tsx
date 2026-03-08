import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { aiTutors } from '@/lib/mockData';
import { useAppStore } from '@/lib/store';
import { useTheme } from '@/lib/useTheme';

interface TutorSelectorProps {
  onSelect?: () => void;
}

export const TutorSelector: React.FC<TutorSelectorProps> = ({ onSelect }) => {
  const { user, setSelectedTutor } = useAppStore();
  const theme = useTheme();

  const getStyleIcon = (style: string): keyof typeof Ionicons.glyphMap => {
    switch (style) {
      case 'encouraging': return 'heart';
      case 'strict': return 'shield-checkmark';
      case 'friendly': return 'sparkles';
      case 'analytical': return 'analytics';
      default: return 'person';
    }
  };

  const getStyleColor = (style: string): string => {
    switch (style) {
      case 'encouraging': return theme.accent;
      case 'strict': return theme.primary;
      case 'friendly': return theme.warning;
      case 'analytical': return theme.secondary;
      default: return theme.textMuted;
    }
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {aiTutors.map((tutor) => {
        const isSelected = user.selectedTutor === tutor.id;
        const isLocked = user.plan === 'free' && tutor.id !== 'sophia';

        return (
          <TouchableOpacity
            key={tutor.id}
            onPress={() => {
              if (!isLocked) {
                setSelectedTutor(tutor.id);
                onSelect?.();
              }
            }}
            activeOpacity={isLocked ? 1 : 0.7}
          >
            <Card
              style={[
                styles.tutorCard,
                { borderColor: theme.border, backgroundColor: theme.card },
                isSelected && [styles.tutorCardSelected, { borderColor: theme.primary, backgroundColor: theme.primary + '20' }],
                isLocked && styles.tutorCardLocked,
              ]}
            >
              {isLocked && (
                <View style={[styles.lockBadge, { backgroundColor: theme.border }]}>
                  <Ionicons name="lock-closed" size={12} color={theme.textMuted} />
                </View>
              )}

              <Text style={styles.avatar}>{tutor.avatar}</Text>
              <Text style={[styles.name, { color: theme.text }, isLocked && { color: theme.textMuted }]}>{tutor.name}</Text>

              <View style={[styles.styleBadge, { backgroundColor: getStyleColor(tutor.style) + '20' }]}>
                <Ionicons name={getStyleIcon(tutor.style)} size={12} color={getStyleColor(tutor.style)} />
                <Text style={[styles.styleText, { color: getStyleColor(tutor.style) }]}>
                  {tutor.style.charAt(0).toUpperCase() + tutor.style.slice(1)}
                </Text>
              </View>

              <Text style={[styles.personality, { color: theme.textSecondary }, isLocked && { color: theme.textMuted }]} numberOfLines={2}>
                {tutor.personality}
              </Text>

              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                  <Text style={[styles.selectedText, { color: theme.success }]}>Active</Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  tutorCard: {
    width: 160,
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tutorCardSelected: {
    borderWidth: 2,
  },
  tutorCardLocked: {
    opacity: 0.6,
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: 40,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  textLocked: {
  },
  styleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  styleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  personality: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  selectedText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
