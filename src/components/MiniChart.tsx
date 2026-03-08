import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/lib/useTheme';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showGrid?: boolean;
}

const MiniChartComponent: React.FC<MiniChartProps> = ({
  data,
  width = 200,
  height = 80,
  color = '#3B82F6',
  showDots = true,
  showGrid = false,
}) => {
  const theme = useTheme();
  if (data.length < 2) return null;

  // Memoize chart calculations to prevent unnecessary re-renders
  const { points, linePath, areaPath } = useMemo(() => {
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const minValue = Math.min(...data) - 5;
    const maxValue = Math.max(...data) + 5;
    const range = maxValue - minValue;

    const calculatedPoints = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
      return { x, y, value };
    });

    const calculatedLinePath = calculatedPoints
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    const calculatedAreaPath = `${calculatedLinePath} L ${calculatedPoints[calculatedPoints.length - 1].x} ${height - 10} L 10 ${height - 10} Z`;

    return {
      points: calculatedPoints,
      linePath: calculatedLinePath,
      areaPath: calculatedAreaPath,
    };
  }, [data, width, height]);

  // Memoize grid lines to prevent unnecessary re-renders
  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    const padding = 10;
    const chartHeight = height - padding * 2;
    return [0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
      <Line
        key={i}
        x1={padding}
        y1={padding + chartHeight * ratio}
        x2={width - padding}
        y2={padding + chartHeight * ratio}
        stroke={theme.border}
        strokeWidth="1"
      />
    ));
  }, [showGrid, width, height, theme.border]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {gridLines}

        <Path d={areaPath} fill="url(#areaGradient)" />
        <Path d={linePath} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {showDots &&
          points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={theme.card}
              stroke={color || theme.primary}
              strokeWidth="2"
            />
          ))}
      </Svg>
    </View>
  );
};

// Wrap with React.memo and custom comparison function
export const MiniChart = React.memo(MiniChartComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  return (
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.color === nextProps.color &&
    prevProps.showDots === nextProps.showDots &&
    prevProps.showGrid === nextProps.showGrid &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
