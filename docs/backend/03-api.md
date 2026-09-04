# 03 · REST API 契约

统一响应：

```json
{ "code": 0, "msg": "ok", "data": {} }
```

认证：`Authorization: Bearer <token>`  
公开接口：`/api/health`、`/api/auth/*`（除 `/me`）

---

## Auth

| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/auth/sms/send` | 发送验证码 `{ mobile, purpose? }` |
| POST | `/api/auth/login` | H5 登录 `{ mobile, password? , code?, role? }` |
| POST | `/api/auth/register` | 注册 |
| POST | `/api/auth/admin/login` | 后台登录 `{ account, password }` |
| GET | `/api/auth/me` | 当前用户 |

`role=2`（管理员）时返回 admin Token，便于 H5 入口跳转后台。

---

## 登记 Registrations

| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/registrations` | 用户提交登记 |
| GET | `/api/admin/registrations?status=` | 列表（`待审核` 聚合） |
| GET | `/api/admin/registrations/:id` | 详情 |
| POST | `/api/admin/registrations/:id/approve` | 通过 → 已受理 + certNo + hash + 短信 |
| POST | `/api/admin/registrations/:id/supplement` | 退回补充 |
| POST | `/api/admin/registrations/:id/reject` | 驳回终止 |

---

## 业务单 Businesses（H5 六宫格）

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/businesses?code=&status=` | 我的业务列表 |
| POST | `/api/businesses` | 创建 |
| POST | `/api/businesses/:orderCode/cancel` | 作废 → `11` |
| POST | `/api/admin/businesses/:orderCode/advance` | `00→01→02` |

---

## 见证 Witnessings

| Method | Path | 说明 |
|--------|------|------|
| POST | `/api/witnessings` | 提交见证 |
| GET | `/api/admin/witnessings?status=` | 列表 |
| POST | `/api/admin/witnessings/:id/approve` | 通过 → 待排期 |
| POST | `/api/admin/witnessings/:id/reject` | 驳回 |
| POST | `/api/admin/witnessings/:id/schedule` | 排期 + 短信 |
| PATCH | `/api/admin/witnessings/:id/agent` | 分配业务员 |
| POST | `/api/admin/witnessings/:id/complete` | 完成 + ceremonyHash |

---

## 纠纷 / 保管 / 加盟

| Method | Path |
|--------|------|
| GET | `/api/admin/disputes` |
| POST | `/api/disputes` |
| POST | `/api/admin/disputes/:id/advance` |
| PATCH | `/api/admin/disputes/:id/owner` |
| GET | `/api/admin/custody` |
| POST | `/api/admin/custody/:willId/inspect` |
| POST | `/api/admin/custody/:willId/mark-bad` |
| POST | `/api/admin/custody/:willId/mark-ok` |
| GET | `/api/admin/franchises` |
| POST | `/api/franchises` |
| POST | `/api/admin/franchises/:id/approve` |
| POST | `/api/admin/franchises/:id/reject` |
| GET | `/api/franchisees/:code/employees` |

---

## 运营横切

| Method | Path |
|--------|------|
| GET | `/api/admin/sms` |
| POST | `/api/admin/sms/:id/resend` |
| GET | `/api/admin/audits` |
| GET | `/api/admin/users` |
| GET | `/api/admin/dashboard` |
| GET | `/api/admin/stats` |
| GET | `/api/health` |

---

## 与页面对照

| 前端页面 | 主要 API |
|----------|----------|
| H5 登录/注册 | `/api/auth/*` |
| H5 业务申请/列表 | `/api/businesses*` |
| 后台总览 | `/api/admin/dashboard` |
| 登记审核 | `/api/admin/registrations*` |
| 见证管理 / 工作台 | `/api/admin/witnessings*` |
| 纠纷管理 | `/api/admin/disputes*` |
| 保管巡检 | `/api/admin/custody*` |
| 加盟审核 | `/api/admin/franchises*` |
| 短信记录 | `/api/admin/sms*` |
| 审计日志 | `/api/admin/audits` |
| 用户权限 | `/api/admin/users` |
| 大屏 KPI | `/api/admin/dashboard` + 各列表聚合（后续可拆 `/screen/geo`） |
