import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type Props = {
  scrollY: Animated.Value;
  maxScroll: number;
  isScrolling: boolean;
  isScrollable: boolean; // New prop
};

export const ScrollIndicator = ({ scrollY, maxScroll, isScrolling, isScrollable }: Props) => {
  const slideAnim = useRef(new Animated.Value(50)).current; // Start fully off screen
  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(true);
  
  // Listen to scroll position changes
  scrollY.addListener(({ value }) => {
    setCanScrollUp(value > 0);
    setCanScrollDown(value < maxScroll - 50); // Add small buffer
  });

  // Hide indicator completely when near bottom
  const baseOpacity = scrollY.interpolate({
    inputRange: [0, maxScroll - 100], // Start fading out earlier
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Only show when not scrolling AND not near bottom
  const finalOpacity = Animated.multiply(
    baseOpacity,
    !isScrolling ? 1 : 0
  );

  useEffect(() => {
    if (!isScrolling && canScrollDown) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
        velocity: 3
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: 50, // Move completely off screen
        useNativeDriver: true,
        tension: 65,
        friction: 10
      }).start();
    }

    // Cleanup listener
    return () => {
      scrollY.removeAllListeners();
    };
  }, [isScrolling, canScrollDown]);

  // Don't render if content isn't scrollable
  if (!isScrollable) return null;

  // Don't render at all if we're at the bottom
  if (!canScrollDown) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: finalOpacity,
          transform: [
            { translateX: slideAnim },
            { translateY: -24 }
          ]
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name="chevron-up" 
          size={20} 
          color={canScrollUp ? "#FF9900" : "#929ABE"} 
        />
        <MaterialCommunityIcons 
          name="chevron-down" 
          size={20} 
          color={canScrollDown ? "#FF9900" : "#929ABE"} 
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    right: -14, // Slightly off screen to avoid seeing the edge
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
