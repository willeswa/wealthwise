import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { Dropdown, DropdownOption } from './Dropdown';
import { CurrencyType, Numpad } from './Numpad';
import { CategoryType } from './type';
import { CustomDatePicker } from './CustomDatePicker';

// Add currency types

const CURRENCIES: CurrencyType[] = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: 'KES', code: 'KES', name: 'Kenyan Shilling' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
];

// Add category types

const CATEGORIES: CategoryType[] = [
  { id: '1', name: 'Salary', icon: 'cash' },
  { id: '2', name: 'Business', icon: 'store' },
  { id: '3', name: 'Investment', icon: 'chart-line' },
  { id: '4', name: 'Freelance', icon: 'laptop' },
  { id: '5', name: 'Gift', icon: 'gift' },
];

type FrequencyType = 'weekly' | 'monthly' | 'yearly';

const FREQUENCIES: { label: string; value: FrequencyType }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

// Calculate dimensions
const PADDING_HORIZONTAL = 16;

export const AddIncomeScreen = () => {
  const [amount, setAmount] = useState("0.00");
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [currency, setCurrency] = useState<CurrencyType>(CURRENCIES[0]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CATEGORIES[0]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleNumberPress = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (amount === "0.00") {
      setAmount(num === "." ? "0." : num);
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (amount.length <= 1 || amount === "0.") {
      setAmount("0.00");
    } else {
      setAmount((prev) => prev.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    console.log("Confirmed Income:", {
      amount,
      frequency,
      category: selectedCategory,
      currency,
      date
    });
  };

  const selectCurrency = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
  };

  const handleCategoryPress = () => {
    setShowCategoryPicker(!showCategoryPicker);
  };

  const selectCategory = (category: CategoryType) => {
    setSelectedCategory(category);
    setShowCategoryPicker(false);
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const toggleFrequencyPicker = () => {
    setShowFrequencyPicker(!showFrequencyPicker);
  };

  const frequencyOptions: DropdownOption[] = FREQUENCIES.map(f => ({
    label: f.label,
    value: f.value
  }));

  const categoryOptions: DropdownOption[] = CATEGORIES.map(c => ({
    id: c.id,
    label: c.name,
    value: c.id,
    icon: c.icon
  }));

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Income</Text>
        <AmountInput 
          amount={amount}
          currencySymbol={currency.symbol}
        />
        
        <Dropdown
          label="Category"
          value={selectedCategory.id}
          options={categoryOptions}
          showPicker={showCategoryPicker}
          onPress={handleCategoryPress}
          onSelect={(option) => {
            const category = CATEGORIES.find(c => c.id === option.value)!;
            selectCategory(category);
          }}
          renderIcon={(option) => (
            <MaterialCommunityIcons 
              name={option.icon as any} 
              size={18} 
              color="#232D59" 
            />
          )}
        />

        <Dropdown
          label="Frequency"
          value={frequency}
          options={frequencyOptions}
          showPicker={showFrequencyPicker}
          onPress={toggleFrequencyPicker}
          onSelect={(option) => {
            setFrequency(option.value as FrequencyType);
            setShowFrequencyPicker(false);
          }}
            renderIcon={(option) => (
            <MaterialCommunityIcons 
              name={option.icon as any} 
              size={18} 
              color="#232D59" 
            />
          )}
        />

        <Numpad
          onNumberPress={handleNumberPress}
          onDelete={handleDelete}
          onCurrencySelect={selectCurrency}
          currencies={CURRENCIES}
          selectedCurrency={currency}
          date={date}
          onDatePress={handleDatePress}
          showDatePicker={showDatePicker}
        />
      </View>

      <View style={styles.bottomContainer}>
        <Button 
          title="Add Income"
          onPress={handleConfirm}
        />
      </View>

      <CustomDatePicker
        show={showDatePicker}
        value={date}
        onChange={handleDateChange}
        onClose={() => setShowDatePicker(false)}
        title="Pay Date"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#929ABE",
  },
  bottomContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopColor: '#EAEAEA',
  },
});
