import { ConflictException } from '@nestjs/common';
import {
  assertStatusIn,
  BUSINESS_RULES,
  DISPUTE_FLOW,
  FRANCHISE_RULES,
  nextBusinessStatus,
  nextDisputeStage,
  REGISTRATION_RULES,
  WITNESS_RULES,
} from './state-machine';

const ctx = { label: '登记', id: 'RG001', action: '受理' };

describe('assertStatusIn', () => {
  it('当前状态在允许清单内时放行', () => {
    expect(() => assertStatusIn('审核中', REGISTRATION_RULES.approve, ctx)).not.toThrow();
  });

  it('当前状态不在允许清单内时抛 409', () => {
    expect(() => assertStatusIn('已受理', REGISTRATION_RULES.approve, ctx)).toThrow(ConflictException);
    try {
      assertStatusIn('已受理', REGISTRATION_RULES.approve, ctx);
    } catch (e) {
      expect((e as ConflictException).getStatus()).toBe(409);
      expect((e as ConflictException).message).toContain('已受理');
    }
  });
});

describe('登记状态机（跳步攻击防护）', () => {
  it('已受理/驳回终止为终态，三动作全部拒绝', () => {
    for (const terminal of ['已受理', '驳回终止']) {
      expect(() => assertStatusIn(terminal, REGISTRATION_RULES.approve, ctx)).toThrow(ConflictException);
      expect(() => assertStatusIn(terminal, REGISTRATION_RULES.supplement, ctx)).toThrow(ConflictException);
      expect(() => assertStatusIn(terminal, REGISTRATION_RULES.reject, ctx)).toThrow(ConflictException);
    }
  });

  it('退回补充后不允许再次退回补充', () => {
    expect(() => assertStatusIn('退回补充', REGISTRATION_RULES.supplement, ctx)).toThrow(ConflictException);
  });

  it('审核中允许受理 / 退回补充 / 驳回', () => {
    expect(() => assertStatusIn('审核中', REGISTRATION_RULES.approve, ctx)).not.toThrow();
    expect(() => assertStatusIn('审核中', REGISTRATION_RULES.supplement, ctx)).not.toThrow();
    expect(() => assertStatusIn('审核中', REGISTRATION_RULES.reject, ctx)).not.toThrow();
  });
});

describe('见证状态机', () => {
  it('仅待审核可通过/驳回', () => {
    expect(() => assertStatusIn('待审核', WITNESS_RULES.approve, ctx)).not.toThrow();
    expect(() => assertStatusIn('待排期', WITNESS_RULES.approve, ctx)).toThrow(ConflictException);
    expect(() => assertStatusIn('已完成', WITNESS_RULES.reject, ctx)).toThrow(ConflictException);
  });

  it('仅待排期可排期/完成', () => {
    expect(() => assertStatusIn('待审核', WITNESS_RULES.schedule, ctx)).toThrow(ConflictException);
    expect(() => assertStatusIn('待审核', WITNESS_RULES.complete, ctx)).toThrow(ConflictException);
    expect(() => assertStatusIn('待排期', WITNESS_RULES.schedule, ctx)).not.toThrow();
    expect(() => assertStatusIn('待排期', WITNESS_RULES.complete, ctx)).not.toThrow();
  });
});

describe('纠纷线性流转', () => {
  it('按 调解中→取证中→诉讼中→已结案 逐级推进', () => {
    expect(nextDisputeStage('调解中', 'DP1')).toBe('取证中');
    expect(nextDisputeStage('取证中', 'DP1')).toBe('诉讼中');
    expect(nextDisputeStage('诉讼中', 'DP1')).toBe('已结案');
  });

  it('已结案不能继续推进', () => {
    expect(() => nextDisputeStage('已结案', 'DP1')).toThrow(ConflictException);
  });

  it('未知阶段报错而非静默停留', () => {
    expect(() => nextDisputeStage('不存在的状态', 'DP1')).toThrow(ConflictException);
  });

  it('流转表与预期一致', () => {
    expect([...DISPUTE_FLOW]).toEqual(['调解中', '取证中', '诉讼中', '已结案']);
  });
});

describe('加盟状态机', () => {
  it('仅待审核可入库/驳回，终态拒绝', () => {
    expect(() => assertStatusIn('待审核', FRANCHISE_RULES.approve, ctx)).not.toThrow();
    expect(() => assertStatusIn('已入库', FRANCHISE_RULES.approve, ctx)).toThrow(ConflictException);
    expect(() => assertStatusIn('已驳回', FRANCHISE_RULES.reject, ctx)).toThrow(ConflictException);
  });
});

describe('业务单状态机', () => {
  it('00→01→02 逐级推进', () => {
    expect(nextBusinessStatus('00', 'ORD1')).toBe('01');
    expect(nextBusinessStatus('01', 'ORD1')).toBe('02');
  });

  it('完成/驳回/作废为终态', () => {
    for (const terminal of ['02', '10', '11']) {
      expect(() => nextBusinessStatus(terminal, 'ORD1')).toThrow(ConflictException);
    }
  });

  it('仅待审/办理中可作废', () => {
    expect(() => assertStatusIn('00', BUSINESS_RULES.cancel, ctx)).not.toThrow();
    expect(() => assertStatusIn('01', BUSINESS_RULES.cancel, ctx)).not.toThrow();
    expect(() => assertStatusIn('02', BUSINESS_RULES.cancel, ctx)).toThrow(ConflictException);
    expect(() => assertStatusIn('11', BUSINESS_RULES.cancel, ctx)).toThrow(ConflictException);
  });
});
