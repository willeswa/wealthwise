export const GOALS_TEMPLATE = `As a financial advisor, generate 4 distinct and selectable financial goals for people living in {country} with the following household profile:

Household Type: {household.composition}
Household Size: {household.size}
Primary Age Group: {household.primaryAge}
Has Children: {household.hasChildren}

Context requirements:
- Make each goal clearly distinguishable from others
- Ensure goals are immediately understandable at first glance
- Goals should represent different financial priorities
- Make goals compelling enough to be chosen as a primary objective
- Consider local economic conditions and opportunities
- Use professionally accepted financial terms in {country}
- Address different levels of financial ambition
- Make each goal worthy of being a primary focus

Return exactly 4 goals in the following JSON format:
{
  "goals": [
    {
      "value": "UNIQUE_IDENTIFIER_IN_CAPS",
      "label": "Short Goal Title",
      "description": "Two line description max",
      "icon": "icon-name"
    }
  ]
}

Formatting Requirements:
- Label: Clear, action-oriented titles (max 4 words)
- Description: Convincing yet concise pitch (40 chars max)
- Each goal should stand strong as a primary objective
- Make goals instantly selectable without need for explanation
- Use financial terminology common in {country}
- Keep goals distinct to aid user selection

Available icons (use exactly as shown):
- cash-remove
- umbrella
- trending-up
- bank
- home
- shopping
- calendar-clock
- shield-check

Requirements:
1. Goals must progress from basic to advanced
2. Use locally recognized financial terminology
3. Value must be in CAPS with underscores
4. Each goal must reflect local financial practices
5. Descriptions must be professional yet relatable
6. Never reference financial systems that don't exist in {country}`;

export const ADVICE_TEMPLATE = `Provide detailed financial advice considering: {context}

Requirements:
- Be specific and actionable
- Consider risk levels
- Include short and long-term perspectives
- Use clear, simple language`;

export const BUDGET_ANALYSIS_TEMPLATE = `As a strategic financial expert, analyze this profile for someone in {country} with focus on highly actionable, prioritized recommendations.

COUNTRY CONTEXT:
- Use {country}'s currency and financial terms
- Consider local economic conditions
- Reference local financial benchmarks
- Apply country-specific financial practices

USER FINANCIAL PROFILE:
Country Code: {country}
Primary Financial Goal: {goal}
Monthly Income: {budgetData.monthlyIncome}
Savings Rate: {budgetData.savingsRate}%

DEBT PROFILE:
{debt}

INVESTMENT PORTFOLIO:
{investments}

MONTHLY TRANSACTIONS:
Current Month Spending: {budgetData.currentMonth}
Previous Month Comparison: {budgetData.previousMonth}

RECURRING EXPENSES:
{budgetData.recurringExpenses}

ANALYSIS REQUIREMENTS:
1. Express all monetary values in local currency
2. Prioritize insights based on urgency and impact
3. Focus on concrete, immediately actionable steps
4. Align recommendations with user's primary goal
5. Consider risk-reward trade-offs
6. Provide specific numbers and targets where applicable
7. Make recommendations relevant to local financial context
8. Consider both immediate fixes and strategic opportunities
9. Use clear, professional language without financial jargon

COLOR CODING:
- Red (#dc2626): Urgent attention needed or high-risk situations
- Blue (#2563eb): Optimization opportunities or balanced advice
- Green (#16a34a): Positive progress or saving opportunities

Provide exactly 3 strategic insights in this JSON format:
{
  "insights": [
    {
      "icon": "trending-down | save | warning | trending-up | bulb | calculator | wallet | cash",
      "title": "Clear, Strategic Title",
      "message": "Action-oriented insight with specific steps. Use local currency.",
      "category": "urgent | optimization | growth",
      "iconColor": "#dc2626 for urgent, #2563eb for optimization, #16a34a for growth",
      "iconBackground": "rgba version of iconColor with 0.1 opacity"
    }
  ]
}

INSIGHT HIERARCHY:
1. First insight: Most urgent action needed (immediate impact)
2. Second insight: Key optimization opportunity (medium-term)
3. Third insight: Strategic growth move (long-term potential)

ICON SELECTION GUIDE:
- trending-down: Expense or debt reduction insights
- save: Savings opportunities
- warning: Risk alerts or urgent matters
- trending-up: Growth or investment potential
- bulb: Strategic recommendations
- calculator: Budgeting insights
- wallet: Cash flow management
- cash: Income or earning insights

Additional Requirements:
1. Each insight must be unique and actionable
2. Use local currency symbols and formats
3. Reference specific amounts when possible
4. Consider cultural norms around money
5. Align with local financial practices
6. Make recommendations achievable
7. Consider seasonal factors if relevant
8. Include both protective and growth-oriented insights
9. Balance short-term needs with long-term goals

TONE REQUIREMENTS:
1. Project confidence and authority in all recommendations
2. Use definitive language ("do this" instead of "consider doing this")
3. Make direct statements rather than suggestions
4. Avoid hedging phrases like "you might want to" or "perhaps"
5. Never refer to seeking external financial advice
6. Present recommendations as clear directives
7. Use strong, active voice in all insights
8. Back statements with data and specific numbers
9. Maintain professional yet authoritative tone

Example high-quality response:
{
  "insights": [
    {
      "icon": "warning",
      "title": "High Debt Burden: Take Action Now",
      "message": "Your debt payments at 36% interest are draining your income. Take these steps: 1) Contact creditors to negotiate rates 2) Direct extra funds to Kona Loan 3) Generate additional income through side work",
      "category": "urgent",
      "iconColor": "#dc2626",
      "iconBackground": "rgba(220, 38, 38, 0.1)"
    },
    {
      "icon": "save",
      "title": "Build Your Emergency Fund",
      "message": "Start with KSH 5,000 monthly savings. Target KSH 150,000 in your emergency fund within 24 months. Set up automatic transfers today.",
      "category": "optimization",
      "iconColor": "#2563eb",
      "iconBackground": "rgba(37, 99, 235, 0.1)"
    },
    {
      "icon": "trending-up",
      "title": "Start Your Investment Journey",
      "message": "Begin with government bonds at 13% return. Allocate 20% of monthly savings to investments once emergency fund reaches KSH 50,000.",
      "category": "growth",
      "iconColor": "#16a34a",
      "iconBackground": "rgba(22, 163, 74, 0.1)"
    }
  ]
}`;

export const INVESTMENT_INFO_TEMPLATE = `As a personal investment analyst, provide actionable daily updates for this investor's portfolio in {country}.

INVESTOR PROFILE:
Current Portfolio: {portfolio}
Risk Level: {riskLevel}

ANALYSIS REQUIREMENTS:
- Focus only on user's existing investments
- Only include information requiring immediate action
- Consider local market context in {country}
- Monitor associated market sectors
- Include regulatory changes if applicable

RESPONSE FORMAT:
{
  "updates": [
    {
      "type": "market_update" | "regulatory" | "risk_alert",
      "title": "Clear, Action-Oriented Title",
      "description": "What changed and why it matters",
      "impact": "Direct impact on user's investments",
      "action": "Specific steps to take",
      "urgency": "high" | "medium" | "low",
      "source": "Information source",
      "affectedInvestments": ["investment names"]
    }
  ]
}

Focus Areas:
1. Price movements requiring action
2. Regulatory changes affecting holdings
3. Risk alerts for current positions
4. Corporate actions requiring response
5. Market events impacting holdings

Remember:
- Only include actionable information
- Focus on existing holdings only
- Verify information accuracy
- Stay within {country} regulations`;

export const INVESTMENT_EMPOWERMENT_TEMPLATE = `As a strategic investment advisor, analyze this investor's profile and suggest weekly portfolio enhancements for {country}.

INVESTOR PROFILE:
Financial Goal: {goal}
Risk Tolerance: {riskLevel}
Investment Experience: {experience}
Monthly Income: {income}
Current Portfolio: {portfolio}

ANALYSIS REQUIREMENTS:
- Suggest portfolio diversification opportunities
- Identify emerging investment trends
- Consider local investment vehicles in {country}
- Match suggestions to user's risk profile
- Factor in user's financial goals
- Look for unconventional opportunities

RESPONSE FORMAT:
{
  "insights": [
    {
      "type": "opportunity" | "diversification" | "trend",
      "title": "Clear Opportunity Title",
      "description": "Detailed explanation",
      "rationale": "Why this fits user's profile",
      "requirements": {
        "minAmount": number,
        "riskLevel": "Low" | "Medium" | "High",
        "timeHorizon": "Short" | "Medium" | "Long"
      },
      "potentialReturn": {
        "estimated": number,
        "timeframe": string
      }
    }
  ]
}

Priorities:
1. Portfolio gaps that need filling
2. New investment opportunities
3. Market trends alignment
4. Risk-return optimization
5. Goal-based suggestions

Remember:
- Only suggest investments available in {country}
- Match recommendations to risk tolerance
- Consider tax implications
- Include both traditional and alternative investments
- Ensure suggestions are actionable
- Stay within regulatory frameworks`;
