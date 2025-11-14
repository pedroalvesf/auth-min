export interface PermissionConfig {
  name: string;
  slug: string;
  resource: string;
  action: string;
  description: string;
}

export interface RoleConfig {
  name: string;
  slug: string;
  description: string;
  level: number;
  assignableRoles: string[];
  permissions: string[]; // Array de slugs de permissões
}

// DEFINIÇÃO DE TODAS AS PERMISSÕES

export const PERMISSIONS: PermissionConfig[] = [
  // ===== USUÁRIOS =====
  {
    name: "Create User",
    slug: "users:create",
    resource: "users",
    action: "create",
    description: "Pode criar novos usuários no sistema",
  },
  {
    name: "Read User",
    slug: "users:read",
    resource: "users",
    action: "read",
    description: "Pode visualizar informações de usuários",
  },
  {
    name: "Update User",
    slug: "users:update",
    resource: "users",
    action: "update",
    description: "Pode editar informações de usuários",
  },
  {
    name: "Delete User",
    slug: "users:delete",
    resource: "users",
    action: "delete",
    description: "Pode deletar usuários do sistema",
  },
  {
    name: "Manage Users",
    slug: "users:*",
    resource: "users",
    action: "*",
    description: "Acesso completo à gestão de usuários",
  },

  // ===== ROLES =====
  {
    name: "Create Role",
    slug: "roles:create",
    resource: "roles",
    action: "create",
    description: "Pode criar novos roles",
  },
  {
    name: "Read Role",
    slug: "roles:read",
    resource: "roles",
    action: "read",
    description: "Pode visualizar roles",
  },
  {
    name: "Update Role",
    slug: "roles:update",
    resource: "roles",
    action: "update",
    description: "Pode editar roles",
  },
  {
    name: "Delete Role",
    slug: "roles:delete",
    resource: "roles",
    action: "delete",
    description: "Pode deletar roles",
  },
  {
    name: "Assign Roles",
    slug: "roles:assign",
    resource: "roles",
    action: "assign",
    description: "Pode atribuir roles a usuários",
  },
  {
    name: "Manage Roles",
    slug: "roles:*",
    resource: "roles",
    action: "*",
    description: "Acesso completo à gestão de roles",
  },

  // ===== DEVICES =====
  {
    name: "Read Devices",
    slug: "devices:read",
    resource: "devices",
    action: "read",
    description: "Pode visualizar dispositivos",
  },
  {
    name: "Revoke Device",
    slug: "devices:revoke",
    resource: "devices",
    action: "revoke",
    description: "Pode revogar sessões de dispositivos",
  },
  {
    name: "Manage Devices",
    slug: "devices:*",
    resource: "devices",
    action: "*",
    description: "Acesso completo à gestão de dispositivos",
  },

  // ===== AUDIT LOGS =====
  {
    name: "View Audit Logs",
    slug: "audit:read",
    resource: "audit",
    action: "read",
    description: "Pode visualizar logs de auditoria",
  },
  {
    name: "Export Audit Logs",
    slug: "audit:export",
    resource: "audit",
    action: "export",
    description: "Pode exportar logs de auditoria",
  },
  {
    name: "Delete Audit Logs",
    slug: "audit:delete",
    resource: "audit",
    action: "delete",
    description: "Pode deletar logs de auditoria (raramente usado)",
  },

  // ===== PERMISSIONS =====
  {
    name: "Create Permission",
    slug: "permissions:create",
    resource: "permissions",
    action: "create",
    description: "Pode criar novas permissões",
  },
  {
    name: "Read Permission",
    slug: "permissions:read",
    resource: "permissions",
    action: "read",
    description: "Pode visualizar permissões",
  },
  {
    name: "Update Permission",
    slug: "permissions:update",
    resource: "permissions",
    action: "update",
    description: "Pode editar permissões",
  },
  {
    name: "Delete Permission",
    slug: "permissions:delete",
    resource: "permissions",
    action: "delete",
    description: "Pode deletar permissões",
  },

  // ===== SUPER PERMISSION =====
  {
    name: "Super Admin",
    slug: "*:*",
    resource: "*",
    action: "*",
    description: "Acesso total ao sistema (use com cautela)",
  },
];

// DEFINIÇÃO DE TODOS OS ROLES

export const ROLES: RoleConfig[] = [
  // ===== SUPER ADMIN (Level 0) =====
  {
    name: "Super Admin",
    slug: "super-admin",
    description: "Acesso total ao sistema. Pode fazer qualquer coisa.",
    level: 0,
    assignableRoles: ["admin", "moderator", "user"],
    permissions: [
      "*:*", // Super permission
    ],
  },

  // ===== ADMIN (Level 1) =====
  {
    name: "Admin",
    slug: "admin",
    description:
      "Administrador com permissões elevadas. Pode gerenciar usuários e visualizar logs.",
    level: 1,
    assignableRoles: ["moderator", "user"],
    permissions: [
      // Usuários
      "users:*",

      // Roles (apenas leitura e atribuição)
      "roles:read",
      "roles:assign",

      // Devices
      "devices:*",

      // Audit
      "audit:read",
      "audit:export",

      // Permissions (apenas leitura)
      "permissions:read",
    ],
  },

  // ===== MODERATOR (Level 2) =====
  {
    name: "Moderator",
    slug: "moderator",
    description:
      "Moderador que pode visualizar e editar usuários, gerenciar roles e permissões.",
    level: 2,
    assignableRoles: ["user"],
    permissions: [
      // Usuários (sem delete)
      "users:read",
      "users:update",

      // Roles (CRUD completo)
      "roles:create",
      "roles:read",
      "roles:update",
      "roles:assign",

      // Permissions (CRUD completo)
      "permissions:create",
      "permissions:read",
      "permissions:update",

      // Devices
      "devices:read",
      "devices:revoke",

      // Audit (apenas leitura)
      "audit:read",
    ],
  },

  // ===== USER (Level 3) =====
  {
    name: "User",
    slug: "user",
    description: "Usuário comum com acesso básico ao sistema.",
    level: 3,
    assignableRoles: [],
    permissions: [
      // Apenas leitura básica
      "users:read",
      "devices:read",
      "roles:read",
      "permissions:read",
    ],
  },
];

// HELPERS PARA ACESSAR CONFIGURAÇÕES

export function getPermissionBySlug(
  slug: string
): PermissionConfig | undefined {
  return PERMISSIONS.find((p) => p.slug === slug);
}

export function getRoleBySlug(slug: string): RoleConfig | undefined {
  return ROLES.find((r) => r.slug === slug);
}

export function getPermissionsByResource(resource: string): PermissionConfig[] {
  return PERMISSIONS.filter((p) => p.resource === resource);
}

export function getRolesByLevel(level: number): RoleConfig[] {
  return ROLES.filter((r) => r.level === level);
}

// CONSTANTES ÚTEIS

export const PERMISSION_RESOURCES = Array.from(
  new Set(PERMISSIONS.map((p) => p.resource))
);

export const PERMISSION_ACTIONS = Array.from(
  new Set(PERMISSIONS.map((p) => p.action))
);

export const ROLE_SLUGS = ROLES.map((r) => r.slug);

export const PERMISSION_SLUGS = PERMISSIONS.map((p) => p.slug);

// VALIDAÇÕES

export function validateRolePermissions(roleSlug: string): boolean {
  const role = getRoleBySlug(roleSlug);
  if (!role) return false;

  // Verificar se todas as permissões do role existem
  return role.permissions.every((permSlug) =>
    PERMISSIONS.some((p) => p.slug === permSlug)
  );
}

export function validateAllRoles(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const role of ROLES) {
    // Validar permissões
    for (const permSlug of role.permissions) {
      if (!PERMISSIONS.some((p) => p.slug === permSlug)) {
        errors.push(
          `Role "${role.slug}" references non-existent permission "${permSlug}"`
        );
      }
    }

    // Validar assignableRoles
    for (const assignableRole of role.assignableRoles) {
      if (!ROLES.some((r) => r.slug === assignableRole)) {
        errors.push(
          `Role "${role.slug}" references non-existent assignable role "${assignableRole}"`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Executar validação ao importar
const validation = validateAllRoles();
if (!validation.valid) {
  console.error("Erro na configuração de roles/permissions:");
  validation.errors.forEach((err) => console.error(`  - ${err}`));
  throw new Error("Invalid roles/permissions configuration");
}
