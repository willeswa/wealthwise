import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePreferencesStore } from '../store/preferences-store';
import { CountryDropdown } from './CountryDropdown';
import { SUPPORTED_COUNTRIES } from '../utils/constants/countries';
import { AiPreferencesSelector } from './AiPreferencesSelector';
import { FinancialGoal } from '../utils/types/preferences';
import { colors } from '../utils/colors';
import { Dropdown } from './Dropdown';
import { Ionicons } from '@expo/vector-icons';

const FINANCIAL_GOALS: { value: FinancialGoal; label: string; icon: string }[] = [
  { value: 'DEBT_FREE', label: 'Become Debt Free', icon: 'card-outline' },
  { value: 'SAVE_EMERGENCY', label: 'Build Emergency Fund', icon: 'umbrella-outline' },
  { value: 'INVEST_FUTURE', label: 'Invest for Future', icon: 'trending-up' },
  { value: 'BUILD_WEALTH', label: 'Build Long-term Wealth', icon: 'diamond-outline' },
  { value: 'START_BUSINESS', label: 'Start a Business', icon: 'briefcase-outline' }
];

export const PreferencesManager = () => {
  const { country, primaryGoal, aiEnabled, setPreferences } = usePreferencesStore();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const goalOptions = FINANCIAL_GOALS.map(goal => ({
    label: goal.label,
    value: goal.value,
    icon: goal.icon
  }));

  return (
    <View style={styles.container}>
      <View style={[
        styles.section,
        showCountryPicker && styles.sectionExpanded
      ]}>
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

      <View style={[
        styles.section,
        showGoalPicker && styles.sectionExpanded
      ]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background.success }]}>
            <Ionicons name="flag" size={18} color={colors.success} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.sectionTitle}>Primary Financial Goal</Text>
            <Text style={styles.sectionDescription}>
              Select your main financial objective
            </Text>
          </View>
        </View>
        <Dropdown
          label="Goal"
          value={primaryGoal}
          options={goalOptions}
          showPicker={showGoalPicker}
          onPress={() => setShowGoalPicker(!showGoalPicker)}
          onSelect={(option) => {
            setPreferences({ primaryGoal: option.value as FinancialGoal });
            setShowGoalPicker(false);
          }}
          placeholder="Select your primary goal"
        />
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
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
    zIndex: 1, // Base z-index
  },
  sectionExpanded: {
    zIndex: 2, // Increased z-index when expanded
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
