import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState, useRef, useEffect } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView, Animated, LayoutChangeEvent } from "react-native";
import { useDebtStore } from '../store/debt-store';
import { useModalStore } from '../store/modal-store';
import { DebtInput, RepaymentFrequency } from '../utils/types/debt';
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { CustomDatePicker } from './CustomDatePicker';
import { NumberStepper } from './NumberStepper';
import { colors } from '../utils/colors';
import { Dropdown } from './Dropdown';
import { ScrollIndicator } from "./scroll-indicator";

const CURRENCIES = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: 'KES', code: 'KES', name: 'Kenyan Shilling' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
] as const;

const FREQUENCIES: RepaymentFrequency[] = ['One-time', 'Weekly', 'Monthly', 'Yearly'];

const PADDING_HORIZONTAL = 16;

export const AddDebtScreen = () => {
  const addNewDebt = useDebtStore(state => state.addNewDebt);
  const { closeModal } = useModalStore();
  
  const [totalAmount, setTotalAmount] = useState("");
  const [creditor, setCreditor] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [interestRate, setInterestRate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [frequency, setFrequency] = useState<RepaymentFrequency>('Monthly');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const maxScroll = 400; // Adjust based on content height
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollEndTimer = useRef<NodeJS.Timeout>();
  const scrollViewRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: () => {
        setIsScrolling(true);
        
        if (scrollEndTimer.current) {
          clearTimeout(scrollEndTimer.current);
        }
        
        scrollEndTimer.current = setTimeout(() => {
          setIsScrolling(false);
        }, 800);
      }
    }
  );

  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContainerHeight(height);
    updateScrollable(height, contentHeight);
  };

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
    updateScrollable(containerHeight, height);
  };

  const updateScrollable = (container: number, content: number) => {
    setIsScrollable(content > container);
  };

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
      }
    };
  }, []);

  const handleConfirm = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const numericAmount = parseFloat(totalAmount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      if (!creditor.trim()) {
        alert('Please enter a creditor name');
        return;
      }

      const debtData: DebtInput = {
        creditor: creditor.trim(),
        total_amount: numericAmount,
        interest_rate: interestRate,
        currency: currency.code,
        frequency,
        start_date: format(startDate, 'yyyy-MM-dd'),
        expected_end_date: format(endDate, 'yyyy-MM-dd'),
        notes: notes.trim() || undefined,
      };

      await addNewDebt(debtData);
      closeModal();
    } catch (error) {
      console.error('Error adding debt:', error);
      alert('Failed to add debt. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={handleScrollViewLayout}
      >
        <View 
          style={styles.contentContainer}
          onLayout={handleContentLayout}
        >
          <Text style={styles.title}>Add Debt</Text>
          
          <View style={{ gap: 16 }}>
            <AmountInput 
              amount={totalAmount}
              currencySymbol={currency.symbol}
              useSystemKeyboard={true}
              onChangeValue={setTotalAmount}
            />

            <TextInput
              style={styles.nameInput}
              placeholder="Creditor Name"
              value={creditor}
              onChangeText={setCreditor}
              placeholderTextColor="#8A8A8A"
            />

            <NumberStepper
              value={interestRate}
              onChange={setInterestRate}
              min={0}
              max={100}
              step={0.1}
              label="Interest Rate (%)"
            />

            <View style={styles.dateSelection}>
              <Text style={styles.dateLabel}>Payment Schedule</Text>
              <View style={styles.dateInputs}>
                <Pressable 
                  style={styles.datePicker}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={18} 
                    color={colors.text.secondary} 
                  />
                  <Text style={styles.dateText}>
                    {format(startDate, 'MMM dd, yyyy')}
                  </Text>
                  <Text style={styles.dateHint}>Start</Text>
                </Pressable>

                <MaterialCommunityIcons 
                  name="arrow-right" 
                  size={18} 
                  color={colors.text.light} 
                />

                <Pressable 
                  style={styles.datePicker}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <MaterialCommunityIcons 
                    name="calendar" 
                    size={18} 
                    color={colors.text.secondary} 
                  />
                  <Text style={styles.dateText}>
                    {format(endDate, 'MMM dd, yyyy')}
                  </Text>
                  <Text style={styles.dateHint}>End</Text>
                </Pressable>
              </View>
            </View>

            <Dropdown
              label="Repayment Frequency"
              value={frequency}
              options={FREQUENCIES.map(f => ({
                id: f,
                label: f,
                value: f
              }))}
              showPicker={showFrequencyPicker}
              onPress={() => setShowFrequencyPicker(true)}
              onSelect={(option) => {
                setFrequency(option.value as RepaymentFrequency);
                setShowFrequencyPicker(false);
              }}
            />

            <TextInput
              style={styles.commentInput}
              placeholder="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholderTextColor="#8A8A8A"
            />
          </View>
        </View>
      </Animated.ScrollView>

      <ScrollIndicator 
        scrollY={scrollY} 
        maxScroll={maxScroll}
        isScrolling={isScrolling} 
        isScrollable={isScrollable}
      />

      <View style={styles.bottomContainer}>
        <Button 
          title={isSubmitting ? "Adding..." : "Add Debt"}
          onPress={handleConfirm}
          disabled={isSubmitting || !totalAmount || !creditor.trim()}
        />
      </View>

      <CustomDatePicker
        show={showStartDatePicker}
        value={startDate}
        onChange={(_, date?: Date) => {
          setShowStartDatePicker(false);
          if (date) setStartDate(date);
        }}
        onClose={() => setShowStartDatePicker(false)}
        title="Start Date"
      />

      <CustomDatePicker
        show={showEndDatePicker}
        value={endDate}
        onChange={(_, date?: Date) => {
          setShowEndDatePicker(false);
          if (date) setEndDate(date);
        }}
        onClose={() => setShowEndDatePicker(false)}
        title="Expected End Date"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: colors.text.secondary,
  },
  input: {
    fontSize: 16,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderColor: colors.background.highlight,
    marginBottom: 24,
    paddingHorizontal: 8,
    height: 40,
  },
  nameInput: {
    fontSize: 16,
    color: "#8A8A8A",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: 16,
    height: 43,
    borderRadius: 32,
  },
  commentInput: {
    fontSize: 16,
    color: "#8A8A8A",
    backgroundColor: '#F5F6FA',
    padding: 16,
    minHeight: 60,
    textAlignVertical: "top",
    paddingTop: 8,
    borderRadius: 8,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  dateSelection: {
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  dateInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  datePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.background.highlight,
    borderRadius: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  dateHint: {
    fontSize: 12,
    color: colors.text.light,
  },
  bottomContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopColor: colors.background.highlight,
  },
});
