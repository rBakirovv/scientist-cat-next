'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import type { RealtimeEvent } from './realtime-events';
import { useRealtimeConnection } from './use-realtime-connection';

type Status = 'connecting' | 'open' | 'closed';
type Handler = (event: RealtimeEvent) => void;

const RealtimeContext = createContext<{
  status: Status;
  subscribe: (handler: Handler) => () => void;
} | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const value = useRealtimeConnection();

  return <RealtimeContext value={value}>{children}</RealtimeContext>;
}

function useRealtime() {
  const value = useContext(RealtimeContext);
  if (!value) throw new Error('Хук realtime вызван вне RealtimeProvider');

  return value;
}

/** Подписка на события. Обработчик может меняться каждый рендер. */
export function useRealtimeEvents(handler: Handler) {
  const { subscribe } = useRealtime();
  const latest = useRef(handler);

  useEffect(() => {
    latest.current = handler;
  });

  useEffect(() => subscribe((event) => latest.current(event)), [subscribe]);
}

/**
 * Интервал опроса для запроса: пока сокет жив, опрашивать незачем, но при
 * обрыве поллинг подхватывает — деградация вместо «или-или».
 */
export function usePollingInterval(ms: number): number | false {
  const { status } = useRealtime();

  return status === 'open' ? false : ms;
}
