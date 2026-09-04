import { Controller, Get } from '@nestjs/common';
import { Public } from './common/auth.guard';
import { ok } from './common/utils';

@Controller('api')
export class HealthController {
  @Public()
  @Get('health')
  health() {
    return ok({
      service: 'will-repository-api',
      status: 'up',
      time: new Date().toISOString(),
    });
  }
}
