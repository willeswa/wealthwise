import { BackgroundFetchResult } from 'expo-background-fetch';
import { collectAIAnalysisData, checkAIInsightsEligibility, clearOldInsights } from '../ai/helpers';
import { AIService } from '../ai/service';
import { getDatabase } from '../db/utils/setup';
import { usePreferencesStore } from '../../store/preferences-store';

// Add a helper function to sanitize AI messages
function sanitizeMessage(message: string, data: any): string {
  // Replace common template variables
  return message
    .replace(/{budgetData\.savingsRate}%/, `${data.savingsRate.toFixed(1)}%`)
    .replace(/{budgetData\.monthlyIncome}/, data.monthlyIncome.toString())
    .replace(/{goal}/, data.goal || 'financial stability')
    // Add any other template variables that need replacing
    .replace(/{[^}]+}/g, ''); // Catch any remaining template variables
}

export async function handleAIAnalysisTask(): Promise<BackgroundFetchResult> {
    const {country} = usePreferencesStore.getState();
    try {
        await clearOldInsights();

        const eligibility = await checkAIInsightsEligibility();
        if (!eligibility.eligible) {
            return BackgroundFetchResult.NoData;
        }

        const analysisData = await collectAIAnalysisData();
        
        try {
            const insights = await AIService.analyzeBudget({
                ...analysisData,
                country: country,
                goal: 'SAVE_EMERGENCY',
                debt: JSON.stringify(analysisData.debts),
                investments: JSON.stringify(analysisData.investments),
                budgetData: JSON.stringify(analysisData.spendingTrends)
            });

            if (!insights?.insights?.length) {
                console.warn('No valid insights generated');
                return BackgroundFetchResult.NoData;
            }

            const db = getDatabase();
            await db.execAsync('DELETE FROM ai_insights');
            
            // Insert new insights with sanitized messages
            await db.execAsync(`
                INSERT INTO ai_insights (
                    type,
                    title,
                    message,
                    category,
                    amount,
                    impact_score,
                    valid_until,
                    created_at
                ) VALUES ${insights.insights.map(insight => {
                    const type = getInsightType(insight.icon);
                    const category = insight.iconColor || type;
                    const amount = extractAmount(insight.message) || null;
                    const impactScore = getImpactScore(insight.iconColor || '');
                    
                    // Sanitize the message before storing
                    const sanitizedMessage = sanitizeMessage(insight.message, analysisData);
                    
                    return `(
                        '${type}',
                        '${insight.title.replace(/'/g, "''")}',
                        '${sanitizedMessage.replace(/'/g, "''")}',
                        '${category}',
                        ${amount ? amount : 'NULL'},
                        ${impactScore},
                        datetime('now', '+7 days'),
                        CURRENT_TIMESTAMP
                    )`;
                }).join(',')}
            `);

            return BackgroundFetchResult.NewData;
        } catch (aiError) {
            console.error('AI Analysis failed:', aiError);
            // Don't throw, return Failed result instead
            return BackgroundFetchResult.Failed;
        }
    } catch (error) {
        console.error('Critical error in handleAIAnalysisTask:', error);
        return BackgroundFetchResult.Failed;
    }
}

// Helper functions to map AI response to database schema
function getInsightType(icon: string): string {
    switch (icon) {
        case 'trending-down':
        case 'calculator':
            return 'spending';
        case 'save':
        case 'wallet':
            return 'saving';
        case 'warning':
            return 'alert';
        default:
            return 'recommendation';
    }
}

function getImpactScore(color: string): number {
    // Map colors to impact scores
    switch (color.toLowerCase()) {
        case '#dc2626': // Red - urgent
            return 9;
        case '#2563eb': // Blue - optimization
            return 6;
        case '#16a34a': // Green - positive
            return 4;
        default:
            return 5;
    }
}

function extractAmount(message: string): number | null {
    // Look for currency amounts in the message
    const match = message.match(/[\$£€]?\d+([.,]\d{2})?/);
    if (match) {
        return parseFloat(match[0].replace(/[^\d.]/g, ''));
    }
    return null;
}

export async function handleInvestmentInfoTask(): Promise<BackgroundFetchResult> {
   
    const {country} = usePreferencesStore.getState();

    try {
        const db = getDatabase();
        
        // Get current portfolio data
        const portfolio = await db.getAllAsync(`
            SELECT json_group_array(
                json_object(
                    'name', name,
                    'type', type,
                    'value', current_value,
                    'risk_level', risk_level
                )
            ) as portfolio
            FROM investments
        `);

        const settings = await db.getFirstAsync(`
            SELECT value as country_code FROM settings WHERE key = 'country_code'
        `);

        if (!portfolio?.[0]?.portfolio) {
            return BackgroundFetchResult.NoData;
        }

        const updates = await AIService.getInvestmentUpdates({
            country: country || 'KE',
            riskLevel: 'Medium', // You might want to calculate this
            portfolio: portfolio[0].portfolio
        });

        if (!updates?.updates?.length) {
            return BackgroundFetchResult.NoData;
        }

        // Store updates in database
        await db.execAsync(`
            INSERT INTO investment_insights (
                type,
                title,
                description,
                impact,
                action_required,
                urgency,
                source,
                affected_investments,
                created_at,
                insight_type
            ) VALUES ${updates.updates.map(update => `(
                '${update.type}',
                '${update.title.replace(/'/g, "''")}',
                '${update.description.replace(/'/g, "''")}',
                '${update.impact.replace(/'/g, "''")}',
                '${update.action.replace(/'/g, "''")}',
                '${update.urgency}',
                '${update.source.replace(/'/g, "''")}',
                '${JSON.stringify(update.affectedInvestments)}',
                CURRENT_TIMESTAMP,
                'daily'
            )`).join(',')}
        `);

        return BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('Investment info task failed:', error);
        return BackgroundFetchResult.Failed;
    }
}

export async function handleInvestmentEmpowermentTask(): Promise<BackgroundFetchResult> {
    try {
        const db = getDatabase();
        const { country, primaryGoal } = usePreferencesStore.getState();
        
        // Get user profile and portfolio data
        const [portfolio, income] = await Promise.all([
            db.getAllAsync(`
                SELECT json_group_array(
                    json_object(
                        'name', name,
                        'type', type,
                        'value', current_value,
                        'risk_level', risk_level
                    )
                ) as portfolio
                FROM investments
            `),
            db.getFirstAsync(`
                SELECT SUM(amount) as monthly_income
                FROM income
                WHERE frequency = 'Monthly'
            `)
        ]);

        if (!portfolio?.[0]?.portfolio) {
            return BackgroundFetchResult.NoData;
        }

        const opportunities = await AIService.getInvestmentOpportunities({
            country,
            goal: primaryGoal.value,
            riskLevel: 'Medium',
            experience: 'intermediate',
            income: income?.monthly_income || 0,
            portfolio: portfolio[0].portfolio
        });

        if (!opportunities?.insights?.length) {
            return BackgroundFetchResult.NoData;
        }

        // Store opportunities in database
        await db.execAsync(`
            INSERT INTO investment_insights (
                type,
                title,
                description,
                rationale,
                requirements,
                potential_return,
                created_at,
                insight_type
            ) VALUES ${opportunities.insights.map(insight => `(
                '${insight.type}',
                '${insight.title.replace(/'/g, "''")}',
                '${insight.description.replace(/'/g, "''")}',
                '${insight.rationale.replace(/'/g, "''")}',
                '${JSON.stringify(insight.requirements)}',
                '${JSON.stringify(insight.potentialReturn)}',
                CURRENT_TIMESTAMP,
                'weekly'
            )`).join(',')}
        `);

        return BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('Investment empowerment task failed:', error);
        return BackgroundFetchResult.Failed;
    }
}
