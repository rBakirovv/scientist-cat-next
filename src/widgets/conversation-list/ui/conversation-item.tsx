import { ConversationListItem } from '@/entities/conversation';
import { getInitials } from '@/shared/lib/utils';
import { formatListDate } from '@/shared/lib/format-date';

export function ConversationItem({
  conversation,
}: {
  conversation: ConversationListItem;
}) {
  return (
    <li>
      <button
        type="button"
        className="group/item hover:bg-muted focus-visible:ring-ring/50 grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-0.5 rounded-2xl px-2 py-2 text-left transition-colors duration-200 outline-none focus-visible:ring-[3px]"
      >
        <span
          aria-hidden
          className="bg-muted text-muted-foreground group-hover/item:bg-background row-span-2 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors duration-200"
        >
          {getInitials(conversation.peer.name)}
        </span>

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

        <span className="text-muted-foreground col-span-2 col-start-2 min-w-0 truncate text-xs">
          {conversation.lastMessage?.body}
        </span>
      </button>
    </li>
  );
}
