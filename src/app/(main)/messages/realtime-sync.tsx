'use client';

import { useRealtimeSync } from './model/use-realtime-sync';

/** Мост уровня app: shared-транспорт не должен знать о сущностях. */
export function RealtimeSync() {
  useRealtimeSync();
  return null;
}
