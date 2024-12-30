import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Animated, Easing } from "react-native";
import { Card } from "./card";
import { colors } from "../utils/colors";
import { useInvestmentStore } from "@/store/investment-store";
import { executeInvestmentAnalysis } from "@/utils/background/task-manager";
import { LinearGradient } from 'expo-linear-gradient';

const INVESTMENT_COLORS = {
  accent: '#2563eb',
  types: {
    stock: { color: '#00C805', bg: '#E6F9E7' },
    bond: { color: '#5B6CF9', bg: '#ECEEFE' },
    crypto: { color: '#F7931A', bg: '#FEF6E6' },
    real_estate: { color: '#FF6B6B', bg: '#FFE9E9' },
    default: { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' }
  }
};

const ANALYSIS_MESSAGES = [
  "Analyzing market conditions...",
  "Evaluating investment opportunities...",
  "Calculating risk metrics...",
  "Reviewing portfolio allocation...",
  "Generating personalized recommendations..."
];

export const InvestmentAIInsights = () => {
  const { insights, fetchInsights } = useInvestmentStore();
  const { daily: dailyInsight, weekly: weeklyInsights, loading } = insights;
  const [analyzing, setAnalyzing] = useState(false);

  const slideAnim = useRef(new Animated.Value(-15)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    const refreshInsights = async () => {
      try {
        setAnalyzing(true);
        await executeInvestmentAnalysis();
        await fetchInsights();
      } catch (error) {
        console.error('Error refreshing insights:', error);
      } finally {
        setAnalyzing(false);
      }
    };

    refreshInsights();
  }, []);

  useEffect(() => {
    if (analyzing) {
      const messageRotation = setInterval(() => {
        setLoadingMessageIndex(current => 
          (current + 1) % ANALYSIS_MESSAGES.length
        );
      }, 3000);
      return () => clearInterval(messageRotation);
    }
  }, [analyzing]);

  useEffect(() => {
    if (weeklyInsights?.length > 0) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          mass: 0.6,
          stiffness: 150,
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
  }, [weeklyInsights]);

  if (loading || analyzing) {
    return (
      <Card style={styles.innerContainer}>
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.08)', 'rgba(37, 99, 235, 0)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="trending-up" size={24} color={INVESTMENT_COLORS.accent} />
              <Text style={styles.title}>Investment Insights</Text>
            </View>
            <Text style={styles.subtitle}>AI-powered market analysis</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={INVESTMENT_COLORS.accent} />
          <Text style={styles.loadingText}>
            {ANALYSIS_MESSAGES[loadingMessageIndex]}
          </Text>
        </View>
      </Card>
    );
  }

  if (!weeklyInsights?.length) return null;

  return (
    <Animated.View style={[styles.container, {
      transform: [
        { translateY: slideAnim },
        { scale: scaleAnim }
      ],
      opacity: opacityAnim,
    }]}>
      <Card style={styles.innerContainer}>
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.08)', 'rgba(37, 99, 235, 0)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Ionicons name="trending-up" size={24} color={INVESTMENT_COLORS.accent} />
              <Text style={styles.title}>Investment Insights</Text>
            </View>
            <Text style={styles.subtitle}>AI-powered market analysis</Text>
          </View>
        </LinearGradient>

        <View style={styles.insightsList}>
          {weeklyInsights.map((insight, index) => {
            const type = getInvestmentType(insight.title);
            const colors = INVESTMENT_COLORS.types[type] || INVESTMENT_COLORS.types.default;
            
            return (
              <View key={index} style={[styles.insightItem, { borderLeftColor: colors.color }]}>
                <Text numberOfLines={1} style={styles.insightTitle}>
                  {insight.title}
                </Text>
                <Text style={styles.insightText}>{insight.description}</Text>
                {insight.requirements && (
                  <View style={styles.riskIndicator}>
                    <Ionicons 
                      name="shield-outline" 
                      size={14} 
                      color={getRiskColor(JSON.parse(insight.requirements).riskLevel)} 
                    />
                    <Text style={[styles.riskText, { 
                      color: getRiskColor(JSON.parse(insight.requirements).riskLevel)
                    }]}>
                      {JSON.parse(insight.requirements).riskLevel} Risk
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Card>
    </Animated.View>
  );
};

const getInvestmentType = (title: string): keyof typeof INVESTMENT_COLORS.types => {
  if (title.toLowerCase().includes('stock')) return 'stock';
  if (title.toLowerCase().includes('bond')) return 'bond';
  if (title.toLowerCase().includes('crypto')) return 'crypto';
  if (title.toLowerCase().includes('real')) return 'real_estate';
  return 'default';
};

const getRiskColor = (risk?: string) => {
  switch (risk?.toLowerCase()) {
    case 'high': return colors.warning;
    case 'medium': return '#FFB020';
    case 'low': return colors.success;
    default: return colors.accent;
  }
};

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    margin: 2,
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
    shadowOffset: { width: 0, height: 1 },
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
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '500',
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
