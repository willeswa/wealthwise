import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AiPreferencesSelectorProps {
  onSelect: (enabled: boolean) => void;
  value: boolean | null; // Add value prop
}

const OPTIONS = [
  {
    value: true,
    label: 'Enable AI Insights',
    description: 'Get personalized financial recommendations',
    icon: 'robot' as const,
    benefits: ['Smart budgeting tips', 'Investment suggestions']
  },
  {
    value: false,
    label: 'Standard Mode',
    description: 'Use basic features only',
    icon: 'shield' as const,
    benefits: ['Complete privacy', 'Manual control']
  }
];

export const AiPreferencesSelector = ({ onSelect, value }: AiPreferencesSelectorProps) => {
  const [selected, setSelected] = useState<boolean | null>(value); // Initialize with value

  return (
    <View style={styles.container}>
      <Text style={styles.helpText}>
        Choose how you want WealthWise to help you
      </Text>
      
      <View style={styles.optionsContainer}>
        {OPTIONS.map((option) => (
          <Pressable
            key={String(option.value)}
            style={[
              styles.option,
              selected === option.value && styles.optionSelected
            ]}
            onPress={() => {
              setSelected(option.value);
              onSelect(option.value);
            }}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={option.icon}
                  size={22}
                  color={selected === option.value ? '#fff' : '#232D59'}
                />
              </View>
              <View style={styles.headerText}>
                <Text style={[
                  styles.label,
                  selected === option.value && styles.labelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.description,
                  selected === option.value && styles.descriptionSelected
                ]}>
                  {option.description}
                </Text>
              </View>
            </View>

            <View style={styles.benefitsContainer}>
              {option.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={14}
                    color={selected === option.value ? '#fff' : '#4CAF50'}
                  />
                  <Text style={[
                    styles.benefitText,
                    selected === option.value && styles.benefitTextSelected
                  ]}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  helpText: {
    fontSize: 15,
    color: '#232D59',
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  optionSelected: {
    backgroundColor: '#232D59',
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232D59',
  },
  labelSelected: {
    color: '#fff',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  descriptionSelected: {
    color: '#fff',
    opacity: 0.9,
  },
  benefitsContainer: {
    marginLeft: 52,
    gap: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 13,
    color: '#666',
  },
  benefitTextSelected: {
    color: '#fff',
    opacity: 0.9,
  },
});
