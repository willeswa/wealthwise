import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GoalSelector } from './GoalSelector';
import { usePreferencesStore } from '../store/preferences-store';
import { useModalStore } from '../store/modal-store';
import { Button } from './Button';
import { FinancialGoal } from '../utils/types/preferences';

export const EditGoalsModal = () => {
  const { primaryGoal, setPreferences } = usePreferencesStore();
  const { closeModal } = useModalStore();
  const [tempGoal, setTempGoal] = useState<FinancialGoal | null>(primaryGoal);

  const handleUpdate = (goal: FinancialGoal) => {
    setTempGoal(goal);
  };

  const handleSave = () => {
    if (tempGoal) {
      setPreferences({ primaryGoal: tempGoal });
      closeModal();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financial Goals</Text>
      <View style={styles.content}>
        <GoalSelector 
          value={tempGoal}
          onSelect={handleUpdate}
        />
      </View>
      <Button 
        onPress={handleSave} 
        disabled={!tempGoal} // Fixed: Now disabled when there's no goal
        title='Save'
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#929ABE",
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
