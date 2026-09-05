import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AdminRoles, UserOnly } from '../common/roles';
import { assertStatusIn, REGISTRATION_RULES } from '../common/state-machine';
import { formatDateTime, genBizId, ok, shortHash } from '../common/utils';

class CreateRegistrationDto {
  @IsString()
  applicant!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  willDate?: string;

  @IsOptional()
  @IsString()
  heirs?: string;

  @IsOptional()
  @IsString()
  summary?: string;
}

@Controller('api')
export class RegistrationsController {
  constructor(private readonly prisma: PrismaService) {}

  @UserOnly()
  @Post('registrations')
  async create(@Body() dto: CreateRegistrationDto, @Req() req: { user: { sub: string; name?: string } }) {
    const id = genBizId('RG');
    const row = await this.prisma.registration.create({
      data: {
        id,
        userId: req.user.sub,
        applicant: dto.applicant,
        type: dto.type,
        status: '审核中',
        willDate: dto.willDate,
        heirs: dto.heirs,
        summary: dto.summary,
      },
    });
    await this.prisma.smsLog.create({
      data: {
        toName: dto.applicant,
        template: '登记提交通知',
        content: `您的遗嘱登记 ${id} 已提交，正在审核中。`,
        status: '成功',
      },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || dto.applicant, action: `提交登记 ${id}` },
    });
    return ok(row, '提交成功');
  }

  @AdminRoles('审核员', '客服', '管理员')
  @Get('admin/registrations')
  async list(@Query('status') status?: string) {
    const where = status && status !== '全部'
      ? status === '待审核'
        ? { status: { in: ['审核中', '已提交', '退回补充'] } }
        : { status }
      : {};
    const list = await this.prisma.registration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return ok(list.map(this.mapReg));
  }

  @AdminRoles('审核员', '客服', '管理员')
  @Get('admin/registrations/:id')
  async detail(@Param('id') id: string) {
    const row = await this.prisma.registration.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`登记 ${id} 不存在`);
    return ok(this.mapReg(row));
  }

  @AdminRoles('审核员', '管理员')
  @Post('admin/registrations/:id/approve')
  async approve(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.registration.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`登记 ${id} 不存在`);
    assertStatusIn(cur.status, REGISTRATION_RULES.approve, { label: '登记', id, action: '受理' });
    const d = new Date();
    const certNo = `QD-WILL-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${id.slice(-3)}`;
    const contentHash = shortHash(`${id}:${certNo}:${Date.now()}`);
    const row = await this.prisma.registration.update({
      where: { id },
      data: { status: '已受理', certNo, contentHash },
    });
    await this.prisma.smsLog.create({
      data: {
        toName: row.applicant,
        template: '登记受理通知',
        content: `您的遗嘱登记已受理，证明编号 ${certNo}。`,
        status: '成功',
      },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '审核员', action: `通过登记 ${id} → ${certNo}` },
    });
    return ok(this.mapReg(row), '已受理');
  }

  @AdminRoles('审核员', '管理员')
  @Post('admin/registrations/:id/supplement')
  async supplement(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.registration.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`登记 ${id} 不存在`);
    assertStatusIn(cur.status, REGISTRATION_RULES.supplement, { label: '登记', id, action: '退回补充' });
    const row = await this.prisma.registration.update({
      where: { id },
      data: { status: '退回补充' },
    });
    await this.prisma.smsLog.create({
      data: {
        toName: row.applicant,
        template: '补件通知',
        content: `请补充材料后重新提交登记申请 ${id}。`,
        status: '成功',
      },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '审核员', action: `退回补充 ${id}` },
    });
    return ok(this.mapReg(row), '已退回补充');
  }

  @AdminRoles('审核员', '管理员')
  @Post('admin/registrations/:id/reject')
  async reject(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.registration.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`登记 ${id} 不存在`);
    assertStatusIn(cur.status, REGISTRATION_RULES.reject, { label: '登记', id, action: '驳回终止' });
    const row = await this.prisma.registration.update({
      where: { id },
      data: { status: '驳回终止' },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '审核员', action: `驳回终止 ${id}` },
    });
    return ok(this.mapReg(row), '已驳回');
  }

  private mapReg(row: {
    id: string;
    applicant: string;
    type: string;
    status: string;
    certNo: string | null;
    contentHash: string | null;
    willDate: string | null;
    heirs: string | null;
    summary: string | null;
    createdAt: Date;
  }) {
    return {
      id: row.id,
      applicant: row.applicant,
      type: row.type,
      status: row.status,
      certNo: row.certNo,
      hash: row.contentHash,
      date: row.willDate,
      heirs: row.heirs,
      summary: row.summary,
      createdAt: formatDateTime(row.createdAt),
    };
  }
}
