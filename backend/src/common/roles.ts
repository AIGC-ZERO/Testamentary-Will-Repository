import { applyDecorators, SetMetadata } from '@nestjs/common';

/**
 * 后台角色常量，与 prisma/seed.ts 中 admin_users.role 一致。
 * 「管理员」为超级角色，默认拥有全部后台权限（见 RolesGuard）。
 */
export const ADMIN_ROLES = ['审核员', '业务员', '管理员', '客服', '管理人'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];
export const ADMIN_SUPER_ROLE: AdminRole = '管理员';

export type TokenKind = 'user' | 'admin';

export const KIND_KEY = 'auth:required-kind';
export const ROLES_KEY = 'auth:required-roles';

/** 要求指定 Token 类型（user=H5 用户 / admin=后台账号） */
export const RequireKind = (kind: TokenKind) => SetMetadata(KIND_KEY, kind);

/** 仅 H5 用户可访问（后台账号调用返回 403） */
export const UserOnly = () => RequireKind('user');

/** 仅后台账号可访问（任意后台角色，含管理员） */
export const AdminOnly = () => RequireKind('admin');

/** 仅指定后台角色可访问；「管理员」作为超级角色始终放行 */
export const AdminRoles = (...roles: AdminRole[]) =>
  applyDecorators(RequireKind('admin'), SetMetadata(ROLES_KEY, roles));
