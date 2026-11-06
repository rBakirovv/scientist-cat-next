'use client';

import { usePathname } from 'next/navigation';
import type { NavItem } from './navigation-items';

export function useNavigationItem(item: NavItem) {
  const pathname = usePathname();
  const isActive =
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

  return { isActive };
}
