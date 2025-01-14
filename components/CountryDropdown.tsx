import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import CountryFlag from "react-native-country-flag";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CountryInfo } from '../utils/constants/countries';
import { CountryModal } from './CountryModal';

interface CountryDropdownProps {
  value: string;
  options: CountryInfo[];
  showPicker: boolean;
  onPress: () => void;
  onSelect: (countryInfo: CountryInfo) => void;
  showLabels?: boolean; // Make labels optional
}

export const CountryDropdown = ({
  value,
  options,
  showPicker,
  onPress,
  onSelect,
  showLabels = true, // Default to true for backward compatibility
}: CountryDropdownProps) => {
  const selectedCountry = options.find(c => c.code === value);

  return (
    <View style={styles.container}>
      {showLabels && (
        <>
          <Text style={styles.label}>Select your country</Text>
          <Text style={styles.helperText}>
            Choose from the list below to get localized features and currency
          </Text>
        </>
      )}

      <Pressable
        style={styles.selector}
        onPress={onPress}
      >
        <View style={styles.selectedCountry}>
          <CountryFlag isoCode={value} size={24} style={styles.flag} />
          <View style={styles.countryInfo}>
            <Text style={styles.countryName}>
              {selectedCountry?.name || 'Select country'}
            </Text>
            {selectedCountry && (
              <Text style={styles.currencyCode}>{selectedCountry.currency}</Text>
            )}
          </View>
        </View>
        <MaterialCommunityIcons 
          name="chevron-down" 
          size={24} 
          color="#666"
        />
      </Pressable>

      <CountryModal
        visible={showPicker}
        onClose={onPress}
        onSelect={onSelect}
        countries={options}
        selectedCountry={value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232D59',
    letterSpacing: -0.3,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    borderRadius: 4,
  },
  countryInfo: {
    gap: 2,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#232D59',
  },
  currencyCode: {
    fontSize: 14,
    color: '#666',
  },
});
