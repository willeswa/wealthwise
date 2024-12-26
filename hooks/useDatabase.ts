import { useEffect, useState } from 'react';
import { initDatabase } from '../utils/db/utils/setup';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSeeding, setIsSeeding] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setIsSeeding(true);
        await initDatabase();
        setIsSeeding(false);
        setIsReady(true);
      } catch (e) {
        setError(e as Error);
        setIsSeeding(false);
      }
    };

    init();
  }, []);

  return { isReady, error, isSeeding };
};
