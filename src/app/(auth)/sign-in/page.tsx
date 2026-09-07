import type { Metadata } from 'next';
import { SignInForm } from '@/features/auth-sign-in';

export const metadata: Metadata = {
  title: 'Вход',
};

export default function SignInPage() {
  return <SignInForm />;
}
