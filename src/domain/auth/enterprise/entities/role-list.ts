import { WatchedList } from '@/core/entities/watched-list';
import { Role } from './role';

export class RoleList extends WatchedList<Role> {
  compareItems(a: Role, b: Role): boolean {
    return a.id.equals(b.id);
  }
}
