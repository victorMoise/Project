import { useEffect } from 'react';
import { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { motion } from '@/theme';

const SHAKE_DISTANCE = 6;

// `trigger` is a token that increments each time this field should shake
// (see FormWizard/FormPage's shakeTokens state). Reacting to it in an effect
// -- rather than exposing an imperative shake() function -- keeps the
// `.value` mutation where react-hooks/immutability already accepts it: a
// hook mutating its own shared value in response to a prop change, the same
// shape as StepIndicator's segment fill.
export function useShake(trigger: number) {
  const reducedMotion = useReducedMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (trigger === 0 || reducedMotion) {
      // Reduce Motion is on, or nothing has asked for a shake yet: the error
      // is still communicated through the field's red border, message and a
      // haptic -- just no movement.
      return;
    }
    // Four keyframes summing to motion.base, so a shake takes as long as
    // any other step transition in the wizard.
    const step = motion.base / 5;
    offset.value = withSequence(
      withTiming(-SHAKE_DISTANCE, { duration: step }),
      withTiming(SHAKE_DISTANCE, { duration: step * 2 }),
      withTiming(-SHAKE_DISTANCE, { duration: step * 1.5 }),
      withTiming(0, { duration: step * 0.5 })
    );
  }, [offset, reducedMotion, trigger]);

  return useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));
}
