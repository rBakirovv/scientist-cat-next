import Image from 'next/image';
import Link from 'next/link';
import { Navigation } from './navigation/navigation';
import { SignOutButton } from '@/features/auth-sign-out';
import Container from '@/shared/components/container';
import { Card } from '@/shared/components/ui/card';
import { ModeToggle } from '@/shared/components/mode-toggle';

export function Header() {
  return (
    <header className="bg-background/80 sticky top-2 z-40 rounded-2xl backdrop-blur">
      <Container>
        <Card className="flex flex-row items-center gap-6 p-4">
          <div className="flex items-center gap-2">
            <Navigation />
            <Link
              href="/"
              className="text-foreground flex items-center gap-2 text-lg font-medium"
            >
              <Image
                src="/logo.png"
                alt="Кот учёный"
                width={1080}
                height={1080}
                priority
                className="size-9 rounded-full object-cover"
              />
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div title="Сменить тему">
              <ModeToggle />
            </div>
            <SignOutButton />
          </div>
        </Card>
      </Container>
    </header>
  );
}
