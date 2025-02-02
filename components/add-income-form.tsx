import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import { useIncomeStore } from '../store/income-store';
import { useModalStore } from '../store/modal-store';
import { IncomeInput } from '../utils/types/income';
import { AmountInput } from './AmountInput';
import { Button } from './Button';
import { CustomDatePicker } from './CustomDatePicker';
import { Dropdown, DropdownOption } from './Dropdown';
import { CurrencyType, Numpad } from './Numpad';
import { ScrollIndicator } from "./scroll-indicator";
import { CategoryType } from './type';

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
  const { defaultCurrency, setDefaultCurrency: updateDefaultCurrency } = useIncomeStore();
  const { closeModal } = useModalStore();
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<FrequencyType>('monthly');
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CATEGORIES[0]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const maxScroll = 300; // Adjust based on content height
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollEndTimer = useRef<NodeJS.Timeout>();
  const scrollViewRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const addNewIncome = useIncomeStore(state => state.addNewIncome);

  const handleNumberPress = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    if (amount.length <= 1) {
      setAmount("");
    } else {
      setAmount((prev) => prev.slice(0, -1));
    }
  };

  const handleConfirm = async () => {
    try {
      const incomeData: IncomeInput = {
        amount: parseFloat(amount),
        currency: defaultCurrency,
        category: selectedCategory.name,
        frequency,
        date: date.toISOString().split('T')[0],
      };

      await addNewIncome(incomeData);
      
      // Reset form
      setAmount("0.00");
      setFrequency('monthly');
      setSelectedCategory(CATEGORIES[0]);
      setDate(new Date());
      
      closeModal();
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const selectCurrency = async (newCurrency: CurrencyType) => {
    if (newCurrency.code === defaultCurrency) return;
    
    try {
      await updateDefaultCurrency(newCurrency.code);

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
    value: c.name,
    icon: c.icon
  }));

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
          <Text style={styles.title}>Income</Text>
          
          <View style={{ gap: 16 }}>
            <AmountInput 
              amount={amount}
              currencySymbol={defaultCurrency}
              onPress={() => {/* handle numpad open */}}
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
            />

            <Numpad
              onNumberPress={handleNumberPress}
              onDelete={handleDelete}
              onCurrencySelect={selectCurrency}
              currencies={CURRENCIES}
              selectedCurrency={defaultCurrency}
              date={date}
              onDatePress={handleDatePress}
              showDatePicker={showDatePicker}
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
    color: "#929ABE",
  },
  bottomContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopColor: '#EAEAEA',
  },
});
