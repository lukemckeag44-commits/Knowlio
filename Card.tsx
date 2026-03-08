import React from 'react';
import { StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../lib/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  delay?: number;
}

/**
 * Premium Card component with refined shadows and layout
 */
export const Card: React.FC<CardProps> = ({ children, style, padding = 16, delay = 0 }) => {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      style={[
        styles.card,
        {
          padding,
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1, // Subtle border for definition
        },
        style
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, // Professional standard
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
    }),
  },
});
