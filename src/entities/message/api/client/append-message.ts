import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { MessageItem, MessagesPage } from '../../model/types';
import { messagesQuery } from './get-messages';

/**
 * Единственное место, где сообщение попадает в ленту. Путей два — своя
 * отправка и событие из сокета, — и своё сообщение приходит по обоим:
 * сначала ответом мутации, потом эхом. Отсюда проверка по id.
 */
export function appendMessage(
  queryClient: QueryClient,
  conversationId: string,
  message: MessageItem,
) {
  queryClient.setQueryData(
    messagesQuery(conversationId).queryKey,
    (old: InfiniteData<MessagesPage> | undefined) => {
      // Чат не открывали — дозаписывать некуда, при заходе загрузится сам.
      if (!old) return old;

      const known = old.pages.some((page) =>
        page.items.some((item) => item.id === message.id),
      );
      if (known) return old;

      // pages[0] — самая свежая страница, её хвост и есть низ ленты.
      const pages = [...old.pages];
      pages[0] = { ...pages[0], items: [...pages[0].items, message] };

      return { ...old, pages };
    },
  );
}
