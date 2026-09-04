# 2026.09.04 前后端联调（后台登录 / 总览 / 登记审核 / H5）

> **文档性质**：联调过程记录 · 接口对接 · 验收要点  
> **日期**：2026-09-04  
> **依据**：`docs/backend/05-frontend-integration.md`

---

## 1. 目标与范围

将前端从纯 `localStorage` 切换为 **API 优先 + 本地回退**：

| 优先级 | 模块 | 状态 |
|--------|------|------|
| 1 | 后台登录 | 已完成 |
| 2 | 总览 Dashboard | 已完成 |
| 3 | 登记审核三动作 | 已完成 |
| 4 | H5 登录 / 注册 / 业务列表 | 已完成 |

---

## 2. 代码变更摘要

### 新增

| 路径 | 说明 |
|------|------|
| `src/api/http.js` | fetch 封装、Token、错误类型 |
| `src/api/auth.js` | 短信 / H5 登录注册 / 后台登录 |
| `src/api/admin.js` | 看板、登记审核、业务单 |
| `src/views/admin/AdminLogin.vue` | 后台登录页 |
| `.env` / `.env.example` | `VITE_API_BASE` |
| 本文档 | 联调记录 |

### 修改

| 路径 | 说明 |
|------|------|
| `src/router/index.js` | `/admin/login`、后台路由守卫 |
| `src/views/Portal.vue` | 管理端入口指向登录页 |
| `src/views/admin/AdminShell.vue` | 退出登录清 Token |
| `src/views/admin/Dashboard.vue` | 拉取 `/api/admin/dashboard` |
| `src/views/admin/Review.vue` | 列表 + 通过/退回/驳回 API |
| `src/views/h5/Login.vue` | 对接登录 / 短信 |
| `src/views/h5/Register.vue` | 对接注册 / 短信 |
| `src/views/h5/BusinessList.vue` | 拉取业务列表 / 取消 |
| `src/store.js` | `applyRegistrations` 等同步助手 |
| `vite.config.js` | `/api` 代理到 `3000` |

---

## 3. 联调步骤（验收）

### 前置

```bash
# 终端 1
cd backend
docker compose up -d postgres
npm run start:dev

# 终端 2
cd will-demo
npm run dev
```

### 后台

1. 打开 http://127.0.0.1:5173/#/admin/login  
2. 账号 `admin01` / 密码 `ChangeMe123!`  
3. 进入总览：指标来自服务端；失败时黄条提示本地缓存  
4. 进入登记审核：对「待审」单点击通过 → 刷新后状态为已受理并有证明编号  

### H5

1. http://127.0.0.1:5173/#/h5/login  
2. 手机号 `13800000001` / 密码 `ChangeMe123!`（或验证码 `888888`）  
3. 进入个人中心 → 在办/已办业务列表，数据优先来自 `/api/businesses`  

---

## 4. Token 约定

| Key | 用途 |
|-----|------|
| `will-demo-admin-token` | 后台 Bearer |
| `will-demo-user-token` | H5 Bearer |

未携带后台 Token 访问 `/admin/*` 会重定向登录页。

---

## 5. 兼容策略

- API 成功：覆盖 `store` 对应列表并 `persist`  
- API 失败：保留本地 seed/缓存，页面提示「后端暂不可用」；写操作回退本地  

---

## 6. 后续

- 见证管理 / 工作台 / 纠纷 / 保管 / 加盟 / 短信 / 审计全面联调  
- 去掉离线回退（第二阶段）  
- OpenAPI / 前端类型生成  

**状态**：Phase B1 核心路径完成（登录 → 总览 → 登记审核 → H5）
