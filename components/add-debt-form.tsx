import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View, ScrollView, Animated } from "react-native";
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { Dropdown, DropdownOption } from './Dropdown';
import { CurrencyType, Numpad } from './Numpad';
import { CustomDatePicker } from './CustomDatePicker';
import { ScrollIndicator } from './scroll-indicator';

const CURRENCIES: CurrencyType[] = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: 'KES', code: 'KES', name: 'Kenyan Shilling' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
];

type FrequencyType = 'one-time' | 'weekly' | 'monthly' | 'yearly';

const FREQUENCIES: { label: string; value: FrequencyType }[] = [
  { label: 'One-time', value: 'one-time' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

const PADDING_HORIZONTAL = 16;

export const AddDebtScreen = () => {
  const [amount, setAmount] = useState("0.00");
  const [creditorName, setCreditorName] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState<CurrencyType>(CURRENCIES[0]);
  const [frequency, setFrequency] = useState<FrequencyType>('one-time');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  
  const creditorInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const maxScroll = 300; // Adjust this value based on your content height

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
    console.log("Confirmed Debt:", {
      amount,
      creditorName,
      notes,
      currency,
      frequency,
      startDate,
      dueDate,
    });
  };

  const isFormValid = () => {
    return (
      amount !== "0.00" && 
      amount !== "" && 
      creditorName.trim() !== "" &&
      startDate &&
      dueDate
    );
  };

  const frequencyOptions: DropdownOption[] = FREQUENCIES.map(f => ({
    label: f.label,
    value: f.value,
    icon: f.value === 'one-time' ? 'calendar-blank' : 'calendar-sync'
  }));

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
      showsVerticalScrollIndicator={false}
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Add Debt</Text>
          <AmountInput 
            amount={amount}
            currencySymbol={currency.symbol}
          />
          
          <TextInput
            ref={creditorInputRef}
            style={styles.input}
            placeholder="Creditor/Debtor Name"
            value={creditorName}
            onChangeText={setCreditorName}
          />

          <Dropdown
            label="Payment Frequency"
            value={frequency}
            options={frequencyOptions}
            showPicker={showFrequencyPicker}
            onPress={() => setShowFrequencyPicker(!showFrequencyPicker)}
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

          <TextInput
            ref={notesInputRef}
            style={[styles.input, styles.notesInput]}
            placeholder="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Numpad
            onNumberPress={handleNumberPress}
            onDelete={handleDelete}
            onCurrencySelect={setCurrency}
            currencies={CURRENCIES}
            selectedCurrency={currency}
            date={startDate}
            onDatePress={() => setShowStartDatePicker(true)}
            showDatePicker={showStartDatePicker}
          />
        </View>
      </Animated.ScrollView>

      <ScrollIndicator scrollY={scrollY} maxScroll={maxScroll} />

      {isFormValid() && (
        <View style={styles.bottomContainer}>
          <Button 
            title="Add Debt"
            onPress={handleConfirm}
          />
        </View>
      )}

      <CustomDatePicker
        show={showStartDatePicker}
        value={startDate}
        onChange={(event: any, date?: Date) => {
          setShowStartDatePicker(false);
          if (date) setStartDate(date);
        }}
        onClose={() => setShowStartDatePicker(false)}
        title="Start Date"
      />

      <CustomDatePicker
        show={showDueDatePicker}
        value={dueDate}
        onChange={(event: any, date?: Date) => {
          setShowDueDatePicker(false);
          if (date) setDueDate(date);
        }}
        onClose={() => setShowDueDatePicker(false)}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 200, // Add extra padding at bottom for scrolling
  },
  contentContainer: {
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
  input: {
    fontSize: 16,
    color: "#232D59",
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 24,
    paddingHorizontal: 8,
    height: 40,
  },
  notesInput: {
    height: 40,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  bottomContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: 8,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
});
