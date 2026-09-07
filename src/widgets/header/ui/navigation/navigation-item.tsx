'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '../../model/navigation-items';
import { DrawerClose } from '@/shared/components/ui/drawer';
import { cn } from '@/shared/lib/utils';

export function NavigationItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive =
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

  return (
    <DrawerClose
      nativeButton={false}
      render={
        <Link
          href={item.href}
          aria-current={isActive ? 'page' : undefined}
          data-active={isActive || undefined}
          className={cn(
            'group/nav-item text-muted-foreground relative flex items-center gap-3 rounded-2xl py-2.5 pr-3 pl-4 text-sm font-medium transition-colors outline-none',
            'hover:bg-muted hover:text-foreground',
            'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'data-active:bg-primary/10 data-active:text-foreground',
          )}
        >
          <span
            aria-hidden
            className="bg-primary absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-full opacity-0 transition-all duration-200 group-data-active/nav-item:translate-x-0 group-data-active/nav-item:opacity-100"
          />
          <item.icon className="group-data-active/nav-item:text-primary size-4 shrink-0 transition-colors" />
          <span className="truncate">{item.label}</span>
        </Link>
      }
    />
  );
}
