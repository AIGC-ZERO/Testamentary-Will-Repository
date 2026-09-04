<template>
  <div class="page">
    <section class="panel">
      <div class="head">
        <h3>保管巡检</h3>
        <div class="filters">
          <select v-model="statusFilter" class="search">
            <option value="">全部状态</option>
            <option value="ok">正常</option>
            <option value="bad">异常</option>
          </select>
          <input v-model="keyword" class="search" placeholder="搜索遗嘱编号/持有人/库位" />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>遗嘱/案件</th><th>持有人</th><th>库位</th><th>入库日</th><th>最近巡检</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.willId">
            <td>{{ c.willId }}</td>
            <td>{{ c.holder }}</td>
            <td>{{ c.location || '—' }}</td>
            <td>{{ c.since }}</td>
            <td>{{ c.lastCheck }}</td>
            <td>
              <span class="tag" :class="c.ok ? 'tag-ok' : 'tag-danger'">{{ c.ok ? '正常' : '异常' }}</span>
            </td>
            <td class="ops">
              <button class="btn btn-sm btn-primary" @click="check(c)">巡检</button>
              <button class="btn btn-sm btn-ghost" @click="markBad(c)">标记异常</button>
              <button class="btn btn-sm btn-ghost" v-if="!c.ok" @click="markOk(c)">恢复正常</button>
              <button class="btn btn-sm btn-ghost" @click="detail = c">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="foot">共 {{ filtered.length }} 件 · 正常 {{ okCount }} · 异常 {{ badCount }}</p>
    </section>

    <div v-if="detail" class="drawer" @click.self="detail = null">
      <div class="drawer-body">
        <header>
          <strong>保管详情</strong>
          <button class="x" @click="detail = null">×</button>
        </header>
        <dl>
          <dt>遗嘱编号</dt><dd>{{ detail.willId }}</dd>
          <dt>持有人</dt><dd>{{ detail.holder }}</dd>
          <dt>库位</dt><dd>{{ detail.location || '—' }}</dd>
          <dt>入库日期</dt><dd>{{ detail.since }}</dd>
          <dt>最近巡检</dt><dd>{{ detail.lastCheck }}</dd>
          <dt>状态</dt><dd>{{ detail.ok ? '正常' : '异常' }}</dd>
        </dl>
        <div class="ops" style="margin-top:16px">
          <button class="btn btn-sm btn-primary" @click="check(detail)">完成巡检</button>
          <button class="btn btn-sm btn-ghost" @click="markBad(detail)">标记异常</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const keyword = ref('')
const statusFilter = ref('')
const detail = ref(null)

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return store.custody.filter(c => {
    if (statusFilter.value === 'ok' && !c.ok) return false
    if (statusFilter.value === 'bad' && c.ok) return false
    if (!k) return true
    return c.willId.toLowerCase().includes(k)
      || c.holder.toLowerCase().includes(k)
      || (c.location || '').toLowerCase().includes(k)
  })
})

const okCount = computed(() => store.custody.filter(c => c.ok).length)
const badCount = computed(() => store.custody.filter(c => !c.ok).length)

function check(c) {
  c.lastCheck = now().slice(0, 10)
  if (c.ok === undefined) c.ok = true
  persist()
  pushAudit(store.adminUser.name, `保管巡检 ${c.willId} → lastCheck ${c.lastCheck}`)
  toast('巡检完成，已更新最近巡检日')
}

function markBad(c) {
  c.ok = false
  c.lastCheck = now().slice(0, 10)
  persist()
  pushAudit(store.adminUser.name, `保管标记异常 ${c.willId}`)
  toast('已标记异常')
}

function markOk(c) {
  c.ok = true
  c.lastCheck = now().slice(0, 10)
  persist()
  pushAudit(store.adminUser.name, `保管恢复正常 ${c.willId}`)
  toast('已恢复正常')
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
.drawer {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}
.drawer-body {
  width: min(400px, 100%);
  background: #fff;
  padding: 20px;
  box-shadow: -8px 0 24px rgba(0,0,0,.12);
}
.drawer-body header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.x { border: 0; background: transparent; font-size: 24px; cursor: pointer; }
dl { display: grid; gap: 12px; font-size: 14px; }
dt { color: #6a7d90; font-size: 12px; }
dd { margin: 0; color: #1a3a5c; }
</style>
