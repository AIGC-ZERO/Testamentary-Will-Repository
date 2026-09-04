<template>
  <div class="chat-root">
    <button class="fab" @click="open" title="客服咨询">客服</button>
    <div v-if="store.chatOpen" class="panel paper-card">
      <header>
        <div>
          <strong>在线客服</strong>
          <div class="ctx">上下文：{{ store.chatContext }}</div>
        </div>
        <button class="x" @click="store.chatOpen=false">×</button>
      </header>
      <div class="msgs" ref="box">
        <div v-for="(m,i) in store.chatMessages" :key="i" class="msg" :class="m.from">
          {{ m.text }}
        </div>
      </div>
      <div class="quick">
        <button v-for="q in quick" :key="q" class="btn btn-sm btn-ghost" @click="ask(q)">{{ q }}</button>
      </div>
      <form class="composer" @submit.prevent="ask(text); text=''">
        <input v-model="text" placeholder="请输入您的问题…" />
        <button class="btn btn-sm btn-primary" type="submit">发送</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { store, toast } from '../store'

const text = ref('')
const box = ref(null)
const quick = ['如何补件？', '见证费用？', '排期多久？', '转人工']

function open() {
  store.chatOpen = true
}
function reply(q) {
  const map = {
    '如何补件？': '审核员发起补件后，您会收到短信。进入「我的业务」找到对应案件，上传缺失材料即可重新提交。',
    '见证费用？': '常见费用区间 3,000–12,000 元，以实际套餐与子服务为准。支付后 24 小时内有效。',
    '排期多久？': '材料齐全并通过审核后，业务员一般 1–3 个工作日联系排期。可线上参加仪式。',
    '转人工': '已为您转接人工坐席。工作时间将有客服接管本会话。',
  }
  return map[q] || `已收到关于「${store.chatContext}」的问题：「${q}」。系统将自动应答，复杂事项可转人工。`
}
async function ask(q) {
  if (!q?.trim()) return
  store.chatMessages.push({ from: 'me', text: q })
  await nextTick()
  if (box.value) box.value.scrollTop = box.value.scrollHeight
  setTimeout(async () => {
    store.chatMessages.push({ from: 'bot', text: reply(q) })
    await nextTick()
    if (box.value) box.value.scrollTop = box.value.scrollHeight
    if (q.includes('人工')) toast('已转接人工坐席')
  }, 450)
}
</script>

<style scoped>
.chat-root { pointer-events: none; }
.chat-root > * { pointer-events: auto; }
.fab {
  position: fixed;
  right: max(14px, calc(50% - 240px + 14px));
  bottom: calc(18px + env(safe-area-inset-bottom, 0px));
  z-index: 1200;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 0;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(145deg, #4d8de0, #2f6ec4);
  box-shadow: 0 12px 24px rgba(47,110,196,.35);
}
.panel {
  position: fixed;
  left: max(10px, calc(50% - 240px + 10px));
  right: max(10px, calc(50% - 240px + 10px));
  bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  z-index: 1201;
  display: flex;
  flex-direction: column;
  max-height: min(58vh, 480px);
  overflow: hidden;
  max-width: 460px;
  margin: 0 auto;
}
@media (max-width: 480px) {
  .fab { right: 14px; }
  .panel { left: 10px; right: 10px; max-width: none; }
}
header {
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--line);
}
.ctx { font-size: 12px; color: var(--muted); margin-top: 2px; }
.x { border: 0; background: transparent; font-size: 22px; }
.msgs { flex: 1; overflow: auto; padding: 12px; display: grid; gap: 8px; }
.msg {
  max-width: 85%;
  padding: 8px 10px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}
.msg.bot { background: var(--blue-soft); color: var(--ink); justify-self: start; }
.msg.me { background: var(--blue); color: #fff; justify-self: end; }
.quick { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 12px 8px; }
.composer {
  display: flex;
  gap: 8px;
  padding: 10px 12px 12px;
  border-top: 1px solid var(--line);
}
.composer input {
  flex: 1;
  border: 1px solid rgba(59,125,216,.25);
  border-radius: 10px;
  padding: 8px 10px;
}
</style>
