import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/shared/lib/utils';
import { ThemeProvider } from '@/shared/lib/theme-provider';
import { QueryProvider } from '@/shared/lib/query-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Кот учёный',
  description:
    'Образовательная платформа с курсами, уроками и отслеживанием прогресса',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={cn('h-full', 'antialiased', 'font-sans', inter.variable)}
    >
      <body className="flex h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
