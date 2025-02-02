import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  View,
  LayoutChangeEvent,
} from "react-native";
import { useExpenseStore } from "../store/expense-store";
import { useModalStore } from "../store/modal-store";
import { getDebts } from "../utils/db/debt";
import { getInvestments } from "../utils/db/investments";
import { ExpenseCategory, ExpenseStatus } from "../utils/types/expense";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { CustomDatePicker } from "./CustomDatePicker";
import { Dropdown, DropdownOption } from "./Dropdown";
import { CurrencyType, Numpad } from "./Numpad";
import { ScrollIndicator } from "./scroll-indicator";
import { NoDebtsSetup } from "./no-debts-setup";
import { usePreferencesStore } from "@/store/preferences-store";

const CURRENCIES: CurrencyType[] = [
  { symbol: "$", code: "USD", name: "US Dollar" },
  { symbol: "£", code: "GBP", name: "British Pound" },
  { symbol: "KES", code: "KES", name: "Kenyan Shilling" },
  { symbol: "C$", code: "CAD", name: "Canadian Dollar" },
  { symbol: "A$", code: "AUD", name: "Australian Dollar" },
];

const PADDING_HORIZONTAL = 16;

export const AddExpenseScreen = () => {
  const {
    addNewExpense,
    defaultCurrency,
    setDefaultCurrency: updateDefaultCurrency,
    categories,
    fetchCategories,
  } = useExpenseStore();
  const { closeModal, openModal } = useModalStore();
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const commentInputRef = useRef<TextInput>(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
  const [linkedItems, setLinkedItems] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [selectedLinkedItem, setSelectedLinkedItem] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [showLinkedItemPicker, setShowLinkedItemPicker] = useState(false);
  const [showDebtSetup, setShowDebtSetup] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollEndTimer = useRef<NodeJS.Timeout>();
  const maxScroll = 300;
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
      },
    }
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
      }
    };
  }, []);

  const loadLinkedItems = async (categoryType: "investment" | "debt") => {
    try {
      let items;
      if (categoryType === "investment") {
        items = await getInvestments();
        setLinkedItems(items.map((i) => ({ id: i.id, name: i.name })));
      } else if (categoryType === "debt") {
        items = await getDebts();
        setLinkedItems(items.map((d) => ({ id: d.id!, name: d.creditor })));
      }
    } catch (error) {
      console.error("Error loading linked items:", error);
    }
  };

  const handleCategoryChange = async (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setSelectedLinkedItem(null);

    if (category.type === "investment" || category.type === "debt") {
      await loadLinkedItems(category.type);
    } else {
      setLinkedItems([]);
    }
  };

  const handleCategorySelect = async (category: ExpenseCategory) => {
    if (category.type === "debt") {
      const debts = await getDebts();
      if (debts.length === 0) {
        setShowDebtSetup(true);
        return;
      }
    }
    handleCategoryChange(category);
    setShowCategoryPicker(false);
  };

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
      const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));

      if (isNaN(numericAmount) || numericAmount <= 0) {
        alert("Please enter a valid amount");
        return;
      }

      if (!name.trim()) {
        alert("Please enter a name for the expense");
        return;
      }

      if (!selectedCategory) {
        alert("Please select a category");
        return;
      }

      if (
        (selectedCategory.type === "investment" ||
          selectedCategory.type === "debt") &&
        !selectedLinkedItem
      ) {
        alert(
          `Please select a ${selectedCategory.type} to link this expense to`
        );
        return;
      }

      const expenseData = {
        name: name.trim(),
        amount: numericAmount,
        currency: defaultCurrency,
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        linked_item_id: selectedLinkedItem?.id,
        linked_item_type:
          selectedCategory.type === "investment" ||
          selectedCategory.type === "debt"
            ? selectedCategory.type
            : undefined,
        comment: comment.trim(),
        date: format(date, "yyyy-MM-dd"),
        status: "completed" as ExpenseStatus,
      };

      await addNewExpense(expenseData);

      // Reset form
      setName("");
      setAmount("0.00");
      setComment("");
      setSelectedCategory(categories[0]);
      setDate(new Date());

      closeModal();
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectCurrency = async (newCurrency: CurrencyType) => {
    if (newCurrency.code === defaultCurrency) return;
    try {
      await updateDefaultCurrency(newCurrency.code);
    } catch (error) {
      console.error("Error updating currency:", error);
    }
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

  const handleSetupDebt = () => {
    // Use modal actions instead of navigation
    openModal("add-debt");
  };

  const handleLinkedItemSelect = (option: DropdownOption) => {
    const item = linkedItems.find((i) => i.name === option.value)!;
    setSelectedLinkedItem(item);
    setShowLinkedItemPicker(false);

    // Set the expense name based on the selected debt
    if (selectedCategory?.type === "debt") {
      setName(`${item.name} Repayment`);
    }

    if(selectedCategory?.type === "investment") {
      setName(`${item.name} Investment`);
    }

  };

  if (showDebtSetup) {
    return (
      <NoDebtsSetup
        onSetupDebt={handleSetupDebt}
        onCancel={() => {
          setShowDebtSetup(false);
          setSelectedCategory(null);
        }}
      />
    );
  }

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
          <Text style={styles.title}>Expense</Text>

          <Dropdown
            label="Category"
            value={selectedCategory?.name || ""}
            placeholder="Select a category"
            options={categories.map((c) => ({
              id: c.id.toString(),
              label: c.name,
              value: c.name,
              icon: c.icon,
            }))}
            showPicker={showCategoryPicker}
            onPress={() => setShowCategoryPicker(true)}
            onSelect={(option) => {
              const category = categories.find((c) => c.name === option.value)!;
              handleCategorySelect(category);
            }}
            renderIcon={(option) => (
              <MaterialCommunityIcons
                name={option.icon as any}
                size={18}
                color="#232D59"
              />
            )}
          />

          {selectedCategory &&
            (selectedCategory.type === "investment" ||
              selectedCategory.type === "debt") && (
              <Dropdown
                label={`Select ${selectedCategory.type}`}
                value={selectedLinkedItem?.name || ""}
                options={linkedItems.map((item) => ({
                  id: item.id.toString(),
                  label: item.name,
                  value: item.name,
                }))}
                showPicker={showLinkedItemPicker}
                onPress={() => setShowLinkedItemPicker(true)}
                onSelect={handleLinkedItemSelect}
              />
            )}
          <TextInput
            style={styles.nameInput}
            placeholder="Expense name"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          <AmountInput amount={amount} currencySymbol={defaultCurrency} />
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

          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder="Add comment..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 16,
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
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: 16,
    height: 43,
    borderRadius: 32,
  },
  commentInput: {
    fontSize: 16,
    color: "#8A8A8A",
    backgroundColor: "#F5F6FA",
    marginBottom: 24,
    padding: 16,
    minHeight: 60,
    textAlignVertical: "top",
    paddingTop: 8,
    borderRadius: 8,
  },
  bottomContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
});
