import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated, Easing } from "react-native";
import { Card } from "./card";
import { colors } from "../utils/colors";
import { useBudgetStore } from "@/store/budget-store";
import { executeAIAnalysis } from '../utils/background/task-manager';
import { checkAIInsightsEligibility } from '../utils/ai/helpers';
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

export const AIBudgetInsights = ({ onOptimize }: Props) => {
  const { aiInsights, fetchLatestInsights } = useBudgetStore();
  const [checking, setChecking] = useState(false);
  
  // Updated animation values
  const slideAnim = useRef(new Animated.Value(-15)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    checkAndUpdateInsights();
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

  const checkAndUpdateInsights = async () => {
    try {
      setChecking(true);
      const eligibility = await checkAIInsightsEligibility();
      console.log(eligibility)
      if (eligibility.eligible) {
        await executeAIAnalysis();
      }
      
      await fetchLatestInsights();
    } catch (error) {
      console.error('Error checking/updating insights:', error);
    } finally {
      setChecking(false);
    }
  };

  // Transform AI insights to component format
  const formattedInsights = aiInsights.map(insight => ({
    icon: getIconForInsightType(insight.type),
    title: insight.title,
    message: insight.message,
    iconColor: getColorForImpact(insight.impact_score),
    iconBackground: getBackgroundForImpact(insight.impact_score),
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

function getColorForImpact(score: number) {
  if (score >= 8) return FINANCE_COLORS.impactColors.high;
  if (score >= 5) return FINANCE_COLORS.impactColors.medium;
  return FINANCE_COLORS.impactColors.low;
}

function getBackgroundForImpact(score: number) {
  if (score >= 8) return FINANCE_COLORS.impactBackgrounds.high;
  if (score >= 5) return FINANCE_COLORS.impactBackgrounds.medium;
  return FINANCE_COLORS.impactBackgrounds.low;
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
  }
});
