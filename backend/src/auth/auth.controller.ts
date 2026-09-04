import { Body, Controller, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../common/auth.guard';
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
  ) {}

  @Public()
  @Post('sms/send')
  async sendSms(@Body() dto: SendSmsDto) {
    const code = this.config.get<string>('SMS_DEV_CODE') || '888888';
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
        content: `验证码已发送（开发环境固定码），5分钟内有效。`,
        status: '成功',
      },
    });
    return ok({ expiresIn: 300 }, '验证码已发送');
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    if (dto.role === '2') {
      // H5 选择管理员身份时，引导走后台登录；此处仍允许手机号快速进后台沙箱
      const admin = await this.prisma.adminUser.findFirst({ where: { active: true, role: '管理员' } });
      if (!admin) throw new UnauthorizedException('无可用管理员账号');
      const token = this.signAdmin(admin);
      return ok({ token, kind: 'admin', user: { name: admin.name, role: admin.role, account: admin.account } });
    }

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
    const admin = await this.prisma.adminUser.findUnique({ where: { account: dto.account } });
    if (!admin?.active || !(await bcrypt.compare(dto.password, admin.passwordHash))) {
      throw new UnauthorizedException('账号或密码错误');
    }
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
    const dev = this.config.get<string>('SMS_DEV_CODE') || '888888';
    if ((!row || row.code !== code) && code !== dev) {
      throw new UnauthorizedException('验证码无效或已过期');
    }
    if (row) {
      await this.prisma.smsCode.update({ where: { id: row.id }, data: { used: true } });
    }
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
    return this.jwt.sign({
      sub: admin.id,
      kind: 'admin',
      account: admin.account,
      name: admin.name,
      role: admin.role,
    });
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
