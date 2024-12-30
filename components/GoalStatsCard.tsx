import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { FinancialGoal } from '../utils/types/preferences';
import { useModalStore } from '../store/modal-store';

interface GoalStatsProps {
  goal: FinancialGoal;
}

export const GoalStatsCard = ({ goal }: GoalStatsProps) => {
  const { openModal } = useModalStore();
  
  return (
    <Pressable 
      onPress={() => openModal('edit-goals')} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Financial Goal</Text>
        <Ionicons name="pencil" size={16} color={colors.accent} />
      </View>
      
      <View style={styles.goalContainer}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background.success }]}>
          <Ionicons name="flag" size={24} color={colors.success} />
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalName}>{goal.label}</Text>
          <Text style={styles.goalDescription}>{goal.description}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
    color: colors.text.secondary,
  },
});
