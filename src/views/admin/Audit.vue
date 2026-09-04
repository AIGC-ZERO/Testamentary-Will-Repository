<template>
  <div class="page">
    <section class="panel">
      <div class="head">
        <h3>审计日志</h3>
        <input v-model="keyword" class="search" placeholder="搜索操作人/动作" />
        <select v-model="whoFilter" class="search">
          <option value="">全部操作人</option>
          <option v-for="w in operators" :key="w" :value="w">{{ w }}</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>时间</th><th>操作人</th><th>动作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(a, i) in filtered" :key="i">
            <td>{{ a.at }}</td>
            <td>{{ a.who }}</td>
            <td>{{ a.action }}</td>
          </tr>
        </tbody>
      </table>
      <p class="foot">共 {{ filtered.length }} 条记录</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store } from '../../store'

const keyword = ref('')
const whoFilter = ref('')

const operators = computed(() => [...new Set(store.audits.map(a => a.who))])

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return store.audits.filter(a => {
    if (whoFilter.value && a.who !== whoFilter.value) return false
    if (!k) return true
    return a.who.toLowerCase().includes(k) || a.action.toLowerCase().includes(k)
  })
})
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
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
h3 { margin: 0; flex: 1; color: #1a3a5c; }
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
.foot { margin-top: 12px; color: #6a7d90; font-size: 13px; }
</style>
