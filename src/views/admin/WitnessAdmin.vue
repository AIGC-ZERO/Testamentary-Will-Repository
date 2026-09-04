<template>
  <div class="page">
    <section class="panel">
      <div class="head">
        <h3>见证管理</h3>
        <div class="filters">
          <select v-model="statusFilter" class="search">
            <option value="">全部状态</option>
            <option>待审核</option>
            <option>待排期</option>
            <option>已完成</option>
          </select>
          <input v-model="keyword" class="search" placeholder="搜索编号/申请人" />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>编号</th><th>申请人</th><th>服务</th><th>费用</th><th>状态</th><th>业务员</th><th>排期</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in filtered" :key="w.id">
            <td>{{ w.id }}</td>
            <td>{{ w.applicant }}</td>
            <td>{{ (w.services||[]).join('/') }}</td>
            <td>¥{{ w.fee || '—' }} <span v-if="w.paid" class="tag tag-ok">已付</span></td>
            <td><span class="tag" :class="statusClass(w.status)">{{ w.status }}</span></td>
            <td>{{ w.agent || '—' }}</td>
            <td>{{ w.schedule || '—' }}</td>
            <td class="ops">
              <button class="btn btn-sm btn-primary" :disabled="w.status !== '待审核'" @click="approve(w)">通过</button>
              <button class="btn btn-sm btn-ghost" :disabled="w.status !== '待审核'" @click="reject(w)">驳回</button>
              <button class="btn btn-sm btn-ghost" :disabled="!['待审核','待排期'].includes(w.status)" @click="schedule(w)">分配排期</button>
              <button class="btn btn-sm btn-ghost" :disabled="w.status === '已完成'" @click="assign(w)">分配业务员</button>
              <button class="btn btn-sm btn-ghost" @click="detail = w">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="foot">共 {{ filtered.length }} 件 · 待审 {{ pendingReview }} · 待排期 {{ pendingSchedule }}</p>
    </section>

    <section class="panel">
      <div class="head">
        <h3>在线业务单（用户端申请）</h3>
        <select v-model="bizFilter" class="search">
          <option value="">全部业务</option>
          <option v-for="(m,c) in BUSINESS_MAP" :key="c" :value="c">{{ m.name }}</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>订单号</th><th>业务</th><th>服务商</th><th>申请人</th><th>状态</th><th>申请时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in onlineBiz" :key="b.orderCode">
            <td>{{ b.orderCode }}</td>
            <td>{{ bizName(b.businessCode) }}</td>
            <td>{{ b.lawName }} · {{ b.companyName }}</td>
            <td>{{ b.applicantName || '—' }}</td>
            <td><span class="tag tag-blue">{{ statusLabel(b.businessStatus) }}</span></td>
            <td>{{ b.registrationTime }}</td>
            <td class="ops">
              <button class="btn btn-sm btn-ghost" :disabled="b.businessStatus === '02'" @click="advanceBiz(b)">推进状态</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <div v-if="detail" class="drawer" @click.self="detail = null">
      <div class="drawer-body">
        <header>
          <strong>见证详情 {{ detail.id }}</strong>
          <button class="x" @click="detail = null">×</button>
        </header>
        <dl>
          <dt>申请人</dt><dd>{{ detail.applicant }}</dd>
          <dt>服务组合</dt><dd>{{ (detail.services||[]).join(' / ') }}</dd>
          <dt>费用</dt><dd>¥{{ detail.fee }} · {{ detail.paid ? '已支付' : '未支付' }}</dd>
          <dt>状态</dt><dd>{{ detail.status }}</dd>
          <dt>业务员</dt><dd>{{ detail.agent || '未分配' }}</dd>
          <dt>排期</dt><dd>{{ detail.schedule || '未排期' }}</dd>
          <dt>仪式哈希</dt><dd>{{ detail.ceremonyHash || '—' }}</dd>
        </dl>
        <div class="ops" style="margin-top:16px">
          <button class="btn btn-sm btn-primary" :disabled="detail.status !== '待审核'" @click="approve(detail)">通过并待排期</button>
          <button class="btn btn-sm btn-ghost" :disabled="detail.status !== '待审核'" @click="reject(detail)">驳回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store, persist, toast, pushAudit, BUSINESS_MAP, now } from '../../store'

const keyword = ref('')
const statusFilter = ref('')
const bizFilter = ref('')
const detail = ref(null)

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return store.witnessings.filter(w => {
    if (statusFilter.value && w.status !== statusFilter.value) return false
    if (!k) return true
    return w.id.toLowerCase().includes(k) || w.applicant.toLowerCase().includes(k)
  })
})

const onlineBiz = computed(() => {
  if (!bizFilter.value) return store.businesses
  return store.businesses.filter(b => b.businessCode === bizFilter.value)
})

const pendingReview = computed(() => store.witnessings.filter(w => w.status === '待审核').length)
const pendingSchedule = computed(() => store.witnessings.filter(w => w.status === '待排期').length)

function bizName(code) {
  return BUSINESS_MAP[code]?.name || code
}
function statusLabel(s) {
  const map = { '00': '申请中', '01': '办理中', '02': '已完成' }
  return map[s] || s
}
function statusClass(s) {
  if (s === '已完成') return 'tag-ok'
  if (['待排期', '待审核'].includes(s)) return 'tag-warn'
  if (s === '已驳回') return 'tag-danger'
  return 'tag-blue'
}

function approve(w) {
  w.status = '待排期'
  w.agent = w.agent || '周业务'
  persist()
  pushAudit(store.adminUser.name, `见证审核通过 ${w.id} → 待排期`)
  toast('已通过，转入待排期')
}

function reject(w) {
  w.status = '已驳回'
  persist()
  pushAudit(store.adminUser.name, `见证驳回 ${w.id}`)
  toast('已驳回该见证申请')
}

function schedule(w) {
  w.status = '待排期'
  w.agent = w.agent || '周业务'
  if (!w.schedule) w.schedule = now().slice(0, 10) + ' 10:00'
  persist()
  pushAudit(store.adminUser.name, `见证 ${w.id} → 待排期，分配业务员${w.agent}`)
  toast('已分配排期入口，请至业务员工作台确认时间')
}

function assign(w) {
  w.agent = w.agent === '周业务' ? '李审核' : '周业务'
  persist()
  pushAudit(store.adminUser.name, `见证 ${w.id} 业务员 → ${w.agent}`)
  toast(`已分配业务员：${w.agent}`)
}

function advanceBiz(b) {
  const flow = { '00': '01', '01': '02' }
  const next = flow[b.businessStatus]
  if (!next) return
  b.businessStatus = next
  persist()
  pushAudit(store.adminUser.name, `业务单 ${b.orderCode} 状态 → ${statusLabel(next)}`)
  toast(`已推进至「${statusLabel(next)}」`)
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
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
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
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eef2f7; white-space: nowrap; }
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
  width: min(420px, 100%);
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
