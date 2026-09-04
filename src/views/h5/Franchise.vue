<template>
  <div class="page">
    <section class="paper-card panel">
      <h3>加盟合作意向</h3>
      <p class="hint">律所、公证服务机构等可提交入驻意向，审核通过后入库。</p>
      <div class="field">
        <label>机构名称</label>
        <input v-model="form.name" placeholder="如：××律师事务所" />
      </div>
      <div class="field">
        <label>联系人与电话</label>
        <input v-model="form.contact" placeholder="姓名 + 手机号" />
      </div>
      <div class="field">
        <label>所在地区</label>
        <input v-model="form.region" placeholder="如：青岛市胶州市" />
      </div>
      <div class="field">
        <label>合作说明</label>
        <textarea v-model="form.note" placeholder="意向业务、资质简述" />
      </div>
      <button class="btn btn-primary btn-block" @click="submit">提交意向</button>
    </section>

    <section class="paper-card panel" v-if="store.franchises.length">
      <h3>已提交记录</h3>
      <div v-for="f in store.franchises" :key="f.id" class="item">
        <div class="row between">
          <div>
            <strong>{{ f.name }}</strong>
            <div class="hint">{{ f.contact }} · {{ f.id }}</div>
          </div>
          <span class="tag" :class="f.status === '已入库' ? 'tag-ok' : f.status === '已驳回' ? 'tag-danger' : 'tag-warn'">
            {{ f.status }}
          </span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { store, persist, toast, pushAudit, now } from '../../store'

const form = reactive({ name: '', contact: '', region: '', note: '' })

onMounted(() => { store.chatContext = '加盟合作' })

function submit() {
  if (!form.name.trim() || !form.contact.trim()) return toast('请填写机构与联系方式')
  const id = 'FR' + String(store.franchises.length + 1).padStart(3, '0')
  store.franchises.unshift({
    id,
    name: form.name,
    contact: form.contact,
    region: form.region,
    note: form.note,
    status: '待审核',
    createdAt: now(),
  })
  persist()
  pushAudit(store.user.name, `提交加盟意向 ${id} ${form.name}`)
  toast('加盟意向已提交')
  form.name = ''
  form.contact = ''
  form.region = ''
  form.note = ''
}
</script>

<style scoped>
.page { padding: 14px; display: grid; gap: 12px; }
.panel { padding: 14px; display: grid; gap: 10px; }
h3 { margin: 0; font-size: 16px; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; }
.item {
  padding: 10px 0;
  border-bottom: 1px dashed rgba(0,0,0,.08);
}
.item:last-child { border-bottom: 0; }
</style>
