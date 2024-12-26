import React, { useEffect, useState } from "react";
import { Animated, View, TextInput, StyleSheet, Text } from "react-native";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import { AmountInput } from "./AmountInput";
import { useInvestmentStore } from "../store/investment-store";
import { RiskLevel, Liquidity, InvestmentType } from "../utils/types/investment";
import { useModalStore } from "../store/modal-store";
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
  const maxScroll = 300;

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

  return (
    <View style={styles.container}>
      <Animated.ScrollView>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Add Investment</Text>

          <TextInput
            style={styles.input}
            placeholder="Investment Name"
            value={name}
            onChangeText={setName}
          />

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
});
