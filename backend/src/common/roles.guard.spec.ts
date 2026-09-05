import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KIND_KEY, ROLES_KEY } from './roles';
import { RolesGuard } from './roles.guard';

interface Metadata {
  [KIND_KEY]?: string;
  [ROLES_KEY]?: string[];
}

function buildGuard(metadata: Metadata, user: unknown) {
  const reflector = {
    getAllAndOverride: (key: string) => metadata[key as keyof Metadata],
  } as unknown as Reflector;
  const auditCreate = jest.fn().mockResolvedValue({});
  const prisma = { auditLog: { create: auditCreate } };
  const guard = new RolesGuard(reflector, prisma as never);
  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user, method: 'POST', url: '/api/admin/test' }),
    }),
  } as unknown as ExecutionContext;
  return { guard, context, auditCreate };
}

const userToken = { sub: 'u1', kind: 'user', name: '张三' };
const reviewerToken = { sub: 'a1', kind: 'admin', role: '审核员', name: '李审核' };
const agentToken = { sub: 'a2', kind: 'admin', role: '业务员', name: '周业务' };
const adminToken = { sub: 'a3', kind: 'admin', role: '管理员', name: '王管理' };

describe('RolesGuard', () => {
  it('接口未标注角色要求时，任意已认证身份放行', async () => {
    const { guard, context } = buildGuard({}, userToken);
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('缺少用户身份时抛 401（防御分支）', async () => {
    const { guard, context } = buildGuard({ [KIND_KEY]: 'admin' }, undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('@UserOnly：用户放行，后台账号拒绝', async () => {
    const asUser = buildGuard({ [KIND_KEY]: 'user' }, userToken);
    await expect(asUser.guard.canActivate(asUser.context)).resolves.toBe(true);

    const asAdmin = buildGuard({ [KIND_KEY]: 'user' }, adminToken);
    await expect(asAdmin.guard.canActivate(asAdmin.context)).rejects.toThrow(ForbiddenException);
  });

  it('@AdminOnly：后台账号放行，普通用户拒绝（核心越权场景）', async () => {
    const asAdmin = buildGuard({ [KIND_KEY]: 'admin' }, adminToken);
    await expect(asAdmin.guard.canActivate(asAdmin.context)).resolves.toBe(true);

    const asUser = buildGuard({ [KIND_KEY]: 'admin' }, userToken);
    await expect(asUser.guard.canActivate(asUser.context)).rejects.toThrow(ForbiddenException);
  });

  it('@AdminRoles：清单内角色放行，清单外拒绝', async () => {
    const reviewer = buildGuard(
      { [KIND_KEY]: 'admin', [ROLES_KEY]: ['审核员'] },
      reviewerToken,
    );
    await expect(reviewer.guard.canActivate(reviewer.context)).resolves.toBe(true);

    const agent = buildGuard({ [KIND_KEY]: 'admin', [ROLES_KEY]: ['审核员'] }, agentToken);
    await expect(agent.guard.canActivate(agent.context)).rejects.toThrow(ForbiddenException);
  });

  it('@AdminRoles：管理员为超级角色，始终放行', async () => {
    const { guard, context } = buildGuard(
      { [KIND_KEY]: 'admin', [ROLES_KEY]: ['审核员'] },
      adminToken,
    );
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('@AdminRoles：普通用户持后台路径被拒，即使伪造 role 字段', async () => {
    const forged = { sub: 'u9', kind: 'user', role: '管理员', name: '伪造者' };
    const { guard, context } = buildGuard(
      { [KIND_KEY]: 'admin', [ROLES_KEY]: ['审核员'] },
      forged,
    );
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('拒绝时写入审计日志', async () => {
    const { guard, context, auditCreate } = buildGuard({ [KIND_KEY]: 'admin' }, userToken);
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
    expect(auditCreate).toHaveBeenCalledTimes(1);
    const arg = auditCreate.mock.calls[0][0] as { data: { action: string } };
    expect(arg.data.action).toContain('越权拦截');
  });
});
