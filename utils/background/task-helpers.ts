import { BackgroundFetchResult } from 'expo-background-fetch';
import { collectAIAnalysisData, checkAIInsightsEligibility } from '../ai/helpers';
import { AIService } from '../ai/service';
import { getDatabase } from '../db/utils/setup';

export async function handleAIAnalysisTask(): Promise<BackgroundFetchResult> {
    try {
        const eligibility = await checkAIInsightsEligibility();
        if (!eligibility.eligible) {
            return BackgroundFetchResult.NoData;
        }

        const analysisData = await collectAIAnalysisData();
        const insights = await AIService.analyzeBudget({
            ...analysisData,
            country: 'US',
            goal: 'SAVE_EMERGENCY',
            debt: JSON.stringify(analysisData.debts),
            investments: JSON.stringify(analysisData.investments),
            budgetData: JSON.stringify(analysisData.spendingTrends)
        });

        const db = getDatabase();
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
                // Determine insight type based on icon
                const type = getInsightType(insight.icon);
                
                // Use the category from the AI response or fallback to type
                const category = insight.category || type;
                
                // Extract numeric amount from message if present
                const amount = extractAmount(insight.message) || null;
                
                // Calculate impact score based on color
                const impactScore = getImpactScore(insight.iconColor || '');
                
                return `(
                    '${type}',
                    '${insight.title.replace(/'/g, "''")}',
                    '${insight.message.replace(/'/g, "''")}',
                    '${category}',
                    ${amount ? amount : 'NULL'},
                    ${impactScore},
                    datetime('now', '+7 days'),
                    CURRENT_TIMESTAMP
                )`;
            }).join(',')}
        `);

        return BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('Error in handleAIAnalysisTask:', error);
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
