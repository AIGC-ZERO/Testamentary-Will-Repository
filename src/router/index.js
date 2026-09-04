import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken } from '../api/http'

const routes = [
  { path: '/', name: 'portal', component: () => import('../views/Portal.vue') },
  {
    path: '/h5',
    component: () => import('../views/h5/H5Shell.vue'),
    children: [
      { path: '', name: 'h5-home', component: () => import('../views/h5/Home.vue') },
      { path: 'login', name: 'h5-login', component: () => import('../views/h5/Login.vue') },
      { path: 'register', name: 'h5-register', component: () => import('../views/h5/Register.vue') },
      { path: 'notification/:type', name: 'h5-notification', component: () => import('../views/h5/ReadNotification.vue') },
      { path: 'business-build/:type', name: 'h5-business-build', component: () => import('../views/h5/BusinessBuild.vue') },
      { path: 'business-list/:code', name: 'h5-business-list', component: () => import('../views/h5/BusinessList.vue') },
      { path: 'menu', name: 'h5-menu', component: () => import('../views/h5/MenuList.vue') },
      { path: 'profile', name: 'h5-profile', component: () => import('../views/h5/Profile.vue') },
      { path: 'orders', name: 'h5-orders', component: () => import('../views/h5/Orders.vue') },
      { path: 'emergency', name: 'h5-emergency', component: () => import('../views/h5/Emergency.vue') },
      { path: 'providers', name: 'h5-providers', component: () => import('../views/h5/Providers.vue') },
      { path: 'my-agreements', name: 'h5-my-agreements', component: () => import('../views/h5/MyAgreements.vue') },
      { path: 'chat', name: 'h5-chat', component: () => import('../views/h5/ChatPage.vue') },
      { path: 'witness-agreement', name: 'h5-witness-agreement', component: () => import('../views/h5/WitnessAgreement.vue') },
      { path: 'execute-agreement', name: 'h5-execute-agreement', component: () => import('../views/h5/AgreementPage.vue'), meta: { code: '1' } },
      { path: 'supervise-agreement', name: 'h5-supervise-agreement', component: () => import('../views/h5/AgreementPage.vue'), meta: { code: '2' } },
      { path: 'manage-agreement', name: 'h5-manage-agreement', component: () => import('../views/h5/AgreementPage.vue'), meta: { code: '3' } },
      { path: 'dispute-agreement', name: 'h5-dispute-agreement', component: () => import('../views/h5/AgreementPage.vue'), meta: { code: '4' } },
      { path: 'custody-agreement', name: 'h5-custody-agreement', component: () => import('../views/h5/AgreementPage.vue'), meta: { code: '5' } },
      { path: 'tickets', name: 'h5-tickets', component: () => import('../views/h5/SimplePage.vue'), props: { title: '电子票夹', desc: '电子票据、缴费回执与服务凭证集中存放，支持按时间检索。' } },
      { path: 'ai', name: 'h5-ai', component: () => import('../views/h5/SimplePage.vue'), props: { title: 'AI帮助', desc: '智能问答助手，可解答业务流程、材料要求与费用说明等问题。' } },
      { path: 'emergency-records', name: 'h5-emergency-records', component: () => import('../views/h5/SimplePage.vue'), props: { title: '紧急修改遗嘱记录', desc: '紧急遗嘱口头修改与视频存证的历史记录。', items: [{ title: '2026-09-01 口头修改视频', meta: '状态：已提交' }, { title: '2026-08-15 紧急补充说明', meta: '状态：已归档' }] } },
    ],
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('../views/admin/AdminLogin.vue'),
    meta: { public: true },
  },
  {
    path: '/admin',
    component: () => import('../views/admin/AdminShell.vue'),
    meta: { requiresAdmin: true },
    children: [
      { path: '', name: 'admin-dash', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'screen', name: 'admin-screen', component: () => import('../views/admin/BigScreen.vue') },
      { path: 'review', name: 'admin-review', component: () => import('../views/admin/Review.vue') },
      { path: 'witness', name: 'admin-witness', component: () => import('../views/admin/WitnessAdmin.vue') },
      { path: 'workbench', name: 'admin-workbench', component: () => import('../views/admin/Workbench.vue') },
      { path: 'dispute', name: 'admin-dispute', component: () => import('../views/admin/DisputeAdmin.vue') },
      { path: 'custody', name: 'admin-custody', component: () => import('../views/admin/CustodyAdmin.vue') },
      { path: 'users', name: 'admin-users', component: () => import('../views/admin/Users.vue') },
      { path: 'franchise', name: 'admin-franchise', component: () => import('../views/admin/FranchiseAdmin.vue') },
      { path: 'sms', name: 'admin-sms', component: () => import('../views/admin/Sms.vue') },
      { path: 'audit', name: 'admin-audit', component: () => import('../views/admin/Audit.vue') },
      { path: 'stats', name: 'admin-stats', component: () => import('../views/admin/Stats.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  if (to.meta.public) return true
  if (to.matched.some((r) => r.meta.requiresAdmin)) {
    if (!getToken('admin')) {
      return { path: '/admin/login', query: { redirect: to.fullPath } }
    }
  }
  return true
})

export default router
