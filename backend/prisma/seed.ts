import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);

  await prisma.adminUser.createMany({
    data: [
      { account: 'reviewer01', name: '李审核', role: '审核员', passwordHash, active: true, lastLoginAt: new Date('2026-09-03T08:50:00') },
      { account: 'agent01', name: '周业务', role: '业务员', passwordHash, active: true, lastLoginAt: new Date('2026-09-03T09:05:00') },
      { account: 'admin01', name: '王管理', role: '管理员', passwordHash, active: true, lastLoginAt: new Date('2026-09-02T17:20:00') },
      { account: 'cs01', name: '孙客服', role: '客服', passwordHash, active: false, lastLoginAt: new Date('2026-08-20T11:00:00') },
      { account: 'manager01', name: '林倩', role: '管理人', passwordHash, active: true, lastLoginAt: new Date('2026-08-30T21:00:00') },
    ],
    skipDuplicates: true,
  });

  const userTian = await prisma.user.upsert({
    where: { mobile: '13800000001' },
    update: {},
    create: {
      mobile: '13800000001',
      passwordHash,
      name: '田野',
      gender: '0',
      idNo: '370***********3531',
      marriage: '已婚',
      address: '青岛市市南区',
      hometown: '山东青岛',
      realNamed: true,
      idProof: true,
      identityType: '0',
    },
  });

  await prisma.user.upsert({
    where: { mobile: '13800000002' },
    update: {},
    create: {
      mobile: '13800000002',
      passwordHash,
      name: '王秀兰',
      gender: '1',
      realNamed: true,
      identityType: '0',
    },
  });

  await prisma.registration.createMany({
    data: [
      { id: 'RG20260703012', userId: userTian.id, applicant: '王秀兰', type: '自书遗嘱', createdAt: new Date('2026-07-03T10:22:00'), status: '已受理', certNo: 'QD-WILL-20260703-012', contentHash: 'a3f28c1d' },
      { id: 'RG20260812008', applicant: '陈建国', type: '打印遗嘱', createdAt: new Date('2026-08-12T15:40:00'), status: '审核中' },
      { id: 'RG20260825005', applicant: '刘芳', type: '自书遗嘱', createdAt: new Date('2026-08-25T09:18:00'), status: '退回补充' },
      { id: 'RG20260901003', applicant: '张明远', type: '录音遗嘱', createdAt: new Date('2026-09-01T11:05:00'), status: '已提交' },
      { id: 'RG20260902015', userId: userTian.id, applicant: '田野', type: '自书遗嘱', createdAt: new Date('2026-09-02T16:50:00'), status: '审核中' },
      { id: 'RG20260818021', applicant: '赵丽', type: '打印遗嘱', createdAt: new Date('2026-08-18T08:30:00'), status: '驳回终止' },
    ],
    skipDuplicates: true,
  });

  await prisma.witnessing.createMany({
    data: [
      { id: 'WS20260902007', userId: userTian.id, applicant: '田野', services: ['见证', '保管'], status: '待排期', fee: 6800, paid: true, agent: '周业务', scheduleAt: '2026-09-05 10:00' },
      { id: 'WS20260830004', applicant: '陈建国', services: ['见证'], status: '待审核', fee: 3000, paid: true },
      { id: 'WS20260815011', applicant: '王秀兰', services: ['见证', '执行'], status: '已完成', fee: 8500, paid: true, agent: '周业务', scheduleAt: '2026-08-20 14:00', ceremonyHash: 'c7b42e9a' },
      { id: 'WS20260722009', applicant: '刘芳', services: ['见证'], status: '已完成', fee: 3000, paid: true, agent: '周业务', scheduleAt: '2026-07-25 09:30', ceremonyHash: 'd1a84f3c' },
    ],
    skipDuplicates: true,
  });

  await prisma.businessOrder.createMany({
    data: [
      { bizId: 2026090207001n, orderCode: 'ORD20260902007', userId: userTian.id, businessCode: '0', businessModel: '0', businessStatus: '00', applicantName: '田野', lawName: '赵律师', phoneNumber: '13912342210', companyName: '山东德和律所', partnerCode: 'FR20240612001', paidFees: '3000', paidFeesTime: '2026-09-02 14:35:02', note: '自书遗嘱见证' },
      { bizId: 2026082803002n, orderCode: 'ORD20260828003', userId: userTian.id, businessCode: '5', businessModel: '0', businessStatus: '01', applicantName: '田野', lawName: '孙主任', phoneNumber: '053288886666', companyName: '青岛安和律师事务所', partnerCode: 'FR20231108002', paidFees: '1800', paidFeesTime: '2026-08-28 09:20:11', note: '遗嘱保管服务' },
      { bizId: 2026081501103n, orderCode: 'ORD20260815011', businessCode: '1', businessModel: '0', businessStatus: '01', applicantName: '王秀兰', lawName: '赵律师', phoneNumber: '13912342210', companyName: '山东德和律所', partnerCode: 'FR20240612001', paidFees: '5000', paidFeesTime: '2026-08-15 10:25:00', note: '遗嘱执行' },
      { bizId: 2026072200904n, orderCode: 'ORD20260722009', businessCode: '2', businessModel: '1', businessStatus: '02', applicantName: '刘芳', lawName: '钱助理', phoneNumber: '13700001111', companyName: '山东德和律所', partnerCode: 'FR20240612001', paidFees: '2200', paidFeesTime: '2026-07-22 16:10:00', note: '遗嘱监管' },
      { bizId: 2026090100505n, orderCode: 'ORD20260901005', businessCode: '3', businessModel: '0', businessStatus: '00', applicantName: '陈建国', lawName: '孙主任', phoneNumber: '053288886666', companyName: '青岛安和律师事务所', partnerCode: 'FR20231108002', note: '遗产管理申请' },
      { bizId: 2026081000206n, orderCode: 'ORD20260810002', businessCode: '4', businessModel: '0', businessStatus: '01', applicantName: '林倩', lawName: '赵律师', phoneNumber: '13912342210', companyName: '山东德和律所', partnerCode: 'FR20240612001', paidFees: '8000', paidFeesTime: '2026-08-10 13:20:00', note: '遗嘱纠纷调解' },
    ],
    skipDuplicates: true,
  });

  await prisma.dispute.createMany({
    data: [
      { id: 'DP20260810002', title: '遗产分配争议调解', applicant: '林倩', owner: '王管理', stage: '调解中', updatedAt: new Date('2026-08-10T14:20:00') },
      { id: 'DP20260705006', title: '遗嘱效力异议', applicant: '赵丽', owner: '王管理', stage: '取证中', updatedAt: new Date('2026-07-08T11:00:00') },
      { id: 'DP20260618003', title: '遗嘱执行阻碍纠纷', applicant: '刘芳', owner: '李审核', stage: '诉讼中', updatedAt: new Date('2026-08-22T09:40:00') },
      { id: 'DP20260520001', title: '继承人身份确认', applicant: '陈建国', owner: '李审核', stage: '已结案', updatedAt: new Date('2026-06-15T16:45:00') },
    ],
    skipDuplicates: true,
  });

  await prisma.custodyRecord.createMany({
    data: [
      { willId: 'WL20260703012', holder: '王秀兰', since: '2026-07-05', lastCheck: '2026-09-01', ok: true, location: '市南保管库 A-12' },
      { willId: 'WL20260828003', holder: '田野', since: '2026-08-29', lastCheck: '2026-09-02', ok: true, location: '市南保管库 B-08' },
      { willId: 'WL20260815011', holder: '王秀兰', since: '2026-08-22', lastCheck: '2026-08-28', ok: false, location: '市南保管库 A-15' },
      { willId: 'WL20260722009', holder: '刘芳', since: '2026-07-26', lastCheck: '2026-09-03', ok: true, location: '黄岛保管库 C-03' },
    ],
    skipDuplicates: true,
  });

  await prisma.franchise.createMany({
    data: [
      { id: 'FR20260901001', name: '胶州公正服务社', region: '胶州市', contact: '0532-8722****', status: '待审核', type: '2' },
      { id: 'FR20260820002', name: '城阳法务咨询中心', region: '城阳区', contact: '137****8899', status: '待审核', type: '2' },
      { id: 'FR20240612001', name: '山东德和律所（赵律师团队）', region: '市南区', contact: '13912342210', status: '已入库', type: '1' },
      { id: 'FR20231108002', name: '青岛安和律师事务所', region: '市北区', contact: '053288886666', status: '已入库', type: '1' },
      { id: 'FR20250715003', name: '即墨遗产服务中心', region: '即墨区', contact: '186****5566', status: '已驳回', type: '2' },
    ],
    skipDuplicates: true,
  });

  await prisma.franchiseEmployee.createMany({
    data: [
      { franchiseId: 'FR20240612001', name: '赵律师', gender: '男', phoneNumber: '13912342210', registrationTime: '2024-06-12' },
      { franchiseId: 'FR20240612001', name: '钱助理', gender: '女', phoneNumber: '13700001111', registrationTime: '2024-08-01' },
      { franchiseId: 'FR20231108002', name: '孙主任', gender: '男', phoneNumber: '053288886666', registrationTime: '2023-11-08' },
    ],
  });

  await prisma.order.createMany({
    data: [
      { id: 'ORD20260903001', userId: userTian.id, title: '遗嘱见证服务费', amount: 3000, status: '待支付', createdAt: new Date('2026-09-03T10:20:00') },
      { id: 'ORD20260902007', userId: userTian.id, title: '遗嘱见证服务费', amount: 3000, status: '已支付', createdAt: new Date('2026-09-02T14:35:00') },
      { id: 'ORD20260828003', userId: userTian.id, title: '遗嘱保管服务费', amount: 1800, status: '已支付', createdAt: new Date('2026-08-28T09:20:00') },
    ],
    skipDuplicates: true,
  });

  await prisma.smsLog.createMany({
    data: [
      { toName: '田野', template: '见证排期通知', content: '您的见证业务 WS20260902007 已排期至 2026-09-05 10:00，请准时到场。', status: '成功', createdAt: new Date('2026-09-03T09:12:33') },
      { toName: '陈建国', template: '补件通知', content: '请补充手持证件清晰照片后重新提交登记申请。', status: '成功', createdAt: new Date('2026-09-02T17:45:08') },
      { toName: '王秀兰', template: '登记受理通知', content: '您的遗嘱登记已受理，证明编号 QD-WILL-20260703-012。', status: '成功', createdAt: new Date('2026-07-05T10:30:00') },
      { toName: '刘芳', template: '验证码', content: '验证码 ******，5分钟内有效，请勿泄露。', status: '成功', createdAt: new Date('2026-08-25T09:15:22') },
      { toMobile: '138****6721', template: '验证码', content: '验证码 ******，5分钟内有效，请勿泄露。', status: '失败', createdAt: new Date('2026-09-01T11:02:18') },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      { who: '周业务', action: '设置排期 WS20260902007 → 2026-09-05 10:00', createdAt: new Date('2026-09-03T09:12:33') },
      { who: '李审核', action: '退回补充 RG20260825005', createdAt: new Date('2026-09-02T17:45:08') },
      { who: '系统', action: '订单 ORD20260902007 支付成功 ¥3000', createdAt: new Date('2026-09-02T14:35:02') },
      { who: '王管理', action: '保管标记异常 WL20260815011', createdAt: new Date('2026-08-22T11:20:00') },
      { who: '周业务', action: '标记完成 WS20260815011，ceremonyHash c7b42e9a', createdAt: new Date('2026-08-20T15:30:00') },
    ],
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
