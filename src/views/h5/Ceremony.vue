<template>
  <div class="page">
    <section class="paper-card panel" v-if="caseItem">
      <div class="row between">
        <div>
          <h3>立遗嘱仪式</h3>
          <div class="hint">案件编号 {{ caseItem.id }}</div>
        </div>
        <span class="tag" :class="statusClass(caseItem.status)">{{ caseItem.status }}</span>
      </div>
      <ul class="meta">
        <li>立遗嘱人：{{ caseItem.applicant }}</li>
        <li>见证人：{{ caseItem.witness || '—' }}</li>
        <li>服务：{{ (caseItem.services || []).join(' / ') }}</li>
        <li>排期：{{ caseItem.schedule || '待排期' }}</li>
        <li>业务员：{{ caseItem.agent || '—' }}</li>
      </ul>
    </section>
    <section class="paper-card panel" v-else>
      <p class="em-red">未找到案件 {{ id }}</p>
      <p class="hint">请从首页「参加仪式」进入，或检查编号。</p>
    </section>

    <section class="paper-card panel" v-if="caseItem">
      <h3>身份核验</h3>
      <p class="hint">入会前需完成实名与人脸核验。</p>
      <div class="row gap">
        <span class="tag" :class="idOk ? 'tag-ok' : 'tag-warn'">{{ idOk ? '身份已核验' : '待核验' }}</span>
        <span class="tag" :class="faceOk ? 'tag-ok' : 'tag-warn'">{{ faceOk ? '人脸已通过' : '待人脸' }}</span>
      </div>
      <button class="btn btn-primary btn-block" :disabled="idOk && faceOk" @click="verify">
        {{ idOk && faceOk ? '核验完成' : '一键身份核验' }}
      </button>
    </section>

    <section class="paper-card panel" v-if="caseItem">
      <h3>线上入会</h3>
      <div class="row between">
        <span>会议状态</span>
        <span class="tag" :class="joined ? 'tag-ok' : 'tag-blue'">{{ joined ? '已入会' : '未入会' }}</span>
      </div>
      <button class="btn btn-ghost btn-block" :disabled="!idOk || !faceOk || joined" @click="join">
        {{ joined ? '已在会议中' : '进入会议' }}
      </button>
      <p class="hint" v-if="!idOk || !faceOk">请先完成身份核验</p>
    </section>

    <section class="paper-card panel" v-if="caseItem">
      <h3>参与人</h3>
      <div class="person" v-for="p in participants" :key="p.name">
        <div>
          <strong>{{ p.name }}</strong>
          <div class="hint">{{ p.role }}</div>
        </div>
        <span class="tag" :class="p.online ? 'tag-ok' : 'tag-warn'">{{ p.online ? '在线' : '待入' }}</span>
      </div>
    </section>

    <section class="paper-card panel" v-if="caseItem && joined">
      <h3>录制状态</h3>
      <div class="rec" :class="{ on: recording }">
        <span class="dot"></span>
        {{ recording ? '录制中…' : '未开始录制' }}
      </div>
      <div class="actions">
        <button class="btn btn-primary" :disabled="recording || done" @click="startRec">开始录制</button>
        <button class="btn btn-ghost" :disabled="!recording" @click="finish">结束并完成</button>
      </div>
      <p class="hint" v-if="done">仪式已完成，存证哈希：{{ caseItem.ceremonyHash || '生成中…' }}</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { store, persist, toast, pushAudit, now } from '../../store'

const route = useRoute()
const id = computed(() => route.params.id || 'WS20260902007')
const caseItem = computed(() => store.witnessings.find(w => w.id === id.value))

const idOk = ref(false)
const faceOk = ref(false)
const joined = ref(false)
const recording = ref(false)
const done = ref(false)

const participants = ref([
  { name: '张明远', role: '立遗嘱人', online: false },
  { name: '赵律师', role: '见证人', online: true },
  { name: '周业务', role: '业务员（主持）', online: true },
  { name: '继承人·张晓', role: '线上旁听', online: false },
])

onMounted(() => { store.chatContext = '立遗嘱仪式' })

function statusClass(s) {
  if (s === '已完成') return 'tag-ok'
  if (['待排期', '待审核'].includes(s)) return 'tag-warn'
  return 'tag-blue'
}

function verify() {
  idOk.value = true
  faceOk.value = true
  toast('身份核验通过')
  pushAudit(store.user.name, `仪式入会核验 ${id.value}`)
}

function join() {
  joined.value = true
  participants.value = participants.value.map(p =>
    p.name === store.user.name ? { ...p, online: true } : p
  )
  toast('已进入线上会议室')
}

function startRec() {
  recording.value = true
  toast('开始全程录音录像')
}

function finish() {
  recording.value = false
  done.value = true
  const hash = 'cer' + Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6)
  if (caseItem.value) {
    caseItem.value.status = '已完成'
    caseItem.value.ceremonyHash = hash
  }
  persist()
  pushAudit(store.user.name, `仪式录制完成 ${id.value} 哈希 ${hash}`)
  toast('仪式完成，已写入存证哈希')
}
</script>

<style scoped>
.page { padding: 14px; display: grid; gap: 12px; }
.panel { padding: 14px; display: grid; gap: 10px; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.gap { flex-wrap: wrap; }
h3 { margin: 0; font-size: 16px; }
.meta { margin: 0; padding-left: 18px; line-height: 1.7; font-size: 14px; }
.person {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px dashed rgba(0,0,0,.06);
}
.person:last-child { border-bottom: 0; }
.rec {
  display: flex; align-items: center; gap: 8px;
  padding: 12px; border-radius: 10px; background: #f4f7fb; font-weight: 600;
}
.rec.on { background: #fff1f0; color: #c62828; }
.dot {
  width: 10px; height: 10px; border-radius: 50%; background: #bbb;
}
.rec.on .dot { background: #c62828; animation: blink 1s infinite; }
@keyframes blink { 50% { opacity: .35; } }
.actions { display: flex; gap: 8px; }
.actions .btn { flex: 1; }
</style>
