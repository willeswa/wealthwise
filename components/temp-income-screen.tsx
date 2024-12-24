import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Dimensions, Keyboard, Platform } from "react-native";
import { FontAwesome, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Add currency types
type CurrencyType = {
  symbol: string;
  code: string;
  name: string;
};

const CURRENCIES: CurrencyType[] = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: 'KES', code: 'KES', name: 'Kenyan Shilling' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
];

// Add category types
type CategoryType = {
  id: string;
  name: string;
  icon: string;
};

const CATEGORIES: CategoryType[] = [
  { id: '1', name: 'Salary', icon: 'cash' },
  { id: '2', name: 'Business', icon: 'store' },
  { id: '3', name: 'Investment', icon: 'chart-line' },
  { id: '4', name: 'Freelance', icon: 'laptop' },
  { id: '5', name: 'Gift', icon: 'gift' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate dimensions
const PADDING_HORIZONTAL = 16;
const TOTAL_PADDING = PADDING_HORIZONTAL * 6;
const COLUMN_GAP = 8;
const TOTAL_GAPS = 3; // 3 gaps between 4 columns
const AVAILABLE_WIDTH = SCREEN_WIDTH - TOTAL_PADDING - (COLUMN_GAP * TOTAL_GAPS);
const BUTTON_SIZE = Math.floor(AVAILABLE_WIDTH / 4); // Divide by 4 columns
const TOTAL_WIDTH = (BUTTON_SIZE * 4) + (COLUMN_GAP * 3); // 4 columns + 3 gaps

const DateDisplay = ({ date }: { date: Date }) => (
  <View style={styles.dateDisplay}>
    <Text style={styles.dateDay}>{date.getDate()}</Text>
    <Text style={styles.dateMonth}>{date.toLocaleString('default', { month: 'short' })}</Text>
  </View>
);

export const AddIncomeScreen = () => {
  const [amount, setAmount] = useState("0.00");
  const [comment, setComment] = useState("");
  const [currency, setCurrency] = useState<CurrencyType>(CURRENCIES[0]);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(CATEGORIES[0]);
  const commentInputRef = useRef<TextInput>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Add useEffect to handle keyboard events
  React.useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        commentInputRef.current?.blur();
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

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
      comment,
      category: selectedCategory,
      currency,
      date
    });
  };

  const handleCurrencyPress = () => {
    setShowCurrencyPicker(!showCurrencyPicker);
  };

  const selectCurrency = (newCurrency: CurrencyType) => {
    setCurrency(newCurrency);
    setShowCurrencyPicker(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Amount Display */}
        <Text style={styles.title}>Income</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>{currency.symbol}</Text>
          <TextInput 
            style={styles.amountInput} 
            value={amount} 
            editable={false} 
          />
        </View>

        {/* Category Selector */}
        <Pressable 
          style={styles.categorySelector}
          onPress={handleCategoryPress}
        >
          <View style={styles.categoryLeft}>
            <MaterialCommunityIcons 
              name={selectedCategory.icon as any} 
              size={24} 
              color="#232D59" 
            />
            <Text style={styles.categoryText}>{selectedCategory.name}</Text>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#8A8A8A" />
        </Pressable>

        {/* Category Picker Modal */}
        {showCategoryPicker && (
          <View style={styles.categoryPicker}>
            {CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={styles.categoryOption}
                onPress={() => selectCategory(category)}
              >
                <MaterialCommunityIcons 
                  name={category.icon as any} 
                  size={24} 
                  color="#232D59" 
                />
                <Text style={styles.categoryOptionText}>{category.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Currency Picker Modal */}
        {showCurrencyPicker && (
          <View style={styles.currencyPicker}>
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr.code}
                style={styles.currencyOption}
                onPress={() => selectCurrency(curr)}
              >
                <Text style={styles.currencyOptionText}>
                  {curr.symbol} - {curr.code}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Updated Comment Input */}
        <TextInput
          ref={commentInputRef}
          style={styles.commentInput}
          placeholder="Add comment..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
        />

        {/* Custom Number Pad */}
        <View style={styles.numpad}>
          {/* Numbers Grid: 3 Columns */}
          <View style={styles.numberGrid}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((item, index) => (
              <Pressable
                key={index}
                style={styles.numberButton}
                onPress={() => handleNumberPress(item)}
              >
                <Text style={styles.numberButtonText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          {/* Fourth Column for Special Actions */}
          <View style={styles.actionColumn}>
            <Pressable 
              style={[styles.actionButton, styles.currencyButton]}
              onPress={handleCurrencyPress}
            >
              <FontAwesome name="dollar" size={24} color="#232D59" />
            </Pressable>
            <Pressable 
              style={[styles.actionButton, styles.calendarButton]} 
              onPress={handleDatePress}
            >
              {showDatePicker ? (
                <MaterialIcons name="date-range" size={24} color="#232D59" />
              ) : (
                <DateDisplay date={date} />
              )}
            </Pressable>
            <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
              <MaterialIcons name="backspace" size={24} color="#232D59" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Add Income Button */}
      <View style={styles.bottomContainer}>
        <Pressable style={styles.addIncomeButton} onPress={handleConfirm}>
          <Text style={styles.addIncomeButtonText}>Add Income</Text>
        </Pressable>
      </View>

      {/* Add DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
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
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#F5F6FA',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
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
    // Remove borderBottomWidth and borderColor
  },
  commentInput: {
    fontSize: 16,
    color: "#8A8A8A",
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 24,
    paddingHorizontal: 8,
    height: 40, // Increased height
    textAlignVertical: 'top', // Align text to top for multiline
    paddingTop: 8,
  },
  numpad: {
    width: TOTAL_WIDTH,
    flexDirection: "row",
    gap: COLUMN_GAP,
    marginBottom: 16,
    alignSelf: 'center', // Center the entire numpad
  },
  numberGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: (BUTTON_SIZE * 3) + (COLUMN_GAP * 2), // 3 columns width + gaps
    gap: COLUMN_GAP,
  },
  numberButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE * .3,
    backgroundColor: "#F5F6FA",
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#232D59",
  },
  actionColumn: {
    width: BUTTON_SIZE,
    gap: COLUMN_GAP,
    alignItems: "center",
  },
  actionButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE * 0.3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6E8F0",
  },
  currencyButton: {
    backgroundColor: '#E5F0FF', // Light blue shade
  },
  calendarButton: {
    backgroundColor: '#E5FFE8', // Light green shade
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  bottomContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopColor: '#EAEAEA',
  },
  addIncomeButton: {
    backgroundColor: "#232D59",
    borderRadius: 32,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  addIncomeButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  currencyPicker: {
    position: 'absolute',
    top: 120,
    right: PADDING_HORIZONTAL,
    left: PADDING_HORIZONTAL,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  currencyOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  currencyOptionText: {
    fontSize: 16,
    color: '#232D59',
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F6FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryText: {
    fontSize: 16,
    color: '#232D59',
    fontWeight: '500',
  },
  categoryPicker: {
    position: 'absolute',
    top: 200, // Adjust based on your layout
    right: PADDING_HORIZONTAL,
    left: PADDING_HORIZONTAL,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#232D59',
  },
  dateDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#232D59',
    lineHeight: 20,
  },
  dateMonth: {
    fontSize: 12,
    color: '#8A8A8A',
    textTransform: 'uppercase',
    lineHeight: 12,
  },
});
