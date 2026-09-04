<template>
  <div class="page">
    <section class="paper-card panel">
      <h3>登记业务</h3>
      <div v-for="r in store.registrations" :key="r.id" class="item" @click="toggle('r'+r.id)">
        <div class="row between">
          <div>
            <strong>{{ r.id }}</strong>
            <div class="hint">{{ r.type }} · {{ r.createdAt }}</div>
          </div>
          <span class="tag" :class="statusClass(r.status)">{{ r.status }}</span>
        </div>
        <div class="detail" v-if="open === 'r'+r.id">
          <p>继承人：{{ r.heirs }}</p>
          <p>摘要：{{ r.summary }}</p>
          <p>哈希：{{ r.hash || '—' }}</p>
          <p>证明编号：{{ r.certNo || '—' }}</p>
          <p>材料：{{ (r.materials || []).join('、') }}</p>
          <button
            v-if="r.status === '退回补充'"
            class="btn btn-sm btn-primary"
            @click.stop="supplement(r)"
          >提交补件材料</button>
        </div>
      </div>
    </section>

    <section class="paper-card panel">
      <h3>见证业务</h3>
      <div v-for="w in store.witnessings" :key="w.id" class="item" @click="toggle('w'+w.id)">
        <div class="row between">
          <div>
            <strong>{{ w.id }}</strong>
            <div class="hint">{{ (w.services||[]).join('/') }} · {{ w.createdAt }}</div>
          </div>
          <span class="tag" :class="statusClass(w.status)">{{ w.status }}</span>
        </div>
        <div class="detail" v-if="open === 'w'+w.id">
          <p>见证人：{{ w.witness || '—' }}</p>
          <p>排期：{{ w.schedule || '—' }}</p>
          <p>业务员：{{ w.agent || '—' }}</p>
          <p>费用：¥ {{ w.fee }} · {{ w.paid ? '已支付' : '未支付' }}</p>
          <p>仪式哈希：{{ w.ceremonyHash || '—' }}</p>
        </div>
      </div>
    </section>

    <section class="paper-card panel">
      <h3>纠纷业务</h3>
      <div v-if="!store.disputes.length" class="hint">暂无纠纷</div>
      <div v-for="d in store.disputes" :key="d.id" class="item" @click="toggle('d'+d.id)">
        <div class="row between">
          <div>
            <strong>{{ d.id }}</strong>
            <div class="hint">{{ d.title }}</div>
          </div>
          <span class="tag tag-warn">{{ d.stage }}</span>
        </div>
        <div class="detail" v-if="open === 'd'+d.id">
          <p>承办：{{ d.owner }}</p>
          <p>更新：{{ d.updatedAt }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const open = ref('')

onMounted(() => { store.chatContext = '我的业务' })

function toggle(key) {
  open.value = open.value === key ? '' : key
}
function statusClass(s) {
  if (['已受理', '已完成', '已入库'].includes(s)) return 'tag-ok'
  if (['审核中', '待排期', '待审核', '退回补充'].includes(s)) return 'tag-warn'
  if (['驳回终止', '驳回'].includes(s)) return 'tag-danger'
  return 'tag-blue'
}
function supplement(r) {
  r.status = '审核中'
  r.materials = [...(r.materials || []), '补件·手持证件清晰照']
  persist()
  pushAudit(store.user.name, `补件提交 ${r.id} @ ${now()}`)
  toast('补件已提交，重新进入审核')
}
</script>

<style scoped>
.page { padding: 14px; display: grid; gap: 12px; }
.panel { padding: 14px; display: grid; gap: 8px; }
h3 { margin: 0 0 4px; font-size: 16px; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.item {
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0,0,0,.08);
  cursor: pointer;
}
.item:last-child { border-bottom: 0; }
.detail {
  margin-top: 8px;
  padding: 10px;
  background: #f5f8fc;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  display: grid;
  gap: 4px;
}
.detail p { margin: 0; }
</style>
