import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/auth.guard';
import { RateLimitService } from '../common/rate-limit';
import { formatDateTime, ok } from '../common/utils';

class SendSmsDto {
  @IsString()
  @Matches(/^1\d{10}$/)
  mobile!: string;

  @IsOptional()
  @IsString()
  purpose?: string;
}

class LoginDto {
  @IsString()
  @Matches(/^1\d{10}$/)
  mobile!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsIn(['0', '1', '2', '3'])
  role?: string;
}

class RegisterDto {
  @IsString()
  @Matches(/^1\d{10}$/)
  mobile!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  idNo?: string;

  @IsOptional()
  @IsString()
  marriage?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  hometown?: string;
}

class AdminLoginDto {
  @IsString()
  account!: string;

  @IsString()
  password!: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Public()
  @Post('sms/send')
  async sendSms(@Body() dto: SendSmsDto) {
    this.rateLimit.hit(`sms:min:${dto.mobile}`, 1, 60_000, '发送过于频繁，请1分钟后再试');
    this.rateLimit.hit(`sms:hour:${dto.mobile}`, 5, 3_600_000, '发送次数已达上限，请稍后再试');
    const devCode = this.devSmsCode();
    // 非开发环境生成随机验证码；真实短信通道接入前仅落库待审
    const code = devCode ?? String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.prisma.smsCode.create({
      data: {
        mobile: dto.mobile,
        code,
        purpose: dto.purpose || 'login',
        expiresAt,
      },
    });
    await this.prisma.smsLog.create({
      data: {
        toMobile: dto.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
        template: '验证码',
        content: devCode
          ? `验证码已发送（开发环境固定码），5分钟内有效。`
          : `验证码已发送，5分钟内有效。`,
        status: '成功',
      },
    });
    return ok({ expiresIn: 300 }, '验证码已发送');
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    if (dto.role === '2') {
      // 后台账号必须走 /api/auth/admin/login，H5 不再提供免密管理员入口
      throw new BadRequestException('管理员账号请通过后台登录页登录');
    }

    const failKey = `login-fail:${dto.mobile}`;
    this.rateLimit.assertUnder(failKey, 5, '失败次数过多，请10分钟后再试');
    try {
      if (dto.code) {
        await this.assertSms(dto.mobile, dto.code, 'login');
      } else if (dto.password) {
        const user = await this.prisma.user.findUnique({ where: { mobile: dto.mobile } });
        if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
          throw new UnauthorizedException('手机号或密码错误');
        }
      } else {
        throw new UnauthorizedException('请输入密码或验证码');
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        this.rateLimit.hit(failKey, 5, 600_000, '失败次数过多，请10分钟后再试');
      }
      throw err;
    }
    this.rateLimit.reset(failKey);

    let user = await this.prisma.user.findUnique({ where: { mobile: dto.mobile } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          mobile: dto.mobile,
          name: `用户${dto.mobile.slice(-4)}`,
          identityType: dto.role || '0',
        },
      });
    }

    const token = this.signUser(user);
    return ok({
      token,
      kind: 'user',
      user: this.publicUser(user),
    });
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    await this.assertSms(dto.mobile, dto.code, 'register');
    const exists = await this.prisma.user.findUnique({ where: { mobile: dto.mobile } });
    if (exists) throw new UnauthorizedException('手机号已注册');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        mobile: dto.mobile,
        passwordHash,
        name: dto.name || `用户${dto.mobile.slice(-4)}`,
        gender: dto.gender,
        idNo: dto.idNo,
        marriage: dto.marriage,
        address: dto.address,
        hometown: dto.hometown,
        identityType: '0',
      },
    });
    await this.prisma.auditLog.create({
      data: { who: user.name || user.mobile, action: `用户注册 ${user.mobile}` },
    });
    const token = this.signUser(user);
    return ok({ token, kind: 'user', user: this.publicUser(user) }, '注册成功');
  }

  @Public()
  @Post('admin/login')
  async adminLogin(@Body() dto: AdminLoginDto) {
    const failKey = `admin-fail:${dto.account}`;
    this.rateLimit.assertUnder(failKey, 5, '失败次数过多，请10分钟后再试');
    const admin = await this.prisma.adminUser.findUnique({ where: { account: dto.account } });
    if (!admin?.active || !(await bcrypt.compare(dto.password, admin.passwordHash))) {
      this.rateLimit.hit(failKey, 5, 600_000, '失败次数过多，请10分钟后再试');
      await this.prisma.auditLog.create({
        data: { who: dto.account, action: `后台登录失败 ${dto.account}` },
      });
      throw new UnauthorizedException('账号或密码错误');
    }
    this.rateLimit.reset(failKey);
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });
    await this.prisma.auditLog.create({
      data: { who: admin.name, action: `后台登录 ${admin.account}` },
    });
    return ok({
      token: this.signAdmin(admin),
      kind: 'admin',
      user: { name: admin.name, role: admin.role, account: admin.account },
    });
  }

  @Get('me')
  async me(@Req() req: { user: { sub: string; kind: string } }) {
    if (req.user.kind === 'admin') {
      const admin = await this.prisma.adminUser.findUnique({ where: { id: req.user.sub } });
      return ok({ kind: 'admin', user: admin ? { name: admin.name, role: admin.role, account: admin.account } : null });
    }
    const user = await this.prisma.user.findUnique({ where: { id: req.user.sub } });
    return ok({ kind: 'user', user: user ? this.publicUser(user) : null });
  }

  private async assertSms(mobile: string, code: string, purpose: string) {
    const row = await this.prisma.smsCode.findFirst({
      where: { mobile, purpose, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (row && row.code === code) {
      await this.prisma.smsCode.update({ where: { id: row.id }, data: { used: true } });
      return;
    }
    // 开发环境固定万能码：仅非生产环境且显式配置时生效
    const devCode = this.devSmsCode();
    if (devCode && code === devCode) return;
    throw new UnauthorizedException('验证码无效或已过期');
  }

  /** 仅开发环境返回 SMS_DEV_CODE；生产环境永远返回 null */
  private devSmsCode(): string | null {
    if ((this.config.get<string>('NODE_ENV') || 'development') === 'production') return null;
    return this.config.get<string>('SMS_DEV_CODE') || null;
  }

  private signUser(user: { id: string; mobile: string; name: string | null; identityType: string }) {
    return this.jwt.sign({
      sub: user.id,
      kind: 'user',
      mobile: user.mobile,
      name: user.name,
      role: user.identityType,
    });
  }

  private signAdmin(admin: { id: string; account: string; name: string; role: string }) {
    // 后台令牌短寿命，降低泄露后的滥用窗口
    const expiresIn = (this.config.get<string>('JWT_ADMIN_EXPIRES_IN') ||
      '2h') as JwtSignOptions['expiresIn'];
    return this.jwt.sign(
      {
        sub: admin.id,
        kind: 'admin',
        account: admin.account,
        name: admin.name,
        role: admin.role,
      },
      { expiresIn },
    );
  }

  private publicUser(user: {
    id: string;
    mobile: string;
    name: string | null;
    gender: string | null;
    marriage: string | null;
    address: string | null;
    hometown: string | null;
    realNamed: boolean;
    face: boolean;
    fingerprint: boolean;
    idProof: boolean;
    identityType: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      mobile: user.mobile,
      name: user.name,
      gender: user.gender,
      marriage: user.marriage,
      address: user.address,
      hometown: user.hometown,
      realNamed: user.realNamed,
      face: user.face,
      fingerprint: user.fingerprint,
      idProof: user.idProof,
      identityType: user.identityType,
      registerAt: formatDateTime(user.createdAt),
    };
  }
}
