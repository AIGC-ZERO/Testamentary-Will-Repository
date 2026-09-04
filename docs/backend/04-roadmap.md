# 04 · 后端里程碑（对齐总开发计划）

依据：`2026.09.03遗嘱库项目分析与开发计划.md`  
前端现状：H5 + 后台 + 大屏页面已完成（Vue 本地态）。

## Phase B0 — 后端骨架（本次已完成）

- [x] NestJS + Prisma + PostgreSQL 工程
- [x] 核心表结构与种子数据（对齐前端 seed）
- [x] Auth / 登记 / 业务单 / 见证 / 纠纷 / 保管 / 加盟 / 短信 / 审计 / 看板 API
- [x] MD 文档体系

## Phase B1 — 与前端联调（下一步）

- [ ] 前端 `store` 增加 API 适配层，替换 localStorage 主读写
- [ ] 统一错误码与 Toast
- [ ] 后台登录页对接 `/api/auth/admin/login`
- [ ] H5 登录对接 `/api/auth/login`
- [ ] 登记审核页对接审批三接口

## Phase B2 — MVP 硬化（对标总计划 Phase 1）

- [ ] 对象存储预签名上传（材料 / 协议）
- [ ] 真实短信通道 + 限流
- [ ] 登记证明 PDF 生成
- [ ] 后台 MFA
- [ ] OpenAPI（Swagger）正式导出

## Phase B3 — 见证主链路（对标 Phase 2）

- [ ] 支付下单与回调
- [ ] 仪式会话 / 受邀链接
- [ ] 大文件分片与转码 Worker
- [ ] Party / Property 独立表完善

## Phase B4 — 扩展

- [ ] 紧急修改遗嘱
- [ ] 加盟商务规则与合同归档
- [ ] 大屏地理点位服务 `/api/admin/screen/geo`

## 合规提醒

对外话术保持：**形式审查 + 存证 + 流程服务**，不得宣称平台使遗嘱「有效」。
