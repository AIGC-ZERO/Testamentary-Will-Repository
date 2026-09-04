<template>
  <div class="page">
    <section class="panel">
      <div class="head">
        <h3>加盟审核</h3>
        <div class="filters">
          <select v-model="statusFilter" class="search">
            <option value="">全部状态</option>
            <option>待审核</option>
            <option>已入库</option>
            <option>已驳回</option>
          </select>
          <input v-model="keyword" class="search" placeholder="搜索机构/区域/联系方式" />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>编号</th><th>机构</th><th>区域</th><th>联系方式</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in filtered" :key="f.id">
            <td>{{ f.id }}</td>
            <td>{{ f.name }}</td>
            <td>{{ f.region || '—' }}</td>
            <td>{{ f.contact }}</td>
            <td>
              <span class="tag" :class="f.status === '已入库' ? 'tag-ok' : f.status === '已驳回' ? 'tag-danger' : 'tag-warn'">
                {{ f.status }}
              </span>
            </td>
            <td class="ops">
              <button class="btn btn-sm btn-primary" :disabled="f.status !== '待审核'" @click="pass(f)">通过入库</button>
              <button class="btn btn-sm btn-ghost" :disabled="f.status !== '待审核'" @click="reject(f)">驳回</button>
              <button class="btn btn-sm btn-ghost" @click="detail = f">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="foot">共 {{ filtered.length }} 家 · 待审 {{ pendingCount }} 家 · 已入库 {{ passCount }} 家</p>
    </section>

    <div v-if="detail" class="drawer" @click.self="detail = null">
      <div class="drawer-body">
        <header>
          <strong>加盟详情</strong>
          <button class="x" @click="detail = null">×</button>
        </header>
        <dl>
          <dt>编号</dt><dd>{{ detail.id }}</dd>
          <dt>机构名称</dt><dd>{{ detail.name }}</dd>
          <dt>服务区域</dt><dd>{{ detail.region || '—' }}</dd>
          <dt>联系方式</dt><dd>{{ detail.contact }}</dd>
          <dt>审核状态</dt><dd>{{ detail.status }}</dd>
        </dl>
        <div class="ops" v-if="detail.status === '待审核'">
          <button class="btn btn-sm btn-primary" @click="pass(detail); detail=null">通过入库</button>
          <button class="btn btn-sm btn-ghost" @click="reject(detail); detail=null">驳回</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store, persist, toast, pushAudit } from '../../store'

const keyword = ref('')
const statusFilter = ref('')
const detail = ref(null)

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return store.franchises.filter(f => {
    if (statusFilter.value && f.status !== statusFilter.value) return false
    if (!k) return true
    return f.id.toLowerCase().includes(k)
      || f.name.toLowerCase().includes(k)
      || (f.region || '').toLowerCase().includes(k)
      || f.contact.toLowerCase().includes(k)
  })
})

const pendingCount = computed(() => store.franchises.filter(f => f.status === '待审核').length)
const passCount = computed(() => store.franchises.filter(f => f.status === '已入库').length)

function pass(f) {
  f.status = '已入库'
  persist()
  pushAudit(store.adminUser.name, `加盟通过入库 ${f.id} ${f.name}`)
  toast('已通过并入库')
}

function reject(f) {
  f.status = '已驳回'
  persist()
  pushAudit(store.adminUser.name, `加盟驳回 ${f.id} ${f.name}`)
  toast('已驳回')
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
dl { display: grid; gap: 12px; font-size: 14px; margin-bottom: 16px; }
dt { color: #6a7d90; font-size: 12px; }
dd { margin: 0; color: #1a3a5c; }
</style>
