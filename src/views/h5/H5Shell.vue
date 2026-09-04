<template>
  <div class="h5-app">
    <div class="h5-stage">
      <router-view />
      <ChatFloat v-if="showChat" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import ChatFloat from '../../components/ChatFloat.vue'

const route = useRoute()
const showChat = computed(() => !['h5-login', 'h5-register'].includes(route.name))

onMounted(() => {
  document.documentElement.classList.add('h5-mode')
  document.body.classList.add('h5-mode')
})
onUnmounted(() => {
  document.documentElement.classList.remove('h5-mode')
  document.body.classList.remove('h5-mode')
})
</script>

<style scoped>
.h5-app {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: var(--page, #f7f8fa);
  overflow-x: hidden;
}
.h5-stage {
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
  min-height: 100dvh;
  margin: 0 auto;
  background: var(--page, #f7f8fa);
  position: relative;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.03);
}
@media (max-width: 480px) {
  .h5-stage {
    max-width: 100%;
    box-shadow: none;
  }
}
</style>
