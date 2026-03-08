import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { useTheme } from '../lib/useTheme';

interface LogoProps {
    size?: number;
    color?: string;
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, color, showText = false }) => {
    const theme = useTheme();
    const primaryColor = color || theme.primary;
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
        >
            <Defs>
                <LinearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={theme.primary} />
                    <Stop offset="50%" stopColor={theme.primary + 'CC'} />
                    <Stop offset="100%" stopColor={theme.primary + '99'} />
                </LinearGradient>
            </Defs>

            {/* Book Shape */}
            <G>
                {/* Left Page */}
                <Path
                    d="M50 85C50 85 45 80 20 80V25C45 25 50 30 50 30"
                    stroke="url(#logoGrad)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Right Page */}
                <Path
                    d="M50 30C50 30 55 25 80 25V80C55 80 50 85 50 85"
                    stroke="url(#logoGrad)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Spine/Center */}
                <Path
                    d="M50 30V85"
                    stroke="url(#logoGrad)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                />
            </G>

            {/* Knowledge Network (Nodes & Connections) */}
            <G>
                {/* Connections */}
                <Path d="M60 40L75 35" stroke={theme.primary} strokeWidth="2" opacity="0.6" />
                <Path d="M75 35L85 45" stroke={theme.primary} strokeWidth="2" opacity="0.6" />
                <Path d="M85 45L70 55" stroke={theme.primary} strokeWidth="2" opacity="0.6" />
                <Path d="M70 55L60 40" stroke={theme.primary} strokeWidth="2" opacity="0.6" />
                <Path d="M75 35L70 55" stroke={theme.primary} strokeWidth="2" opacity="0.6" />

                {/* Nodes */}
                <Circle cx="60" cy="40" r="4" fill={theme.primary} stroke={theme.card} strokeWidth="1.5" />
                <Circle cx="75" cy="35" r="5" fill={theme.primary} stroke={theme.card} strokeWidth="1.5" />
                <Circle cx="85" cy="45" r="4" fill={theme.primary} stroke={theme.card} strokeWidth="1.5" />
                <Circle cx="70" cy="55" r="4" fill={theme.primary} stroke={theme.card} strokeWidth="1.5" />
            </G>
        </Svg>
    );
};
