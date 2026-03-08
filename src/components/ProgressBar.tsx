import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  height = 8,
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(Math.max(progress, 0), 100)}%`, { duration: 500 }),
  }));

  return (
    <View style={[styles.container, { backgroundColor, height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.progress,
          { backgroundColor: color, borderRadius: height / 2 },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});
