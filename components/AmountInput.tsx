import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AmountInputProps {
  amount: string;
  currencySymbol: string;
}

const formatAmount = (amount: string) => {
  // Remove any existing commas first
  const cleanAmount = amount.replace(/,/g, '');
  
  // Split into whole and decimal parts
  const [whole, decimal] = cleanAmount.split('.');
  
  // Add commas to whole number part
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Return formatted number with decimal part if it exists
  return decimal ? `${formattedWhole}.${decimal}` : formattedWhole;
};

export const AmountInput: React.FC<AmountInputProps> = ({ amount, currencySymbol }) => {
  return (
    <View style={styles.amountContainer}>
      <Text style={styles.currencySymbol}>{currencySymbol}</Text>
      <Text 
        style={styles.amountInput}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {formatAmount(amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#F5F6FA',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    minHeight: 100, // Add minimum height to prevent layout shifts
  },
  currencySymbol: {
    fontSize: 24,
    color: '#8A8A8A',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 53,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    flexShrink: 1, // Allow text to shrink
    maxWidth: '80%', // Prevent text from getting too close to edges
  },
});
