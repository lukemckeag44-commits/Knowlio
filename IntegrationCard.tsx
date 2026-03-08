import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { useAppStore } from '../lib/store';
import { useTheme } from '../lib/useTheme';

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  connected: boolean;
  onConnect: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  description,
  icon,
  color,
  connected,
  onConnect,
}) => {
  const { user } = useAppStore();
  const theme = useTheme();
  const isLocked = user.plan !== 'pro';

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
            {isLocked && (
              <View style={[styles.proBadge, { backgroundColor: theme.warning }]}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={[styles.description, { color: theme.textSecondary }]}>{description}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.connectButton,
          connected && styles.connectedButton,
          isLocked && styles.lockedButton,
        ]}
        onPress={onConnect}
        disabled={isLocked}
      >
        {isLocked ? (
          <Ionicons name="lock-closed" size={16} color={theme.textMuted} />
        ) : connected ? (
          <>
            <Ionicons name="checkmark" size={16} color={theme.success} />
            <Text style={[styles.connectedText, { color: theme.success }]}>Connected</Text>
          </>
        ) : (
          <Text style={styles.connectText}>Connect</Text>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  proBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: theme.primary,
  },
  connectedButton: {
    backgroundColor: theme.success + '20',
  },
  lockedButton: {
    backgroundColor: theme.border,
  },
  connectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  connectedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
});
