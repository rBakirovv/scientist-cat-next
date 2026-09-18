'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

// Небольшой отступ сверху, чтобы непрочитанное не липло к краю ленты.
const UNREAD_OFFSET = 24;

// Насколько близко к низу человек должен быть, чтобы чужое сообщение его доскроллило.
const NEAR_BOTTOM = 120;

type Options = {
  conversationId: string;
  /** id самого верхнего сообщения: меняется, когда сверху встала старая страница. */
  firstMessageId: string | undefined;
  /** Первое непрочитанное сообщение собеседника — к нему открываем чат. */
  firstUnreadId: string | undefined;
  /** Последнее сообщение: по его смене решаем, прокручивать ли вниз. */
  lastMessageId: string | undefined;
  /** Своё ли последнее сообщение — своё всегда доводим до низа. */
  isLastMessageOwn: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
};

/**
 * Лента сообщений: открывается у первого непрочитанного (или внизу),
 * подгружает старое при прокрутке вверх и не теряет место при подстановке.
 *
 * Позиция выставляется на каждый заход в чат, а не на смену id: Next держит
 * посещённые сегменты в <Activity>, поэтому компонент и его ref-ы переживают
 * уход со страницы — «новый чат» по ref-у не определить.
 */
export function useMessageFeedScroll({
  conversationId,
  firstMessageId,
  firstUnreadId,
  lastMessageId,
  isLastMessageOwn,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Options) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Расстояние до низа ленты. При подстановке старого оно не меняется,
  // поэтому по нему и восстанавливаем позицию.
  const distanceFromBottom = useRef(0);
  const renderedFirstMessage = useRef<string | undefined>(undefined);
  const renderedLastMessage = useRef<string | undefined>(undefined);

  // Пока цель не отменена, её переприменяют при изменении высоты ленты:
  // аватары и метки времени доезжают уже после первой отрисовки.
  const pendingScroll = useRef<(() => void) | null>(null);

  // Свежие значения для эффектов, которые не должны на них перезапускаться.
  const latest = useRef({
    firstMessageId,
    firstUnreadId,
    lastMessageId,
    isFetchingNextPage,
    fetchNextPage,
  });
  useEffect(() => {
    latest.current = {
      firstMessageId,
      firstUnreadId,
      lastMessageId,
      isFetchingNextPage,
      fetchNextPage,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      distanceFromBottom.current = container.scrollHeight - container.scrollTop;
    };

    // Отменяем цель только по действию пользователя: событие scroll
    // прилетает и от наших собственных присваиваний scrollTop.
    const cancelPending = () => {
      pendingScroll.current = null;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', cancelPending, { passive: true });
    container.addEventListener('touchstart', cancelPending, { passive: true });
    container.addEventListener('keydown', cancelPending);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', cancelPending);
      container.removeEventListener('touchstart', cancelPending);
      container.removeEventListener('keydown', cancelPending);
    };
  }, []);

  // Заход в чат: ставим позицию заново. Эффект перезапускается и при смене id,
  // и при возврате на страницу — этого и добиваемся.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const apply = () => {
      const unreadId = latest.current.firstUnreadId;
      const unread = unreadId
        ? container.querySelector<HTMLElement>(
            `[data-message-id="${unreadId}"]`,
          )
        : null;

      if (unread) {
        // Позиция относительно контейнера: offsetParent тут не гарантирован.
        const offset =
          unread.getBoundingClientRect().top -
          container.getBoundingClientRect().top +
          container.scrollTop;

        container.scrollTop = offset - UNREAD_OFFSET;
      } else {
        container.scrollTop = container.scrollHeight;
      }

      distanceFromBottom.current = container.scrollHeight - container.scrollTop;
    };

    // Верхнее сообщение считаем уже показанным, иначе эффект ниже
    // примет первый рендер за подгрузку старой страницы.
    renderedFirstMessage.current = latest.current.firstMessageId;
    renderedLastMessage.current = latest.current.lastMessageId;

    apply();
    pendingScroll.current = apply;

    return () => {
      pendingScroll.current = null;
    };
  }, [conversationId]);

  // Сверху встала старая страница — возвращаем ту же точку относительно низа.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (renderedFirstMessage.current === firstMessageId) return;

    // Лента приехала уже после захода в чат: это первая порция, а не подстановка
    // старого. Цель из pendingScroll оставляем — её доставит ResizeObserver.
    if (renderedFirstMessage.current === undefined) {
      renderedFirstMessage.current = firstMessageId;
      return;
    }

    renderedFirstMessage.current = firstMessageId;
    pendingScroll.current = null;
    container.scrollTop = container.scrollHeight - distanceFromBottom.current;
  }, [firstMessageId]);

  // Пришло новое сообщение в конец ленты.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (renderedLastMessage.current === lastMessageId) return;

    // Та же первая порция — низ ленты не «новое сообщение».
    if (renderedLastMessage.current === undefined) {
      renderedLastMessage.current = lastMessageId;
      return;
    }

    renderedLastMessage.current = lastMessageId;

    // Своё сообщение доводим до низа всегда. Чужое — только если человек
    // и так читал последние: иначе выдернем его из середины истории.
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      NEAR_BOTTOM;

    if (isLastMessageOwn || nearBottom) {
      pendingScroll.current = null;
      container.scrollTop = container.scrollHeight;
      distanceFromBottom.current = container.scrollHeight - container.scrollTop;
    }
  }, [lastMessageId, isLastMessageOwn]);

  // Высота ленты меняется после первой отрисовки — переприменяем цель.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => pendingScroll.current?.());
    observer.observe(container);
    for (const child of Array.from(container.children)) observer.observe(child);

    return () => observer.disconnect();
  }, [conversationId, firstMessageId]);

  useEffect(() => {
    const container = containerRef.current;
    const sentinel = sentinelRef.current;
    if (!container || !sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || latest.current.isFetchingNextPage) return;
        latest.current.fetchNextPage();
      },
      // Начинаем грузить чуть раньше, чем край показался.
      { root: container, rootMargin: '200px 0px 0px 0px' },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasNextPage]);

  return { containerRef, sentinelRef };
}
