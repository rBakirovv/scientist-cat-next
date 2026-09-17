import type { User } from '../model/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { getInitials } from '@/shared/lib/utils';

export function UserAvatar({
  user,
  ...props
}: React.ComponentProps<typeof Avatar> & {
  user: Pick<User, 'name' | 'image'>;
}) {
  return (
    <Avatar {...props}>
      <AvatarImage src={user.image ?? undefined} alt="" />
      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
    </Avatar>
  );
}
