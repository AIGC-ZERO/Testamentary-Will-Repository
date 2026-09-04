<template>
  <div v-if="store.toast" class="toast">{{ store.toast }}</div>
  <router-view />
</template>

<script setup>
import { store } from './store'
</script>
