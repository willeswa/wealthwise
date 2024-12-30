import { BackgroundFetchResult } from 'expo-background-fetch';
import { collectAIAnalysisData, checkAIInsightsEligibility, clearOldInsights } from '../ai/helpers';
import { AIService } from '../ai/service';
import { getDatabase } from '../db/utils/setup';

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
                country: 'US',
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
