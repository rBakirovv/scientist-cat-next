'use client';

import { ArrowUp } from 'lucide-react';
import { useMessageComposer } from '../model/use-message-composer';
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
  const { body, error, canSend, onSubmit, onChange, onKeyDown } =
    useMessageComposer(conversationId);

  return (
    <form className="w-full" onSubmit={onSubmit}>
      <InputGroup>
        <InputGroupTextarea
          value={body}
          onChange={onChange}
          rows={1}
          className="max-h-36 min-h-9"
          placeholder="Сообщение"
          aria-label="Текст сообщения"
          onKeyDown={onKeyDown}
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
