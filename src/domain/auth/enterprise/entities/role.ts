// export enum Role {
//   USER = 'USER',
//   ADMIN = 'ADMIN',
//   MODERATOR = 'MODERATOR'
// }

// export const RolePermissions = {
//   [Role.USER]: [
//     'profile.read',
//     'profile.update'
//   ],
//   [Role.MODERATOR]: [
//     'profile.read',
//     'profile.update',
//     'users.read',
//     'content.moderate'
//   ],
//   [Role.ADMIN]: [
//     'profile.read',
//     'profile.update',
//     'users.read',
//     'users.write',
//     'users.delete',
//     'content.moderate',
//     'system.admin'
//   ]
// }

// export function hasPermission(userRole: Role, requiredPermission: string): boolean {
//   return RolePermissions[userRole].includes(requiredPermission)
// }

// export function canAccessResource(userRole: Role, requiredRole: Role): boolean {
//   const roleHierarchy = {
//     [Role.USER]: 1,
//     [Role.MODERATOR]: 2,
//     [Role.ADMIN]: 3
//   }

//   return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
// }
