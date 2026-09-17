'use client';

import { formatMessageDate } from '@/shared/lib/format-date';

export function MessageTime({ createdAt }: { createdAt: Date | string }) {
  return (
    <time
      suppressHydrationWarning
      dateTime={String(createdAt)}
      className="text-muted-foreground text-xs"
    >
      {formatMessageDate(createdAt)}
    </time>
  );
}
