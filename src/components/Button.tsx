import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/lib/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Professional Button component with refined typography and interaction states
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  icon,
}) => {
  const scale = useSharedValue(1);
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97); // Subtle press effect
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.input;
    switch (variant) {
      case 'primary': return theme.primary;
      case 'secondary': return theme.secondary;
      case 'danger': return theme.danger;
      case 'outline':
      case 'ghost': return 'transparent';
      default: return theme.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textMuted;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger': return '#FFFFFF';
      case 'outline':
      case 'ghost': return theme.primary;
      default: return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'medium': return { paddingVertical: 14, paddingHorizontal: 24 };
      case 'large': return { paddingVertical: 18, paddingHorizontal: 32 };
      default: return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'medium': return 16;
      case 'large': return 18;
      default: return 16;
    }
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: theme.primary,
          borderRadius: 14,
          ...getPadding(),
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: getTextColor(), fontSize: getFontSize(), marginLeft: icon ? 8 : 0 }]}>
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
      web: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
    }),
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.2, // Tighter letter spacing for premium look
  },
});
