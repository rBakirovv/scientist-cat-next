import { Client } from 'pg';
import { logger } from '@/shared/lib/logger';
import {
  REALTIME_CHANNEL,
  isRealtimeEvent,
  type RealtimeEvent,
} from '@/shared/lib/realtime-events';

const RECONNECT_DELAY = 2000;

// Prisma кладёт схему в query-строку, а node-postgres такого параметра не знает.
function connectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL не задан');

  return url.replace(/[?&]schema=[^&]*/, '');
}

/**
 * Слушает канал на ВЫДЕЛЕННОМ соединении. Пул Prisma сюда не годится: LISTEN
 * живёт на конкретном соединении, а пул вернёт его себе — и подписка молча
 * перестанет работать, без единой ошибки.
 */
export function listenForEvents(onEvent: (event: RealtimeEvent) => void) {
  let client: Client | null = null;
  let stopped = false;
  let timer: NodeJS.Timeout | null = null;

  const scheduleReconnect = () => {
    if (stopped || timer) return;
    timer = setTimeout(() => {
      timer = null;
      void connect();
    }, RECONNECT_DELAY);
  };

  const connect = async () => {
    if (stopped) return;

    const next = new Client({ connectionString: connectionString() });

    // Вешаем до connect(): база может отвалиться в любой момент, и без
    // обработчика ошибка соединения уронит процесс.
    next.on('error', (error) => {
      logger.error({ err: error }, 'Соединение слушателя оборвалось');
      next.end().catch(() => {});
      if (client === next) client = null;
      scheduleReconnect();
    });

    next.on('notification', (notification) => {
      if (!notification.payload) return;

      try {
        const parsed: unknown = JSON.parse(notification.payload);
        if (!isRealtimeEvent(parsed)) {
          logger.warn(
            { payload: notification.payload },
            'Чужое событие в канале',
          );
          return;
        }

        onEvent(parsed);
      } catch (error) {
        logger.error({ err: error }, 'Не удалось разобрать payload');
      }
    });

    try {
      await next.connect();
      await next.query(`LISTEN ${REALTIME_CHANNEL}`);
      client = next;
      logger.info({ channel: REALTIME_CHANNEL }, 'Слушаю канал');
    } catch (error) {
      logger.error({ err: error }, 'Не удалось подписаться на канал');
      scheduleReconnect();
    }
  };

  void connect();

  return async () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    await client?.end().catch(() => {});
  };
}
