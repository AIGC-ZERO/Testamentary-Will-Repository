# 数据库快照与恢复

本目录存放可导入的 PostgreSQL 数据快照，便于他人一键还原与当前开发库一致的演示数据。

| 文件 | 说明 |
|------|------|
| `will_repository_seed.sql` | 全库结构 + 数据（含迁移记录与种子业务数据） |

## 前置

```bash
cd backend
docker compose up -d postgres
```

连接串（与 `.env.example` 一致）：

```text
postgresql://will:will_dev_password@127.0.0.1:5432/will_repository
```

## 方式 A：导入 SQL 快照（含数据）

```bash
# Windows PowerShell（在 backend 目录）
Get-Content .\db\will_repository_seed.sql -Raw | docker exec -i will-demo-postgres psql -U will -d will_repository
```

或：

```bash
docker exec -i will-demo-postgres psql -U will -d will_repository < db/will_repository_seed.sql
```

## 方式 B：Prisma 迁移 + 种子（推荐日常开发）

```bash
npx prisma migrate deploy
npm run prisma:seed
```

## 更新快照

在本地库有变更并希望同步到仓库时：

```bash
docker exec will-demo-postgres pg_dump -U will -d will_repository --no-owner --no-acl --clean --if-exists > db/will_repository_seed.sql
```

然后提交 `db/will_repository_seed.sql`。

> 注意：快照仅用于开发/演示，勿写入生产密钥；账号口令见 `docs/backend/02-database.md`。
