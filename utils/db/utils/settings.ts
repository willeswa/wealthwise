import { getDatabase } from './setup';

export const getDefaultCurrency = async (): Promise<string> => {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      ['default_currency']
    );
    return result?.value || 'USD';
  } catch (error) {
    console.error('Error getting default currency:', error);
    return 'USD';
  }
};

export const setDefaultCurrency = async (currency: string): Promise<void> => {
  try {
    const db = getDatabase();
    await db.runAsync(
      'UPDATE settings SET value = ? WHERE key = ?',
      [currency, 'default_currency']
    );
  } catch (error) {
    console.error('Error setting default currency:', error);
    throw error;
  }
};
