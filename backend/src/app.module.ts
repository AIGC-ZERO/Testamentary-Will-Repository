import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/auth.guard';
import { RolesGuard } from './common/roles.guard';
import { CommonModule } from './common/common.module';
import { RegistrationsController } from './registrations/registrations.controller';
import { BusinessesController } from './businesses/businesses.controller';
import { WitnessingsController } from './witnessings/witnessings.controller';
import { OpsController } from './ops/ops.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CommonModule,
    AuthModule,
  ],
  controllers: [
    HealthController,
    RegistrationsController,
    BusinessesController,
    WitnessingsController,
    OpsController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 角色守卫必须在 JwtAuthGuard 之后执行
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
