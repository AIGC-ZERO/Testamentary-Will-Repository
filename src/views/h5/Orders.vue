<template>
  <div class="simple-page">
    <div class="simple-header">
      <button class="back-btn" type="button" @click="$router.back()">←</button>
      <h2>我的订单</h2>
    </div>

    <div v-if="store.orders.length" class="order-list">
      <div v-for="o in store.orders" :key="o.id" class="list-card">
        <div class="title">{{ o.title }}</div>
        <div class="meta">订单号：{{ o.id }}</div>
        <div class="meta">金额：¥{{ o.amount }} · {{ o.status }}</div>
        <div class="meta">时间：{{ o.at }}</div>
      </div>
    </div>
    <div v-else class="empty-tip">暂无订单记录</div>
  </div>
</template>

<script setup>
import { store } from '../../store'
</script>

<style scoped>
.order-list { margin-top: 8px; }
</style>
