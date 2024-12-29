import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FinancialGoal, GOALS } from '../utils/types/preferences';

interface GoalSelectorProps {
  onSelect: (goal: FinancialGoal) => void;
  value: FinancialGoal | null;
  customGoals?: FinancialGoal[] | null;
  isLoading?: boolean;
}

export const GoalSelector = ({ 
  onSelect, 
  value, 
  customGoals, 
  isLoading 
}: GoalSelectorProps) => {
  const [selected, setSelected] = useState<FinancialGoal | null>(value);

  const handleGoalSelect = (goal: FinancialGoal) => {
    setSelected(goal);
    onSelect(goal); // Call onSelect immediately when goal is selected
  };

  // Determine which goals to show
  const goalsToShow = useMemo(() => {
    if (customGoals && customGoals.length > 0) {
      return customGoals;
    }
    return GOALS;
  }, [customGoals]);

  return (
    <View style={styles.container}>
      <Text style={styles.helpText}>
        Select the goal that best matches your primary financial objective
      </Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#232D59" />
          <Text style={styles.loadingText}>Customizing goals for your region...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.goalsContainer}
          showsVerticalScrollIndicator={false}
        >
          {goalsToShow.map((goal) => (
            <Pressable
              key={goal.value}
              style={[
                styles.goal,
                selected === goal && styles.goalSelected
              ]}
              onPress={() => handleGoalSelect(goal)}
            >
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={goal.icon} 
                  size={18} 
                  color={selected === goal ? '#fff' : '#232D59'} 
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[
                  styles.label,
                  selected?.value === goal.value && styles.labelSelected
                ]}>
                  {goal.label}
                </Text>
                <Text style={[
                  styles.description,
                  selected?.value === goal.value && styles.descriptionSelected
                ]}>
                  {goal.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
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
    paddingVertical: 12, // Increased vertical padding
    paddingHorizontal: 16, // Increased horizontal padding
    borderRadius: 16,
    gap: 4, // Increased gap between icon and text
    marginHorizontal: 4, // Add slight margin for better edge spacing
  },
  goalSelected: {
    backgroundColor: '#232D59',
  },
  iconContainer: {
    width: 44, // Slightly larger icon container
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 6, // Increased gap between label and description
    paddingRight: 8, // Add some padding on the right for text
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
