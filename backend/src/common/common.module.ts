import { Global, Module } from '@nestjs/common';
import { RateLimitService } from './rate-limit';

/** 全局公共模块：限流器等横切服务在此注册一次、全应用可注入 */
@Global()
@Module({
  providers: [RateLimitService],
  exports: [RateLimitService],
})
export class CommonModule {}
