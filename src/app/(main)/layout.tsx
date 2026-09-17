import { Header } from '@/widgets/header';
import Container from '@/shared/components/container';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Container className="mt-2 flex min-h-0 flex-1 flex-col py-8">
        {children}
      </Container>
    </>
  );
}
