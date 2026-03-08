import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '@/lib/useTheme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = '#3B82F6',
  trend,
  trendValue,
  delay = 0,
}) => {
  const theme = useTheme();
  
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return theme.success;
      case 'down': return theme.danger;
      default: return theme.textMuted;
    }
  };

  const getTrendIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'up': return 'trending-up';
      case 'down': return 'trending-down';
      default: return 'remove';
    }
  };

  return (
    <Card style={styles.card} delay={delay}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: (iconColor || theme.primary) + '15' }]}>
          <Ionicons name={icon} size={20} color={iconColor || theme.primary} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: getTrendColor() + '15' }]}>
            <Ionicons name={getTrendIcon()} size={12} color={getTrendColor()} />
            {trendValue && <Text style={[styles.trendText, { color: getTrendColor() }]}>{trendValue}</Text>}
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
        <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    marginTop: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
