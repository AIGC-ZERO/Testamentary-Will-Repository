<template>
  <div class="user-main">
    <div class="header">
      <div class="user-name">{{ store.user.name }}您好</div>
      <div class="welcome-title">欢迎登录青岛岛城遗嘱库</div>
    </div>

    <div class="menu-list">
      <div
        v-for="item in MENU_ITEMS"
        :key="item.route"
        class="menu-item"
        @click="go(item.route)"
      >
        <div class="icon-container">
          <div class="css-icon" :class="item.iconClass">{{ menuIcon(item.iconClass) }}</div>
        </div>
        <div class="menu-text">{{ item.text }}</div>
        <div class="menu-arrow" />
      </div>
    </div>

    <div class="bottom-functions">
      <div class="bottom-card" @click="openChat">
        <div class="bottom-icon">💬</div>
        <div class="bottom-text">在线客服</div>
      </div>
      <div class="bottom-card" @click="$router.push('/h5')">
        <div class="bottom-icon">🏠</div>
        <div class="bottom-text">我的主页</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { store, MENU_ITEMS, toast } from '../../store'

const router = useRouter()

onMounted(() => {
  store.chatContext = '个人中心'
  if (!store.loggedIn) router.replace('/h5/login')
})

const ROUTES = {
  doing: '/h5/business-list/all?tab=doing',
  done: '/h5/business-list/all?tab=done',
  orders: '/h5/orders',
  emergency: '/h5/emergency',
  profile: '/h5/profile',
  'emergency-records': '/h5/emergency-records',
  chat: '/h5/chat',
  tickets: '/h5/tickets',
  ai: '/h5/ai',
  providers: '/h5/providers',
  agreements: '/h5/my-agreements',
}

const ICONS = {
  'icon-processing': '📋',
  'icon-completed': '✅',
  'icon-order': '🧾',
  'icon-edit': '✏️',
  'icon-user': '👤',
  'icon-emergency': '🚨',
  'icon-chat': '💬',
  'icon-ticket': '🎫',
  'icon-help': '🤖',
  'icon-witness': '⚖️',
  'icon-agreement': '📄',
}

function menuIcon(cls) {
  return ICONS[cls] || '📌'
}

function go(route) {
  const path = ROUTES[route]
  if (path) router.push(path)
}

function openChat() {
  store.chatOpen = true
  toast('已打开在线客服')
}
</script>
