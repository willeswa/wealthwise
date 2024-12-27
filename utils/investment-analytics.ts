import {
  Investment,
  InvestmentRecommendation,
  PortfolioAnalytics,
  RecommendationType,
  RecommendationPriority,
  RiskLevel,
} from "./types/investment";

const calculateRiskScore = (investments: Investment[]): number => {
  const riskWeights = { Low: 1, Medium: 2, High: 3 };
  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.current_value,
    0
  );

  if (totalValue === 0) return 0;

  const weightedRisk = investments.reduce((sum, inv) => {
    const weight = inv.current_value / totalValue;
    return (
      sum + weight * riskWeights[inv.risk_level as keyof typeof riskWeights]
    );
  }, 0);

  // Convert to percentage (1-3 scale to 0-100)
  return ((weightedRisk - 1) / 2) * 100;
};

const calculateRiskDistribution = (investments: Investment[]) => {
  const totalValue = investments.reduce(
    (sum, inv) => sum + inv.current_value,
    0
  );

  if (totalValue === 0) {
    return { low: 0, medium: 0, high: 0 };
  }

  return investments.reduce(
    (dist, inv) => {
      const percentage = (inv.current_value / totalValue) * 100;
      dist[inv.risk_level.toLowerCase() as "low" | "medium" | "high"] +=
        percentage;
      return dist;
    },
    { low: 0, medium: 0, high: 0 }
  );
};

const getRiskLevel = (score: number): RiskLevel => {
  if (score < 33) return "Low";
  if (score < 66) return "Medium";
  return "High";
};

const generateRecommendations = (
  investments: Investment[]
): InvestmentRecommendation[] => {
  const distribution = calculateRiskDistribution(investments);
  const recommendations: InvestmentRecommendation[] = [];

  // Check risk distribution
  if (distribution.high > 50) {
    recommendations.push({
      type: "rebalance" as RecommendationType,
      title: "High Risk Alert",
      description:
        "Consider rebalancing your portfolio to reduce risk exposure",
      priority: "high" as RecommendationPriority,
    });
  }

  // Check for diversification
  if (investments.length < 3) {
    recommendations.push({
      type: "diversify" as RecommendationType,
      title: "Diversify Portfolio",
      description: "Add more investments to spread your risk",
      priority: "medium" as RecommendationPriority,
    });
  }

  // Check for regular contributions
  const hasRegularContributions = investments.some(
    (inv) => inv.type === "SACCO" || inv.type === "Money Market Fund"
  );
  if (!hasRegularContributions) {
    recommendations.push({
      type: "contribute" as RecommendationType,
      title: "Start Regular Contributions",
      description: "Consider adding regular investment contributions",
      priority: "low" as RecommendationPriority,
    });
  }

  return recommendations;
};

export const analyzePortfolio = (
  investments: Investment[]
): PortfolioAnalytics => {
  // Handle empty portfolio
  if (!investments.length) {
    return {
      bestPerforming: { name: "N/A", return: 0 },
      worstPerforming: { name: "N/A", return: 0 },
      riskAnalysis: {
        riskScore: 0,
        riskLevel: "Low",
        distribution: { low: 0, medium: 0, high: 0 },
      },
      recommendations: [],
    };
  }

  // Calculate risk metrics
  const riskScore = calculateRiskScore(investments);
  const distribution = calculateRiskDistribution(investments);

  // Find best and worst performing investments
  const sorted = [...investments].sort((a, b) => {
    const aReturn = a.current_value; // Simplified for example
    const bReturn = b.current_value;
    return bReturn - aReturn;
  });

  return {
    bestPerforming: {
      name: sorted[0].name,
      return: sorted[0].current_value,
    },
    worstPerforming: {
      name: sorted[sorted.length - 1].name,
      return: sorted[sorted.length - 1].current_value,
    },
    riskAnalysis: {
      riskScore,
      riskLevel: getRiskLevel(riskScore),
      distribution,
    },
    recommendations: generateRecommendations(investments),
  };
};
