import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { motion, radius, spacing, useTheme } from '@/theme';

type SegmentState = 'completed' | 'current' | 'upcoming';

function Segment({ state }: { state: SegmentState }) {
  const theme = useTheme();
  const fill = useSharedValue(state === 'upcoming' ? 0 : 100);

  useEffect(() => {
    fill.value = withTiming(state === 'upcoming' ? 0 : 100, { duration: motion.base });
  }, [fill, state]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));

  return (
    <View
      style={{
        flex: 1,
        height: 4,
        borderRadius: radius.sm,
        borderCurve: 'continuous' as const,
        backgroundColor: theme.colors.border,
        overflow: 'hidden',
      }}>
      <Animated.View style={[{ height: '100%', backgroundColor: theme.colors.accent }, animatedStyle]} />
    </View>
  );
}

type StepIndicatorProps = {
  currentStepIndex: number;
  totalSteps: number;
  isCurrentStepOptional: boolean;
};

export function StepIndicator({ currentStepIndex, totalSteps, isCurrentStepOptional }: StepIndicatorProps) {
  const stepNumber = currentStepIndex + 1;

  return (
    <View
      style={{ gap: spacing.xs, paddingHorizontal: spacing.md, paddingTop: spacing.sm }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: totalSteps, now: stepNumber }}
      accessibilityLabel={`Step ${stepNumber} of ${totalSteps}`}>
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <Segment key={index} state={index < currentStepIndex ? 'completed' : index === currentStepIndex ? 'current' : 'upcoming'} />
        ))}
      </View>
      <ThemedText variant="caption" color="textSecondary" style={{ fontVariant: ['tabular-nums'] }}>
        Step {stepNumber} of {totalSteps}
        {isCurrentStepOptional ? ' (optional)' : ''}
      </ThemedText>
    </View>
  );
}
