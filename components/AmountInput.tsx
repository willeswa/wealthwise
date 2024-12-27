import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AmountInputProps {
  amount: string;
  currencySymbol: string;
  label?: string;
  onChangeValue?: (value: string) => void;
  useSystemKeyboard?: boolean;
  onPress?: () => void;
}

const formatAmount = (amount: string) => {
  const cleanAmount = amount.replace(/,/g, '');
  const [whole, decimal] = cleanAmount.split('.');
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
};

export const AmountInput: React.FC<AmountInputProps> = ({ 
  amount, 
  currencySymbol,
  label,
  onChangeValue,
  useSystemKeyboard = false,
  onPress
}) => {
  const handleChangeText = (text: string) => {
    const sanitizedText = text.replace(/[^0-9.]/g, '');
    const parts = sanitizedText.split('.');
    const formattedText = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : sanitizedText;

    onChangeValue?.(formattedText);
  };

  const content = (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <View style={styles.currencyContainer}>
          <Text style={styles.currencySymbol}>{currencySymbol}</Text>
        </View>
        {useSystemKeyboard ? (
          <TextInput
            style={styles.amountInput}
            value={formatAmount(amount)}
            onChangeText={handleChangeText}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        ) : (
          <Text 
            style={[styles.amountInput, styles.amountText]}
            adjustsFontSizeToFit
            numberOfLines={1}
          >
            {formatAmount(amount)}
          </Text>
        )}
      </View>
    </View>
  );

  if (!useSystemKeyboard && onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minHeight: 80,
  },
  currencyContainer: {
    justifyContent: 'center',
    paddingTop: 8, // Align with the amount text
  },
  currencySymbol: {
    fontSize: 16, // Smaller font size
    color: '#8A8A8A',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    color: '#000',
    paddingLeft: 4, // Add some spacing from currency
  },
  amountText: {
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
