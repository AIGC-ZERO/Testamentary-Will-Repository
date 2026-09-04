<template>
  <div class="page">
    <div v-if="loading" class="banner">正在加载登记数据…</div>
    <div v-else-if="offline" class="banner warn">后端暂不可用，已使用本地缓存；写操作将仅保存在本地</div>

    <section class="panel">
      <div class="head">
        <h3>登记审核</h3>
        <div class="tabs">
          <button
            v-for="t in tabs"
            :key="t.key"
            class="btn btn-sm"
            :class="filter === t.key ? 'btn-primary' : 'btn-ghost'"
            @click="filter = t.key"
          >{{ t.label }} ({{ t.count }})</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>编号</th><th>申请人</th><th>类型</th><th>状态</th><th>证明编号</th><th>提交时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id" @click="detail = r">
            <td>{{ r.id }}</td>
            <td>{{ r.applicant }}</td>
            <td>{{ r.type }}</td>
            <td><span class="tag" :class="statusClass(r.status)">{{ r.status }}</span></td>
            <td>{{ r.certNo || '—' }}</td>
            <td>{{ r.createdAt }}</td>
            <td class="ops" @click.stop>
              <button class="btn btn-sm btn-primary" :disabled="!canReview(r) || busyId === r.id" @click="approve(r)">通过</button>
              <button class="btn btn-sm btn-ghost" :disabled="!canReview(r) || busyId === r.id" @click="supplement(r)">退回补充</button>
              <button class="btn btn-sm btn-ghost" :disabled="!canReview(r) || busyId === r.id" @click="reject(r)">驳回</button>
              <button class="btn btn-sm btn-ghost" @click="detail = r">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="detail" class="drawer" @click.self="detail = null">
      <div class="drawer-body">
        <header>
          <strong>登记详情 {{ detail.id }}</strong>
          <button class="x" @click="detail = null">×</button>
        </header>
        <dl>
          <dt>申请人</dt><dd>{{ detail.applicant }}</dd>
          <dt>遗嘱类型</dt><dd>{{ detail.type }}</dd>
          <dt>当前状态</dt><dd>{{ detail.status }}</dd>
          <dt>证明编号</dt><dd>{{ detail.certNo || '未生成' }}</dd>
          <dt>存证哈希</dt><dd>{{ detail.hash || '—' }}</dd>
          <dt>提交时间</dt><dd>{{ detail.createdAt }}</dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { store, persist, toast, pushAudit, now, applyRegistrations } from '../../store'
import {
  fetchRegistrations,
  approveRegistration,
  supplementRegistration,
  rejectRegistration,
} from '../../api/admin'
import { ApiError } from '../../api/http'

const filter = ref('all')
const detail = ref(null)
const loading = ref(false)
const offline = ref(false)
const busyId = ref('')

const tabs = computed(() => [
  { key: 'all', label: '全部', count: store.registrations.length },
  { key: 'pending', label: '待审核', count: store.registrations.filter(r => ['审核中', '已提交', '退回补充'].includes(r.status)).length },
  { key: 'done', label: '已受理', count: store.registrations.filter(r => r.status === '已受理').length },
  { key: 'reject', label: '已驳回', count: store.registrations.filter(r => r.status === '驳回终止').length },
])

const filtered = computed(() => {
  if (filter.value === 'pending') {
    return store.registrations.filter(r => ['审核中', '已提交', '退回补充'].includes(r.status))
  }
  if (filter.value === 'done') return store.registrations.filter(r => r.status === '已受理')
  if (filter.value === 'reject') return store.registrations.filter(r => r.status === '驳回终止')
  return store.registrations
})

function statusClass(s) {
  if (s === '已受理') return 'tag-ok'
  if (['审核中', '已提交', '退回补充'].includes(s)) return 'tag-warn'
  if (s === '驳回终止') return 'tag-danger'
  return 'tag-blue'
}
function canReview(r) {
  return ['审核中', '已提交', '退回补充'].includes(r.status)
}

function patchLocal(id, patch) {
  const idx = store.registrations.findIndex(x => x.id === id)
  if (idx >= 0) Object.assign(store.registrations[idx], patch)
  if (detail.value?.id === id) Object.assign(detail.value, patch)
  persist()
}

async function reload() {
  loading.value = true
  try {
    const list = await fetchRegistrations()
    applyRegistrations(list)
    offline.value = false
  } catch (err) {
    offline.value = true
    if (!(err instanceof ApiError)) console.warn(err)
  } finally {
    loading.value = false
  }
}

async function approve(r) {
  busyId.value = r.id
  try {
    const row = await approveRegistration(r.id)
    patchLocal(r.id, row)
    toast('已通过并生成证明编号，短信已发送')
    await reload()
  } catch {
    // 本地回退
    r.status = '已受理'
    r.certNo = r.certNo || `QD-WILL-${now().replace(/\D/g, '').slice(0, 8)}-${r.id.slice(-3)}`
    r.hash = r.hash || ('h' + Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6))
    store.sms.unshift({
      id: (store.sms[0]?.id || 0) + 1,
      to: r.applicant,
      tpl: '登记受理通知',
      content: `您的遗嘱登记已受理，证明编号 ${r.certNo}`,
      status: '成功',
      at: now(),
    })
    persist()
    pushAudit(store.adminUser.name, `审核通过 ${r.id} → 已受理，证明 ${r.certNo}`)
    toast('后端不可用：已在本地通过')
  } finally {
    busyId.value = ''
  }
}

async function supplement(r) {
  busyId.value = r.id
  try {
    const row = await supplementRegistration(r.id)
    patchLocal(r.id, row)
    toast('已退回补充并短信通知')
    await reload()
  } catch {
    r.status = '退回补充'
    store.sms.unshift({
      id: (store.sms[0]?.id || 0) + 1,
      to: r.applicant,
      tpl: '补件通知',
      content: '请补充手持证件清晰照片后重新提交',
      status: '成功',
      at: now(),
    })
    persist()
    pushAudit(store.adminUser.name, `退回补充 ${r.id}`)
    toast('后端不可用：已在本地退回补充')
  } finally {
    busyId.value = ''
  }
}

async function reject(r) {
  busyId.value = r.id
  try {
    const row = await rejectRegistration(r.id)
    patchLocal(r.id, row)
    toast('已驳回终止')
    await reload()
  } catch {
    r.status = '驳回终止'
    persist()
    pushAudit(store.adminUser.name, `驳回终止 ${r.id}`)
    toast('后端不可用：已在本地驳回')
  } finally {
    busyId.value = ''
  }
}

onMounted(reload)
</script>

<style scoped>
.page { display: grid; gap: 16px; }
.banner {
  background: #eaf3ff;
  color: #1e5a9a;
  border: 1px solid rgba(47,110,196,.2);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
}
.banner.warn {
  background: #fff7e8;
  color: #9a6b16;
  border-color: rgba(180,130,40,.25);
}
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
.tabs { display: flex; gap: 6px; flex-wrap: wrap; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eef2f7; white-space: nowrap; }
tbody tr { cursor: pointer; }
tbody tr:hover { background: #f8fbfe; }
th { color: #6a7d90; }
.ops { display: flex; gap: 6px; }
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
