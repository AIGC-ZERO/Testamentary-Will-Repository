<template>
  <div class="page">
    <div class="paper-card sheet">
      <div class="head">
        <SealLogo />
        <div>
          <h2>{{ notice.title }}</h2>
          <span class="badge">办理须知</span>
        </div>
      </div>
      <p class="lead">{{ notice.lead }}</p>
      <ol>
        <li v-for="(it, i) in notice.items" :key="i" v-html="format(it)"></li>
      </ol>
      <label class="agree">
        <input type="checkbox" v-model="ok" />
        我已阅读并同意上述办理须知与相关协议
      </label>
      <button class="btn btn-ghost btn-block next" :disabled="!ok" @click="next">下一步</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SealLogo from '../../components/SealLogo.vue'
import { NOTICES, store, toast } from '../../store'

const route = useRoute()
const router = useRouter()
const ok = ref(false)
const type = computed(() => route.params.type)
const notice = computed(() => NOTICES[type.value] || NOTICES.register)

watch(type, () => { ok.value = false; store.chatContext = notice.value.title }, { immediate: true })

function format(t) {
  return t
    .replace(/不产生新遗嘱|不对遗嘱效力|不得理解为「遗嘱有效」|前五年|唯一识别编号|24 小时/g, (m) => `<span class="em-red">${m}</span>`)
}
function next() {
  if (!ok.value) return toast('请先勾选同意')
  const map = {
    register: '/h5/register',
    witness: '/h5/witness',
    execute: '/h5/witness',
    supervise: '/h5/witness',
    manage: '/h5/witness',
    custody: '/h5/custody',
    dispute: '/h5/dispute',
    emergency: '/h5/emergency',
    consult: '/h5',
  }
  if (['execute','supervise','manage'].includes(type.value)) {
    toast('已预选对应子服务，进入见证申请')
  }
  router.push(map[type.value] || '/h5')
}
</script>

<style scoped>
.page { padding: 12px 12px 24px; }
.sheet { padding: 18px 16px 20px; }
.head { display: flex; gap: 12px; align-items: center; margin-bottom: 10px; }
h2 { margin: 0 0 8px; font-size: 22px; }
.badge {
  display: inline-flex;
  background: var(--blue);
  color: #fff;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 600;
}
.lead { color: var(--blue); line-height: 1.6; font-size: 14px; }
ol { padding-left: 18px; color: var(--ink); line-height: 1.7; font-size: 13.5px; }
li { margin-bottom: 8px; }
.agree { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; margin: 14px 0; color: var(--ink-soft); }
.next:disabled { opacity: .45; cursor: not-allowed; }
:deep(.em-red) { color: var(--danger); font-weight: 600; }
</style>
