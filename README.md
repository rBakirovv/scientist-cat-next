# Кот учёный

Образовательная платформа. Сейчас готова переписка один-на-один: список чатов, лента с бесконечной прокруткой, непрочитанные, отметки о прочтении и доставка в реальном времени. Остальное — в [TODO](#todo).

## Стек

|                   |                                                         |
| ----------------- | ------------------------------------------------------- |
| Фреймворк         | Next.js 16 (App Router), React 19, React Compiler       |
| Язык              | TypeScript                                              |
| База              | PostgreSQL, Prisma 7 через адаптер `@prisma/adapter-pg` |
| Авторизация       | better-auth (email + пароль)                            |
| Данные на клиенте | TanStack Query 5                                        |
| Интерфейс         | Tailwind CSS 4, shadcn/ui на Base UI, lucide-react      |
| Формы             | react-hook-form, zod                                    |
| Реальное время    | `ws` + Postgres `LISTEN/NOTIFY`                         |
| Логи              | pino                                                    |

Включены экспериментальные возможности Next: `cacheComponents`, `partialPrefetching`, `reactCompiler`.

> API этой версии Next отличается от более ранних. Перед правками читайте
> `node_modules/next/dist/docs/` — подробности в [AGENTS.md](AGENTS.md).

## Структура

Feature-Sliced Design, границы слоёв проверяет `eslint-plugin-fsd-lint`:

```
src/
  app/        роуты, лейауты, API-хендлеры
  widgets/    conversation-list, conversation-view, header
  features/   auth-sign-in, auth-sign-out, conversation-create, message-send
  entities/   conversation, message, user
  shared/     components/ui, lib
realtime/     отдельный Node-процесс: вебсокеты
prisma/       схема и миграции
```

У сущностей два входа: `index.ts` для клиента и `server.ts` для сервера. Правила FSD применяются только к `src` — `realtime/` это отдельный процесс, а не слой.

## Как работает чат

Источник правды для ленты — кеш TanStack Query, поэтому переключение между чатами не обращается к серверу. Новые сообщения и отметки о прочтении приезжают вебсокетом: Next публикует событие через `pg_notify`, процесс `realtime` слушает канал и рассылает его подключённым клиентам. Если сокет оборвался, запросы автоматически возвращаются к опросу сервера.

## Запуск

Нужны Node.js 22+, Docker и npm.

### 1. Зависимости

```bash
npm install
```

### 2. Переменные окружения

Создайте в корне файл `.env`:

```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/scientist_cat_next?schema=public"

# DOCKER
POSTGRES_CONTAINER_NAME=scientist_cat_next_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=scientist_cat_next
POSTGRES_PORT=5433
REALTIME_CONTAINER_NAME=scientist_cat_next_realtime

# AUTH
BETTER_AUTH_SECRET=замените-на-случайную-строку
BETTER_AUTH_URL=http://localhost:3000

# REALTIME
REALTIME_PORT=3001
REALTIME_ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

Порт в `DATABASE_URL` должен совпадать с `POSTGRES_PORT`, а имя базы — с `POSTGRES_DB`: эти значения подставляются в контейнер и в строку подключения независимо.

Секрет можно сгенерировать так:

```bash
openssl rand -base64 32
```

### 3. База данных

Поднять PostgreSQL в контейнере:

```bash
docker compose -f docker-compose.local.yml up -d postgres
```

Применить схему — одна команда делает три вещи: дописывает в схему таблицы better-auth, прогоняет миграции и генерирует клиент Prisma:

```bash
npm run db:sync
```

Проверить, что база поднялась и таблицы на месте:

```bash
npm run db:studio
```

Если контейнер уже существует с другими параметрами, пересоздайте его вместе с томом:

```bash
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d postgres
```

### 4. Приложение

```bash
npm run dev
```

Откройте `http://localhost:3000` — неавторизованных перебросит на `/sign-in`. Зарегистрируйте **двух** пользователей (во втором браузере или приватном окне), иначе переписку не проверить: собственный аккаунт в списке получателей не показывается.

### 5. Вебсокеты

В отдельном терминале:

```bash
npm run realtime
```

или в контейнере:

```bash
docker compose -f docker-compose.local.yml up -d realtime
```

Без этого процесса приложение работает, просто сообщения приходят опросом с задержкой до пяти секунд. Признак, что всё поднялось правильно, — в логе процесса строки «Слушаю канал» и «Клиент подключился» после открытия страницы.

## Команды

| Команда                           | Что делает                                       |
| --------------------------------- | ------------------------------------------------ |
| `npm run dev`                     | дев-сервер Next                                  |
| `npm run realtime`                | процесс вебсокетов с перезапуском по изменениям  |
| `npm run build`                   | продакшен-сборка                                 |
| `npm run start`                   | запуск собранного приложения                     |
| `npm run typecheck`               | `tsc --noEmit`                                   |
| `npm run lint` / `lint:fix`       | ESLint                                           |
| `npm run format` / `format:check` | Prettier                                         |
| `npm run compiler:check`          | совместимость с React Compiler                   |
| `npm run db:sync`                 | схема better-auth + миграции + генерация клиента |
| `npm run db:migrate`              | только миграции                                  |
| `npm run db:generate`             | только генерация клиента                         |
| `npm run db:studio`               | Prisma Studio                                    |
| `npm run upgrade`                 | `next upgrade` на последнюю версию               |

Перед коммитом: `npm run typecheck && npm run lint && npm run build`.

## API

| Метод и путь                            | Назначение                                          |
| --------------------------------------- | --------------------------------------------------- |
| `GET /api/conversations`                | чаты пользователя; беседы без сообщений не попадают |
| `POST /api/conversations`               | найти или создать беседу с собеседником             |
| `GET /api/conversations/[id]`           | беседа с собеседником                               |
| `GET /api/conversations/[id]/messages`  | страница сообщений по курсору                       |
| `POST /api/conversations/[id]/messages` | отправить сообщение                                 |
| `PATCH /api/conversations/[id]/read`    | отметить чужие сообщения прочитанными               |
| `GET /api/users`                        | пользователи, с которыми переписки ещё нет          |
| `/api/auth/[...all]`                    | обработчик better-auth                              |

Сессия проверяется в каждом хендлере через `getApiSession`, участие в беседе — в серверных функциях сущностей. [src/proxy.ts](src/proxy.ts) делает оптимистичную проверку куки и редиректит неавторизованных; полноценной защитой он не является.

## TODO

### Обучение

- [ ] Курсы: каталог, страница курса, запись на курс
- [ ] Уроки с материалами и заданиями
- [ ] Прогресс ученика по курсу и по урокам
- [ ] Роли в деле: `student`, `teacher` и `admin` есть в схеме, но ни на что не влияют
- [ ] Кабинет преподавателя: свои курсы, ученики, проверка заданий

### Переписка

- [ ] Групповые чаты
- [ ] Вложения в сообщениях
- [ ] Поиск по переписке
- [ ] Индикатор «печатает» и статус «в сети»
- [ ] Редактирование и удаление сообщений
- [ ] Уведомления, когда приложение закрыто

### Общее

- [ ] Профиль: аватар, имя, смена пароля
- [ ] Восстановление пароля по почте
- [ ] Поиск и фильтры по пользователям
- [ ] Админка: пользователи, роли, модерация
