'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { isRealtimeEvent, type RealtimeEvent } from './realtime-events';

const URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3001';

// У WebSocket, в отличие от EventSource, переподключение не встроено.
const MIN_RETRY = 1000;
const MAX_RETRY = 30_000;

type Status = 'connecting' | 'open' | 'closed';
type Handler = (event: RealtimeEvent) => void;

const RealtimeContext = createContext<{
  status: Status;
  subscribe: (handler: Handler) => () => void;
} | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('connecting');
  const handlers = useRef<Set<Handler>>(new Set());

  const subscribe = useCallback((handler: Handler) => {
    handlers.current.add(handler);
    return () => {
      handlers.current.delete(handler);
    };
  }, []);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let retry = MIN_RETRY;
    let stopped = false;

    const connect = () => {
      if (stopped) return;

      setStatus('connecting');
      socket = new WebSocket(URL);

      socket.onopen = () => {
        retry = MIN_RETRY;
        setStatus('open');
      };

      socket.onmessage = (message) => {
        try {
          const parsed: unknown = JSON.parse(message.data as string);
          if (!isRealtimeEvent(parsed)) return;

          for (const handler of handlers.current) handler(parsed);
        } catch {
          // Мусор в канале не должен ронять вкладку.
        }
      };

      // onerror всегда сопровождается onclose, так что хватает одного места.
      socket.onclose = () => {
        setStatus('closed');
        if (stopped) return;

        timer = setTimeout(connect, retry);
        retry = Math.min(retry * 2, MAX_RETRY);
      };
    };

    // Ноутбук проснулся или сеть вернулась — ждать досчёта бэкоффа незачем.
    const reconnectNow = () => {
      if (stopped || socket?.readyState === WebSocket.OPEN) return;
      if (document.visibilityState !== 'visible') return;

      if (timer) clearTimeout(timer);
      timer = null;
      retry = MIN_RETRY;
      connect();
    };

    connect();
    window.addEventListener('online', reconnectNow);
    document.addEventListener('visibilitychange', reconnectNow);

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      window.removeEventListener('online', reconnectNow);
      document.removeEventListener('visibilitychange', reconnectNow);
      socket?.close();
    };
  }, []);

  return (
    <RealtimeContext value={{ status, subscribe }}>{children}</RealtimeContext>
  );
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
