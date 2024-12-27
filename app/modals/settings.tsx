import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PreferencesManager } from '../../components/preferences-manager';
import { colors } from '../../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

export default function SettingsModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.decorativeBg}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <BlurView intensity={60} style={StyleSheet.absoluteFill} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Personalize your experience</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { minHeight: height - 140 } // Ensure content fills screen
        ]}
        keyboardShouldPersistTaps="handled" // Important for dropdown interaction
        showsVerticalScrollIndicator={false}
        bounces={true} // Enable bouncing for better UX
      >
        <View style={styles.contentWrapper}>
          <PreferencesManager />
          
          <View style={styles.footer}>
            <Text style={styles.version}>WealthWise v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  decorativeBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: colors.background.highlight,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    opacity: 0.1,
  },
  circle2: {
    position: 'absolute',
    top: 50,
    left: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.success,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12, // Reduced from 20
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12, // Reduced from 16
    paddingBottom: 24, // Add extra padding at bottom
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 16, // Added gap for consistent spacing
  },
  footer: {
    marginTop: 24, // Reduced from 40
    paddingVertical: 16, // Reduced from 20
    borderTopWidth: 1,
    borderTopColor: colors.background.highlight,
    alignItems: 'center',
    gap: 12, // Reduced from 16
  },
  version: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 15,
    color: colors.warning,
    fontWeight: '500',
  },
});
