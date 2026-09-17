import type { getConversation } from '../api/server/get-conversation';
import type { getConversations } from '../api/server/get-conversations';

export type ConversationListItem = Awaited<
  ReturnType<typeof getConversations>
>[number];

export type ConversationPeer = NonNullable<
  Awaited<ReturnType<typeof getConversation>>
>['peer'];
