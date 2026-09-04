<template>
  <div class="page">
    <section class="paper-card panel">
      <h3>保管说明</h3>
      <ul class="list">
        <li>保管与登记共用安全存储：对象存储 + 元数据 + 哈希存证。</li>
        <li>签署《保管协议》后纳入保管台账，平台定期巡检完整性。</li>
        <li>访问行为全量审计；异常自动告警。</li>
        <li>收费500 元/年。</li>
      </ul>
      <router-link class="btn btn-ghost btn-block" to="/h5/notice/custody">阅读完整须知</router-link>
    </section>

    <section class="paper-card panel">
      <h3>我的保管台账</h3>
      <div v-if="!mine.length" class="hint">暂无保管记录</div>
      <div v-for="c in mine" :key="c.willId" class="item">
        <div class="row between">
          <div>
            <strong>{{ c.willId }}</strong>
            <div class="hint">持有人 {{ c.holder }} · 入库 {{ c.since }}</div>
          </div>
          <span class="tag" :class="c.ok ? 'tag-ok' : 'tag-danger'">{{ c.ok ? '正常' : '异常' }}</span>
        </div>
        <div class="hint">最近巡检：{{ c.lastCheck }}</div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { store } from '../../store'

const mine = computed(() => store.custody)

onMounted(() => { store.chatContext = '遗嘱保管' })
</script>

<style scoped>
.page { padding: 14px; display: grid; gap: 12px; }
.panel { padding: 14px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: 16px; }
.list { margin: 0; padding-left: 18px; line-height: 1.7; font-size: 14px; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.item {
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0,0,0,.08);
  display: grid;
  gap: 4px;
}
.item:last-child { border-bottom: 0; }
</style>
