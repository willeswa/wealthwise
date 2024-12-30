import { CountryDropdown } from '@/components/CountryDropdown';
import { AIService } from '@/utils/ai/service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AiPreferencesSelector } from '../components/AiPreferencesSelector';
import { Button } from '../components/Button';
import { GoalSelector } from '../components/GoalSelector';
import { HouseholdSelector } from '../components/HouseholdSelector';
import { ProgressDots } from '../components/ProgressDots';
import { usePreferencesStore } from '../store/preferences-store';
import { getCountryInfo, getCountryOptions, getUserCountry } from '../utils/constants/countries';
import { getQuoteForStep } from '../utils/constants/quotes';
import { FinancialGoal, HouseholdProfile } from '../utils/types/preferences';

export const ONBOARDING_STEPS = [
  {
    id: 'country',
    title: 'Welcome to WealthWise',
    subtitle: "Let's customize your experience to your location",
    icon: 'globe-outline',
    color: '#E8F5E9',
    validation: (data: any) => !!data.country
  },
  {
    id: 'household',
    title: 'Your Household Profile',
    subtitle: "Help us personalize your financial journey",
    icon: 'account-group',
    color: '#E1F5FE',
    validation: (data: any) => !!data.householdProfile
  },
  {
    id: 'goals',
    title: 'Set Your Goals',
    subtitle: "What would you like to achieve?",
    icon: 'target',
    color: '#FFF3E0',
    validation: (data: any) => !!data.primaryGoal
  },
  {
    id: 'ai',
    title: 'Smart Recommendations',
    subtitle: "Choose how you'd like to be guided",
    icon: 'brain',
    color: '#E3F2FD',
    validation: (data: any) => typeof data.aiEnabled === 'boolean'
  }
];

// Add new state interface
interface OnboardingState {
  isLoadingAI: boolean;
  aiGoals: FinancialGoal[] | null;
  country: string;
  currency: string;
  primaryGoal: FinancialGoal | null;
  aiEnabled: boolean | null;
  householdProfile: HouseholdProfile | null;
}

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { setPreferences, completeOnboarding, hasCompletedOnboarding, country } = usePreferencesStore();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const defaultCountry = useMemo(() => getUserCountry(), []);
  
  // Initialize stepData with default country
  const [stepData, setStepData] = useState<OnboardingState>({
    isLoadingAI: false,
    aiGoals: null,
    country: defaultCountry.code,
    currency: defaultCountry.currency,
    primaryGoal: null,
    aiEnabled: null,
    householdProfile: null
  });

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Keep track of completed steps
  const [completedSteps, setCompletedSteps] = useState<{
    [key: string]: boolean;
  }>({});

  // Set preferences with default country on mount
  useEffect(() => {
    setPreferences({
      country: defaultCountry.code,
      currency: defaultCountry.currency
    });
  }, []);

  // Get all countries and memoize the list
  const countries = useMemo(() => getCountryOptions().map(option => getCountryInfo(option.value)), []);

  // Prevent direct URL access if onboarding is completed
  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  const animateTransition = (forward = true) => {
    // Prevent multiple animations from running simultaneously
    if (fadeAnim._value !== 1) return;

    // Configure smoother animation timing
    const timing = {
      duration: 400,
      useNativeDriver: true,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Smooth easing curve
    };

    // Start with fade out and slide
    Animated.parallel([
      // Fade and scale out slightly
      Animated.timing(fadeAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      // Minimal slide
      Animated.timing(slideAnim, {
        toValue: forward ? -20 : 20,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      // Subtle scale
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      })
    ]).start(() => {
      // Update step
      slideAnim.setValue(forward ? 20 : -20);
      forward ? setStep(step + 1) : setStep(step - 1);
      
      // Spring back to original position
      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 300,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 300,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 300,
        })
      ]).start();
    });
  };

  const handleBack = () => {
    if (step > 0) {
      animateTransition(false);
    }
  };

  const handleComplete = async () => {
    await setPreferences({
      ...stepData,
      primaryGoal: stepData.primaryGoal || undefined,
      aiEnabled: stepData.aiEnabled || undefined
    });
    completeOnboarding();
    router.replace('/(tabs)');
  };

  // Modify fetchAIGoals to include household profile
  const fetchAIGoals = async (countryCode: string, householdProfile: OnboardingState['householdProfile']) => {
    try {
      setStepData(prev => ({ ...prev, isLoadingAI: true }));
      const response = await AIService.getCountrySpecificGoals(countryCode, householdProfile || undefined);
      setStepData(prev => ({ 
        ...prev, 
        aiGoals: response.goals,
        isLoadingAI: false 
      }));
      return true;
    } catch (error) {
      console.error('Failed to fetch AI goals:', error);
      setStepData(prev => ({ ...prev, isLoadingAI: false }));
      return false;
    }
  };

  // Modify handleNextStep to fetch AI goals after household step
  const handleNextStep = async () => {
    if (step === 1 && stepData.householdProfile) {
      setIsLoading(true);
      const success = await fetchAIGoals(stepData.country, stepData.householdProfile);
      setIsLoading(false);
      if (!success) {
        // Continue anyway, will use default goals
      }
    }
    
    setCompletedSteps(prev => ({
      ...prev,
      [ONBOARDING_STEPS[step].id]: true
    }));
    animateTransition(true);
  };

  const canContinue = () => {
    return ONBOARDING_STEPS[step].validation(stepData);
  };

  const renderStepContent = (step: number) => {
    const currentStep = ONBOARDING_STEPS[step];
    const quote = getQuoteForStep(step);

    return (
      <View style={styles.stepContainer}>
        <View style={styles.topSection}>
          <View style={styles.messageSection}>
            <Text style={styles.quote}>"{quote.quote}"</Text>
            <Text style={styles.author}>— {quote.author}</Text>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.inputSection}>
              {step === 0 && (
                <CountryDropdown
                  value={stepData.country || defaultCountry.code}
                  options={countries}
                  showPicker={showCountryPicker}
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                  onSelect={(countryInfo) => {
                    setStepData(prev => ({
                      ...prev,
                      country: countryInfo.code,
                      currency: countryInfo.currency
                    }));
                    setPreferences({
                      country: countryInfo.code,
                      currency: countryInfo.currency
                    });
                    setShowCountryPicker(false);
                    setCompletedSteps(prev => ({
                      ...prev,
                      country: true
                    }));
                  }}
                />
              )}

              {step === 1 && (
                <HouseholdSelector
                  value={stepData.householdProfile}
                  onSelect={(profile) => {
                    setStepData(prev => ({
                      ...prev,
                      householdProfile: profile
                    }));
                    setCompletedSteps(prev => ({
                      ...prev,
                      household: true
                    }));
                  }}
                />
              )}

              {step === 2 && (
                <GoalSelector
                  value={stepData.primaryGoal} // Pass current value
                  onSelect={(goal) => {
                    setStepData(prev => ({
                      ...prev,
                      primaryGoal: goal
                    }));
                    setCompletedSteps(prev => ({
                      ...prev,
                      goals: true
                    }));
                  }}
                  customGoals={stepData.aiGoals}
                  isLoading={stepData.isLoadingAI}
                />
              )}

              {step === 3 && (
                <AiPreferencesSelector
                  value={stepData.aiEnabled} // Pass current value
                  onSelect={(enabled) => {
                    setStepData(prev => ({
                      ...prev,
                      aiEnabled: enabled
                    }));
                    setCompletedSteps(prev => ({
                      ...prev,
                      ai: true
                    }));
                  }}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <ProgressDots 
            total={ONBOARDING_STEPS.length} 
            current={step}
            completed={completedSteps}
          />
          <Button
            title={step === 3 ? "Get Started" : "Continue"}
            onPress={() => {
              if (step === 3) {
                setPreferences({
                  ...stepData,
                  primaryGoal: stepData.primaryGoal || undefined,
                  aiEnabled: stepData.aiEnabled || undefined
                }); // Save all data
                handleComplete();
              } else {
                handleNextStep();
              }
            }}
            disabled={!canContinue()}
            loading={isLoading}
            style={styles.continueButton}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View 
        style={[
          styles.background, 
          { backgroundColor: ONBOARDING_STEPS[step].color }
        ]}
      />
      
      {step > 0 && (
        <Pressable 
          onPress={handleBack} 
          style={[
            styles.backButton, 
            { top: insets.top + 20 }
          ]}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#232D59" />
        </Pressable>
      )}

      <Animated.View 
        style={[styles.content, {
          opacity: fadeAnim,
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim },
            // Add slight rotation for more natural feel
            {
              rotate: slideAnim.interpolate({
                inputRange: [-20, 0, 20],
                outputRange: ['0.5deg', '0deg', '-0.5deg'],
              })
            }
          ]
        }]}
      >
        {renderStepContent(step)}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%', // Only cover the top portion
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topSection: {
    flex: 1,
  },
  messageSection: {
    paddingTop: 60,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#232D59',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    lineHeight: 24,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    opacity: 0.8,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputSection: {
    flex: 1,
    gap: 24,
  },
  bottomSection: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 32,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButton: {
    width: '100%', // Full width button
    marginTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden', // Prevent flickering
    perspective: '1000px', // Improve 3D transforms
    willChange: 'transform', // Optimize animations
  },
  quote: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232D59',

    fontStyle: 'italic',
    padding: 16,
  },
  author: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#232D59',
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
});
