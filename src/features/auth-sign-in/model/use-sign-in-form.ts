'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signInSchema, type SignInValues } from './schema';
import { signIn } from '../api/client/sign-in';

export function useSignInForm() {
  const router = useRouter();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleSubmit = async (values: SignInValues) => {
    const { error } = await signIn(values);

    if (error) {
      form.setError('password', { message: 'Неверный email или пароль' });

      return;
    }

    router.push('/');
    router.refresh();
  };

  return { form, onSubmit: form.handleSubmit(handleSubmit) };
}
