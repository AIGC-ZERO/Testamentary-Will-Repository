import { HttpException } from '@nestjs/common';
import { RateLimitService } from './rate-limit';

describe('RateLimitService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-05T10:00:00'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('窗口内未超限放行，超限抛 429', () => {
    const rl = new RateLimitService();
    expect(() => rl.hit('k', 2, 60_000, 'too many')).not.toThrow();
    expect(() => rl.hit('k', 2, 60_000, 'too many')).not.toThrow();
    try {
      rl.hit('k', 2, 60_000, 'too many');
      fail('应当抛出 429');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(429);
    }
  });

  it('不同 key 互相隔离', () => {
    const rl = new RateLimitService();
    rl.hit('a', 1, 60_000, 'x');
    expect(() => rl.hit('b', 1, 60_000, 'x')).not.toThrow();
    expect(() => rl.hit('a', 1, 60_000, 'x')).toThrow(HttpException);
  });

  it('窗口过期后重新计数', () => {
    const rl = new RateLimitService();
    rl.hit('k', 1, 60_000, 'x');
    expect(() => rl.hit('k', 1, 60_000, 'x')).toThrow(HttpException);
    jest.setSystemTime(new Date('2026-09-05T10:01:01'));
    expect(() => rl.hit('k', 1, 60_000, 'x')).not.toThrow();
  });

  it('assertUnder 只检查不计数；reset 解除锁定', () => {
    const rl = new RateLimitService();
    rl.hit('k', 2, 60_000, 'x');
    rl.hit('k', 2, 60_000, 'x');
    expect(() => rl.assertUnder('k', 2, 'locked')).toThrow(HttpException);
    expect(() => rl.assertUnder('k', 2, 'locked')).toThrow(HttpException);
    rl.reset('k');
    expect(() => rl.assertUnder('k', 2, 'locked')).not.toThrow();
    expect(() => rl.hit('k', 2, 60_000, 'x')).not.toThrow();
  });
});
