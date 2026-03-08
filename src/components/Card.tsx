import React from 'react';
import { StyleSheet, ViewStyle, Platform, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  delay?: number;
  animated?: boolean;
}

/**
 * Premium Card component with refined shadows and layout
 */
export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  padding = 20, 
  delay = 0,
  animated = true
}) => {
  const theme = useTheme();

  const cardStyle = [
    styles.card,
    {
      padding,
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1, // Subtle border for definition
      shadowColor: theme.shadow,
    },
    style
  ];

  if (animated) {
    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(600).springify()}
        style={cardStyle}
      >
        {children}
      </Animated.View>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20, // Professional standard
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 15,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 15,
      },
    }),
  },
});
