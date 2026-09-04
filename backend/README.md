# 岛城遗嘱库 · Backend API

NestJS + Prisma + PostgreSQL，对齐 H5 / 管理后台前端。

## 快速开始

```bash
# 需要本机 Docker 可用
docker compose up -d postgres

npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev
```

- 服务地址：http://127.0.0.1:3000  
- 健康检查：http://127.0.0.1:3000/api/health  
- 环境变量：复制 `.env.example` 为 `.env`

## 开发账号

| 端 | 账号 | 密码 |
|----|------|------|
| 后台 | `admin01` / `reviewer01` / `agent01` | `ChangeMe123!` |
| H5 | `13800000001` | `ChangeMe123!` |
| 短信验证码（开发） | — | `888888` |

## 文档

详见 [`../docs/backend/`](../docs/backend/README.md)。
