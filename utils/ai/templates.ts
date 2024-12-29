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

export const BUDGET_ANALYSIS_TEMPLATE = `As a premium personal finance expert, analyze this financial profile for someone in {country} (country code). Focus on providing highly localized, culturally relevant advice.

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

COUNTRY-SPECIFIC CONTEXT:
- Consider regulatory environment and financial products available in {country}
- Account for local banking practices and interest rates
- Factor in country-specific debt management approaches
- Include cultural attitudes towards saving and investing
- Reference local financial institutions and services
- Consider regional economic conditions and cost of living

Provide exactly 3 unique and diverse premium insights in this JSON format:
{
  "insights": [
    {
      "icon": "trending-down | save | warning | trending-up | bulb | calculator | wallet | cash",
      "title": "Clear, Impactful Title",
      "message": "Actionable insight under 120 characters. DO NOT use template variables in messages.",
      "category": "spending | saving | alert | recommendation",
      "iconColor": "hex color code",
      "iconBackground": "rgba color with 0.1 opacity"
    }
  ]
}

ANALYSIS REQUIREMENTS:
1. Each insight MUST be unique and focus on a different aspect of financial health
2. Never repeat similar suggestions or themes across insights
3. Distribute insights across different categories (spending, saving, alerts)
4. Each insight should address a distinct financial opportunity or concern
5. Make all advice specific to {country}'s financial ecosystem
6. Consider cultural norms around money management
7. Provide concrete, actionable steps relevant to local context
8. Use financial terminology familiar in {country}

INSIGHT DISTRIBUTION (exactly one of each):
- First insight: Focus on immediate action or urgent matter
- Second insight: Address medium-term optimization
- Third insight: Target long-term financial growth

COLOR CODING:
- Red (#dc2626): Urgent attention needed or high-risk situations
- Blue (#2563eb): Optimization opportunities or balanced advice
- Green (#16a34a): Positive progress or saving opportunities

ICON SELECTION GUIDE:
- trending-down: Expense or debt reduction insights
- save: Savings opportunities
- warning: Risk alerts or urgent matters
- trending-up: Growth or investment potential
- bulb: Strategic recommendations
- calculator: Budgeting insights
- wallet: Cash flow management
- cash: Income or earning insights`;
