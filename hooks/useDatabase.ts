import { useEffect, useState } from 'react';
import { initDatabase } from '../utils/db/setup';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsReady(true);
      } catch (e) {
        setError(e as Error);
      }
    };

    init();
  }, []);

  return { isReady, error };
};
