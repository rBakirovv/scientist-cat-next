import type { SignInValues } from '../../model/schema';
import { authClient } from '@/shared/lib/auth-client';

export function signIn(values: SignInValues) {
  return authClient.signIn.email({
    email: values.email,
    password: values.password,
    rememberMe: values.rememberMe,
  });
}
