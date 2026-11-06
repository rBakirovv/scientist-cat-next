# Лента беседы

Api/client/use-conversation-feed.ts загружает собеседника и страницы сообщений; model/use-conversation-view.ts готовит строки, отмечает прочтение и подключает model/use-message-feed-scroll.ts для прокрутки.

Логика находится в хуках, UI-компоненты получают готовые данные и обработчики.
Разделение сохраняет существующие запросы, взаимодействия и публичные пропсы.

## Публичный API

Экспорт через `index.ts`: `ConversationView`, `ConversationViewEmpty`, `ConversationViewSkeleton`.
Внутренние хуки за пределы слайса не экспортируются.
