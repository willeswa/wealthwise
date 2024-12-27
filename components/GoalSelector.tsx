import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FinancialGoal } from '../utils/types/preferences';
import { Button } from './Button';

interface GoalSelectorProps {
  onSelect: (goal: FinancialGoal) => void;
  value: FinancialGoal | null; // Add value prop
}

const GOALS: { value: FinancialGoal; label: string; description: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  {
    value: 'DEBT_FREE',
    label: 'Become Debt Free',
    description: 'Focus on clearing all your debts',
    icon: 'cash-remove'
  },
  {
    value: 'SAVE_EMERGENCY',
    label: 'Build Emergency Fund',
    description: '3-6 months of expenses saved',
    icon: 'umbrella'
  },
  {
    value: 'INVEST_FUTURE',
    label: 'Start Investing',
    description: 'Grow wealth through investments',
    icon: 'trending-up'
  },
  {
    value: 'BUILD_WEALTH',
    label: 'Build Long-term Wealth',
    description: 'Focus on assets and passive income',
    icon: 'bank'
  },
 
];

export const GoalSelector = ({ onSelect, value }: GoalSelectorProps) => {
  const [selected, setSelected] = useState<FinancialGoal | null>(value); // Initialize with value

  const handleGoalSelect = (goal: FinancialGoal) => {
    setSelected(goal);
    onSelect(goal); // Call onSelect immediately when goal is selected
  };

  return (
    <View style={styles.container}>
      <Text style={styles.helpText}>
        Select the goal that best matches your primary financial objective
      </Text>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.goalsContainer}
        showsVerticalScrollIndicator={false}
      >
        {GOALS.map((goal) => (
          <Pressable
            key={goal.value}
            style={[
              styles.goal,
              selected === goal.value && styles.goalSelected
            ]}
            onPress={() => handleGoalSelect(goal.value)}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons 
                name={goal.icon} 
                size={18} 
                color={selected === goal.value ? '#fff' : '#232D59'} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[
                styles.label,
                selected === goal.value && styles.labelSelected
              ]}>
                {goal.label}
              </Text>
              <Text style={[
                styles.description,
                selected === goal.value && styles.descriptionSelected
              ]}>
                {goal.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  goalsContainer: {
    gap: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  helpText: {
    fontSize: 15,
    color: '#232D59',
    fontWeight: '500',
    marginBottom: 24,
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 20,
  },
  goalSelected: {
    backgroundColor: '#232D59',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232D59',
    letterSpacing: -0.3,
  },
  labelSelected: {
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginTop: 2,
  },
  descriptionSelected: {
    color: '#fff',
    opacity: 0.8,
  },
  continueButton: {
    width: '100%',
    marginTop: 24,
    marginBottom: 0,
  },
});
