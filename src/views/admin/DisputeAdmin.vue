<template>
  <div class="page">
    <section class="panel">
      <div class="head">
        <h3>纠纷案件管理</h3>
        <div class="filters">
          <select v-model="stageFilter" class="search">
            <option value="">全部阶段</option>
            <option v-for="s in stages" :key="s" :value="s">{{ s }}</option>
          </select>
          <input v-model="keyword" class="search" placeholder="搜索编号/标题/申请人" />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>编号</th><th>标题</th><th>申请人</th><th>承办人</th><th>阶段</th><th>更新时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in filtered" :key="d.id">
            <td>{{ d.id }}</td>
            <td>{{ d.title }}</td>
            <td>{{ d.applicant }}</td>
            <td>{{ d.owner }}</td>
            <td><span class="tag" :class="stageClass(d.stage)">{{ d.stage }}</span></td>
            <td>{{ d.updatedAt }}</td>
            <td class="ops">
              <button class="btn btn-sm btn-primary" :disabled="d.stage === '已结案'" @click="advance(d)">推进</button>
              <button class="btn btn-sm btn-ghost" @click="assign(d)">改派</button>
              <button class="btn btn-sm btn-ghost" @click="exportPack(d)">导出证据包</button>
              <button class="btn btn-sm btn-ghost" @click="detail = d">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="foot">共 {{ filtered.length }} 件 · 进行中 {{ activeCount }} 件</p>
    </section>

    <div v-if="detail" class="drawer" @click.self="detail = null">
      <div class="drawer-body">
        <header>
          <strong>纠纷详情 {{ detail.id }}</strong>
          <button class="x" @click="detail = null">×</button>
        </header>
        <dl>
          <dt>标题</dt><dd>{{ detail.title }}</dd>
          <dt>申请人</dt><dd>{{ detail.applicant }}</dd>
          <dt>承办人</dt><dd>{{ detail.owner }}</dd>
          <dt>当前阶段</dt><dd>{{ detail.stage }}</dd>
          <dt>更新时间</dt><dd>{{ detail.updatedAt }}</dd>
        </dl>
        <div class="stages">
          <span v-for="s in stages" :key="s" class="pill" :class="{ on: detail.stage === s }">{{ s }}</span>
        </div>
        <div class="ops" style="margin-top:16px">
          <button class="btn btn-sm btn-primary" :disabled="detail.stage === '已结案'" @click="advance(detail)">推进下一阶段</button>
          <button class="btn btn-sm btn-ghost" @click="exportPack(detail)">导出证据包</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const stages = ['调解中', '取证中', '诉讼中', '已结案']
const owners = ['王管理', '李审核', '周业务']
const keyword = ref('')
const stageFilter = ref('')
const detail = ref(null)

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return store.disputes.filter(d => {
    if (stageFilter.value && d.stage !== stageFilter.value) return false
    if (!k) return true
    return d.id.toLowerCase().includes(k) || d.title.toLowerCase().includes(k) || d.applicant.toLowerCase().includes(k)
  })
})

const activeCount = computed(() => store.disputes.filter(d => d.stage !== '已结案').length)

function stageClass(s) {
  if (s === '已结案') return 'tag-ok'
  if (s === '诉讼中') return 'tag-danger'
  if (s === '取证中') return 'tag-warn'
  return 'tag-blue'
}

function advance(d) {
  const i = stages.indexOf(d.stage)
  if (i < 0 || i >= stages.length - 1) return
  const next = stages[i + 1]
  d.stage = next
  d.updatedAt = now()
  persist()
  pushAudit(store.adminUser.name, `纠纷 ${d.id} 推进 → ${next}`)
  toast(`已推进至「${next}」`)
}

function assign(d) {
  const idx = owners.indexOf(d.owner)
  d.owner = owners[(idx + 1) % owners.length]
  d.updatedAt = now()
  persist()
  pushAudit(store.adminUser.name, `纠纷 ${d.id} 改派承办人 → ${d.owner}`)
  toast(`已改派承办人：${d.owner}`)
}

function exportPack(d) {
  pushAudit(store.adminUser.name, `导出纠纷证据包 ${d.id}`)
  toast(`证据包已生成：${d.id}-证据清单.pdf`)
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
dl { display: grid; gap: 12px; font-size: 14px; margin-bottom: 16px; }
dt { color: #6a7d90; font-size: 12px; }
dd { margin: 0; color: #1a3a5c; }
.stages { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef3f9;
  color: #6a7d90;
  font-size: 12px;
}
.pill.on { background: #d6e8fb; color: #1e5a9a; font-weight: 700; }
</style>
