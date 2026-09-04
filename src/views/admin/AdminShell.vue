<template>
  <div v-if="isScreen" class="screen-host">
    <router-view />
  </div>
  <div v-else class="admin-shell">
    <aside class="side">
      <div class="brand">
        <SealLogo :size="36" :font="11" />
        <div>
          <div class="title">岛城遗嘱库</div>
          <div class="sub">后台管理系统</div>
        </div>
      </div>

      <nav class="nav">
        <router-link
          v-for="n in nav"
          :key="n.to"
          :to="n.to"
          class="nav-item"
          active-class=""
          exact-active-class=""
          :class="{ active: isActive(n.to) }"
        >
          <span class="nav-ico" v-html="n.icon"></span>
          <span class="nav-label">{{ n.label }}</span>
        </router-link>
      </nav>

      <router-link to="/" class="back">
        <span class="nav-ico" v-html="icons.home"></span>
        <span>返回门户</span>
      </router-link>
    </aside>

    <div class="main">
      <header class="top">
        <div class="crumb">
          <strong>{{ pageTitle }}</strong>
          <span class="hint">首页 / {{ pageTitle }}</span>
        </div>
        <div class="roles">
          <span class="hint">当前角色</span>
          <button
            v-for="r in roles"
            :key="r"
            class="btn btn-sm"
            :class="store.adminUser.role === r ? 'btn-primary' : 'btn-ghost'"
            @click="switchRole(r)"
          >{{ r }}</button>
          <span class="who">{{ store.adminUser.name }}</span>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SealLogo from '../../components/SealLogo.vue'
import { store, persist, toast } from '../../store'

const route = useRoute()
const roles = ['审核员', '业务员', '管理员']
const isScreen = computed(() => route.name === 'admin-screen' || route.path === '/admin/screen')

const icons = {
  screen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 20h8M12 18v2"/><path d="M6 10h4M14 8h4M6 13h8"/></svg>',
  dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 13h6V4H4v9zm10 7h6V4h-6v16zM4 20h6v-5H4v5zm10-7h6v-3h-6v3z"/></svg>',
  review: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>',
  witness: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3.5"/><path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></svg>',
  work: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
  dispute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 4v6c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V7l8-4z"/></svg>',
  custody: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c1-3.5 3.5-5 6-5s5 1.5 6 5M14 19c.5-2 2-3.5 4.5-3.5"/></svg>',
  franchise: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V8l7-4 7 4v13"/><path d="M9 21v-6h6v6"/></svg>',
  sms: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16v10H8l-4 3V6z"/></svg>',
  audit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  stats: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11.5L12 4l9 7.5"/><path d="M6 10v9h12v-9"/></svg>',
}

const nav = [
  { to: '/admin/screen', label: '大屏展示', icon: icons.screen },
  { to: '/admin', label: '总览', icon: icons.dash },
  { to: '/admin/review', label: '登记审核', icon: icons.review },
  { to: '/admin/witness', label: '见证管理', icon: icons.witness },
  { to: '/admin/workbench', label: '业务员工作台', icon: icons.work },
  { to: '/admin/dispute', label: '纠纷管理', icon: icons.dispute },
  { to: '/admin/custody', label: '保管巡检', icon: icons.custody },
  { to: '/admin/users', label: '用户权限', icon: icons.users },
  { to: '/admin/franchise', label: '加盟审核', icon: icons.franchise },
  { to: '/admin/sms', label: '短信记录', icon: icons.sms },
  { to: '/admin/audit', label: '审计日志', icon: icons.audit },
  { to: '/admin/stats', label: '统计分析', icon: icons.stats },
]

const pageTitle = computed(() => {
  const hit = nav.find(n => isActive(n.to))
  return hit?.label || '总览'
})

function isActive(to) {
  if (to === '/admin') return route.path === '/admin' || route.path === '/admin/'
  return route.path === to || route.path.startsWith(to + '/')
}

function switchRole(r) {
  store.adminUser.role = r
  store.adminUser.name = r === '审核员' ? '李审核' : r === '业务员' ? '周业务' : '王管理'
  persist()
  toast(`已切换为${r}`)
}
</script>

<style scoped>
.screen-host {
  min-height: 100vh;
  min-height: 100dvh;
  background: #020b1a;
}
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 232px 1fr;
  background: #eef3f9;
  color: #1a2b3c;
}

.side {
  background: linear-gradient(180deg, #e8f2fc 0%, #f4f8fc 42%, #f8fafc 100%);
  border-right: 1px solid rgba(47, 110, 196, 0.1);
  padding: 18px 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 100vh;
  box-shadow: 2px 0 12px rgba(36, 79, 120, 0.04);
}

.brand {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 4px 10px 16px;
  margin-bottom: 4px;
  border-bottom: 1px solid rgba(47, 110, 196, 0.12);
}
.title {
  font-weight: 700;
  font-size: 16px;
  color: #1a3a5c;
  letter-spacing: 0.02em;
  line-height: 1.3;
}
.sub {
  font-size: 12px;
  color: #7a8fa3;
  margin-top: 2px;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  margin: 0 2px;
  border-radius: 8px;
  color: #5a6d80;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}
.nav-item:hover {
  background: rgba(47, 110, 196, 0.06);
  color: #2f6ec4;
}
.nav-item:hover .nav-ico {
  color: #2f6ec4;
}

.nav-item.active {
  color: #1677ff;
  font-weight: 600;
  background: linear-gradient(90deg, rgba(22, 119, 255, 0.16) 0%, rgba(22, 119, 255, 0.06) 55%, transparent 100%);
  box-shadow: inset 3px 0 0 #1677ff;
  border-radius: 0 8px 8px 0;
}
.nav-item.active .nav-ico {
  color: #1677ff;
}

.nav-ico {
  display: inline-flex;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #8a9aac;
}
.nav-ico :deep(svg) {
  width: 18px;
  height: 18px;
  display: block;
}
.nav-label {
  flex: 1;
  line-height: 1.3;
}

.back {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 2px 0;
  padding: 10px 14px;
  border-radius: 8px;
  color: #6a7d90;
  font-size: 13px;
  text-decoration: none;
  border-top: 1px solid rgba(47, 110, 196, 0.1);
  padding-top: 14px;
}
.back:hover {
  color: #2f6ec4;
  background: rgba(47, 110, 196, 0.06);
}
.back .nav-ico { color: inherit; }

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #eef3f9;
}
.top {
  background: #fff;
  border-bottom: 1px solid rgba(47, 110, 196, 0.1);
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.crumb {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.crumb strong {
  font-size: 16px;
  color: #1a3a5c;
}
.top .hint {
  font-size: 12px;
  color: #8a9aac;
}
.roles {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.who {
  font-size: 13px;
  color: #3a5168;
  margin-left: 4px;
}
.content {
  padding: 16px 20px 24px;
}

@media (max-width: 900px) {
  .admin-shell { grid-template-columns: 1fr; }
  .side {
    min-height: auto;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  .nav {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }
  .nav-item.active {
    border-radius: 8px;
    box-shadow: none;
    background: #1677ff;
    color: #fff;
  }
  .nav-item.active .nav-ico { color: #fff; }
}
</style>
