import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../utils/colors";
import { useModalStore } from '@/store/modal-store';

interface AppBarProps {
  title: string;
  subtitle?: string;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export const AppBar = ({ title, subtitle }: AppBarProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const buttonScale = useSharedValue(1);
  const isModalVisible = useModalStore(state => state.isModalVisible);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 15 });
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15 });
  };

  if (isModalVisible) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AnimatedBlurView
        tint="light"
        intensity={80}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <Animated.View style={[animatedButtonStyle]}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push("/modals/settings")}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <View style={styles.buttonInner}>
              <Ionicons 
                name="settings-outline" 
                size={22} 
                color={colors.text.primary} 
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <View style={styles.bottomBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingVertical: 8,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: Platform.OS === 'ios' ? '700' : '600',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Platform.OS === 'ios' 
      ? 'rgba(255,255,255,0.9)' 
      : 'rgba(255,255,255,1)',
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
});
