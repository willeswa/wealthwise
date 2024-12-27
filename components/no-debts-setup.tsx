import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { colors } from '../utils/colors';

interface Props {
  onSetupDebt: () => void;
  onCancel: () => void;
}

export const NoDebtsSetup = ({ onSetupDebt, onCancel }: Props) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.text.light} />
      <Text style={styles.title}>No Debts Found</Text>
      <Text style={styles.message}>
        You need to set up your debt details before you can add debt repayment expenses.
      </Text>
      <View style={styles.actions}>
        <Button 
          title="Set Up Debt" 
          onPress={onSetupDebt}
        />
        <Button 
          title="Cancel" 
          onPress={onCancel}
          variant="secondary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 8,
  },
  message: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
});
