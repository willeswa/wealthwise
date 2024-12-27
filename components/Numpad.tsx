import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export type CurrencyType = {
  symbol: string;
  code: string;
  name: string;
};

interface NumpadProps {
  onNumberPress: (num: string) => void;
  onDelete: () => void;
  onCurrencySelect: (currency: CurrencyType) => void;
  currencies: CurrencyType[];
  selectedCurrency: CurrencyType;
  date: Date;
  onDatePress: () => void;
  showDatePicker?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate dimensions
const PADDING_HORIZONTAL = 12;
const TOTAL_PADDING = PADDING_HORIZONTAL * 6;
const COLUMN_GAP = 16;
const TOTAL_GAPS = 3;
const AVAILABLE_WIDTH = SCREEN_WIDTH - TOTAL_PADDING - (COLUMN_GAP * TOTAL_GAPS);
const BUTTON_SIZE = Math.floor(AVAILABLE_WIDTH / 4);
const TOTAL_WIDTH = (BUTTON_SIZE * 4) + (COLUMN_GAP * 3);

const DateDisplay = ({ date }: { date: Date }) => (
  <View style={styles.dateDisplay}>
    <Text style={styles.dateDay}>{date.getDate()}</Text>
    <Text style={styles.dateMonth}>{date.toLocaleString('default', { month: 'short' })}</Text>
  </View>
);

export const Numpad: React.FC<NumpadProps> = ({
  onNumberPress,
  onDelete,
  onCurrencySelect,
  currencies,
  selectedCurrency,
  date,
  onDatePress,
  showDatePicker
}) => {
  const [showCurrencyPicker, setShowCurrencyPicker] = React.useState(false);

  const handleCurrencyPress = () => {
    setShowCurrencyPicker(!showCurrencyPicker);
  };

  const handleCurrencySelect = (currency: CurrencyType) => {
    onCurrencySelect(currency);
    setShowCurrencyPicker(false);
  };

  return (
    <>
      <View style={styles.numpad}>
        <View style={styles.numberGrid}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((item, index) => (
            <Pressable
              key={index}
              style={styles.numberButton}
              onPress={() => onNumberPress(item)}
            >
              <Text style={styles.numberButtonText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.actionColumn}>
          <Pressable 
            style={[styles.actionButton, styles.currencyButton]}
            onPress={handleCurrencyPress}
          >
            <Text style={styles.currencyButtonText}>{selectedCurrency.symbol}</Text>
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.calendarButton]} 
            onPress={onDatePress}
          >
            {showDatePicker ? (
              <MaterialIcons name="date-range" size={18} color="#232D59" />
            ) : (
              <DateDisplay date={date} />
            )}
          </Pressable>
          <Pressable 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={onDelete}
          >
            <MaterialIcons name="backspace" size={18} color="#232D59" />
          </Pressable>
        </View>
      </View>

      {showCurrencyPicker && (
        <View style={styles.currencyPicker}>
          {currencies.map((curr) => (
            <Pressable
              key={curr.code}
              style={styles.currencyOption}
              onPress={() => handleCurrencySelect(curr)}
            >
              <Text style={styles.currencyOptionText}>
                {curr.symbol} - {curr.code}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  numpad: {
    width: TOTAL_WIDTH,
    flexDirection: "row",
    gap: COLUMN_GAP,
    alignSelf: 'center',
  },
  numberGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: (BUTTON_SIZE * 3) + (COLUMN_GAP * 2),
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
    fontSize: 30,
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
    backgroundColor: '#E5F0FF',
  },
  calendarButton: {
    backgroundColor: '#E5FFE8',
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  currencyPicker: {
    position: 'absolute',
    bottom: '8%',
    right: 34,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
    width: 200,
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
  currencyButtonText: {
    fontSize: 18,
    color: '#232D59',
    fontWeight: 'bold',
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
