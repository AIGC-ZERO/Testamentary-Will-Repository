<template>
  <div class="page">
    <section class="paper-card panel">
      <h3>提交纠纷申请</h3>
      <div class="field">
        <label>争议标题</label>
        <input v-model="form.title" placeholder="如：遗嘱分配异议" />
      </div>
      <div class="field">
        <label>关联遗嘱/案件编号</label>
        <input v-model="form.refId" placeholder="如 RG… / WS…" />
      </div>
      <div class="field">
        <label>情况说明</label>
        <textarea v-model="form.desc" placeholder="简要描述争议点与诉求" />
      </div>
      <button class="btn btn-primary btn-block" @click="submit">提交纠纷</button>
    </section>

    <section class="paper-card panel">
      <h3>我的纠纷进度</h3>
      <div v-if="!store.disputes.length" class="hint">暂无纠纷记录</div>
      <div v-for="d in store.disputes" :key="d.id" class="case">
        <div class="row between">
          <div>
            <strong>{{ d.title }}</strong>
            <div class="hint">{{ d.id }} · 承办 {{ d.owner }}</div>
          </div>
          <span class="tag" :class="stageClass(d.stage)">{{ d.stage }}</span>
        </div>
        <div class="timeline">
          <div
            v-for="s in stages"
            :key="s"
            class="node"
            :class="{ done: stageIndex(d.stage) >= stageIndex(s), current: d.stage === s }"
          >
            <span class="dot"></span>
            <span>{{ s }}</span>
          </div>
        </div>
        <div class="hint">更新于 {{ d.updatedAt }}</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const stages = ['调解中', '取证中', '诉讼中', '已结案']
const form = reactive({ title: '', refId: '', desc: '' })

onMounted(() => { store.chatContext = '遗嘱纠纷' })

function stageIndex(s) {
  const i = stages.indexOf(s)
  return i < 0 ? 0 : i
}
function stageClass(s) {
  if (s === '已结案') return 'tag-ok'
  if (s === '诉讼中') return 'tag-danger'
  if (s === '取证中') return 'tag-blue'
  return 'tag-warn'
}

function submit() {
  if (!form.title.trim()) return toast('请填写争议标题')
  const id = 'DP' + now().replace(/\D/g, '').slice(0, 12)
  store.disputes.unshift({
    id,
    applicant: store.user.name,
    stage: '调解中',
    title: form.title,
    owner: '周业务',
    refId: form.refId,
    desc: form.desc,
    updatedAt: now(),
  })
  persist()
  pushAudit(store.user.name, `提交纠纷 ${id} ${form.title}`)
  toast('纠纷已提交，进入调解阶段')
  form.title = ''
  form.refId = ''
  form.desc = ''
}
</script>

<style scoped>
.page { padding: 14px; display: grid; gap: 12px; }
.panel { padding: 14px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: 16px; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.case {
  display: grid; gap: 8px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0,0,0,.08);
}
.case:last-child { border-bottom: 0; }
.timeline {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.node {
  display: grid; gap: 4px; justify-items: center;
  font-size: 11px; color: #8a97a8; text-align: center;
}
.node .dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: #d5dde8; position: relative;
}
.node.done { color: var(--blue-deep, #2f6ec4); }
.node.done .dot { background: #4d8de0; }
.node.current { color: #c62828; font-weight: 700; }
.node.current .dot { background: #c62828; box-shadow: 0 0 0 3px rgba(198,40,40,.15); }
</style>
