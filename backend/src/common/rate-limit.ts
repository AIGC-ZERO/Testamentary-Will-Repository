import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * 进程内固定窗口限流（零依赖，适用于单实例开发/演示环境）。
 * 生产环境多实例部署时必须替换为 Redis 等集中式限流。
 */
@Injectable()
export class RateLimitService {
  private readonly buckets = new Map<string, Bucket>();

  /** 计 1 次；窗口内超过 limit 次抛 429 */
  hit(key: string, limit: number, windowMs: number, message: string): void {
    const now = Date.now();
    this.sweep(now);
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > limit) {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  /** 只检查不计数：用于登录等动作的事前锁定判断 */
  assertUnder(key: string, limit: number, message: string): void {
    const bucket = this.buckets.get(key);
    if (bucket && bucket.resetAt > Date.now() && bucket.count >= limit) {
      throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  private sweep(now: number): void {
    if (this.buckets.size < 5000) return;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
