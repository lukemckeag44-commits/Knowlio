import React from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface PressableSceneProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    scaleTo?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScene: React.FC<PressableSceneProps> = ({
    children,
    onPress,
    style,
    scaleTo = 0.95
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <AnimatedPressable
            onPressIn={() => {
                scale.value = withSpring(scaleTo, {
                    damping: 15,
                    stiffness: 300,
                });
            }}
            onPressOut={() => {
                scale.value = withSpring(1, {
                    damping: 15,
                    stiffness: 300,
                });
            }}
            onPress={onPress}
            style={[animatedStyle, style as any]}
        >
            {children}
        </AnimatedPressable>
    );
};
