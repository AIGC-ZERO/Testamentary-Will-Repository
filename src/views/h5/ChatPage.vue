<template>
  <div class="simple-page">
    <div class="simple-header">
      <button class="back-btn" type="button" @click="$router.back()">←</button>
      <h2>聊天消息</h2>
    </div>

    <div class="chat-list">
      <div v-for="(m, i) in messages" :key="i" class="list-card" :class="{ unread: m.unread }">
        <div class="title">{{ m.from }}</div>
        <div class="preview">{{ m.text }}</div>
        <div class="meta">{{ m.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const messages = ref([
  { from: '在线客服', text: '您好，遗嘱见证业务一般需提前3个工作日预约。', time: '2026-09-03 09:15', unread: true },
  { from: '系统通知', text: '您的遗嘱见证申请已提交，请等待审批。', time: '2026-09-02 16:40', unread: false },
  { from: '赵律师', text: '材料已收到，请携带身份证原件到场。', time: '2026-09-01 11:20', unread: false },
  { from: '平台提醒', text: '请及时完善个人信息及生物识别认证。', time: '2026-08-30 08:00', unread: false },
])
</script>

<style scoped>
.chat-list { margin-top: 8px; }
.preview { font-size: 13px; color: #666; margin: 4px 0; }
.list-card.unread { border-left: 3px solid var(--blue); }
</style>
