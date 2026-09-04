<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>个人信息</h1>
    </div>

    <div class="profile-content">
      <div class="info-section">
        <div v-for="field in fields" :key="field.key" class="info-item">
          <div class="info-label">{{ field.label }}</div>
          <div v-if="!editing" class="info-value-text">{{ displayValue(field.key) }}</div>
          <input
            v-else
            v-model="editForm[field.key]"
            class="form-select"
            :type="field.type || 'text'"
          />
        </div>
      </div>

      <div class="info-section">
        <div class="section-title" style="margin-bottom:12px;border-left:3px solid var(--blue);padding-left:10px;font-weight:600">生物识别</div>
        <div class="bio-item">
          <span class="bio-label">人脸识别</span>
          <span :class="store.user.face ? 'bio-status-ok' : 'bio-status-no'">
            {{ store.user.face ? '已采集' : '未采集' }}
          </span>
          <button class="bio-btn" type="button" @click="capture('face')">{{ store.user.face ? '重新采集' : '采集' }}</button>
        </div>
        <div class="bio-item">
          <span class="bio-label">指纹识别</span>
          <span :class="store.user.fingerprint ? 'bio-status-ok' : 'bio-status-no'">
            {{ store.user.fingerprint ? '已采集' : '未采集' }}
          </span>
          <button class="bio-btn" type="button" @click="capture('fingerprint')">{{ store.user.fingerprint ? '重新采集' : '采集' }}</button>
        </div>
        <div class="bio-item">
          <span class="bio-label">身份证佐证</span>
          <span :class="store.user.idProof ? 'bio-status-ok' : 'bio-status-no'">
            {{ store.user.idProof ? '已上传' : '未上传' }}
          </span>
          <button class="bio-btn" type="button" @click="capture('idProof')">{{ store.user.idProof ? '重新上传' : '上传' }}</button>
          <button v-if="store.user.idProof" class="bio-btn preview-btn" type="button" @click="toast('预览身份证佐证')">预览</button>
        </div>
      </div>
    </div>

    <div class="profile-footer" :style="editing ? { display: 'flex', gap: '12px' } : {}">
      <button v-if="!editing" class="edit-btn" type="button" @click="startEdit">编辑信息</button>
      <template v-else>
        <button class="cancel-btn" type="button" @click="cancelEdit">取消</button>
        <button class="save-btn" type="button" @click="save">保存</button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { store, persist, toast } from '../../store'

const editing = ref(false)
const editForm = reactive({})

const fields = [
  { key: 'name', label: '姓名' },
  { key: 'mobile', label: '手机号' },
  { key: 'gender', label: '性别' },
  { key: 'idNo', label: '身份证号' },
  { key: 'marriage', label: '婚姻状况' },
  { key: 'address', label: '现居地址' },
  { key: 'hometown', label: '户籍地址' },
  { key: 'registerAddr', label: '注册地址' },
  { key: 'registerAt', label: '注册时间' },
]

function displayValue(key) {
  const v = store.user[key]
  if (key === 'gender') return v === '0' ? '男' : v === '1' ? '女' : v
  return v || '—'
}

function startEdit() {
  Object.assign(editForm, { ...store.user })
  editing.value = true
}

function cancelEdit() {
  editing.value = false
}

function save() {
  Object.assign(store.user, editForm)
  persist()
  editing.value = false
  toast('个人信息已保存')
}

function capture(type) {
  if (type === 'face') {
    store.user.face = true
    toast('人脸识别采集成功')
  } else if (type === 'fingerprint') {
    store.user.fingerprint = true
    toast('指纹识别采集成功')
  } else {
    store.user.idProof = true
    toast('身份证佐证已上传')
  }
  persist()
}
</script>
