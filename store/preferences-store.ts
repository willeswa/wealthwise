import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getUserCountry, SUPPORTED_COUNTRIES } from '../utils/constants/countries';
import { setDefaultCurrency } from '../utils/db/utils/settings';
import { UserPreferences } from '../utils/types/preferences';

const defaultCountry = getUserCountry();

interface PreferencesStore extends UserPreferences {
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  completeOnboarding: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      country: defaultCountry.code,
      currency: defaultCountry.currency,
      locale: Localization.locale,
      primaryGoal: 'SAVE_EMERGENCY',
      aiEnabled: false,
      hasCompletedOnboarding: false,
      householdProfile: null,

      setPreferences: async (preferences) => {
        // If currency is being updated, sync with database
        if (preferences.currency) {
          await setDefaultCurrency(preferences.currency);
        }
        
        set((state) => ({
          ...state,
          ...preferences,
          // Always update locale when changing country
          locale: preferences.country ? 
            SUPPORTED_COUNTRIES.find(c => c.code === preferences.country)?.code || state.locale : 
            state.locale,
          householdProfile: preferences.householdProfile || state.householdProfile,
        }));
      },

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
