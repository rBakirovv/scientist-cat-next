import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { MessagesPage } from '../../model/types';
import { messagesQuery } from './get-messages';

/**
 * Проставляет readAt тем сообщениям, которые прочитал собеседник. Себя
 * определять не нужно: событие приходит только тому, кто НЕ читал, значит
 * «отправленные не читателем» — это и есть свои.
 */
export function markMessagesRead(
  queryClient: QueryClient,
  conversationId: string,
  readerId: string,
  readAt: string,
) {
  queryClient.setQueryData(
    messagesQuery(conversationId).queryKey,
    (old: InfiniteData<MessagesPage> | undefined) => {
      if (!old) return old;

      const stamp = new Date(readAt);
      let touched = false;

      const pages = old.pages.map((page) => {
        let pageTouched = false;

        const items = page.items.map((item) => {
          if (item.senderId === readerId || item.readAt !== null) return item;

          pageTouched = true;
          return { ...item, readAt: stamp };
        });

        if (!pageTouched) return page;

        touched = true;
        return { ...page, items };
      });

      // Ссылку не меняем, если менять нечего: лишний рендер ленты не нужен.
      return touched ? { ...old, pages } : old;
    },
  );
}
