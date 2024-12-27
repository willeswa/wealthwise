import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDebtStore } from "../store/debt-store";
import { useModalStore } from "../store/modal-store";
import { calculateEndDate } from "../utils/calculations/debt";
import { colors } from "../utils/colors";
import { DebtInput, RepaymentPeriodUnit } from "../utils/types/debt";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { CustomDatePicker } from "./CustomDatePicker";
import { Dropdown } from "./Dropdown";
import { NumberStepper } from "./NumberStepper";
import { ScrollIndicator } from "./scroll-indicator";
import { getDefaultCurrency } from '../utils/db/utils/settings';

const CURRENCIES = [
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "KES", code: "KES", name: "Kenyan Shilling" },
  { symbol: "£", code: "GBP", name: "British Pound" },
] as const;

const PERIOD_UNITS: RepaymentPeriodUnit[] = ["Weeks", "Months", "Years"];

const PADDING_HORIZONTAL = 16;

export const AddDebtScreen = () => {
  const addNewDebt = useDebtStore((state) => state.addNewDebt);
  const { closeModal } = useModalStore();

  const [totalAmount, setTotalAmount] = useState("");
  const [creditor, setCreditor] = useState("");
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState<string>('USD');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [interestRate, setInterestRate] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [repaymentPeriod, setRepaymentPeriod] = useState<number>(0);
  const [periodUnit, setPeriodUnit] = useState<RepaymentPeriodUnit>("Months");
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const maxScroll = 400; // Adjust based on content heightfdefa
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollEndTimer = useRef<NodeJS.Timeout>();
  const scrollViewRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [showPeriodUnitPicker, setShowPeriodUnitPicker] = useState(false);

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
      },
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

  useEffect(() => {
    if (repaymentPeriod > 0) {
      const calculatedEndDate = calculateEndDate(
        startDate,
        repaymentPeriod,
        periodUnit
      );
      setEndDate(calculatedEndDate);
    }
  }, [startDate, repaymentPeriod, periodUnit]);

  useEffect(() => {
    const loadDefaultCurrency = async () => {
      const defaultCurrency = await getDefaultCurrency();
      setCurrency(defaultCurrency);
    };
    loadDefaultCurrency();
  }, []);

  const handleConfirm = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const numericAmount = parseFloat(totalAmount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      if (!creditor.trim()) {
        alert("Please enter a creditor name");
        return;
      }

      const debtData: DebtInput = {
        creditor: creditor.trim(),
        total_amount: numericAmount,
        interest_rate: interestRate,
        currency: currency,
        frequency:
          periodUnit === "Weeks"
            ? "Weekly"
            : periodUnit === "Months"
            ? "Monthly"
            : periodUnit === "Years"
            ? "Yearly"
            : "Monthly",
        start_date: format(startDate, "yyyy-MM-dd"),
        expected_end_date: format(endDate, "yyyy-MM-dd"),
        repayment_period: repaymentPeriod,
        period_unit: periodUnit,
        notes: notes.trim() || undefined,
      };

      await addNewDebt(debtData);
      closeModal();
    } catch (error) {
      console.error("Error adding debt:", error);
      alert("Failed to add debt. Please try again.");
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
        <View style={styles.contentContainer} onLayout={handleContentLayout}>
          <Text style={styles.title}>Add Debt</Text>

          <View style={{ gap: 16 }}>
            <AmountInput
              amount={totalAmount}
              currencySymbol={currency}
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
              max={2000}
              step={0.1}
              label="Interest Rate (%)"
            />

            {/* Repayment Period Section */}
            <View>
              <Text style={styles.inputLabel}>Repayment Period</Text>
              <View style={styles.periodWrapper}>
                <View style={styles.periodContainer}>
                  <TextInput
                    style={styles.periodInput}
                    keyboardType="numeric"
                    value={repaymentPeriod > 0 ? repaymentPeriod.toString() : ""}
                    onChangeText={(text) => setRepaymentPeriod(Number(text) || 0)}
                    placeholder="eg. 48"
                  />
                  
                  <View style={styles.periodUnitSection}>
                    <Dropdown
                      label=""
                      value={periodUnit}
                      options={PERIOD_UNITS.map(unit => ({
                        id: unit,
                        label: unit,
                        value: unit
                      }))}
                      showPicker={showPeriodUnitPicker}
                      onPress={() => setShowPeriodUnitPicker(!showPeriodUnitPicker)}
                      onSelect={(option) => {
                        setPeriodUnit(option.value as RepaymentPeriodUnit);
                        setShowPeriodUnitPicker(false);
                      }}
                      selectorStyle={styles.periodUnitSelector}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Payment Schedule Section */}
            <View style={styles.dateSelection}>
              <Text style={styles.dateLabel}>Payment Schedule</Text>
              <View style={styles.scheduleInputs}>
                <View style={styles.datesRow}>
                  <Pressable
                    style={[styles.datePicker, styles.datePickerHalf]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={18}
                      color={colors.text.secondary}
                    />
                    <Text style={styles.dateText}>
                      {format(startDate, "MMM dd, yyyy")}
                    </Text>
                    <Text style={styles.dateHint}>Start</Text>
                  </Pressable>

                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={18}
                    color={colors.text.light}
                  />

                  <Pressable
                    style={[styles.datePicker, styles.datePickerHalf]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <MaterialCommunityIcons
                      name="calendar"
                      size={18}
                      color={colors.text.secondary}
                    />
                    <Text style={styles.dateText}>
                      {format(endDate, "MMM dd, yyyy")}
                    </Text>
                    <Text style={styles.dateHint}>End</Text>
                  </Pressable>
                </View>
              </View>
            </View>

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
    height: 48,
    borderRadius: 32,
  },
  commentInput: {
    fontSize: 16,
    color: "#8A8A8A",
    backgroundColor: "#F5F6FA",
    padding: 16,
    minHeight: 60,
    textAlignVertical: "top",
    paddingTop: 8,
    borderRadius: 8,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  datePicker: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: colors.background.highlight,
    borderRadius: 32,
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
  periodWrapper: {
    position: "relative",
    zIndex: 1,
  },
  periodContainer: {
    flexDirection: "row",
    borderRadius: 32,
    overflow: "visible",
    minHeight: 48,
  },
  periodInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingHorizontal: 16,
    backgroundColor: colors.background.highlight,
    height: 48,
    borderWidth: 1,
    borderColor: colors.background.highlight,
    borderRadius: 32,
    borderRightWidth: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  periodUnitSection: {
    minWidth: 120,
    backgroundColor: colors.background.highlight,
    borderRadius: 32,
  },
  periodUnitSelector: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.background.highlight,
    borderLeftWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  periodInputs: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberInput: {
    flex: 1,
  },
  endDateToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  scheduleInputs: {
    gap: 12,
  },
  startDateSection: {
    marginBottom: 12,
  },
  periodSection: {
    marginBottom: 12,
  },
  endDateSection: {
    marginBottom: 12,
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  datePickerHalf: {
    flex: 1,
  },
});
