import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CountryFlag from "react-native-country-flag";
import { Dropdown } from './Dropdown';
import { CountryInfo } from '../utils/constants/countries';

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
  const dropdownOptions = options.map(country => ({
    label: country.name,
    value: country.code
  }));

  const renderFlag = (option: { value: string }) => (
    <CountryFlag
      isoCode={option.value}
      size={20}
      style={styles.flag}
    />
  );

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
      <Dropdown
        label="Country"
        value={value}
        options={dropdownOptions}
        showPicker={showPicker}
        onPress={onPress}
        onSelect={(option) => {
          const country = options.find(c => c.code === option.value);
          if (country) {
            onSelect(country);
          }
        }}
        renderIcon={renderFlag}
        placeholder="Choose your country"
        containerStyle={[
          styles.dropdown,
          showLabels && styles.dropdownWithLabels
        ]}
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
  dropdown: {
    zIndex: 1000,
  },
  dropdownWithLabels: {
    marginTop: 8,
  },
  flag: {
    borderRadius: 2,
  },
});
