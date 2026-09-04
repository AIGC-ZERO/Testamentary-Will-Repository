# 02 · 数据库设计

## 1. ER 概览

```text
users ─┬─< registrations
       ├─< witnessings
       ├─< business_orders
       ├─< disputes
       ├─< orders
       ├─< agreements
       └─< providers

admin_users（独立后台账号体系）

franchises ─< franchise_employees
custody_records（按 will_id）
sms_logs / sms_codes / audit_logs（横切）
```

## 2. 核心表说明

### users
H5 申请人。敏感字段：`password_hash`、`id_no`（建议生产列加密/tokenization）。

### admin_users
后台角色：`审核员` / `业务员` / `管理员` / `客服` / `管理人`。

### registrations（遗嘱登记）
状态机：

```text
已提交 / 审核中 → 已受理
                → 退回补充 →（补件后回到审核中）
                → 驳回终止
```

受理后写入 `cert_no`（`QD-WILL-YYYYMMDD-xxx`）与 `content_hash`。

### witnessings（见证）
状态机：

```text
待审核 → 待排期 → 已完成
      ↘ 已驳回
```

### business_orders（H5 六宫格业务）
- `business_code`：`0`见证 `1`执行 `2`监管 `3`管理 `4`纠纷 `5`保管
- `business_status`：`00`待审 `01`办理中 `02`完成 `10`驳回 `11`作废

### disputes
阶段：`调解中` → `取证中` → `诉讼中` → `已结案`

### custody_records
保管台账；`ok=false` 表示异常，对应后台巡检与大屏点位。

### franchises
`待审核` / `已入库` / `已驳回`

## 3. 编号前缀约定

| 前缀 | 实体 |
|------|------|
| RG | 登记 |
| WS | 见证 |
| DP | 纠纷 |
| FR | 加盟 |
| WL | 保管关联遗嘱 ID |
| ORD | 订单 / 业务单号 |
| AG | 协议 |
| QD-WILL- | 登记证明编号 |

## 4. 种子账号（仅开发）

| 类型 | 账号 | 初始密码 |
|------|------|----------|
| 后台审核员 | `reviewer01` | `ChangeMe123!` |
| 后台业务员 | `agent01` | `ChangeMe123!` |
| 后台管理员 | `admin01` | `ChangeMe123!` |
| H5 用户 | `13800000001`（田野） | `ChangeMe123!` |

短信开发验证码：环境变量 `SMS_DEV_CODE`（默认 `888888`）。

> 生产环境必须轮换密码、关闭固定验证码、接入真实短信与 MFA。

## 5. 迁移命令

```bash
npx prisma migrate dev --name <change>
npx prisma studio   # 可视化检视
```
