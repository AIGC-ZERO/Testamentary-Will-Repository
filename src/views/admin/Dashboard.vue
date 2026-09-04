<template>
  <div class="dash">
    <div class="cards">
      <div class="card" v-for="c in cards" :key="c.label" @click="c.to && $router.push(c.to)">
        <div class="num">{{ c.value }}</div>
        <div class="label">{{ c.label }}</div>
      </div>
    </div>

    <div class="row-panels">
      <section class="panel">
        <h3>待办事项</h3>
        <div v-if="!todos.length" class="empty">暂无待办</div>
        <div v-for="t in todos" :key="t.id" class="todo" @click="$router.push(t.to)">
          <span class="tag" :class="t.tagClass">{{ t.tag }}</span>
          <div>
            <strong>{{ t.title }}</strong>
            <div class="hint">{{ t.meta }}</div>
          </div>
          <span class="arrow">→</span>
        </div>
      </section>

      <section class="panel">
        <h3>业务概览</h3>
        <div class="mini-stats">
          <div v-for="s in bizStats" :key="s.label" class="mini">
            <span>{{ s.label }}</span>
            <strong>{{ s.value }}</strong>
          </div>
        </div>
      </section>
    </div>

    <section class="panel">
      <div class="panel-head">
        <h3>最近审计</h3>
        <button class="btn btn-sm btn-ghost" @click="$router.push('/admin/audit')">查看全部</button>
      </div>
      <table>
        <thead>
          <tr><th>时间</th><th>操作人</th><th>动作</th></tr>
        </thead>
        <tbody>
          <tr v-for="(a,i) in store.audits.slice(0, 8)" :key="i">
            <td>{{ a.at }}</td>
            <td>{{ a.who }}</td>
            <td>{{ a.action }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store, BUSINESS_MAP } from '../../store'

const cards = computed(() => [
  { label: '登记总数', value: store.registrations.length, to: '/admin/review' },
  { label: '见证案件', value: store.witnessings.length, to: '/admin/witness' },
  {
    label: '待审登记',
    value: store.registrations.filter(r => ['审核中', '已提交', '退回补充'].includes(r.status)).length,
    to: '/admin/review',
  },
  { label: '待排期见证', value: store.witnessings.filter(w => w.status === '待排期').length, to: '/admin/workbench' },
  { label: '保管台账', value: store.custody.length, to: '/admin/custody' },
  { label: '纠纷案件', value: store.disputes.filter(d => d.stage !== '已结案').length, to: '/admin/dispute' },
])

const bizStats = computed(() => {
  const codes = ['0', '1', '2', '3', '4', '5']
  return codes.map(code => ({
    label: BUSINESS_MAP[code]?.name || code,
    value: store.businesses.filter(b => b.businessCode === code).length,
  }))
})

const todos = computed(() => {
  const list = []
  store.registrations.filter(r => ['审核中', '已提交', '退回补充'].includes(r.status)).slice(0, 3).forEach(r => {
    list.push({
      id: r.id,
      tag: '登记审核',
      tagClass: 'tag-warn',
      title: `${r.applicant} · ${r.type}`,
      meta: `${r.id} · ${r.status}`,
      to: '/admin/review',
    })
  })
  store.witnessings.filter(w => w.status === '待审核').slice(0, 2).forEach(w => {
    list.push({
      id: w.id,
      tag: '见证审核',
      tagClass: 'tag-blue',
      title: `${w.applicant} · 见证申请`,
      meta: `${w.id} · 待审核`,
      to: '/admin/witness',
    })
  })
  store.franchises.filter(f => f.status === '待审核').slice(0, 2).forEach(f => {
    list.push({
      id: f.id,
      tag: '加盟审核',
      tagClass: 'tag-warn',
      title: f.name,
      meta: `${f.id} · 待审核`,
      to: '/admin/franchise',
    })
  })
  store.custody.filter(c => !c.ok).slice(0, 2).forEach(c => {
    list.push({
      id: c.willId,
      tag: '保管异常',
      tagClass: 'tag-danger',
      title: `${c.holder} · 保管异常`,
      meta: c.willId,
      to: '/admin/custody',
    })
  })
  return list.slice(0, 6)
})
</script>

<style scoped>
.dash { display: grid; gap: 18px; }
.cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.card {
  background: #fff;
  border: 1px solid rgba(47,110,196,.12);
  border-radius: 12px;
  padding: 18px 16px;
  box-shadow: 0 6px 16px rgba(36,79,120,.06);
  cursor: pointer;
  transition: transform .15s;
}
.card:hover { transform: translateY(-2px); }
.num { font-size: 28px; font-weight: 700; color: #1e5a9a; }
.label { margin-top: 4px; color: #6a7d90; font-size: 13px; }
.row-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(47,110,196,.12);
  padding: 16px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
h3 { margin: 0 0 12px; font-size: 16px; color: #1a3a5c; }
.panel-head h3 { margin: 0; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eef2f7; }
th { color: #6a7d90; font-weight: 600; }
.todo {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
  cursor: pointer;
}
.todo:hover { background: #f8fbfe; }
.arrow { color: #9ab0c4; }
.mini-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.mini {
  background: #f3f8fd;
  border-radius: 8px;
  padding: 12px;
  display: grid;
  gap: 4px;
  font-size: 12px;
  color: #6a7d90;
}
.mini strong { font-size: 20px; color: #1e5a9a; }
.empty { color: #8a9aac; font-size: 13px; padding: 8px 0; }
.hint { font-size: 12px; color: #8a9aac; margin-top: 2px; }
@media (max-width: 1100px) {
  .cards { grid-template-columns: repeat(3, 1fr); }
  .row-panels { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
