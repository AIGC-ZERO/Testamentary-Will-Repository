<template>
  <div class="agree-page">
    <div class="toolbar">
      <button class="back" @click="$router.push('/h5')">‹ 返回</button>
      <span>{{ meta.title }}</span>
      <button class="link" @click="$router.push(`/h5/apply/${type}`)">申请表</button>
    </div>

    <div class="doc">
      <h1>{{ meta.title }}委托协议</h1>
      <div class="doc-no">遗嘱库协议：20{{ meta.code }}号</div>

      <section class="party">
        <div class="line">
          <strong>委托方：(下称甲方，遗嘱人)</strong>
          <u class="fill">{{ form.partyA }}</u>
        </div>
        <div class="grid2">
          <label>地址：<input v-model="form.address" /></label>
          <label>电话：<input v-model="form.phone" /></label>
        </div>
        <label>邮箱：<input v-model="form.email" /></label>

        <div class="line" style="margin-top:14px">
          <strong>受托方：(下称乙方)</strong>
          <u class="fill">{{ store.partyB.name }}</u>
        </div>
        <div class="grid2">
          <label>地址：<input v-model="form.bAddress" /></label>
          <label>电话：<input v-model="form.bPhone" /></label>
        </div>
      </section>

      <h2>第一部分 名词释义</h2>
      <p>1. “服务商推选平台”是专注于遗嘱相关法律服务，储备诸多符合资质要求、信誉良好的常年合作服务供应商，连接客户与专业服务供应商的平台。</p>
      <p>2. “服务供应商”是指具备专业资质要求及良好信誉的主体，经审核纳入资源库，通过平台向客户提供专业遗嘱业务服务的提供者（如律所、律师团队、公证处、家族办公室等）。</p>

      <h2>第二部分 协议内容</h2>
      <p>乙方为专业的遗嘱业务服务商推选平台，乙方服务供应商均为乙方合作伙伴。甲方自愿在乙方服务平台中选择具体遗嘱业务的服务供应商办理业务。双方经协商一致，订立下列条款，以供双方共同遵照执行。</p>

      <p><strong>1. 甲方委托办理{{ meta.name }}业务。</strong></p>
      <p>1.1 经甲方慎重考虑，自愿通过乙方平台选择乙方以下服务供应商（统称“乙方服务供应商”），办理具体委托事项：</p>

      <div class="provider-actions">
        <button class="ghost" @click="addProvider('个人')">添加个人服务商</button>
        <button class="ghost" @click="addProvider('机构')">添加机构服务商</button>
      </div>

      <div v-if="selectedProviders.length" class="provider-list">
        <div v-for="(p,i) in selectedProviders" :key="i" class="provider-item">
          <span>{{ p.kind }} · {{ p.name }} · {{ p.phone }}</span>
          <button @click="selectedProviders.splice(i,1)">移除</button>
        </div>
      </div>
      <p v-else class="muted">尚未添加服务商（可点击上方按钮添加）</p>

      <p>甲方同意所选定的乙方服务供应商根据工作需要指派其他工作人员配合完成辅助工作。甲方同意在办理委托事项时，乙方及乙方服务供应商进行视听资料的制作。</p>

      <h3>二、委托事项</h3>
      <p>甲方委托乙方服务供应商办理如下第
        <input class="inline" v-model="form.matterNo" />
        项事宜：</p>
      <label v-for="(m,i) in MATTERS" :key="m" class="check">
        <input type="checkbox" :value="String.fromCharCode(97+i)" v-model="form.matters" />
        <span>{{ String.fromCharCode(97+i) }}. {{ m }}</span>
      </label>

      <h3>三、服务费用</h3>
      <p>1、遗产（资产）调查费：（小写￥：<input class="inline" v-model="form.fee1" /> 元整）；自本合同生效后 <input class="inline short" v-model="form.days" /> 日内支付至乙方账户。</p>
      <p>指定的特定关系人身份、身体状况调查费：（小写￥：<input class="inline" v-model="form.fee2" /> 元整）。</p>
      <p>{{ meta.name }}服务费人民币（大写）：<input class="inline wide" v-model="form.feeBig" />（小写￥：<input class="inline" v-model="form.fee3" /> 元整）。</p>
      <p>2、工作成本费用：差旅费、调查费及公告费等必要工作费用，由甲方财产承担，实报实销。</p>
      <p>3、乙方账户信息：</p>
      <div class="account">
        <label>户名：<input v-model="form.accountName" /></label>
        <label>账号：<input v-model="form.accountNo" /></label>
        <label>开户行：<input v-model="form.bank" /></label>
        <label>银行地址：<input v-model="form.bankAddr" /></label>
      </div>

      <h3>四、双方权利、义务</h3>
      <p>1、签订本协议及办理相关业务时，如需出具健康及精神状态专业医学鉴定报告，甲方应予以配合；</p>
      <p>2、甲方享有获悉委托事项进展情况的权利，并承担及时支付服务费、提供真实材料的义务。</p>
      <p>3、乙方服务供应商应依照法律和委托协议按时尽责完成委托事务并保守业务秘密。</p>
      <p>4、乙方服务供应商应妥善保管相关文件，但不对遗嘱内容的法律效力承担责任。</p>
      <p>5、在文件制作完毕后，甲方选择以下第
        <select v-model="form.pickup">
          <option value="a">a</option>
          <option value="b">b</option>
        </select>
        种方式提取：</p>
      <label class="check"><input type="radio" value="a" v-model="form.pickup" /> a、甲方自提；</label>
      <label class="check"><input type="radio" value="b" v-model="form.pickup" /> b、甲方指定他人提取</label>

      <div class="sign">
        <div>
          <div>甲方：{{ form.partyA }}</div>
          <div>日期：{{ today }}</div>
        </div>
        <div>
          <div>乙方：{{ store.partyB.name }}</div>
          <div>日期：{{ today }}</div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-primary" @click="submit">提交协议</button>
      <button class="btn btn-ghost" @click="reset">重置表单</button>
      <button class="btn btn-ghost" @click="preview">打印预览</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store, MATTERS, SERVICES, persist, toast, now, pushAudit } from '../../store'

const route = useRoute()
const router = useRouter()
const type = computed(() => route.params.type)
const meta = computed(() => SERVICES.find(s => s.key === type.value) || SERVICES[0])
const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`
})
const selectedProviders = ref([])

const form = reactive({
  partyA: store.user.name,
  address: store.user.address,
  phone: store.user.mobile,
  email: '',
  bAddress: store.partyB.address,
  bPhone: store.partyB.phone,
  matterNo: '',
  matters: [],
  fee1: '',
  fee2: '',
  fee3: '3000',
  feeBig: '叁仟元整',
  days: '3',
  accountName: '青岛天秤网络科技传媒有限公司',
  accountNo: '6222 **** **** 8899',
  bank: '中国银行青岛分行',
  bankAddr: '青岛市市南区',
  pickup: 'a',
})

watch(type, () => {
  store.chatContext = meta.value.name + '协议'
  selectedProviders.value = []
  form.matters = []
}, { immediate: true })

function addProvider(kind) {
  const name = kind === '个人' ? '赵律师' : '青岛安和律师事务所'
  const phone = kind === '个人' ? '139****2210' : '0532-88886666'
  selectedProviders.value.push({ kind, name, phone })
  toast(`已添加${kind}服务商`)
}
function reset() {
  form.matters = []
  form.matterNo = ''
  selectedProviders.value = []
  toast('表单已重置')
}
function preview() {
  toast('已打开打印预览')
  window.print()
}
function submit() {
  if (!selectedProviders.value.length) return toast('请先添加服务商')
  if (!form.matters.length) return toast('请勾选委托事项')
  const id = 'AG' + Date.now().toString().slice(-8)
  store.agreements.unshift({
    id,
    type: meta.value.key,
    title: meta.value.title + '委托协议',
    providers: [...selectedProviders.value],
    matters: [...form.matters],
    fee: form.fee3,
    status: '已提交',
    at: now(),
  })
  store.businesses.unshift({
    id: 'BZ' + Date.now().toString().slice(-8),
    type: meta.value.name,
    status: '在办',
    at: now(),
  })
  store.orders.unshift({
    id: 'ORD' + Date.now().toString().slice(-8),
    title: meta.value.name + '服务费',
    amount: Number(form.fee3) || 0,
    status: '待支付',
    at: now(),
  })
  pushAudit(store.user.name, `提交${meta.value.name}协议 ${id}`)
  persist()
  toast('协议已提交')
  router.push('/h5/business?tab=doing')
}
</script>

<style scoped>
.agree-page { min-height: 100%; background: #f7f8fa; padding-bottom: 90px; }
.toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 70px 1fr 70px;
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 10px 12px;
  font-weight: 600;
  text-align: center;
}
.back, .link { border: 0; background: transparent; color: var(--blue); font-size: 13px; }
.doc {
  margin: 12px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  padding: 18px 14px 24px;
  color: #222;
  line-height: 1.75;
  font-size: 13.5px;
}
h1 { margin: 0 0 8px; text-align: center; font-size: 20px; }
.doc-no { text-align: right; margin-bottom: 16px; color: #555; }
h2, h3 { text-align: center; margin: 18px 0 10px; font-size: 16px; }
h3 { text-align: left; font-size: 15px; }
.party label, .account label {
  display: block;
  margin: 6px 0;
}
.party input, .account input, .inline {
  border: none;
  border-bottom: 1px solid #333;
  background: transparent;
  border-radius: 0;
  padding: 2px 4px;
  min-width: 120px;
}
.inline { width: 72px; text-align: center; }
.inline.short { width: 40px; }
.inline.wide { width: 120px; }
.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.line { display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
.fill { min-width: 80px; display: inline-block; padding: 0 6px; }
.provider-actions { display: flex; gap: 10px; margin: 10px 0; flex-wrap: wrap; }
.ghost {
  border: 1px solid #ddd;
  background: #f7f7f7;
  border-radius: 6px;
  padding: 8px 12px;
  color: #666;
}
.provider-list { display: grid; gap: 8px; margin-bottom: 8px; }
.provider-item {
  display: flex;
  justify-content: space-between;
  background: #f7fbff;
  border: 1px solid #d6e4ff;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
}
.provider-item button { border: 0; background: transparent; color: var(--danger); }
.muted { color: #999; }
.check {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 6px 0;
}
.sign {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}
.actions {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: min(430px, 100%);
  bottom: 0;
  display: flex;
  gap: 8px;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -1px 3px rgba(0,0,0,.08);
}
.actions .btn { flex: 1; font-size: 13px; padding: 0 8px; }
@media print {
  .toolbar, .actions { display: none !important; }
  .agree-page { background: #fff; }
  .doc { box-shadow: none; margin: 0; }
}
</style>
