import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useTheme } from '../lib/useTheme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
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
      <View style={[styles.iconContainer, { backgroundColor: (iconColor || theme.primary) + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor || theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      {(subtitle || trend) && (
        <View style={styles.footer}>
          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <Ionicons name={getTrendIcon()} size={14} color={getTrendColor()} />
              <Text style={[styles.trendValue, { color: getTrendColor() }]}>{trendValue}</Text>
            </View>
          )}
          {subtitle && <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
