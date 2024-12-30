import { usePreferencesStore } from '@/store/preferences-store';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AiPreferencesSelector } from '../../components/AiPreferencesSelector';
import { CountryDropdown } from '../../components/CountryDropdown';
import { GoalStatsCard } from '../../components/GoalStatsCard';
import { ProfileStatsCard } from '../../components/ProfileStatsCard';
import { colors } from '../../utils/colors';
import { SUPPORTED_COUNTRIES } from '../../utils/constants/countries';

export default function SettingsModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { householdProfile, primaryGoal, country, aiEnabled, setPreferences } = usePreferencesStore();
  
  const [showCountryPicker, setShowCountryPicker] = useState(false);

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
          <ProfileStatsCard 
            householdProfile={householdProfile}
          />
          <GoalStatsCard
            goal={primaryGoal}
          />

          {/* Country Selection */}
          <View style={[styles.section, showCountryPicker && styles.sectionExpanded]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background.accent }]}>
                <Ionicons name="globe-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.sectionTitle}>Location & Currency</Text>
                <Text style={styles.sectionDescription}>
                  Choose your location to get personalized features
                </Text>
              </View>
            </View>
            <CountryDropdown
              value={country}
              options={SUPPORTED_COUNTRIES}
              showPicker={showCountryPicker}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
              onSelect={(country) => {
                setPreferences({ country: country.code, currency: country.currency });
                setShowCountryPicker(false);
              }}
              showLabels={false}
            />
          </View>

         
          {/* AI Features */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background.warning }]}>
                <Ionicons name="flash" size={18} color={colors.warning} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.sectionTitle}>AI Features</Text>
                <Text style={styles.sectionDescription}>
                  Choose how you want AI to assist you
                </Text>
              </View>
            </View>
            <AiPreferencesSelector
              value={aiEnabled}
              onSelect={(enabled) => setPreferences({ aiEnabled: enabled })}
            />
          </View>

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
    gap: 24, 
    paddingHorizontal: 16,
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1,
  },
  sectionExpanded: {
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
