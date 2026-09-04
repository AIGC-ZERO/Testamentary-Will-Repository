<template>
  <div class="phone">
    <div class="notch-bar">
      <span>09:03</span>
      <span class="mid">中国电信 5G</span>
      <span>100%</span>
    </div>
    <header class="nav">
      <button class="icon-btn" @click="onBack" aria-label="返回">{{ backIcon }}</button>
      <div class="title">{{ title }}</div>
      <button class="icon-btn" @click="$emit('more')" aria-label="更多">···</button>
    </header>
    <main class="body cloud-bg">
      <slot />
    </main>
    <ChatFloat v-if="chat" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import ChatFloat from './ChatFloat.vue'

const props = defineProps({
  title: { type: String, default: '遗嘱库' },
  backIcon: { type: String, default: '‹' },
  chat: { type: Boolean, default: true },
  backTo: { type: String, default: '' },
})
defineEmits(['more'])
const router = useRouter()
function onBack() {
  if (props.backTo) router.push(props.backTo)
  else if (window.history.length > 1) router.back()
  else router.push('/h5')
}
</script>

<style scoped>
.phone {
  width: min(420px, 100%);
  height: min(860px, calc(100vh - 40px));
  margin: 0 auto;
  background: #111;
  border-radius: 28px;
  padding: 10px;
  box-shadow: 0 30px 80px rgba(0,0,0,.45);
  display: flex;
  flex-direction: column;
}
.notch-bar {
  display: flex;
  justify-content: space-between;
  color: #d7e6f7;
  font-size: 11px;
  padding: 4px 14px 8px;
}
.mid { opacity: .75; }
.nav {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  background: #fff;
  border-radius: 18px 18px 0 0;
  min-height: 48px;
  padding: 0 6px;
}
.title { text-align: center; font-weight: 700; font-size: 16px; }
.icon-btn {
  border: 0;
  background: transparent;
  font-size: 22px;
  color: #222;
  height: 40px;
}
.body {
  flex: 1;
  overflow: auto;
  border-radius: 0 0 18px 18px;
  position: relative;
}
</style>
