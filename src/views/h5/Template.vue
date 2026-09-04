<template>
  <div class="page">
    <section class="paper-card panel">
      <h3>遗嘱模板问卷</h3>
      <div class="field">
        <label>遗嘱类型</label>
        <select v-model="form.willType">
          <option>打印遗嘱</option>
          <option>自书遗嘱</option>
          <option>代书遗嘱</option>
        </select>
      </div>
      <div class="field" v-for="q in TEMPLATE_QUESTIONS" :key="q.key">
        <label>{{ q.label }}</label>
        <input v-model="form.answers[q.key]" :placeholder="q.placeholder" />
      </div>
      <button class="btn btn-primary btn-block" @click="generate">生成草稿预览</button>
    </section>

    <section class="paper-card panel" v-if="form.draftText">
      <h3>草稿预览</h3>
      <pre class="draft">{{ form.draftText }}</pre>
      <button class="btn btn-ghost btn-block" @click="finalize">定稿到剪贴板</button>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { store, toast, pushAudit, TEMPLATE_QUESTIONS } from '../../store'

const form = reactive({
  willType: store.draft.template.willType || '打印遗嘱',
  answers: { ...store.draft.template.answers },
  draftText: store.draft.template.draftText || '',
})

onMounted(() => {
  store.chatContext = '遗嘱模板'
  TEMPLATE_QUESTIONS.forEach(q => {
    if (form.answers[q.key] === undefined) form.answers[q.key] = ''
  })
})

function generate() {
  const a = form.answers
  form.draftText = [
    `立遗嘱人：${store.user.name}`,
    `遗嘱形式：${form.willType}`,
    '',
    `一、本人指定继承人为：${a.heirs || '（待填写）'}。`,
    `二、主要遗产范围包括：${a.estate || '（待填写）'}。`,
    `三、排除继承人说明：${a.exclude || '无'}。`,
    `四、特殊安排：${a.special || '无'}。`,
    '',
    '本草稿不构成法律效力意见；正式订立请按平台见证/登记流程办理。',
  ].join('\n')
  store.draft.template = {
    willType: form.willType,
    answers: { ...form.answers },
    draftText: form.draftText,
  }
  toast('草稿已生成')
}

async function finalize() {
  if (!form.draftText) return toast('请先生成草稿')
  try {
    await navigator.clipboard.writeText(form.draftText)
    toast('已定稿并复制到剪贴板')
  } catch {
    toast('已定稿（请手动复制内容）')
  }
  pushAudit(store.user.name, `遗嘱模板定稿（${form.willType}）`)
}
</script>

<style scoped>
.page { padding: 14px; display: grid; gap: 12px; }
.panel { padding: 14px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: 16px; }
.draft {
  margin: 0;
  white-space: pre-wrap;
  font-family: var(--display, 'Songti SC', serif);
  font-size: 13px;
  line-height: 1.7;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid rgba(47,110,196,.12);
}
</style>
