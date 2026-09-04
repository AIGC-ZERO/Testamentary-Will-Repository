<template>
  <div class="simple-page">
    <div class="simple-header">
      <button class="back-btn" type="button" @click="$router.back()">←</button>
      <h2>{{ title }}</h2>
    </div>

    <p class="desc">{{ desc }}</p>

    <div v-if="items?.length" class="item-list">
      <div v-for="(item, i) in items" :key="i" class="list-card">
        <div class="title">{{ item.title || item }}</div>
        <div v-if="item.meta" class="meta">{{ item.meta }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '页面' },
  desc: { type: String, default: '' },
  items: { type: Array, default: () => [] },
})
</script>

<style scoped>
.desc {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 16px;
}
.item-list { margin-top: 8px; }
</style>
