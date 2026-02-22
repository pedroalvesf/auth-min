import { User } from '@/domain/auth/enterprise/entities/user';

export class ListUserPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  static toPartnerHTTP(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      active: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toPartnerListHTTP(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
