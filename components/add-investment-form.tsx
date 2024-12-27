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
  const { addNewInvestment, fetchInvestmentTypes, investmentTypes } = useInvestmentStore();
  const { closeModal } = useModalStore();

  // Fetch investment types on component mount
  useEffect(() => {
    fetchInvestmentTypes();
  }, []);

  // Updated state to match new schema
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("");
  const [currentValue, setCurrentValue] = useState("0.00");
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

          <TextInput
            style={styles.nameInput}
            placeholder="Investment Name"
            value={name}
            onChangeText={setName}
          />

          {/* Add gap={16} to create consistent spacing between elements */}
          <View style={{ gap: 16 }}>
            <Dropdown
              label="Investment Type"
              value={type}
              options={investmentTypeOptions}
              showPicker={showTypeDropdown}
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              onSelect={handleInvestmentTypeSelect}
            />

            <AmountInput
              label="Current Value"
              amount={currentValue}
              currencySymbol="KES"
              onChangeValue={setCurrentValue}
              useSystemKeyboard={true}
            />

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

            <Dropdown
              label="Liquidity"
              value={liquidity}
              options={LIQUIDITY_OPTIONS}
              showPicker={showLiquidityDropdown}
              onPress={() => setShowLiquidityDropdown(!showLiquidityDropdown)}
              onSelect={(option) => {
                setLiquidity(option.value as Liquidity);
                setShowLiquidityDropdown(false);
              }}
            />

            <TextInput
              style={[styles.commentInput]}
              placeholder="Notes (optional)"
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
    marginBottom: 16,
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
});
