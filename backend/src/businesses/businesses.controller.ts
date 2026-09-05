import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { AdminRoles, UserOnly } from '../common/roles';
import { assertStatusIn, BUSINESS_RULES, nextBusinessStatus } from '../common/state-machine';
import { formatDateTime, ok } from '../common/utils';

class CreateBusinessDto {
  @IsString()
  businessCode!: string;

  @IsOptional()
  @IsString()
  businessModel?: string;

  @IsOptional()
  @IsString()
  applicantName?: string;

  @IsOptional()
  @IsString()
  lawName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  partnerCode?: string;

  @IsOptional()
  @IsString()
  paidFees?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

@Controller('api')
export class BusinessesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('businesses')
  async list(
    @Req() req: { user: { sub: string; kind: string } },
    @Query('code') code?: string,
    @Query('status') status?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (req.user.kind === 'user') where.userId = req.user.sub;
    if (code && code !== 'all') where.businessCode = code;
    if (status) where.businessStatus = status;
    const list = await this.prisma.businessOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return ok(list.map(this.mapBiz));
  }

  @UserOnly()
  @Post('businesses')
  async create(@Body() dto: CreateBusinessDto, @Req() req: { user: { sub: string; name?: string } }) {
    const orderCode = `ORD${Date.now().toString().slice(-10)}`;
    const row = await this.prisma.businessOrder.create({
      data: {
        orderCode,
        bizId: BigInt(Date.now()),
        userId: req.user.sub,
        businessCode: dto.businessCode,
        businessModel: dto.businessModel || '0',
        businessStatus: '00',
        applicantName: dto.applicantName || req.user.name,
        lawName: dto.lawName,
        phoneNumber: dto.phoneNumber,
        companyName: dto.companyName,
        partnerCode: dto.partnerCode,
        paidFees: dto.paidFees || '',
        paidFeesTime: dto.paidFees ? formatDateTime() : '',
        note: dto.note,
      },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '用户', action: `创建业务单 ${orderCode}` },
    });
    return ok(this.mapBiz(row), '创建成功');
  }

  @UserOnly()
  @Post('businesses/:orderCode/cancel')
  async cancel(@Param('orderCode') orderCode: string, @Req() req: { user: { sub: string; name?: string } }) {
    const cur = await this.prisma.businessOrder.findUnique({ where: { orderCode } });
    if (!cur) throw new NotFoundException(`业务单 ${orderCode} 不存在`);
    // 只能作废本人名下的业务单（历史无归属数据禁止用户侧作废）
    if (!cur.userId || cur.userId !== req.user.sub) {
      throw new ForbiddenException('只能作废本人的业务单');
    }
    assertStatusIn(cur.businessStatus, BUSINESS_RULES.cancel, {
      label: '业务单',
      id: orderCode,
      action: '作废',
    });
    const row = await this.prisma.businessOrder.update({
      where: { orderCode },
      data: { businessStatus: '11' },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '用户', action: `作废业务单 ${orderCode}` },
    });
    return ok(this.mapBiz(row), '已作废');
  }

  @AdminRoles('审核员', '业务员', '管理员')
  @Post('admin/businesses/:orderCode/advance')
  async advance(@Param('orderCode') orderCode: string, @Req() req: { user: { name?: string } }) {
    const cur = await this.prisma.businessOrder.findUnique({ where: { orderCode } });
    if (!cur) throw new NotFoundException(`业务单 ${orderCode} 不存在`);
    const next = nextBusinessStatus(cur.businessStatus, orderCode);
    const row = await this.prisma.businessOrder.update({
      where: { orderCode },
      data: { businessStatus: next },
    });
    await this.prisma.auditLog.create({
      data: { who: req.user.name || '管理员', action: `推进业务单 ${orderCode} → ${next}` },
    });
    return ok(this.mapBiz(row));
  }

  private mapBiz(row: {
    id: string;
    bizId: bigint | null;
    orderCode: string;
    businessCode: string;
    businessModel: string;
    businessStatus: string;
    applicantName: string | null;
    lawName: string | null;
    phoneNumber: string | null;
    companyName: string | null;
    partnerCode: string | null;
    paidFees: string | null;
    paidFeesTime: string | null;
    note: string | null;
    createdAt: Date;
  }) {
    return {
      id: row.bizId ? Number(row.bizId) : row.id,
      orderCode: row.orderCode,
      businessCode: row.businessCode,
      businessModel: row.businessModel,
      businessStatus: row.businessStatus,
      applicantName: row.applicantName,
      lawName: row.lawName,
      phoneNumber: row.phoneNumber,
      companyName: row.companyName,
      partnerCode: row.partnerCode,
      paidFees: row.paidFees || '',
      paidFeesTime: row.paidFeesTime || '',
      note: row.note || '',
      registrationTime: formatDateTime(row.createdAt),
    };
  }
}
