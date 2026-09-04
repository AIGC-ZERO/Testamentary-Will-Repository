<template>
  <div class="page">
    <section class="panel">
      <div class="head">
        <h3>短信发送记录</h3>
        <input v-model="keyword" class="search" placeholder="搜索接收人/模板" />
        <button class="btn btn-sm btn-primary" @click="resend">重发选中模板</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>接收人</th><th>模板</th><th>内容</th><th>状态</th><th>时间</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filtered" :key="s.id">
            <td>{{ s.id }}</td>
            <td>{{ s.to }}</td>
            <td>{{ s.tpl }}</td>
            <td class="content">{{ s.content }}</td>
            <td><span class="tag" :class="s.status === '成功' ? 'tag-ok' : 'tag-danger'">{{ s.status }}</span></td>
            <td>{{ s.at }}</td>
            <td>
              <button class="btn btn-sm btn-ghost" @click="retry(s)">重发</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p class="foot">共 {{ filtered.length }} 条 · 成功 {{ successCount }} 条</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const keyword = ref('')

const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return store.sms
  return store.sms.filter(s =>
    s.to.toLowerCase().includes(k) || s.tpl.toLowerCase().includes(k) || s.content.toLowerCase().includes(k)
  )
})

const successCount = computed(() => filtered.value.filter(s => s.status === '成功').length)

function retry(s) {
  const id = (store.sms[0]?.id || 0) + 1
  store.sms.unshift({
    id,
    to: s.to,
    tpl: s.tpl,
    content: s.content,
    status: '成功',
    at: now(),
  })
  persist()
  pushAudit(store.adminUser.name, `重发短信 ${s.tpl} → ${s.to}`)
  toast('短信已重新发送')
}

function resend() {
  const last = store.sms.find(s => s.tpl === '验证码') || store.sms[0]
  if (!last) return toast('暂无短信记录')
  retry(last)
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
  min-width: 160px;
}
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eef2f7; }
th { color: #6a7d90; }
.content { max-width: 360px; white-space: normal; }
.foot { margin-top: 12px; color: #6a7d90; font-size: 13px; }
</style>
