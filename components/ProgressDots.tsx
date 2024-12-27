import { ONBOARDING_STEPS } from '@/app/onboarding';
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface ProgressDotsProps {
  total: number;
  current: number;
  completed?: { [key: string]: boolean };
}

export const ProgressDots = ({ total, current, completed }: ProgressDotsProps) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === current && styles.activeDot,
            completed?.[ONBOARDING_STEPS[index].id] && styles.completedDot
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  activeDot: {
    backgroundColor: '#232D59',
    transform: [{ scale: 1.2 }],
  },
  completedDot: {
    backgroundColor: '#7986CB',
  },
});
