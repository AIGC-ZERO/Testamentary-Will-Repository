<template>
  <div class="page">
    <section class="paper-card panel">
      <h3>紧急口头修改</h3>
      <p class="hint">录制口头修改视频并上传。系统将短信通知管理人与立遗嘱人。</p>
      <div class="upload-box" :class="{ filled: form.uploaded }" @click="upload">
        <div>
          <div class="ico">🎥</div>
          <div>{{ form.uploaded ? '口头修改视频已上传' : '点击上传口头修改视频' }}</div>
        </div>
      </div>
      <div class="field">
        <label>备注说明</label>
        <textarea v-model="form.note" placeholder="简述修改意图、紧急原因" />
      </div>
      <p class="em-red">紧急状况解除后，请联系业务员走正式修改/见证流程。</p>
      <button class="btn btn-primary btn-block" @click="submit">提交紧急修改</button>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const form = reactive({ ...store.draft.emergency })

onMounted(() => { store.chatContext = '紧急修改遗嘱' })

function upload() {
  form.uploaded = true
  toast('视频已上传')
}

function submit() {
  if (!form.uploaded) return toast('请先上传口头修改视频')
  const at = now()
  const nextId = (store.sms[0]?.id || 0) + 1
  store.sms.unshift(
    {
      id: nextId,
      to: '管理人·林倩',
      tpl: '紧急修改通知',
      content: `立遗嘱人${store.user.name}发起紧急遗嘱修改，请联系确认。备注：${form.note || '无'}`,
      status: '成功',
      at,
    },
    {
      id: nextId + 1,
      to: store.user.name,
      tpl: '紧急修改回执',
      content: '您已提交紧急口头修改视频。24 小时内可联系平台撤销。',
      status: '成功',
      at,
    },
  )
  store.draft.emergency = { uploaded: false, note: '' }
  form.uploaded = false
  form.note = ''
  persist()
  pushAudit(store.user.name, '提交紧急口头修改视频并通知管理人')
  toast('已提交，短信已发送给管理人与立遗嘱人')
}
</script>

<style scoped>
.page { padding: 14px; display: grid; gap: 12px; }
.panel { padding: 14px; display: grid; gap: 12px; }
h3 { margin: 0; font-size: 16px; }
.ico { font-size: 28px; margin-bottom: 6px; }
</style>
