import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  disabled?: boolean;
}

export const Button = ({ title, disabled, style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
    >
      <Text style={[
        styles.buttonText,
        disabled && styles.buttonTextDisabled
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#232D59',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 32,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#888888',
  },
});
