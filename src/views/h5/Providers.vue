<template>
  <div class="simple-page">
    <div class="simple-header">
      <button class="back-btn" type="button" @click="$router.back()">←</button>
      <h2>我的见证人等</h2>
    </div>

    <div class="provider-list">
      <div v-for="(p, i) in store.providers" :key="i" class="list-card">
        <div class="title">{{ p.kind }} · {{ p.name }}</div>
        <div class="meta">电话：{{ p.phone }}</div>
        <div class="meta">机构：{{ p.org || '—' }}</div>
      </div>
    </div>

    <button class="submit-btn" type="button" style="margin-top:16px" @click="addProvider">添加见证人</button>
  </div>
</template>

<script setup>
import { store, persist, toast } from '../../store'

function addProvider() {
  store.providers.push({
    kind: '个人',
    name: '王律师',
    phone: '13800001234',
    org: '青岛德信律所',
  })
  persist()
  toast('已添加见证人')
}
</script>

<style scoped>
.provider-list { margin-top: 8px; }
</style>
