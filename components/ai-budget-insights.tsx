import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing, ActivityIndicator } from "react-native";
import { Card } from "./card";
import { colors } from "../utils/colors";
import { useBudgetStore } from "@/store/budget-store";
import { executeAIAnalysis } from '../utils/background/task-manager';
import { checkAIInsightsEligibility, collectAIAnalysisData } from '../utils/ai/helpers';
import { LinearGradient } from 'expo-linear-gradient';

const FINANCE_COLORS = {
  accent: '#2563eb', // Refined blue
  impactColors: {
    high: '#dc2626',    // Refined red
    medium: '#2563eb',  // Refined blue
    low: '#16a34a',     // Refined green
  },
  impactBackgrounds: {
    high: 'rgba(255, 82, 82, 0.1)',
    medium: 'rgba(30, 136, 229, 0.1)',
    low: 'rgba(76, 175, 80, 0.1)',
  }
};

interface InsightItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  iconColor?: string;
  iconBackground?: string;
}

interface Props {
  onOptimize?: () => void;
}

// Add loading messages based on context
const ANALYSIS_MESSAGES = {
  default: [
    "Analyzing your financial patterns...",
    "Reviewing your spending habits...",
    "Preparing personalized insights..."
  ],
  highDebt: [
    "Analyzing debt reduction opportunities...",
    "Calculating optimal repayment strategies...",
    "Finding ways to reduce interest costs..."
  ],
  investment: [
    "Evaluating investment performance...",
    "Analyzing market opportunities...",
    "Reviewing portfolio allocation..."
  ],
  savings: [
    "Identifying saving opportunities...",
    "Analyzing spending patterns...",
    "Calculating potential savings targets..."
  ],
  overspending: [
    "Reviewing expense patterns...",
    "Finding cost-cutting opportunities...",
    "Analyzing budget optimization options..."
  ]
};

export const AIBudgetInsights = ({ onOptimize }: Props) => {
  const { aiInsights, fetchLatestInsights } = useBudgetStore();
  const [checking, setChecking] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  // Updated animation values
  const slideAnim = useRef(new Animated.Value(-15)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  console.log('AI insights:', aiInsights);

  useEffect(() => {
    checkAndUpdateInsights();
    
    // Refresh every 5 minutes if the app is open
    const refreshInterval = setInterval(() => {
      checkAndUpdateInsights();
    }, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Enhanced animation sequence
  useEffect(() => {
    if (aiInsights.length > 0) {
      // Configure smoother animation timing
      const timing = {
        duration: 300,
        useNativeDriver: true,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      };

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          mass: 0.6,
          stiffness: 150,
          restDisplacementThreshold: 0.001,
          restSpeedThreshold: 0.001,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          mass: 0.6,
          stiffness: 150,
        }),
      ]).start();
    }
  }, [aiInsights]);

  // Add useEffect for rotating loading messages
  useEffect(() => {
    if (checking) {
      const messageRotation = setInterval(() => {
        setLoadingMessageIndex(current => 
          (current + 1) % ANALYSIS_MESSAGES.default.length
        );
      }, 3000); // Rotate every 3 seconds

      return () => clearInterval(messageRotation);
    }
  }, [checking]);

  const checkAndUpdateInsights = async () => {
    try {
      setChecking(true);
      const eligibility = await checkAIInsightsEligibility();
      
      if (eligibility.eligible) {
        // Collect analysis data first
        const data = await collectAIAnalysisData();
        setAnalysisData(data);
        await executeAIAnalysis();
      }
      
      await fetchLatestInsights();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error checking/updating insights:', error);
    } finally {
      setChecking(false);
    }
  };

  const getContextualLoadingMessages = () => {
    if (!analysisData) return ANALYSIS_MESSAGES.default;

    const { debts, investments, savingsRate, spendingTrends } = analysisData;
    
    if (debts?.length > 0) {
      return ANALYSIS_MESSAGES.highDebt;
    }
    if (investments?.length > 0) {
      return ANALYSIS_MESSAGES.investment;
    }
    if (savingsRate < 10) {
      return ANALYSIS_MESSAGES.savings;
    }
    if (spendingTrends?.currentMonth?.length > 0) {
      return ANALYSIS_MESSAGES.overspending;
    }
    return ANALYSIS_MESSAGES.default;
  };

  // Show loading state with header
  if (checking) {
    const messages = getContextualLoadingMessages();
    return (
      <Card style={styles.innerContainer}>
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.08)', 'rgba(37, 99, 235, 0)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="sparkles" size={24} color={FINANCE_COLORS.accent} />
              <Text style={styles.title}>AI Insights</Text>
            </View>
            <Text style={styles.subtitle}>Personalized financial recommendations</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={FINANCE_COLORS.accent} />
          <Text style={styles.loadingText}>
            {messages[loadingMessageIndex]}
          </Text>
        </View>
      </Card>
    );
  }

  // Transform AI insights to component format
  const formattedInsights = aiInsights.map(insight => ({
    icon: getIconForInsightType(insight.type),
    title: insight.title,
    message: insight.message,
    iconColor: getCategoryColor(insight.type),
    iconBackground: getCategoryBackground(insight.type),
  }));

  if (!formattedInsights.length) {
    return null;
  }

  return (
    <Animated.View style={[
      styles.container,
      {
        transform: [
          { translateY: slideAnim },
          { scale: scaleAnim },
          {
            rotate: slideAnim.interpolate({
              inputRange: [-15, 0],
              outputRange: ['0.3deg', '0deg'],
              extrapolate: 'clamp'
            })
          }
        ],
        opacity: opacityAnim,
        shadowOpacity: opacityAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.1]
        })
      }
    ]}>
      <Card style={styles.innerContainer}>
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.08)', 'rgba(37, 99, 235, 0)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="sparkles" size={24} color={FINANCE_COLORS.accent} />
              <Text style={styles.title}>AI Insights</Text>
            </View>
            <Text style={styles.subtitle}>Personalized financial recommendations</Text>
          </View>
        </LinearGradient>

        <View style={styles.insightsList}>
          {formattedInsights.map((insight, index) => (
            <View 
              key={index} 
              style={[
                styles.insightItem,
                { borderLeftColor: insight.iconColor }
              ]}
            >
              <Text numberOfLines={1} style={styles.insightTitle}>
                {insight.title}
              </Text>
              <Text style={styles.insightText}>
                {insight.message}
              </Text>
            </View>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
};

function getIconForInsightType(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'spending': return 'trending-down';
    case 'saving': return 'save';
    case 'alert': return 'warning';
    case 'recommendation': return 'bulb';
    default: return 'information-circle';
  }
}

function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case 'urgent':
      return FINANCE_COLORS.impactColors.high;
    case 'optimization':
      return FINANCE_COLORS.impactColors.medium;
    case 'growth':
      return FINANCE_COLORS.impactColors.low;
    default:
      return FINANCE_COLORS.impactColors.medium;
  }
}

function getCategoryBackground(category: string) {
  switch (category.toLowerCase()) {
    case 'urgent':
      return FINANCE_COLORS.impactBackgrounds.high;
    case 'optimization':
      return FINANCE_COLORS.impactBackgrounds.medium;
    case 'growth':
      return FINANCE_COLORS.impactBackgrounds.low;
    default:
      return FINANCE_COLORS.impactBackgrounds.medium;
  }
}

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    margin: 2, // Add slight margin to prevent shadow clipping
  },
  innerContainer: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  headerGradient: {
    padding: 20,
    marginHorizontal: -16,
    marginTop: -16,
    borderRadius: 10,
  },
  header: {
    gap: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 32,
    fontWeight: '500',
  },
  insightsList: {
    gap: 12,
    marginTop: 16,
  },
  insightItem: {
    backgroundColor: colors.background.card,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  insightText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
