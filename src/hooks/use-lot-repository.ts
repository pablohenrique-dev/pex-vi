import { useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { SqliteLotRepository } from '@/db/lot-repository';

export function useLotRepository() {
  const database = useSQLiteContext();
  return useMemo(() => new SqliteLotRepository(database), [database]);
}
