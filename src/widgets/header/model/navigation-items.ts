import { MessageCircle, Home, type LucideIcon } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: '/', label: 'Главная', icon: Home },
  { href: '/messages', label: 'Сообщения', icon: MessageCircle },
];
