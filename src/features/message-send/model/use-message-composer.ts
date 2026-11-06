'use client';

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { createMessageSchema, useSendMessage } from '@/entities/message';

export function useMessageComposer(conversationId: string) {
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send();
  };
  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void send();
    }
  };
  return { body, error, canSend, onSubmit, onChange, onKeyDown };
}
