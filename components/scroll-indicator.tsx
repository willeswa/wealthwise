import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type Props = {
  scrollY: Animated.Value;
  maxScroll: number;
};

export const ScrollIndicator = ({ scrollY, maxScroll }: Props) => {
  const opacity = scrollY.interpolate({
    inputRange: [0, maxScroll],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name="chevron-up" 
          size={24} 
          color="#FF9900" 
        />
        <MaterialCommunityIcons 
          name="chevron-down" 
          size={24} 
          color="#FF9900" 
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    right: -18,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 2,
    transform: [{ translateY: -25 }], // Half of container height to center
    elevation: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // height: 50,
  },
});
