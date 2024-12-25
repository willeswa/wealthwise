import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  showPicker,
  onPress,
  onSelect,
  renderIcon,
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.container}>
      <Pressable style={styles.selector} onPress={onPress}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
        <View style={styles.valueContainer}>
          {renderIcon && selectedOption && renderIcon(selectedOption)}
          <Text style={styles.value} numberOfLines={1}>
            {selectedOption?.label}
          </Text>
          <MaterialCommunityIcons name={showPicker ? "chevron-up" : "chevron-down"} size={24} color="#8A8A8A" />
        </View>
      </Pressable>

      {showPicker && (
        <View style={styles.optionsContainer}>
          <View style={styles.options}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.option,
                  value === option.value && styles.optionSelected
                ]}
                onPress={() => onSelect(option)}
              >
                {renderIcon && renderIcon(option)}
                <Text style={[
                  styles.optionText,
                  value === option.value && styles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
                {value === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 24,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    zIndex: 1000,
  },
  options: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
});
