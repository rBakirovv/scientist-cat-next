import 'dotenv/config';
import { createServer, type IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import { WebSocket, WebSocketServer } from 'ws';
import { listenForEvents } from './pg-listener';
import { auth } from '@/shared/lib/auth';
import { logger } from '@/shared/lib/logger';

function port() {
  const raw = process.env.REALTIME_PORT ?? '3001';
  const value = Number(raw);

  // Иначе ошибка всплывает далеко от причины — RangeError из глубин net.
  if (!Number.isInteger(value) || value < 0 || value > 65535) {
    throw new Error(`REALTIME_PORT должен быть числом, а не «${raw}»`);
  }

  return value;
}

const PORT = port();
const ALLOWED_ORIGINS = (
  process.env.REALTIME_ALLOWED_ORIGINS ?? 'http://localhost:3000'
)
  .split(',')
  .map((origin) => origin.trim());

// Раз в столько миллисекунд опрашиваем соединения: оборванные молчат, а не
// сообщают о себе, и без этого реестр забивается мёртвыми сокетами.
const HEARTBEAT_INTERVAL = 30_000;

type Connection = WebSocket & { userId: string; isAlive: boolean };

async function main() {
  // Реестр по пользователю, а не по чату: одному человеку нужны и сообщения
  // в открытом чате, и счётчики по всем остальным. Set — потому что вкладок
  // может быть несколько.
  const connections = new Map<string, Set<Connection>>();

  const register = (connection: Connection) => {
    const existing = connections.get(connection.userId);
    if (existing) existing.add(connection);
    else connections.set(connection.userId, new Set([connection]));
  };

  const unregister = (connection: Connection) => {
    const existing = connections.get(connection.userId);
    if (!existing) return;

    existing.delete(connection);
    // Пустой Set оставлять нельзя — Map будет течь по числу пользователей.
    if (existing.size === 0) connections.delete(connection.userId);
  };

  const server = createServer((_request, response) => {
    // Процесс существует только ради апгрейда, обычный HTTP тут не нужен.
    response.writeHead(426, { 'Content-Type': 'text/plain' });
    response.end('Upgrade Required');
  });

  const wss = new WebSocketServer({ noServer: true });

  // noServer означает «рукопожатие проведу сам» — именно это даёт точку,
  // в которой можно отказать до установки соединения.
  server.on('upgrade', (request, socket, head) => {
    void authorize(request, socket, head);
  });

  const reject = (socket: Duplex, status: string) => {
    socket.write(`HTTP/1.1 ${status}\r\n\r\n`);
    socket.destroy();
  };

  async function authorize(
    request: IncomingMessage,
    socket: Duplex,
    head: Buffer,
  ) {
    // На вебсокеты не распространяется CORS: браузер не защитит, проверяем сами.
    const origin = request.headers.origin;
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      logger.warn({ origin }, 'Апгрейд с чужого origin');
      return reject(socket, '403 Forbidden');
    }

    // Браузерный WebSocket не умеет выставлять Authorization — вообще никак.
    // Единственное, что доезжает, это куки.
    const headers = new Headers();
    if (request.headers.cookie) headers.set('cookie', request.headers.cookie);

    let userId: string | undefined;
    try {
      const session = await auth.api.getSession({ headers });
      userId = session?.user.id;
    } catch (error) {
      logger.error({ err: error }, 'Сессию проверить не удалось');
      return reject(socket, '500 Internal Server Error');
    }

    // Отказывать надо до handleUpgrade: после него соединение уже установлено.
    if (!userId) return reject(socket, '401 Unauthorized');

    wss.handleUpgrade(request, socket, head, (ws) => {
      const connection = ws as Connection;
      connection.userId = userId;
      connection.isAlive = true;

      register(connection);
      logger.info({ userId, total: wss.clients.size }, 'Клиент подключился');

      connection.on('pong', () => {
        connection.isAlive = true;
      });

      connection.on('close', () => {
        unregister(connection);
        logger.info({ userId, total: wss.clients.size }, 'Клиент отключился');
      });

      connection.on('error', (error) => {
        logger.error({ err: error, userId }, 'Ошибка соединения');
      });
    });
  }

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      const connection = ws as Connection;

      // Не ответил на прошлый ping — соединение мертво, добиваем.
      if (!connection.isAlive) {
        unregister(connection);
        connection.terminate();
        continue;
      }

      connection.isAlive = false;
      connection.ping();
    }
  }, HEARTBEAT_INTERVAL);

  const stopListening = listenForEvents((event) => {
    const payload = JSON.stringify(event);
    let delivered = 0;

    for (const recipientId of event.recipientIds) {
      const sockets = connections.get(recipientId);
      if (!sockets) continue;

      for (const socket of sockets) {
        if (socket.readyState !== WebSocket.OPEN) continue;
        socket.send(payload);
        delivered += 1;
      }
    }

    logger.debug(
      { type: event.type, recipients: event.recipientIds.length, delivered },
      'Событие роздано',
    );
  });

  server.listen(PORT, () => {
    logger.info({ port: PORT }, 'Realtime слушает');
  });

  const shutdown = async () => {
    clearInterval(heartbeat);
    await stopListening();
    for (const ws of wss.clients) ws.close(1001, 'Server shutting down');
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

void main();
