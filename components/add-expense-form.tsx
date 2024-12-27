import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useExpenseStore } from '../store/expense-store';
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { CustomDatePicker } from './CustomDatePicker';
import { Dropdown, DropdownOption } from './Dropdown';
import { CurrencyType, Numpad } from './Numpad';
import { CategoryType } from './type';
import { useModalStore } from '../store/modal-store';

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
  { id: '5', name: 'Entertainment', icon: 'movie' },
  { id: '6', name: 'Healthcare', icon: 'hospital' },
  { id: '7', name: 'Education', icon: 'school' },
  { id: '8', name: 'Rent', icon: 'home' },
  { id: '9', name: 'Utilities', icon: 'water' },
  { id: '10', name: 'Insurance', icon: 'shield' },
  { id: '11', name: 'Other', icon: 'dots-horizontal' },
];

const PADDING_HORIZONTAL = 16;

export const AddExpenseScreen = () => {
  const navigation = useNavigation();
  const { addNewExpense, defaultCurrency, setDefaultCurrency: updateDefaultCurrency } = useExpenseStore();
  const { closeModal } = useModalStore();
  const [amount, setAmount] = useState("0.00");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState<CurrencyType>(() => {
    // Initialize with default currency or fallback to USD
    return CURRENCIES.find(c => c.code === defaultCurrency) || CURRENCIES[0];
  });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CATEGORIES[0]);
  const commentInputRef = useRef<TextInput>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleConfirm = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Convert amount string to number, removing any currency formatting
      const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));

      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      if (!name.trim()) {
        alert('Please enter a name for the expense');
        return;
      }

      const expenseData = {
        name: name.trim(),
        amount: numericAmount,
        currency: currency.code,
        category: selectedCategory.name,
        comment: comment.trim(),
        date: format(date, 'yyyy-MM-dd')
      };
      
      await addNewExpense(expenseData);
      
      // Reset form
      setName("");
      setAmount("0.00");
      setComment("");
      setSelectedCategory(CATEGORIES[0]);
      setDate(new Date());
      
      closeModal();

    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCurrency = async (newCurrency: CurrencyType) => {
    if (newCurrency.code === currency.code) return;
    
    try {
      await updateDefaultCurrency(newCurrency.code);
      setCurrency(newCurrency);
    } catch (error) {
      console.error('Error updating currency:', error);
    }
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
    value: c.name,
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
        
        <TextInput
          style={styles.nameInput}
          placeholder="Expense name"
          value={name}
          onChangeText={setName}
          maxLength={50}
        />

        <Dropdown
          label="Category"
          value={selectedCategory.name}
          options={categoryOptions}
          showPicker={showCategoryPicker}
          onPress={handleCategoryPress}
          onSelect={(option) => {
            const category = CATEGORIES.find(c => c.name === option.value)!;
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
          title={isSubmitting ? "Adding..." : "Add Expense"}
          onPress={handleConfirm}
          disabled={isSubmitting || parseFloat(amount) <= 0}
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
  nameInput: {
    fontSize: 16,
    color: "#8A8A8A",
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 16,
    paddingHorizontal: 8,
    height: 40,
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
