import React, { useEffect, useState, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, TextInput, View, LayoutChangeEvent } from "react-native";
import { useInvestmentStore } from "../store/investment-store";
import { useModalStore } from "../store/modal-store";
import { Liquidity, RiskLevel } from "../utils/types/investment";
import { AmountInput } from "./AmountInput";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { ScrollIndicator } from "./scroll-indicator";

const RISK_LEVELS = [
  { label: 'Low Risk', value: 'Low' },
  { label: 'Medium Risk', value: 'Medium' },
  { label: 'High Risk', value: 'High' }
];

const LIQUIDITY_OPTIONS = [
  { label: 'Liquid', value: 'Liquid' },
  { label: 'Illiquid', value: 'Illiquid' }
];

export const AddInvestmentScreen = () => {
  const { addNewInvestment, fetchInvestmentTypes, investmentTypes, defaultCurrency } = useInvestmentStore();
  const { closeModal } = useModalStore();

  // Fetch investment types on component mount
  useEffect(() => {
    fetchInvestmentTypes();
  }, []);

  // Updated state to match new schema
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("");
  const [currentValue, setCurrentValue] = useState("");
  const [liquidity, setLiquidity] = useState<Liquidity>('Liquid');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Medium');
  const [notes, setNotes] = useState("");
  
  // Dropdown visibility states
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showRiskDropdown, setShowRiskDropdown] = useState(false);
  const [showLiquidityDropdown, setShowLiquidityDropdown] = useState(false);

  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollEndTimer = useRef<NodeJS.Timeout>();
  const maxScroll = 300;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: true,
      listener: () => {
        setIsScrolling(true);
        
        // Clear existing timer
        if (scrollEndTimer.current) {
          clearTimeout(scrollEndTimer.current);
        }
        
        // Set new timer
        scrollEndTimer.current = setTimeout(() => {
          setIsScrolling(false);
        }, 800); // Adjust timeout duration as needed
      }
    }
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
      }
    };
  }, []);

  // Transform investment types for dropdown
  const investmentTypeOptions = investmentTypes.map(type => ({
    label: type.name,
    value: type.name,
    description: type.description
  }));

  const handleInvestmentTypeSelect = (option: { value: string }) => {
    const selectedType = investmentTypes.find(t => t.name === option.value);
    if (selectedType) {
      setType(selectedType.name);
      // Automatically set risk level and liquidity based on selected type
      setRiskLevel(selectedType.risk_level);
      setLiquidity(selectedType.liquidity);
    }
    setShowTypeDropdown(false);
  };

  const handleSubmit = async () => {
    try {
      await addNewInvestment({
        name,
        type,
        current_value: parseFloat(currentValue),
        liquidity,
        risk_level: riskLevel,
        notes: notes || undefined
      });
      closeModal();
    } catch (error) {
      console.error('Error adding investment:', error);
    }
  };

  const isValid = () => {
    return name.trim() !== "" && 
           type !== "" && 
           parseFloat(currentValue) > 0;
  };

  const [isScrollable, setIsScrollable] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

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

  return (
    <View style={styles.container}>
      <Animated.ScrollView
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
          <Text style={styles.title}>Add Investment</Text>

          <View style={styles.formContainer}>
            {/* 1. Name - Primary identifier */}
            <TextInput
              style={styles.nameInput}
              placeholder="Investment Name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#8A8A8A"
            />

            {/* 2. Amount - Making it real */}
            <AmountInput
              label="Initial Amount"
              amount={currentValue}
              currencySymbol={defaultCurrency}
              onChangeValue={setCurrentValue}
              useSystemKeyboard={true}
            />

            {/* 3. Investment Type - Categorization */}
            <Dropdown
              label="Investment Type"
              value={type}
              options={investmentTypeOptions}
              showPicker={showTypeDropdown}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              onSelect={handleInvestmentTypeSelect}
            />

            {/* 4. Risk Level - Key decision point */}
            <Dropdown
              label="Risk Level"
              value={riskLevel}
              options={RISK_LEVELS}
              showPicker={showRiskDropdown}
              onPress={() => setShowRiskDropdown(!showRiskDropdown)}
              onSelect={(option) => {
                setRiskLevel(option.value as RiskLevel);
                setShowRiskDropdown(false);
              }}
            />

            {/* 5. Liquidity - Secondary characteristic */}
            <Dropdown
              label="Accessebility"
              value={liquidity}
              options={LIQUIDITY_OPTIONS}
              showPicker={showLiquidityDropdown}
              onPress={() => setShowLiquidityDropdown(!showLiquidityDropdown)}
              onSelect={(option) => {
                setLiquidity(option.value as Liquidity);
                setShowLiquidityDropdown(false);
              }}
            />

            {/* 6. Notes - Additional context */}
            <TextInput
              style={[styles.commentInput]}
              placeholder="Add any notes or details about this investment (optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
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
          title="Add Investment"
          onPress={handleSubmit}
          disabled={!isValid()}
        />
      </View>
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
    paddingBottom: 120,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopColor: '#EAEAEA',
    backgroundColor: '#FFFFFF',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    marginBottom: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  title: {
    fontSize: 24, // Increased size
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28, // More space after title
    color: "#232D59",
  },
  nameInput: {
    fontSize: 18, // Increased size for primary input
    color: "#232D59",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 32,
    marginBottom: 24, // More space after name
    fontWeight: '500',
  },
  commentInput: {
    fontSize: 16,
    color: "#8A8A8A",
    backgroundColor: '#F5F6FA',
    padding: 16,
    minHeight: 80, // Increased height for notes
    textAlignVertical: "top",
    paddingTop: 12,
    borderRadius: 12,
    marginTop: 8, // Extra space before notes
  },
  formContainer: {
    gap: 20, // Increased gap for better visual hierarchy
  },
});
