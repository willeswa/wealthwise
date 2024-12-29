import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { handleAIAnalysisTask } from './task-helpers';

const AI_ANALYSIS_TASK = 'AI_ANALYSIS_TASK';
let isInitialized = false;

export const initializeBackgroundTasks = async () => {
    if (isInitialized) return;

    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(AI_ANALYSIS_TASK);
        if (isRegistered) {
            isInitialized = true;
            return;
        }

        TaskManager.defineTask(AI_ANALYSIS_TASK, async () => {
            try {
                return await handleAIAnalysisTask();
            } catch (error) {
                return BackgroundFetch.BackgroundFetchResult.Failed;
            }
        });

        await BackgroundFetch.registerTaskAsync(AI_ANALYSIS_TASK, {
            minimumInterval: 900,
            stopOnTerminate: false,
            startOnBoot: true
        });

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
