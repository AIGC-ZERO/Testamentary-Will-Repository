<template>
  <div class="page">
    <section class="panel nums">
      <div class="stat" v-for="s in summary" :key="s.label">
        <div class="n">{{ s.value }}</div>
        <div class="l">{{ s.label }}</div>
      </div>
    </section>

    <div class="row">
      <section class="panel">
        <h3>业务类型分布</h3>
        <div class="bars">
          <div class="bar-row" v-for="b in bizBars" :key="b.label">
            <div class="name">{{ b.label }}</div>
            <div class="track">
              <div class="fill" :style="{ width: b.pct + '%' }"></div>
            </div>
            <div class="val">{{ b.value }}</div>
          </div>
        </div>
      </section>

      <section class="panel">
        <h3>费用汇总（已支付订单）</h3>
        <div class="fee-box">
          <div class="fee-n">¥{{ totalPaid.toLocaleString() }}</div>
          <div class="fee-l">累计已收服务费</div>
        </div>
        <table>
          <thead>
            <tr><th>订单</th><th>项目</th><th>金额</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr v-for="o in store.orders" :key="o.id">
              <td>{{ o.id }}</td>
              <td>{{ o.title }}</td>
              <td>¥{{ o.amount }}</td>
              <td><span class="tag" :class="o.status==='已支付'?'tag-ok':'tag-warn'">{{ o.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>

    <section class="panel">
      <h3>业务量对比</h3>
      <div class="bars">
        <div class="bar-row" v-for="b in bars" :key="b.label">
          <div class="name">{{ b.label }}</div>
          <div class="track">
            <div class="fill" :style="{ width: b.pct + '%' }"></div>
          </div>
          <div class="val">{{ b.value }}</div>
        </div>
      </div>
    </section>

    <section class="panel">
      <h3>登记状态分布</h3>
      <div class="bars">
        <div class="bar-row" v-for="b in regBars" :key="b.label">
          <div class="name">{{ b.label }}</div>
          <div class="track">
            <div class="fill alt" :style="{ width: b.pct + '%' }"></div>
          </div>
          <div class="val">{{ b.value }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store, BUSINESS_MAP } from '../../store'

const summary = computed(() => [
  { label: '登记', value: store.registrations.length },
  { label: '见证', value: store.witnessings.length },
  { label: '纠纷', value: store.disputes.length },
  { label: '保管', value: store.custody.length },
  { label: '加盟', value: store.franchises.length },
  { label: '短信', value: store.sms.length },
])

const bars = computed(() => {
  const items = [
    { label: '登记', value: store.registrations.length },
    { label: '见证', value: store.witnessings.length },
    { label: '纠纷', value: store.disputes.length },
    { label: '保管', value: store.custody.length },
    { label: '加盟', value: store.franchises.length },
  ]
  const max = Math.max(...items.map(i => i.value), 1)
  return items.map(i => ({ ...i, pct: Math.round((i.value / max) * 100) }))
})

const bizBars = computed(() => {
  const items = Object.entries(BUSINESS_MAP).map(([code, m]) => ({
    label: m.name,
    value: store.businesses.filter(b => b.businessCode === code).length,
  }))
  const max = Math.max(...items.map(i => i.value), 1)
  return items.map(i => ({ ...i, pct: Math.round((i.value / max) * 100) }))
})

const regBars = computed(() => {
  const map = {}
  store.registrations.forEach(r => { map[r.status] = (map[r.status] || 0) + 1 })
  const items = Object.entries(map).map(([label, value]) => ({ label, value }))
  const max = Math.max(...items.map(i => i.value), 1)
  return items.map(i => ({ ...i, pct: Math.round((i.value / max) * 100) }))
})

const totalPaid = computed(() =>
  store.orders.filter(o => o.status === '已支付').reduce((s, o) => s + (o.amount || 0), 0)
)
</script>

<style scoped>
.page { display: grid; gap: 16px; }
.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(47,110,196,.12);
  padding: 16px;
}
h3 { margin: 0 0 14px; color: #1a3a5c; }
.nums {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}
.stat {
  text-align: center;
  padding: 12px 8px;
  background: #f3f8fd;
  border-radius: 10px;
}
.n { font-size: 24px; font-weight: 700; color: #1e5a9a; }
.l { font-size: 12px; color: #6a7d90; margin-top: 4px; }
.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.bars { display: grid; gap: 12px; }
.bar-row {
  display: grid;
  grid-template-columns: 88px 1fr 36px;
  gap: 10px;
  align-items: center;
  font-size: 13px;
}
.name { color: #3a5168; }
.track {
  height: 14px;
  background: #e8eef5;
  border-radius: 8px;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, #5a9de0, #2f6ec4);
  border-radius: 8px;
  min-width: 4px;
  transition: width .35s ease;
}
.fill.alt {
  background: linear-gradient(90deg, #7bb8e8, #3d7fc4);
}
.val { text-align: right; color: #1e5a9a; font-weight: 600; }
.fee-box {
  text-align: center;
  padding: 16px;
  background: #f3f8fd;
  border-radius: 10px;
  margin-bottom: 14px;
}
.fee-n { font-size: 28px; font-weight: 700; color: #1e5a9a; }
.fee-l { font-size: 13px; color: #6a7d90; margin-top: 4px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #eef2f7; }
th { color: #6a7d90; }
@media (max-width: 900px) {
  .nums { grid-template-columns: repeat(3, 1fr); }
  .row { grid-template-columns: 1fr; }
}
</style>
