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
                type, title, message, category, amount, impact_score, valid_until
            ) VALUES ${insights.insights.map(r => {
                const normalizedImpactScore = Math.min(Math.max(r.impactScore || 5, 1), 10);
                return `(
                    'recommendation',
                    '${r.title.replace(/'/g, "''")}',
                    '${r.message.replace(/'/g, "''")}',
                    '${(r.iconBackground || '').replace(/'/g, "''")}',
                    ${r.iconColor || 0},
                    ${normalizedImpactScore},
                    datetime('now', '+7 days')
                )`;
            }).join(',')}
        `);

        return BackgroundFetchResult.NewData;
    } catch (error) {
        return BackgroundFetchResult.Failed;
    }
}
