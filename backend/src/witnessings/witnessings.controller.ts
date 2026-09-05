import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AdminRoles, UserOnly } from '../common/roles';
import { assertStatusIn, WITNESS_RULES } from '../common/state-machine';
import { formatDateTime, genBizId, ok, shortHash } from '../common/utils';

class CreateWitnessDto {
  @IsString()
  applicant!: string;

  @IsArray()
  services!: string[];

  @IsOptional()
  @IsNumber()
  fee?: number;

  @IsOptional()
  @IsBoolean()
  paid?: boolean;
}

class ScheduleDto {
  @IsString()
  schedule!: string;

  @IsOptional()
  @IsString()
  agent?: string;
}

@Controller('api')
export class WitnessingsController {
  constructor(private readonly prisma: PrismaService) {}

  @UserOnly()
  @Post('witnessings')
  async create(@Body() dto: CreateWitnessDto, @Req() req: { user: { sub: string; name?: string } }) {
    const id = genBizId('WS');
    const row = await this.prisma.witnessing.create({
      data: {
        id,
        userId: req.user.sub,
        applicant: dto.applicant,
        services: dto.services,
        status: '待审核',
        fee: dto.fee ?? 0,
        paid: dto.paid ?? false,
      },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || dto.applicant, action: `提交见证 ${id}` },
    });
    return ok(this.map(row), '提交成功');
  }

  @AdminRoles('审核员', '业务员', '管理员')
  @Get('admin/witnessings')
  async list(@Query('status') status?: string) {
    const list = await this.prisma.witnessing.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return ok(list.map(this.map));
  }

  @AdminRoles('审核员', '管理员')
  @Post('admin/witnessings/:id/approve')
  async approve(@Param('id') id: string, @Body() body: { agent?: string }, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.witnessing.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`见证 ${id} 不存在`);
    assertStatusIn(cur.status, WITNESS_RULES.approve, { label: '见证', id, action: '通过' });
    const row = await this.prisma.witnessing.update({
      where: { id },
      data: { status: '待排期', agent: body.agent || '周业务' },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '审核员', action: `见证通过 ${id}` },
    });
    return ok(this.map(row));
  }

  @AdminRoles('审核员', '管理员')
  @Post('admin/witnessings/:id/reject')
  async reject(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.witnessing.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`见证 ${id} 不存在`);
    assertStatusIn(cur.status, WITNESS_RULES.reject, { label: '见证', id, action: '驳回' });
    const row = await this.prisma.witnessing.update({
      where: { id },
      data: { status: '已驳回' },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '审核员', action: `见证驳回 ${id}` },
    });
    return ok(this.map(row));
  }

  @AdminRoles('业务员', '管理员')
  @Post('admin/witnessings/:id/schedule')
  async schedule(@Param('id') id: string, @Body() dto: ScheduleDto, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.witnessing.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`见证 ${id} 不存在`);
    assertStatusIn(cur.status, WITNESS_RULES.schedule, { label: '见证', id, action: '排期' });
    const row = await this.prisma.witnessing.update({
      where: { id },
      data: {
        status: '待排期',
        scheduleAt: dto.schedule,
        agent: dto.agent || undefined,
      },
    });
    await this.prisma.smsLog.create({
      data: {
        toName: row.applicant,
        template: '见证排期通知',
        content: `您的见证业务 ${id} 已排期至 ${dto.schedule}，请准时到场。`,
        status: '成功',
      },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '业务员', action: `设置排期 ${id} → ${dto.schedule}` },
    });
    return ok(this.map(row));
  }

  @AdminRoles('管理员')
  @Patch('admin/witnessings/:id/agent')
  async assign(@Param('id') id: string, @Body() body: { agent: string }, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.witnessing.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`见证 ${id} 不存在`);
    assertStatusIn(cur.status, WITNESS_RULES.assignAgent, { label: '见证', id, action: '分配业务员' });
    const row = await this.prisma.witnessing.update({
      where: { id },
      data: { agent: body.agent },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `分配业务员 ${id} → ${body.agent}` },
    });
    return ok(this.map(row));
  }

  @AdminRoles('业务员', '管理员')
  @Post('admin/witnessings/:id/complete')
  async complete(@Param('id') id: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.witnessing.findUnique({ where: { id } });
    if (!cur) throw new NotFoundException(`见证 ${id} 不存在`);
    assertStatusIn(cur.status, WITNESS_RULES.complete, { label: '见证', id, action: '标记完成' });
    if (!cur.scheduleAt) {
      throw new ConflictException(`见证 ${id} 尚未排期，不能标记完成`);
    }
    const ceremonyHash = shortHash(`${id}:ceremony:${Date.now()}`);
    const row = await this.prisma.witnessing.update({
      where: { id },
      data: { status: '已完成', ceremonyHash },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '业务员', action: `标记完成 ${id}，ceremonyHash ${ceremonyHash}` },
    });
    return ok(this.map(row));
  }

  private map(row: {
    id: string;
    applicant: string;
    services: string[];
    status: string;
    fee: { toString(): string };
    paid: boolean;
    agent: string | null;
    scheduleAt: string | null;
    ceremonyHash: string | null;
  }) {
    return {
      id: row.id,
      applicant: row.applicant,
      services: row.services,
      status: row.status,
      fee: Number(row.fee),
      paid: row.paid,
      agent: row.agent || '',
      schedule: row.scheduleAt || undefined,
      ceremonyHash: row.ceremonyHash || undefined,
    };
  }
}
