<template>
  <div class="agreement-page">
    <div class="agreement-toolbar">
      <button type="button" style="border:0;background:transparent;color:var(--blue)" @click="router.back()">‹ 返回</button>
      <span>{{ meta.name }}委托协议</span>
      <span />
    </div>

    <h2 style="text-align:center;margin:0 0 12px">{{ meta.name }}委托协议</h2>
    <p style="text-align:right">遗嘱库协议：20{{ bizCode }}号</p>

    <p><strong>委托方：(下称甲方，遗嘱人)</strong> <u>{{ form.partyA }}</u></p>
    <p>地址：<input v-model="form.address" style="border:none;border-bottom:1px solid #333;background:transparent;width:60%" /></p>
    <p>电话：<input v-model="form.phone" style="border:none;border-bottom:1px solid #333;background:transparent;width:40%" /></p>

    <p style="margin-top:16px"><strong>受托方：(下称乙方)</strong> <u>{{ store.partyB.name }}</u></p>
    <p>地址：{{ store.partyB.address }}</p>
    <p>电话：{{ store.partyB.phone }}</p>

    <h3 style="text-align:center;margin:20px 0 10px">协议摘要</h3>
    <p>甲方委托乙方平台推荐的服务供应商办理{{ meta.name }}相关业务。主要内容包括委托事项、服务费用、双方权利义务及保密条款等。</p>

    <p><strong>一、委托服务商</strong></p>
    <p>
      <button type="button" style="padding:4px 10px;margin-right:8px" @click="addProvider('个人')">添加个人服务商</button>
      <button type="button" style="padding:4px 10px" @click="addProvider('机构')">添加机构服务商</button>
    </p>
    <div v-if="providers.length">
      <p v-for="(p, i) in providers" :key="i">
        {{ p.kind }} · {{ p.name }} · {{ p.phone }}
        <button type="button" style="border:0;background:transparent;color:red;margin-left:8px" @click="providers.splice(i, 1)">移除</button>
      </p>
    </div>

    <p><strong>二、委托事项</strong></p>
    <label v-for="(m, i) in MATTERS" :key="m" style="display:block;margin:6px 0">
      <input v-model="form.matters" type="checkbox" :value="String.fromCharCode(97 + i)" />
      {{ String.fromCharCode(97 + i) }}. {{ m }}
    </label>

    <p><strong>三、服务费用</strong></p>
    <p>服务费：（小写￥：<input v-model="form.fee" style="border:none;border-bottom:1px solid #333;width:80px;text-align:center" /> 元整）</p>

    <p><strong>四、账户信息</strong></p>
    <p>户名：<input v-model="form.accountName" style="border:none;border-bottom:1px solid #333;width:70%" /></p>
    <p>账号：<input v-model="form.accountNo" style="border:none;border-bottom:1px solid #333;width:70%" /></p>
    <p>开户行：<input v-model="form.bank" style="border:none;border-bottom:1px solid #333;width:70%" /></p>

    <div class="agreement-actions">
      <button class="btn-submit" type="button" @click="submit">提交</button>
      <button class="btn-reset" type="button" @click="reset">重置</button>
      <button class="btn-print" type="button" @click="print">打印</button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store, MATTERS, BUSINESS_MAP, persist, toast, now, pushAudit } from '../../store'

const route = useRoute()
const router = useRouter()
const providers = ref([])

const bizCode = computed(() => {
  if (route.meta?.code != null) return String(route.meta.code)
  const match = route.path.match(/(\d)/)
  return match ? match[1] : '0'
})

const meta = computed(() => BUSINESS_MAP[bizCode.value] || BUSINESS_MAP['0'])

const form = reactive({
  partyA: store.user.name,
  address: store.user.address,
  phone: store.user.mobile,
  matters: [],
  fee: '3000',
  accountName: '青岛天秤网络科技传媒有限公司',
  accountNo: '6222 **** **** 8899',
  bank: '中国银行青岛分行',
})

function addProvider(kind) {
  providers.value.push({
    kind,
    name: kind === '个人' ? '赵律师' : '青岛安和律师事务所',
    phone: kind === '个人' ? '13912342210' : '0532-88886666',
  })
  toast(`已添加${kind}服务商`)
}

function reset() {
  form.matters = []
  providers.value = []
  toast('表单已重置')
}

function print() {
  toast('已打开打印预览')
  window.print()
}

function submit() {
  if (!providers.value.length) return toast('请先添加服务商')
  if (!form.matters.length) return toast('请勾选委托事项')
  const id = 'AG' + Date.now().toString().slice(-8)
  store.agreements.unshift({
    id,
    type: bizCode.value,
    title: meta.value.name + '委托协议',
    providers: [...providers.value],
    matters: [...form.matters],
    fee: form.fee,
    status: '已提交',
    at: now(),
  })
  pushAudit(store.user.name, `提交${meta.value.name}协议 ${id}`)
  persist()
  toast('协议已提交')
  router.push(`/h5/business-list/${bizCode.value}`)
}
</script>
