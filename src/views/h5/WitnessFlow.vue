<template>
  <div class="page">
    <div class="stepper">
      <span v-for="(s,i) in steps" :key="s" class="step" :class="{ active: i===step, done: i<step }">{{ s }}</span>
    </div>

    <div class="paper-card panel" v-show="step===0">
      <h3>选择服务组合</h3>
      <div class="checks">
        <label v-for="s in allServices" :key="s"><input type="checkbox" :value="s" v-model="form.services" :disabled="s==='见证'" /> {{ s }}</label>
      </div>
      <p class="hint">「见证」为父服务必选；执行/监管/管理/保管为可选子服务。</p>
    </div>

    <div class="paper-card panel" v-show="step===1">
      <h3>见证人与角色</h3>
      <div class="field">
        <label>见证人来源</label>
        <select v-model="form.witnessSource">
          <option>平台推荐</option>
          <option>第三方录入</option>
        </select>
      </div>
      <div class="field">
        <label>见证人</label>
        <input v-model="form.witnessName" placeholder="姓名/机构名称" />
      </div>
      <div class="field" v-if="form.services.includes('执行')">
        <label>遗嘱执行人</label>
        <input v-model="form.executor" placeholder="个人/法人/其他组织" />
      </div>
      <div class="field" v-if="form.services.includes('监管')">
        <label>遗嘱监管人</label>
        <input v-model="form.supervisor" placeholder="个人/法人/其他组织" />
      </div>
      <div class="field" v-if="form.services.includes('管理')">
        <label>遗嘱管理人</label>
        <input v-model="form.manager" placeholder="个人/法人/其他组织" />
      </div>
      <label class="agree" v-if="form.services.includes('保管')">
        <input type="checkbox" v-model="form.custody" /> 同时签署《保管协议》，纳入保管台账
      </label>
    </div>

    <div class="paper-card panel" v-show="step===2">
      <h3>财产信息</h3>
      <div v-for="(p,i) in form.properties" :key="i" class="prop">
        <div class="field">
          <label>财产类型</label>
          <select v-model="p.type">
            <option>不动产</option>
            <option>银行存款</option>
            <option>证券</option>
            <option>股权</option>
            <option>其他</option>
          </select>
        </div>
        <div class="field">
          <label>描述</label>
          <input v-model="p.desc" />
        </div>
        <div class="upload-box" :class="{ filled: p.proof }" @click="p.proof=true">
          <div>{{ p.proof ? '权属证明已上传' : '上传权属证明影像' }}</div>
        </div>
      </div>
      <button class="btn btn-sm btn-ghost" @click="form.properties.push({ type:'其他', desc:'', proof:false })">+ 添加财产</button>
    </div>

    <div class="paper-card panel" v-show="step===3">
      <h3>协议与支付</h3>
      <div class="agree-box">
        <p>将签署：《遗嘱见证协议》《授权委托书》{{ form.custody ? '《保管协议》' : '' }}。</p>
        <p>电子签凭证：SIGN-{{ stamp }}</p>
      </div>
      <label class="agree"><input type="checkbox" v-model="form.agree" /> 确认签署全部协议</label>
      <div class="pay">
        <div>
          <div class="hint">应付金额</div>
          <div class="fee">¥ {{ fee.toLocaleString() }}</div>
        </div>
        <button class="btn btn-primary" :disabled="!form.agree" @click="pay">{{ form.paid ? '已支付' : '立即支付' }}</button>
      </div>
    </div>

    <div class="actions">
      <button v-if="step>0" class="btn btn-ghost" @click="step--">上一步</button>
      <button v-if="step<3" class="btn btn-primary" @click="forward">下一步</button>
      <button v-else class="btn btn-primary" @click="submit">提交申请</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { store, persist, toast, pushAudit, now } from '../../store'

const router = useRouter()
const route = useRoute()
const steps = ['选服务', '角色', '财产', '协议支付']
const step = ref(0)
const allServices = ['见证', '执行', '监管', '管理', '保管']
const form = reactive(JSON.parse(JSON.stringify(store.draft.witness)))
const stamp = Date.now().toString().slice(-8)

onMounted(() => {
  store.chatContext = '遗嘱见证表单'
  const from = route.query.pre
  if (from && allServices.includes(from) && !form.services.includes(from)) form.services.push(from)
})

const fee = computed(() => {
  let n = 3000
  if (form.services.includes('执行')) n += 2000
  if (form.services.includes('监管')) n += 1200
  if (form.services.includes('管理')) n += 1000
  if (form.services.includes('保管') || form.custody) n += 500
  return n
})

function forward() {
  if (step.value === 1 && !form.witnessName) return toast('请填写见证人')
  if (step.value === 2 && form.properties.some(p => !p.desc || !p.proof)) return toast('请完善财产与证明')
  step.value++
}
function pay() {
  if (!form.agree) return toast('请先签署协议')
  form.paid = true
  toast('支付成功')
}
function submit() {
  if (!form.paid) return toast('请先完成支付')
  const id = 'WS' + now().replace(/\D/g, '').slice(0, 12)
  const services = [...form.services]
  if (form.custody && !services.includes('保管')) services.push('保管')
  store.witnessings.unshift({
    id,
    applicant: store.user.name,
    services,
    status: '待审核',
    fee: fee.value,
    paid: true,
    witness: `${form.witnessSource}·${form.witnessName}`,
    executor: form.executor,
    schedule: '',
    agent: '',
    createdAt: now(),
  })
  if (form.custody) {
    store.custody.unshift({ willId: id, holder: store.user.name, since: now().slice(0,10), lastCheck: '—', ok: true })
  }
  pushAudit(store.user.name, `提交见证 ${id} 支付¥${fee.value}`)
  store.sms.unshift({ id: Date.now(), to: store.user.name, tpl: '见证提交通知', content: `见证申请 ${id} 已提交待审`, status: '成功', at: now() })
  persist()
  toast('见证申请已提交')
  router.push('/h5/mine')
}
</script>

<style scoped>
.page { padding: 12px; display: grid; gap: 12px; }
.panel { padding: 14px; }
h3 { margin: 0 0 10px; }
.checks { display: grid; gap: 8px; }
.checks label { display: flex; gap: 8px; align-items: center; font-size: 14px; }
.prop { padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px dashed var(--line); }
.agree-box { background: rgba(255,255,255,.55); border-radius: 10px; padding: 12px; font-size: 13px; line-height: 1.6; border: 1px solid var(--line); }
.agree { display: flex; gap: 8px; margin: 12px 0; font-size: 13px; }
.pay { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.fee { font-size: 28px; font-weight: 700; color: var(--seal); }
.actions { display: flex; gap: 8px; }
.actions .btn { flex: 1; }
</style>
