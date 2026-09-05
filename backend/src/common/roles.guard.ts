import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ADMIN_SUPER_ROLE, KIND_KEY, ROLES_KEY, TokenKind } from './roles';

interface TokenPayload {
  sub: string;
  kind?: string;
  role?: string;
  name?: string;
  account?: string;
}

/**
 * 全局角色守卫（注册顺序必须在 JwtAuthGuard 之后）。
 *
 * 规则：
 * - 接口未标注 @UserOnly/@AdminOnly/@AdminRoles → 任意已认证身份可访问；
 * - @UserOnly → 仅 kind='user'；@AdminOnly → 仅 kind='admin'；
 * - @AdminRoles(...) → kind='admin' 且角色在清单内；「管理员」为超级角色，始终放行；
 * - 拒绝一律返回 403（不区分"未登录"与"无权限"之外的细节），并写入审计日志。
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredKind = this.reflector.getAllAndOverride<TokenKind>(KIND_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredKind && (!requiredRoles || requiredRoles.length === 0)) return true;

    const req = context.switchToHttp().getRequest<{
      user?: TokenPayload;
      method: string;
      url: string;
    }>();
    const user = req.user;
    // JwtAuthGuard 已先执行，此处缺失属于防御分支
    if (!user) throw new UnauthorizedException('未登录');

    let allowed = true;
    if (requiredKind && user.kind !== requiredKind) allowed = false;
    if (allowed && requiredRoles && requiredRoles.length > 0) {
      if (user.kind !== 'admin') {
        allowed = false;
      } else if (user.role !== ADMIN_SUPER_ROLE && !requiredRoles.includes(user.role ?? '')) {
        allowed = false;
      }
    }

    if (!allowed) {
      await this.auditDeny(req, user);
      throw new ForbiddenException('没有执行该操作的权限');
    }
    return true;
  }

  private async auditDeny(
    req: { method: string; url: string },
    user: TokenPayload,
  ): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          who: user.name || user.account || user.sub,
          action: `越权拦截 ${req.method} ${req.url}（kind=${user.kind ?? '?'} role=${user.role ?? '?'}）`,
        },
      });
    } catch {
      // 审计写入失败不阻断安全决策
    }
  }
}
