import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, BounceIn } from 'react-native-reanimated';
import { useTheme } from '../lib/useTheme';
import { Button } from './Button';

const { width } = Dimensions.get('window');

interface MilestoneModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  xpReward: number;
  type: 'streak' | 'achievement' | 'level';
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ 
  visible, 
  onClose, 
  title, 
  message, 
  xpReward,
  type
}) => {
  const theme = useTheme();

  const getIcon = () => {
    switch (type) {
      case 'streak': return 'flame';
      case 'achievement': return 'trophy';
      case 'level': return 'star';
      default: return 'medal';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'streak': return '#FF4500';
      case 'achievement': return '#FFD700';
      case 'level': return '#1E90FF';
      default: return theme.primary;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View 
          entering={FadeIn}
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
        />
        <Animated.View 
          entering={SlideInDown.springify()}
          style={[styles.content, { backgroundColor: theme.card }]}
        >
          <Animated.View entering={BounceIn.delay(300)} style={styles.iconWrapper}>
            <Ionicons name={getIcon()} size={80} color={getIconColor()} />
          </Animated.View>
          
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          
          <View style={[styles.rewardBadge, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.rewardText, { color: theme.primary }]}>+{xpReward} XP EARNED</Text>
          </View>
          
          <Button 
            title="Awesome!" 
            onPress={onClose} 
            style={styles.button}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    width: width * 0.85,
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  rewardBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 30,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  button: {
    width: '100%',
  }
});
