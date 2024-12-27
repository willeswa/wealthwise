import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from './Button';
import { usePreferencesStore } from '../store/preferences-store';
import { AmountInput } from './AmountInput';

interface CurrencyInputProps {
  onSubmit: (amount: number) => void;
  onChange: (amount: number) => void; // Add this new prop
}

export const CurrencyInput = ({ onSubmit, onChange }: CurrencyInputProps) => {
  const [value, setValue] = useState('');
  const { currency } = usePreferencesStore();

  const handleValueChange = (text: string) => {
    setValue(text);
    const amount = parseFloat(text);
    if (!isNaN(amount) && amount > 0) {
      onChange(amount); // Call onChange when we have a valid amount
    } else {
      onChange(0);
    }
  };

  const handleSubmit = () => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      onSubmit(amount);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <Text style={styles.helpText}>
          Enter your average monthly income after tax
        </Text>
        <AmountInput
          amount={value}
          currencySymbol={currency}
          onChangeValue={handleValueChange}
          useSystemKeyboard={true}
          label="Monthly Income"
        />
        <Text style={styles.tipText}>
          This helps us suggest appropriate saving and investment targets
        </Text>
      </View>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  inputSection: {
    flex: 1,
    paddingTop: 24,
    gap: 20,
  },
  continueButton: {
    width: '100%',
    marginBottom: 0, // Remove bottom margin as it's handled by parent
  },
  helpText: {
    fontSize: 15,
    color: '#232D59',
    fontWeight: '500',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
