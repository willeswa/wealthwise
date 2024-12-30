import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { handleAIAnalysisTask, handleInvestmentEmpowermentTask, handleInvestmentInfoTask } from './task-helpers';

const AI_ANALYSIS_TASK = 'AI_ANALYSIS_TASK';
const INVESTMENT_INFO_TASK = 'INVESTMENT_INFO_TASK';
const INVESTMENT_EMPOWERMENT_TASK = 'INVESTMENT_EMPOWERMENT_TASK';
let isInitialized = false;

export const initializeBackgroundTasks = async () => {
    if (isInitialized) return;

    try {
        const tasks = [
            { name: AI_ANALYSIS_TASK, interval: 900 },
            { name: INVESTMENT_INFO_TASK, interval: 86400 }, // Daily
            { name: INVESTMENT_EMPOWERMENT_TASK, interval: 604800 }, // Weekly
        ];

        for (const task of tasks) {
            const isRegistered = await TaskManager.isTaskRegisteredAsync(task.name);
            if (!isRegistered) {
                TaskManager.defineTask(task.name, async () => {
                    try {
                        switch (task.name) {
                            case AI_ANALYSIS_TASK:
                                return await handleAIAnalysisTask();
                            case INVESTMENT_INFO_TASK:
                                return await handleInvestmentInfoTask();
                            case INVESTMENT_EMPOWERMENT_TASK:
                                return await handleInvestmentEmpowermentTask();
                        }
                    } catch (error) {
                        return BackgroundFetch.BackgroundFetchResult.Failed;
                    }
                });

                await BackgroundFetch.registerTaskAsync(task.name, {
                    minimumInterval: task.interval,
                    stopOnTerminate: false,
                    startOnBoot: true
                });
            }
        }

        isInitialized = true;
    } catch (error) {
        throw error;
    }
};

export const checkBackgroundStatus = async () => {
    try {
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(AI_ANALYSIS_TASK);
        return { status, isRegistered, isInitialized };
    } catch (error) {
        throw error;
    }
};

export const cleanupBackgroundTasks = async () => {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(AI_ANALYSIS_TASK);
        if (isRegistered) {
            await BackgroundFetch.unregisterTaskAsync(AI_ANALYSIS_TASK);
            isInitialized = false;
        }
    } catch (error) {
    }
};

export const executeAIAnalysis = async () => {
    if (!isInitialized) {
        console.log('Initializing background tasks...');
        await initializeBackgroundTasks();
    }
    
    try {
        const result = await handleAIAnalysisTask();
        return result;
    } catch (error) {
        throw error;
    }
};

export const executeInvestmentAnalysis = async () => {
    if (!isInitialized) {
        await initializeBackgroundTasks();
    }
    
    try {
        const [infoResult] = await Promise.all([
            // handleInvestmentInfoTask(),
            handleInvestmentEmpowermentTask()
        ]);
        return { infoResult };
    } catch (error) {
        throw error;
    }
};
