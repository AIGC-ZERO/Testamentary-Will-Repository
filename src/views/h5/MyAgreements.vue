<template>
  <div class="simple-page">
    <div class="simple-header">
      <button class="back-btn" type="button" @click="$router.back()">←</button>
      <h2>我的协议</h2>
    </div>

    <div v-if="store.agreements.length" class="agreement-list">
      <div v-for="a in store.agreements" :key="a.id" class="list-card">
        <div class="title">{{ a.title }}</div>
        <div class="meta">编号：{{ a.id }} · {{ a.status }}</div>
        <div class="meta">费用：¥{{ a.fee || '—' }} · {{ a.at }}</div>
      </div>
    </div>
    <div v-else class="empty-tip">暂无协议记录，完成业务申请后可在此查看</div>
  </div>
</template>

<script setup>
import { store } from '../../store'
</script>

<style scoped>
.agreement-list { margin-top: 8px; }
</style>
