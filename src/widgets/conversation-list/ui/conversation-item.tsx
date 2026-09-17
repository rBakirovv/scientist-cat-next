'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConversationListItem } from '@/entities/conversation';
import { UserAvatar } from '@/entities/user';
import { formatListDate } from '@/shared/lib/format-date';
import { cn } from '@/shared/lib/utils';

export function ConversationItem({
  conversation,
}: {
  conversation: ConversationListItem;
}) {
  const pathname = usePathname();
  const href = `/messages/${conversation.id}`;
  const isActive = pathname === href;
  const hasUnread = conversation.unreadCount > 0;

  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        data-active={isActive || undefined}
        className={cn(
          'group/item focus-visible:ring-ring/50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-0.5 rounded-2xl px-2 py-2 text-left transition-colors duration-200 outline-none focus-visible:ring-[3px]',
          'hover:bg-muted',
          'data-active:bg-muted data-active:hover:bg-muted',
        )}
      >
        <UserAvatar
          aria-hidden
          user={conversation.peer}
          className="group-hover/item:*:data-[slot=avatar-fallback]:bg-background group-data-active/item:*:data-[slot=avatar-fallback]:bg-background row-span-2 size-9 *:data-[slot=avatar-fallback]:transition-colors *:data-[slot=avatar-fallback]:duration-200"
        />

        <h3 className="col-start-2 min-w-0 truncate text-sm font-medium">
          {conversation.peer.name}
        </h3>

        <time
          suppressHydrationWarning
          dateTime={String(conversation.lastMessage?.createdAt ?? '')}
          className="text-muted-foreground col-start-3 shrink-0 text-xs"
        >
          {conversation.lastMessage &&
            formatListDate(conversation.lastMessage.createdAt)}
        </time>

        <span className="text-muted-foreground col-start-2 row-start-2 min-w-0 truncate text-xs">
          {conversation.lastMessage?.body}
        </span>

        {hasUnread && (
          <span
            aria-label={`${conversation.unreadCount} непрочитанных`}
            className="bg-primary text-primary-foreground col-start-3 row-start-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums"
          >
            {conversation.unreadCount}
          </span>
        )}
      </Link>
    </li>
  );
}
