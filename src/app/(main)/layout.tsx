import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Header } from '@/widgets/header';
import { auth } from '@/shared/lib/auth';
import Container from '@/shared/components/container';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  return (
    <>
      <Header />
      <Container className="mt-2 flex min-h-0 flex-1 flex-col py-8">
        {children}
      </Container>
    </>
  );
}
