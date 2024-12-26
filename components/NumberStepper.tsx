import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
}

export const NumberStepper = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = '%',
}: NumberStepperProps) => {
  const handleIncrease = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleDecrease = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleChangeText = (text: string) => {
    const num = parseFloat(text);
    if (isNaN(num)) return;
    const newValue = Math.min(max, Math.max(min, num));
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          onPress={handleDecrease}
          style={styles.button}
        >
          <MaterialCommunityIcons name="minus" size={24} color="#4B7BE5" />
        </TouchableOpacity>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={value.toString()}
            onChangeText={handleChangeText}
            keyboardType="numeric"
            selectTextOnFocus
            maxLength={5}
          />
          <Text style={styles.unit}>{unit}</Text>
        </View>

        <TouchableOpacity 
          onPress={handleIncrease}
          style={styles.button}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#4B7BE5" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F6FA',
    borderRadius: 32,
    padding: 8,
  },
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#FFF',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    fontSize: 24,
    fontWeight: '600',
    color: '#232D59',
    textAlign: 'center',
    padding: 8,
    minWidth: 60,
  },
  unit: {
    fontSize: 20,
    color: '#666',
    marginLeft: 4,
  },
});
