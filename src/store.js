import { reactive } from 'vue'
import { createSeedData } from './seed'

export const BRAND = {
  name: '岛城遗嘱库',
  platform: '青岛岛城',
  welcomeFull: '欢迎登录青岛岛城遗嘱库',
  welcomeShort: '欢迎登录岛城遗嘱库',
  platformTitle: '岛城遗嘱库平台',
  serviceName: '岛城遗嘱库综合服务平台',
}

const STORAGE_KEY = 'will-demo-state-v5'
const seed = createSeedData()

const saved = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
})()

function pickList(savedList, seedList) {
  return savedList?.length ? savedList : seedList
}

export const store = reactive({
  toast: '',
  loggedIn: saved?.loggedIn ?? false,
  chatOpen: false,
  chatContext: '首页',
  chatMessages: [
    { from: 'bot', text: `您好，我是${BRAND.name}在线客服。可为您解答见证、执行、保管等业务问题。` },
  ],
  user: saved?.user || {
    name: '田野',
    mobile: '19526955095',
    password: '******',
    gender: '0',
    idNo: '370705199810173531',
    marriage: '已婚',
    address: '青岛市市南区',
    hometown: '山东青岛',
    registerAddr: '',
    registerAt: '2026-09-03 21:18:39',
    face: false,
    fingerprint: false,
    idProof: true,
    realNamed: true,
  },
  emergencyStatus: saved?.emergencyStatus ?? null, // 00已启动 01已执行 11已取消
  servicePhone: saved?.servicePhone || '15092079620',
  partyB: {
    name: '青岛岛城',
    address: '延安三路8号汇丽大厦',
    phone: '15092079620',
  },
  draft: {
    emergency: { uploaded: false, note: '' },
    register: {
      type: '自书遗嘱',
      date: '',
      heirs: '',
      summary: '',
      uploaded: false,
      agree: false,
    },
    witness: {
      services: ['见证'],
      witnessSource: '平台推荐',
      witnessName: '赵律师',
      executor: '',
      supervisor: '',
      manager: '',
      custody: false,
      properties: [{ type: '不动产', desc: '', proof: false }],
      agree: false,
      paid: false,
    },
    template: {
      willType: '打印遗嘱',
      answers: {},
      draftText: '',
    },
  },
  providers: saved?.providers || [
    { kind: '个人', name: '赵律师', phone: '13912342210', org: '山东德和律所' },
  ],
  businesses: pickList(saved?.businesses, seed.businesses),
  agreements: saved?.agreements || [],
  orders: saved?.orders || [
    { id: 'ORD20260903001', title: '遗嘱见证服务费', amount: 3000, status: '待支付', at: '2026-09-03 10:20' },
    { id: 'ORD20260902007', title: '遗嘱见证服务费', amount: 3000, status: '已支付', at: '2026-09-02 14:35' },
    { id: 'ORD20260828003', title: '遗嘱保管服务费', amount: 1800, status: '已支付', at: '2026-08-28 09:20' },
  ],
  adminUser: saved?.adminUser || { name: '李审核', role: '审核员' },
  adminUsers: pickList(saved?.adminUsers, seed.adminUsers),
  registrations: pickList(saved?.registrations, seed.registrations),
  witnessings: pickList(saved?.witnessings, seed.witnessings),
  disputes: pickList(saved?.disputes, seed.disputes),
  custody: pickList(saved?.custody, seed.custody),
  franchises: pickList(saved?.franchises, seed.franchises),
  sms: pickList(saved?.sms, seed.sms),
  audits: pickList(saved?.audits, seed.audits),
})

export function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    loggedIn: store.loggedIn,
    user: store.user,
    emergencyStatus: store.emergencyStatus,
    servicePhone: store.servicePhone,
    providers: store.providers,
    businesses: store.businesses,
    agreements: store.agreements,
    orders: store.orders,
    adminUser: store.adminUser,
    adminUsers: store.adminUsers,
    registrations: store.registrations,
    witnessings: store.witnessings,
    disputes: store.disputes,
    custody: store.custody,
    franchises: store.franchises,
    sms: store.sms,
    audits: store.audits,
  }))
}

export function toast(msg) {
  store.toast = msg
  clearTimeout(toast._t)
  toast._t = setTimeout(() => { store.toast = '' }, 2200)
}

export function now() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

export function pushAudit(who, action) {
  store.audits.unshift({ at: now(), who, action })
  persist()
}

/** 实站 businessCode：0见证 1执行 2监管 3管理 4纠纷 5保管 */
export const BUSINESS_MAP = {
  '0': { name: '遗嘱见证', role: '见证', icon: '📜', agreementPath: '/h5/witness-agreement' },
  '1': { name: '遗嘱执行', role: '执行', icon: '⚖️', agreementPath: '/h5/execute-agreement' },
  '2': { name: '遗嘱监管', role: '监管', icon: '👁️', agreementPath: '/h5/supervise-agreement' },
  '3': { name: '遗产管理', role: '管理', icon: '💰', agreementPath: '/h5/manage-agreement' },
  '4': { name: '遗嘱纠纷', role: '调解', icon: '⚔️', agreementPath: '/h5/dispute-agreement' },
  '5': { name: '遗嘱保管', role: '保管', icon: '🔒', agreementPath: '/h5/custody-agreement' },
}

export const SERVICES = [
  { code: '0', ...BUSINESS_MAP['0'] },
  { code: '1', ...BUSINESS_MAP['1'] },
  { code: '2', ...BUSINESS_MAP['2'] },
  { code: '3', ...BUSINESS_MAP['3'] },
  { code: '4', ...BUSINESS_MAP['4'] },
  { code: '5', ...BUSINESS_MAP['5'] },
]

export const ROLE_LABELS = {
  '0': '见证人', '1': '执行人', '2': '监管人', '3': '管理人', '4': '调解人', '5': '保管人',
}

export const MOCK_FRANCHISEES = [
  { name: '赵律师', type: '0', joinDate: '2024-06-12', identificationCode: 'FR20240612001' },
  { name: '青岛安和律师事务所', type: '1', joinDate: '2023-11-08', identificationCode: 'FR20231108002' },
  { name: '胶州公正服务社', type: '2', joinDate: '2025-02-20', identificationCode: 'FR20250220003' },
  { name: '李明', type: '0', joinDate: '2025-08-01', identificationCode: 'FR20250801004' },
]

export const MOCK_EMPLOYEES = {
  FR20240612001: [
    { name: '赵律师', gender: '男', registrationTime: '2024-06-12', phoneNumber: '13912342210', partnerCode: 'FR20240612001' },
    { name: '钱助理', gender: '女', registrationTime: '2024-08-01', phoneNumber: '13700001111', partnerCode: 'FR20240612001' },
  ],
  FR20231108002: [
    { name: '孙主任', gender: '男', registrationTime: '2023-11-08', phoneNumber: '053288886666', partnerCode: 'FR20231108002' },
  ],
}

export const FILE_NOTICES = {
  '0': { fileType: '遗嘱见证委托协议', title: '遗嘱见证' },
  '1': { fileType: '遗嘱执行协议', title: '遗嘱执行' },
  '2': { fileType: '遗嘱执行监管委托协议', title: '遗嘱监管' },
  '3': { fileType: '财产（遗产）保管协议', title: '遗产管理' },
  '4': { fileType: '民事案件委托代理合同', title: '遗嘱纠纷' },
  '5': { fileType: '财产（遗产）保管协议', title: '遗嘱保管' },
}

export const MATTERS = [
  '遗产（资产）调查（另附清单）',
  '指定的特定关系人身份、身体状况调查',
  '代书及代书遗嘱见证',
  '自书遗嘱见证',
  '复制证据及档案材料',
]

export const TEMPLATE_QUESTIONS = [
  { key: 'heirs', label: '指定继承人', placeholder: '如：配偶张某、子女李某' },
  { key: 'estate', label: '主要遗产范围', placeholder: '不动产、存款、股权等' },
  { key: 'exclude', label: '排除继承人说明', placeholder: '无则可不填' },
  { key: 'special', label: '特殊安排', placeholder: '如：保管期限、执行条件等' },
]

export const MENU_ITEMS = [
  { text: '在办(申请)业务', iconClass: 'icon-processing', route: 'doing' },
  { text: '已办业务', iconClass: 'icon-completed', route: 'done' },
  { text: '我的订单', iconClass: 'icon-order', route: 'orders' },
  { text: '修改遗嘱记录', iconClass: 'icon-edit', route: 'emergency' },
  { text: '个人信息', iconClass: 'icon-user', route: 'profile' },
  { text: '紧急修改遗嘱记录', iconClass: 'icon-emergency', route: 'emergency-records' },
  { text: '聊天消息', iconClass: 'icon-chat', route: 'chat' },
  { text: '电子票夹', iconClass: 'icon-ticket', route: 'tickets' },
  { text: 'AI帮助', iconClass: 'icon-help', route: 'ai' },
  { text: '我的见证人等', iconClass: 'icon-witness', route: 'providers' },
  { text: '我的协议', iconClass: 'icon-agreement', route: 'agreements' },
]

export function createBusiness(code, payload) {
  const orderCode = 'ORD' + Date.now().toString().slice(-10)
  const biz = {
    id: Date.now(),
    orderCode,
    businessCode: code,
    businessModel: payload.businessModel ?? '0',
    businessStatus: '00',
    lawName: payload.lawName || '',
    phoneNumber: payload.phoneNumber || '',
    companyName: payload.companyName || '',
    partnerCode: payload.partnerCode || '',
    registrationTime: now(),
    paidFees: payload.paidFees || '',
    paidFeesTime: '',
    note: payload.note || '',
  }
  store.businesses.unshift(biz)
  persist()
  return orderCode
}
