import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from "react";
import { Animated, StyleSheet, Text, TextInput, View } from "react-native";
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { CustomDatePicker } from './CustomDatePicker';
import { Dropdown, DropdownOption } from './Dropdown';
import { CurrencyType, Numpad } from './Numpad';
import { ScrollIndicator } from './scroll-indicator';
import { useDebtStore } from '../store/debt-store';
import { useModalStore } from '../store/modal-store';
import { DebtInput } from '../utils/types/debt';
import Slider from '@react-native-community/slider';
import { NumberStepper } from './NumberStepper';

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
  const addNewDebt = useDebtStore(state => state.addNewDebt);
  const { closeModal } = useModalStore();
  
  const [amount, setAmount] = useState(""); // Changed from "0.00" to empty string
  const [creditorName, setCreditorName] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState<CurrencyType>(CURRENCIES[0]);
  const [frequency, setFrequency] = useState<FrequencyType>('one-time');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [interestRate, setInterestRate] = useState(15); // Default to 15%
  const [paymentAmount, setPaymentAmount] = useState("0.00");
  const [activeInput, setActiveInput] = useState<'payment'>('payment');
  
  const creditorInputRef = useRef<TextInput>(null);
  const notesInputRef = useRef<TextInput>(null);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const maxScroll = 300; 

  const handleNumberPress = (num: string) => {
    if (num === "." && paymentAmount.includes(".")) return;
    if (paymentAmount === "0.00") {
      setPaymentAmount(num === "." ? "0." : num);
    } else {
      setPaymentAmount((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    if (paymentAmount.length <= 1 || paymentAmount === "0.") {
      setPaymentAmount("0.00");
    } else {
      setPaymentAmount((prev) => prev.slice(0, -1));
    }
  };

  const handleConfirm = async () => {
    try {
      const debtData: DebtInput = {
        creditor: creditorName,
        amount: amount ? parseFloat(amount) : null,  // Convert empty string to null
        interest_rate: interestRate,
        currency: currency.code,
        startDate: startDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        frequency,
        payment_amount: parseFloat(paymentAmount),
        notes: notes || undefined,
      };

      await addNewDebt(debtData);
      
      // Reset form
      setAmount("");  // Reset to empty string instead of "0.00"
      setInterestRate(15);
      setPaymentAmount("0.00");
      setCreditorName("");
      setNotes("");
      setFrequency('one-time');
      setStartDate(new Date());
      setDueDate(new Date());
      
      closeModal();
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  const isFormValid = () => {
    return paymentAmount !== "0.00" && 
           paymentAmount !== "" && 
           creditorName.trim() !== "" &&
           startDate &&
           dueDate;
  };

  const frequencyOptions: DropdownOption[] = FREQUENCIES.map(f => ({
    label: f.label,
    value: f.value,
    icon: f.value === 'one-time' ? 'calendar-blank' : 'calendar-sync'
  }));

  // Add this new handler for smoother slider interaction
  const handleSliderComplete = (value: number) => {
    setInterestRate(Math.round(value));
  };

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
            amount={paymentAmount}
            currencySymbol={currency.symbol}
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

          <TextInput
            ref={creditorInputRef}
            style={styles.input}
            placeholder="Creditor/Debtor Name"
            value={creditorName}
            onChangeText={setCreditorName}
          />

          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, styles.currencyInput]}
              placeholder="Total Amount (Optional)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <Text style={styles.currencySymbol}>{currency.symbol}</Text>
          </View>

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

          <NumberStepper
            value={interestRate}
            onChange={setInterestRate}
            min={0}
            max={50}
            step={1}
            label="Interest Rate"
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
    paddingBottom: 120, // Reduced padding since numpad is no longer at bottom
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
  amountSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  currencyInput: {
    flex: 1,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    paddingBottom: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',  // Center the header
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: 28,  // Increased size
    fontWeight: '600',
    color: '#232D59',
    marginRight: 8,
    minWidth: 70,  // Ensure consistent width
    textAlign: 'right',
  },
  sliderLabel: {
    fontSize: 16,
    color: '#666',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  sliderMinMax: {
    fontSize: 12,
    color: '#666',
  },
});
