import { WatchedList } from '@/core/entities/watched-list';
import { Permission } from './permission';

export class PermissionList extends WatchedList<Permission> {
  compareItems(a: Permission, b: Permission): boolean {
    return a.id.equals(b.id);
  }
}
