<template>
  <div class="page">
    <section class="panel">
      <h3>业务员工作台</h3>
      <p class="hint">处理「待排期」案件：设置时间、上传材料、标记完成并写入仪式哈希。</p>
      <div v-for="w in pending" :key="w.id" class="card">
        <div class="row between">
          <div>
            <strong>{{ w.id }}</strong>
            <div class="hint">{{ w.applicant }} · {{ (w.services||[]).join('/') }}</div>
          </div>
          <span class="tag tag-warn">{{ w.status }}</span>
        </div>
        <div class="field">
          <label>排期时间</label>
          <input type="datetime-local" v-model="draft[w.id].schedule" />
        </div>
        <div class="upload-box" :class="{ filled: draft[w.id].uploaded }" @click="draft[w.id].uploaded = true">
          <div>{{ draft[w.id].uploaded ? '音视频/文书已上传' : '点击上传音视频文书' }}</div>
        </div>
        <div class="ops">
          <button class="btn btn-sm btn-ghost" @click="saveSchedule(w)">保存排期</button>
          <button class="btn btn-sm btn-primary" @click="complete(w)">标记已完成</button>
        </div>
      </div>
      <div v-if="!pending.length" class="hint">暂无待排期案件</div>
    </section>

    <section class="panel">
      <h3>近期已办</h3>
      <div v-for="w in done" :key="w.id" class="done-row">
        <span>{{ w.id }}</span>
        <span class="hint">{{ w.schedule || '—' }}</span>
        <span class="tag tag-ok">{{ w.status }}</span>
        <span class="hint">哈希 {{ w.ceremonyHash || '—' }}</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const pending = computed(() => store.witnessings.filter(w => w.status === '待排期'))
const done = computed(() => store.witnessings.filter(w => w.status === '已完成').slice(0, 5))
const draft = reactive({})

watch(pending, (list) => {
  list.forEach(w => {
    if (!draft[w.id]) {
      draft[w.id] = {
        schedule: w.schedule ? w.schedule.replace(' ', 'T').slice(0, 16) : '',
        uploaded: false,
      }
    }
  })
}, { immediate: true })

function saveSchedule(w) {
  const s = draft[w.id]?.schedule
  if (!s) return toast('请选择排期时间')
  w.schedule = s.replace('T', ' ')
  w.agent = w.agent || '周业务'
  persist()
  pushAudit(store.adminUser.name, `设置排期 ${w.id} → ${w.schedule}`)
  toast('排期已保存')
}

function complete(w) {
  if (!draft[w.id]?.schedule && !w.schedule) return toast('请先设置排期')
  if (!draft[w.id]?.uploaded) return toast('请先上传音视频文书')
  if (draft[w.id].schedule) w.schedule = draft[w.id].schedule.replace('T', ' ')
  w.status = '已完成'
  w.ceremonyHash = 'c' + Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6)
  w.agent = w.agent || '周业务'
  persist()
  pushAudit(store.adminUser.name, `标记完成 ${w.id}，ceremonyHash ${w.ceremonyHash} @ ${now()}`)
  toast('已标记完成并写入仪式哈希')
}
</script>

<style scoped>
.page { display: grid; gap: 16px; }
.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(47,110,196,.12);
  padding: 16px;
  display: grid;
  gap: 12px;
}
h3 { margin: 0; color: #1a3a5c; }
.card {
  border: 1px solid #e4ecf5;
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 10px;
  background: #f9fbfe;
}
.row { display: flex; align-items: center; }
.between { justify-content: space-between; }
.ops { display: flex; gap: 8px; }
.done-row {
  display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
  padding: 8px 0; border-bottom: 1px solid #eef2f7; font-size: 13px;
}
</style>
