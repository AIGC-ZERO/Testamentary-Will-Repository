# 05 · 前后端联调说明

## 1. 目标

将现有 Vue 前端从 `localStorage`（`will-demo-state-v5`）平滑切换为调用 `backend` API，同时保持页面交互不变。

## 2. 建议适配方式

在 `src/` 增加：

```text
src/api/
  http.js          # fetch 封装 + Bearer Token
  auth.js
  registrations.js
  businesses.js
  ...
src/store.js       # 保留响应式结构；读写改为 API + 本地缓存兜底
```

环境变量（Vite）：

```env
VITE_API_BASE=http://127.0.0.1:3000
```

## 3. Token 存放

| 端 | Key | 来源 |
|----|-----|------|
| H5 | `will-demo-user-token` | `/api/auth/login` / `register` |
| 后台 | `will-demo-admin-token` | `/api/auth/admin/login` |

## 4. 联调优先级

1. ~~健康检查与后台登录~~ ✅（2026-09-04）  
2. ~~总览 dashboard~~ ✅  
3. ~~登记审核三动作~~ ✅  
4. ~~H5 登录 + 业务列表~~ ✅  
5. 见证排期 / 完成  
6. 其余模块  

过程记录见 [06-integration-log-2026-09-04.md](./06-integration-log-2026-09-04.md)。

## 5. 兼容策略

- 第一阶段：API 优先，失败回退 localStorage（便于展会离线）  
- 第二阶段：去掉回退，强制在线  

## 6. 字段对齐注意

- 前端 `hash` ↔ 后端 `contentHash`（API 已映射为 `hash`）  
- 前端 `schedule` ↔ 后端 `scheduleAt`（API 已映射为 `schedule`）  
- `businesses.id` 前端为 number，后端返回 `bizId` 数字或 cuid  

## 7. 快速验通（curl）

```bash
curl http://127.0.0.1:3000/api/health

curl -X POST http://127.0.0.1:3000/api/auth/admin/login ^
  -H "Content-Type: application/json" ^
  -d "{\"account\":\"admin01\",\"password\":\"ChangeMe123!\"}"
```
