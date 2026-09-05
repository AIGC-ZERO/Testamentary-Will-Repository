import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Req } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AdminOnly, AdminRoles, UserOnly } from '../common/roles';
import {
  assertStatusIn,
  FRANCHISE_RULES,
  nextDisputeStage,
} from '../common/state-machine';
import { formatDateTime, genBizId, ok } from '../common/utils';

@Controller('api')
export class OpsController {
  constructor(private readonly prisma: PrismaService) {}

  // ---- disputes ----
  @AdminRoles('业务员', '审核员', '管理员')
  @Get('admin/disputes')
  async disputes() {
    const list = await this.prisma.dispute.findMany({ orderBy: { updatedAt: 'desc' } });
    return ok(list.map((d) => ({
      id: d.id,
      title: d.title,
      applicant: d.applicant,
      owner: d.owner,
      stage: d.stage,
      updatedAt: formatDateTime(d.updatedAt),
    })));
  }

  @UserOnly()
  @Post('disputes')
  async createDispute(
    @Body() body: { title: string; applicant: string; desc?: string },
    @Req() req: { user: { sub: string; name?: string } },
  ) {
    const id = genBizId('DP');
    const row = await this.prisma.dispute.create({
      data: {
        id,
        userId: req.user.sub,
        title: body.title,
        applicant: body.applicant,
        owner: '周业务',
        stage: '调解中',
        description: body.desc,
      },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || body.applicant, action: `提交纠纷 ${id}` },
    });
    return ok(row, '提交成功');
  }

  @AdminRoles('业务员', '管理员')
  @Post('admin/disputes/:id/advance')
  async advanceDispute(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.dispute.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`纠纷 ${id} 不存在`);
    const next = nextDisputeStage(cur.stage, id);
    const row = await this.prisma.dispute.update({ where: { id }, data: { stage: next } });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '业务员', action: `推进纠纷 ${id} → ${next}` },
    });
    return ok(row);
  }

  @AdminRoles('管理员')
  @Patch('admin/disputes/:id/owner')
  async assignOwner(@Param('id') id: string, @Body() body: { owner: string }, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.dispute.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`纠纷 ${id} 不存在`);
    const row = await this.prisma.dispute.update({ where: { id }, data: { owner: body.owner } });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `纠纷改派 ${id} → ${body.owner}` },
    });
    return ok(row);
  }

  // ---- custody ----
  @AdminRoles('业务员', '管理人', '管理员')
  @Get('admin/custody')
  async custody() {
    const list = await this.prisma.custodyRecord.findMany({ orderBy: { updatedAt: 'desc' } });
    return ok(list);
  }

  @AdminRoles('业务员', '管理人', '管理员')
  @Post('admin/custody/:willId/inspect')
  async inspect(@Param('willId') willId: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.custodyRecord.findUnique({ where: { willId } });
    if (!cur) throw new NotFoundException(`保管记录 ${willId} 不存在`);
    const row = await this.prisma.custodyRecord.update({
      where: { willId },
      data: { lastCheck: formatDateTime().slice(0, 10) },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `保管巡检 ${willId}` },
    });
    return ok(row);
  }

  @AdminRoles('业务员', '管理人', '管理员')
  @Post('admin/custody/:willId/mark-bad')
  async markBad(@Param('willId') willId: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.custodyRecord.findUnique({ where: { willId } });
    if (!cur) throw new NotFoundException(`保管记录 ${willId} 不存在`);
    const row = await this.prisma.custodyRecord.update({ where: { willId }, data: { ok: false } });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `保管标记异常 ${willId}` },
    });
    return ok(row);
  }

  @AdminRoles('业务员', '管理人', '管理员')
  @Post('admin/custody/:willId/mark-ok')
  async markOk(@Param('willId') willId: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.custodyRecord.findUnique({ where: { willId } });
    if (!cur) throw new NotFoundException(`保管记录 ${willId} 不存在`);
    const row = await this.prisma.custodyRecord.update({ where: { willId }, data: { ok: true } });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `保管恢复正常 ${willId}` },
    });
    return ok(row);
  }

  // ---- franchise ----
  @AdminRoles('管理员')
  @Get('admin/franchises')
  async franchises() {
    return ok(await this.prisma.franchise.findMany({ orderBy: { createdAt: 'desc' }, include: { employees: true } }));
  }

  @UserOnly()
  @Post('franchises')
  async applyFranchise(@Body() body: { name: string; region?: string; contact?: string; note?: string }, @Req() req: { user: { name?: string } }) {
    const id = genBizId('FR');
    const row = await this.prisma.franchise.create({
      data: { id, name: body.name, region: body.region, contact: body.contact, note: body.note, status: '待审核' },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || body.name, action: `提交加盟 ${id}` },
    });
    return ok(row, '已提交');
  }

  @AdminRoles('管理员')
  @Post('admin/franchises/:id/approve')
  async approveFr(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.franchise.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`加盟 ${id} 不存在`);
    assertStatusIn(cur.status, FRANCHISE_RULES.approve, { label: '加盟', id, action: '入库' });
    const row = await this.prisma.franchise.update({ where: { id }, data: { status: '已入库' } });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `加盟入库 ${id}` },
    });
    return ok(row);
  }

  @AdminRoles('管理员')
  @Post('admin/franchises/:id/reject')
  async rejectFr(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.franchise.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`加盟 ${id} 不存在`);
    assertStatusIn(cur.status, FRANCHISE_RULES.reject, { label: '加盟', id, action: '驳回' });
    const row = await this.prisma.franchise.update({ where: { id }, data: { status: '已驳回' } });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `加盟驳回 ${id}` },
    });
    return ok(row);
  }

  // 加盟成员含手机号等个人信息，仅后台可见
  @AdminRoles('客服', '管理员')
  @Get('franchisees/:code/employees')
  async employees(@Param('code') code: string) {
    const list = await this.prisma.franchiseEmployee.findMany({ where: { franchiseId: code } });
    return ok(list);
  }

  // ---- sms / audits / users / dashboard ----
  @AdminRoles('客服', '管理员')
  @Get('admin/sms')
  async sms() {
    const list = await this.prisma.smsLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    return ok(list.map((s) => ({
      id: s.id,
      to: s.toName || s.toMobile,
      tpl: s.template,
      content: s.content,
      status: s.status,
      at: formatDateTime(s.createdAt),
    })));
  }

  @AdminRoles('客服', '管理员')
  @Post('admin/sms/:id/resend')
  async resend(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const src = await this.prisma.smsLog.findUnique({ where: { id: Number(id) } });
    if (!src) throw new NotFoundException(`短信记录 #${id} 不存在`);
    const row = await this.prisma.smsLog.create({
      data: {
        toName: src.toName,
        toMobile: src.toMobile,
        template: src.template,
        content: src.content,
        status: '成功',
      },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `重发短信 #${id}` },
    });
    return ok(row, '已重发');
  }

  @AdminRoles('管理员')
  @Get('admin/audits')
  async audits() {
    const list = await this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    return ok(list.map((a) => ({ at: formatDateTime(a.createdAt), who: a.who, action: a.action })));
  }

  @AdminRoles('管理员')
  @Get('admin/users')
  async users() {
    const list = await this.prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
    return ok(list.map((u) => ({
      name: u.name,
      account: u.account,
      role: u.role,
      active: u.active,
      lastLogin: u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '',
    })));
  }

  @AdminOnly()
  @Get('admin/dashboard')
  async dashboard() {
    const [registrations, witnessings, custody, disputes, franchises, businesses, audits] = await Promise.all([
      this.prisma.registration.count(),
      this.prisma.witnessing.count(),
      this.prisma.custodyRecord.count(),
      this.prisma.dispute.count({ where: { stage: { not: '已结案' } } }),
      this.prisma.franchise.count(),
      this.prisma.businessOrder.groupBy({ by: ['businessCode'], _count: true }),
      this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);
    const pendingRegs = await this.prisma.registration.count({
      where: { status: { in: ['审核中', '已提交', '退回补充'] } },
    });
    const pendingWitness = await this.prisma.witnessing.count({ where: { status: '待排期' } });
    return ok({
      cards: {
        registrations,
        witnessings,
        pendingRegs,
        pendingWitness,
        custody,
        disputes,
        franchises,
      },
      bizStats: businesses.map((b) => ({ code: b.businessCode, value: b._count })),
      recentAudits: audits.map((a) => ({ at: formatDateTime(a.createdAt), who: a.who, action: a.action })),
    });
  }

  @AdminOnly()
  @Get('admin/stats')
  async stats() {
    const dash = await this.dashboard();
    return dash;
  }
}
