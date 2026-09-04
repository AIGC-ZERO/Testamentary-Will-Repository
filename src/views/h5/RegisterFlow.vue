<template>
  <div class="page">
    <div class="stepper">
      <span v-for="(s,i) in steps" :key="s" class="step" :class="{ active: i===step, done: i<step }">{{ s }}</span>
    </div>

    <div class="paper-card panel" v-if="step===0">
      <div class="field">
        <label>遗嘱类型</label>
        <select v-model="form.type">
          <option>自书遗嘱</option>
          <option>代书遗嘱</option>
          <option>打印遗嘱</option>
          <option>录音录像遗嘱</option>
        </select>
      </div>
      <div class="field">
        <label>立遗嘱日期</label>
        <input type="date" v-model="form.date" />
      </div>
      <div class="field">
        <label>继承人概要</label>
        <input v-model="form.heirs" placeholder="如：配偶、子女姓名" />
      </div>
      <div class="field">
        <label>财产结构化摘要</label>
        <textarea v-model="form.summary" placeholder="不动产/存款/股权等概要" />
      </div>
      <div class="upload-box" :class="{ filled: form.uploaded }" @click="form.uploaded=true">
        <div>
          <div class="ico">📄</div>
          <div>{{ form.uploaded ? '材料影像已上传' : '上传遗嘱材料影像' }}</div>
        </div>
      </div>
    </div>

    <div class="paper-card panel" v-else-if="step===1">
      <h3>《遗嘱登记协议》（节选）</h3>
      <div class="agree-box">
        <p>甲方（申请人）自愿将已订立遗嘱及相关材料提交平台进行形式审查与存证。</p>
        <p>乙方（平台）提供材料接收、形式审查、编号与电子证明、安全存储与访问审计等服务。</p>
        <p class="em-red">双方确认：平台服务不构成对遗嘱法律效力的保证或公证结论。</p>
        <p>签署方式：电子签（电子签凭证 ES-{{ Date.now().toString().slice(-6) }}）。</p>
      </div>
      <label class="agree"><input type="checkbox" v-model="form.agree" /> 我已阅读并同意签署</label>
    </div>

    <div class="paper-card panel" v-else>
      <h3>提交确认</h3>
      <ul class="sum">
        <li>类型：{{ form.type }}</li>
        <li>日期：{{ form.date || '—' }}</li>
        <li>继承人：{{ form.heirs || '—' }}</li>
        <li>摘要：{{ form.summary || '—' }}</li>
        <li>材料：{{ form.uploaded ? '已上传' : '未上传' }}</li>
        <li>协议：{{ form.agree ? '已签署' : '未签署' }}</li>
      </ul>
      <p class="hint">提交后状态：已提交 → 审核中。可在「我的业务」查看进度。</p>
    </div>

    <div class="actions">
      <button v-if="step>0" class="btn btn-ghost" @click="step--">上一步</button>
      <button v-if="step<2" class="btn btn-primary" @click="forward">下一步</button>
      <button v-else class="btn btn-primary" @click="submit">提交登记</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store, persist, toast, pushAudit, now } from '../../store'

const router = useRouter()
const steps = ['填写材料', '签署协议', '确认提交']
const step = ref(0)
const form = reactive({ ...store.draft.register })
onMounted(() => { store.chatContext = '遗嘱登记表单' })

function forward() {
  if (step.value === 0 && (!form.type || !form.uploaded)) return toast('请完善类型并上传材料')
  if (step.value === 1 && !form.agree) return toast('请先签署协议')
  step.value++
}
function submit() {
  if (!store.user.realNamed) {
    toast('请先完成实名认证')
    return router.push('/h5/realname')
  }
  const id = 'RG' + now().replace(/\D/g, '').slice(0, 12)
  store.registrations.unshift({
    id,
    applicant: store.user.name,
    type: form.type,
    date: form.date || now().slice(0, 10),
    status: '审核中',
    heirs: form.heirs || '（未填）',
    summary: form.summary || '（未填）',
    materials: ['遗嘱原件影像', '身份证件'],
    hash: Math.random().toString(16).slice(2, 8) + '…' + Math.random().toString(16).slice(2, 6),
    createdAt: now(),
  })
  pushAudit(store.user.name, `提交登记 ${id}`)
  store.sms.unshift({ id: Date.now(), to: store.user.name, tpl: '登记提交通知', content: `您的登记 ${id} 已提交，等待审核`, status: '成功', at: now() })
  persist()
  toast('登记已提交')
  router.push('/h5/mine')
}
</script>

<style scoped>
.page { padding: 12px; display: grid; gap: 12px; }
.panel { padding: 14px; }
h3 { margin: 0 0 10px; }
.agree-box {
  background: rgba(255,255,255,.55);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.65;
  max-height: 260px;
  overflow: auto;
}
.agree { display: flex; gap: 8px; margin-top: 12px; font-size: 13px; }
.sum { padding-left: 18px; line-height: 1.8; font-size: 13px; }
.actions { display: flex; gap: 8px; }
.actions .btn { flex: 1; }
</style>
