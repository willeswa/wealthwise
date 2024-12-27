import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';

interface ScreenBackgroundProps {
  color1: string;
  color2: string;
}

export const ScreenBackground = ({ color1, color2 }: ScreenBackgroundProps) => {
  return (
    <View style={styles.decorativeBg}>
      <View style={[styles.circle1, { backgroundColor: color1 }]} />
      <View style={[styles.circle2, { backgroundColor: color2 }]} />
      <BlurView intensity={60} style={StyleSheet.absoluteFill} />
    </View>
  );
};

const styles = StyleSheet.create({
  decorativeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
  },
  circle2: {
    position: 'absolute',
    top: 50,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.1,
  },
});
