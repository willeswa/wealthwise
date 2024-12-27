import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import CountryFlag from "react-native-country-flag";

export interface DropdownOption {
  id?: string;
  label: string;
  value: string;
  icon?: string;
}

interface DropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  showPicker: boolean;
  onPress: () => void;
  onSelect: (option: DropdownOption) => void;
  renderIcon?: (option: DropdownOption) => React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  selectorStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  showPicker,
  onPress,
  onSelect,
  renderIcon,
  containerStyle,
  selectorStyle,
  placeholder,
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable style={[styles.selector, selectorStyle]} onPress={onPress}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <View style={styles.valueContainer}>
          {selectedOption && (
            <CountryFlag
              isoCode={selectedOption.value}
              size={20}
              style={styles.flag}
            />
          )}
          <Text style={[
            styles.value,
            !selectedOption && styles.placeholder
          ]} numberOfLines={1}>
            {selectedOption?.label || placeholder}
          </Text>
          <MaterialCommunityIcons name={showPicker ? "chevron-up" : "chevron-down"} size={24} color="#8A8A8A" />
        </View>
      </Pressable>

      {showPicker && (
        <View style={styles.optionsContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={false}
            nestedScrollEnabled={true}
          >
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.option,
                  value === option.value && styles.optionSelected
                ]}
                onPress={() => onSelect(option)}
              >
                <CountryFlag
                  isoCode={option.value}
                  size={20}
                  style={styles.flag}
                />
                <Text style={[
                  styles.optionText,
                  value === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
                {value === option.value && (
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={20} 
                    color="#007AFF" 
                  />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F6FA',
    borderRadius: 32,
  },
  label: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
    marginRight: 8,
    fontWeight: '900',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 16,
    color: '#007AFF',
  },
  optionsContainer: {
    marginTop: 4,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: 300, // Set a maximum height
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexGrow: 0,
  },
  options: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  optionSelected: {
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  optionTextSelected: {
    color: '#007AFF',
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    color: '#8A8A8A',
  },
  flag: {
    borderRadius: 2,
    marginRight: 8,
  },
});
