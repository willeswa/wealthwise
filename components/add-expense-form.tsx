import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { Dropdown, DropdownOption } from './Dropdown';
import { CurrencyType, Numpad } from './Numpad';
import { CategoryType } from './type';
import { CustomDatePicker } from './CustomDatePicker';

const CURRENCIES: CurrencyType[] = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: 'KES', code: 'KES', name: 'Kenyan Shilling' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
];

// Expense specific categories
const CATEGORIES: CategoryType[] = [
  { id: '1', name: 'Food', icon: 'food' },
  { id: '2', name: 'Transport', icon: 'car' },
  { id: '3', name: 'Shopping', icon: 'shopping' },
  { id: '4', name: 'Bills', icon: 'receipt' },
  { id: '5', name: 'Entertainment', icon: 'movie' },
  { id: '6', name: 'Healthcare', icon: 'hospital' },
  { id: '7', name: 'Education', icon: 'school' },
];

const PADDING_HORIZONTAL = 16;

export const AddExpenseScreen = () => {
  const [amount, setAmount] = useState("0.00");
  const [comment, setComment] = useState("");
  const [currency, setCurrency] = useState<CurrencyType>(CURRENCIES[0]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CATEGORIES[0]);
  const commentInputRef = useRef<TextInput>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ...existing keyboard effect code...

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
    console.log("Confirmed Expense:", {
      amount,
      comment,
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

  const categoryOptions: DropdownOption[] = CATEGORIES.map(c => ({
    id: c.id,
    label: c.name,
    value: c.id,
    icon: c.icon
  }));

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Expense</Text>
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

        <TextInput
          ref={commentInputRef}
          style={styles.commentInput}
          placeholder="Add comment..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
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
          title="Add Expense"
          onPress={handleConfirm}
        />
      </View>

      <CustomDatePicker
        show={showDatePicker}
        value={date}
        onChange={handleDateChange}
        onClose={() => setShowDatePicker(false)}
        title="Due Date"
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
  commentInput: {
    fontSize: 16,
    color: "#8A8A8A",
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 24,
    paddingHorizontal: 8,
    height: 40,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  bottomContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopColor: '#EAEAEA',
  },
});
