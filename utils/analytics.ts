import * as Sentry from "@sentry/react-native";

/**
 * Initialize analytics services.
 * Currently, only Sentry is initialized.
 */
export const initializeAnalytics = () => {
    // Sentry Initialization
    if (!__DEV__) {
        Sentry.init({
            dsn: "https://d82f94159ce8afa3becfaba5d4545356@o4505939054034944.ingest.us.sentry.io/4508700305457152",
            // Adjust tracesSampleRate for your project's needs
            tracesSampleRate: 1.0, // Captures 100% of transactions for performance monitoring
            environment: __DEV__ ? "development" : "production",
        });
    }

};
