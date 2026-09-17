'use client';

import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { createMessageSchema, useSendMessage } from '@/entities/message';
import { FieldError } from '@/shared/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/shared/components/ui/input-group';

export function MessageComposer({
  conversationId,
}: {
  conversationId: string;
}) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useSendMessage(conversationId);

  const isValid = createMessageSchema.safeParse({ body }).success;
  const canSend = isValid && !isPending;

  const send = async () => {
    if (!canSend) return;

    try {
      await mutateAsync(body);
      setBody('');
      setError(null);
    } catch {
      setError('Не удалось отправить сообщение');
    }
  };

  return (
    <form
      className="w-full"
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      <InputGroup>
        <InputGroupTextarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={1}
          className="max-h-36 min-h-9"
          placeholder="Сообщение"
          aria-label="Текст сообщения"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="submit"
            variant="default"
            size="icon-sm"
            className="rounded-full"
            disabled={!canSend}
            title="Отправить"
          >
            <ArrowUp />
            <span className="sr-only">Отправить</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {error && <FieldError className="mt-1">{error}</FieldError>}
    </form>
  );
}
