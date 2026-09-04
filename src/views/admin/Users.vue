<template>
  <div class="page">
    <section class="panel">
      <div class="head">
        <h3>用户与角色</h3>
        <div class="filters">
          <input v-model="keyword" placeholder="搜索姓名/账号" class="search" />
          <select v-model="roleFilter" class="search">
            <option value="">全部角色</option>
            <option v-for="r in roles" :key="r" :value="r">{{ r }}</option>
          </select>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>姓名</th><th>账号</th><th>角色</th><th>状态</th><th>最近登录</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.account">
            <td>{{ u.name }}</td>
            <td>{{ u.account }}</td>
            <td><span class="tag tag-blue">{{ u.role }}</span></td>
            <td>
              <span class="tag" :class="u.active ? 'tag-ok' : 'tag-warn'">{{ u.active ? '启用' : '停用' }}</span>
            </td>
            <td>{{ u.lastLogin }}</td>
            <td class="ops">
              <button class="btn btn-sm" :class="u.active ? 'btn-ghost' : 'btn-primary'" @click="toggle(u)">
                {{ u.active ? '停用' : '启用' }}
              </button>
              <button class="btn btn-sm btn-ghost" @click="cycleRole(u)">调整角色</button>
              <button class="btn btn-sm btn-ghost" @click="resetLogin(u)">重置登录</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="foot">共 {{ filtered.length }} 条 · 顶栏可切换当前操作员角色</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const keyword = ref('')
const roleFilter = ref('')
const roles = ['审核员', '业务员', '管理员', '申请人', '管理人', '客服']

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return store.adminUsers.filter(u => {
    if (roleFilter.value && u.role !== roleFilter.value) return false
    if (!k) return true
    return u.name.toLowerCase().includes(k) || u.account.toLowerCase().includes(k)
  })
})

function toggle(u) {
  u.active = !u.active
  persist()
  pushAudit(store.adminUser.name, `${u.active ? '启用' : '停用'}用户 ${u.account}`)
  toast(u.active ? '已启用账号' : '已停用账号')
}

function cycleRole(u) {
  const idx = roles.indexOf(u.role)
  u.role = roles[(idx + 1) % roles.length]
  persist()
  pushAudit(store.adminUser.name, `调整用户 ${u.account} 角色 → ${u.role}`)
  toast(`角色已调整为：${u.role}`)
}

function resetLogin(u) {
  u.lastLogin = now()
  persist()
  pushAudit(store.adminUser.name, `重置登录时间 ${u.account}`)
  toast('已更新最近登录记录')
}
</script>

<style scoped>
.page { display: grid; gap: 16px; }
.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(47,110,196,.12);
  padding: 16px;
  overflow-x: auto;
}
.head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
h3 { margin: 0; color: #1a3a5c; }
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.search {
  border: 1px solid #dce4ee;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  min-width: 140px;
}
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eef2f7; }
th { color: #6a7d90; }
.ops { display: flex; gap: 6px; flex-wrap: wrap; }
.foot { margin-top: 12px; color: #6a7d90; font-size: 13px; }
</style>
