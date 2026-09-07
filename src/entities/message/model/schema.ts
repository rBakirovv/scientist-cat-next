import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, 'Сообщение не может быть пустым')
    .max(5000, 'Не более 5000 символов'),
});

export type CreateMessageValues = z.infer<typeof createMessageSchema>;
