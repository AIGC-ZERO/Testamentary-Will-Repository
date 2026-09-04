<template>
  <span class="seal" :style="{ width: size + 'px', height: size + 'px', fontSize: font + 'px' }">
    <span>{{ text }}</span>
  </span>
</template>

<script setup>
defineProps({
  text: { type: String, default: '岛城' },
  size: { type: Number, default: 42 },
  font: { type: Number, default: 12 },
})
</script>
