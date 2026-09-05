import { ConflictException } from '@nestjs/common';

/**
 * 服务端状态机强制：所有状态流转必须先校验「当前状态是否允许执行该操作」，
 * 防止跳步攻击（如已受理的登记被再次通过/驳回，或终态案件被推进）。
 * 非法流转一律返回 409 Conflict，不泄露除当前状态外的信息。
 */

export interface TransitionContext {
  /** 业务对象名称，用于报错文案，如「登记」 */
  label: string;
  /** 业务编号 */
  id: string;
  /** 要执行的动作名称，如「受理」 */
  action: string;
}

export function assertStatusIn(
  current: string,
  allowedFrom: readonly string[],
  ctx: TransitionContext,
): void {
  if (!allowedFrom.includes(current)) {
    throw new ConflictException(
      `${ctx.label} ${ctx.id} 当前状态为「${current}」，不允许执行「${ctx.action}」操作`,
    );
  }
}

/** 遗嘱登记：草稿/审核中可审；已受理、驳回终止为终态 */
export const REGISTRATION_RULES = {
  approve: ['已提交', '审核中', '退回补充'],
  supplement: ['已提交', '审核中'],
  reject: ['已提交', '审核中', '退回补充'],
} as const;

/** 遗嘱见证：待审核 → 待排期 → 已完成；已驳回为终态 */
export const WITNESS_RULES = {
  approve: ['待审核'],
  reject: ['待审核'],
  schedule: ['待排期'],
  assignAgent: ['待审核', '待排期'],
  complete: ['待排期'],
} as const;

/** 纠纷：调解中 → 取证中 → 诉讼中 → 已结案（线性，不可回退、不可越级） */
export const DISPUTE_FLOW = ['调解中', '取证中', '诉讼中', '已结案'] as const;

export function nextDisputeStage(current: string, id: string): string {
  const idx = (DISPUTE_FLOW as readonly string[]).indexOf(current);
  if (idx < 0) {
    throw new ConflictException(`纠纷 ${id} 当前阶段「${current}」非法，无法推进`);
  }
  if (idx === DISPUTE_FLOW.length - 1) {
    throw new ConflictException(`纠纷 ${id} 已结案，不能继续推进`);
  }
  return DISPUTE_FLOW[idx + 1];
}

/** 加盟：仅「待审核」可入库/驳回 */
export const FRANCHISE_RULES = {
  approve: ['待审核'],
  reject: ['待审核'],
} as const;

/** 业务单：00待审 → 01办理中 → 02完成；10驳回/11作废为终态 */
export const BUSINESS_RULES = {
  advance: ['00', '01'],
  cancel: ['00', '01'],
} as const;

export function nextBusinessStatus(current: string, orderCode: string): string {
  if (current === '00') return '01';
  if (current === '01') return '02';
  throw new ConflictException(`业务单 ${orderCode} 当前状态为「${current}」，不能继续推进`);
}
