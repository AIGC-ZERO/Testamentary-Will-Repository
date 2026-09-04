# 01 · 后端技术架构

## 1. 选型（已冻结 · Phase 0）

| 层级 | 选型 | 说明 |
|------|------|------|
| API 框架 | **NestJS 11** | 与前端同属 TypeScript 生态，模块化清晰 |
| ORM | **Prisma 5** | Schema 即文档，迁移友好 |
| 数据库 | **PostgreSQL 16** | JSONB / 数组 / 强约束，符合总计划推荐 |
| 缓存（预留） | Redis 7 | Compose 中 `profile: full`，OTP/限流二期启用 |
| 认证 | JWT（Bearer） | H5 用户 Token / 后台 Admin Token 分 kind |
| 校验 | class-validator | DTO 白名单 + 转型 |
| 容器 | Docker Compose | 本地 Postgres 一键拉起 |

> 总计划备选 Spring Boot 3 仍可作为生产加固路线；当前以 NestJS 快速对齐已完成前端页面。

## 2. 逻辑架构

```text
[H5 Vue] ──┐
           ├── HTTP JSON ──► NestJS API (127.0.0.1:3000)
[Admin Vue]┘                      │
                                  ├── Prisma ──► PostgreSQL
                                  └── AuditLog / SmsLog（横切）
```

## 3. 仓库目录

```text
backend/
├── docker-compose.yml      # Postgres（+ 可选 Redis）
├── prisma/
│   ├── schema.prisma       # 数据模型
│   ├── seed.ts             # 与前端 seed 对齐的种子数据
│   └── migrations/         # 迁移历史
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/               # 登录注册 / 短信码 / 后台登录
│   ├── registrations/      # 遗嘱登记审核
│   ├── businesses/         # H5 六宫格业务单
│   ├── witnessings/        # 见证排期完成
│   ├── ops/                # 纠纷/保管/加盟/短信/审计/看板
│   ├── prisma/
│   └── common/             # JWT Guard、工具函数
├── .env.example
└── package.json
```

## 4. 本地启动

```bash
# 1) 启动数据库
cd backend
docker compose up -d postgres

# 2) 安装依赖（若尚未安装）
npm install

# 3) 迁移 + 种子
npx prisma migrate dev --name init
npm run prisma:seed

# 4) 启动 API
npm run start:dev
```

健康检查：`GET http://127.0.0.1:3000/api/health`

## 5. 安全基线（本期已落地）

| 项 | 实现 |
|----|------|
| 密码 | bcrypt 哈希存储，响应体不回传 |
| 开发验证码 | `SMS_DEV_CODE`（默认 888888），短信内容脱敏 |
| CORS | 仅 `CORS_ORIGIN` 白名单 |
| 监听地址 | 默认 `127.0.0.1` |
| 审计 | 关键写操作写入 `audit_logs` |
| 存证哈希 | 登记受理 / 仪式完成生成 `content_hash` / `ceremony_hash` |

## 6. 与前端实体映射

| 前端 store 字段 | 后端表 |
|-----------------|--------|
| `registrations` | `registrations` |
| `witnessings` | `witnessings` |
| `businesses` | `business_orders` |
| `disputes` | `disputes` |
| `custody` | `custody_records` |
| `franchises` | `franchises` |
| `sms` | `sms_logs` |
| `audits` | `audit_logs` |
| `adminUsers` | `admin_users` |
| `orders` | `orders` |
| H5 `user` | `users` |
