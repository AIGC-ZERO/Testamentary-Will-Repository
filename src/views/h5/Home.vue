<template>
  <div class="home-container" @focusin="store.chatContext = '首页'">
    <div class="header">
      <div class="user-name">{{ store.user.name }}您好</div>
      <div class="welcome-title">欢迎登录青岛岛城遗嘱库</div>
    </div>

    <div class="function-grid">
      <div class="function-row" v-for="(row, ri) in rows" :key="ri">
        <div
          class="function-card"
          v-for="s in row"
          :key="s.code"
          @click="goService(s)"
        >
          <div class="function-icon">{{ s.icon }}</div>
          <div class="function-name">{{ s.name }}</div>
        </div>
      </div>
    </div>

    <div class="important-info">
      <a class="emergency-contact" :href="'tel:' + store.servicePhone">
        <div class="info-icon">📞</div>
        <div class="info-content">
          <div class="info-title">24小时客服电话(点击拨打)</div>
          <div class="info-value">{{ store.servicePhone }}</div>
        </div>
      </a>

      <div class="emergency-will" @click="showUpload = true">
        <div class="info-icon">🚨</div>
        <div class="info-content">
          <div class="info-title">
            紧急遗嘱
            <span
              class="status-badge"
              :class="emergencyActive ? 'status-active' : 'status-inactive'"
            >
              {{ emergencyLabel }}
            </span>
          </div>
          <div class="info-desc">快速提交紧急遗嘱</div>
        </div>
      </div>
    </div>

    <div class="bottom-functions">
      <div class="bottom-card" @click="openChat">
        <div class="bottom-icon">💬</div>
        <div class="bottom-text">在线客服</div>
      </div>
      <div class="bottom-card" @click="$router.push('/h5/menu')">
        <div class="bottom-icon">👤</div>
        <div class="bottom-text">个人中心</div>
      </div>
    </div>

    <div v-if="showUpload" class="upload-dialog-mask" @click.self="showUpload = false">
      <div class="upload-dialog">
        <div class="dialog-header">
          <div class="dialog-title">紧急遗嘱上传</div>
          <button class="close-btn" type="button" @click="showUpload = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="upload-area" @click="pickFiles">
            <div class="upload-icon">📁</div>
            <div class="upload-text">点击选择文件（可多选）</div>
            <div class="upload-hint">支持图片、PDF、视频等格式</div>
          </div>
          <input ref="fileInput" type="file" multiple hidden @change="onFiles" />
          <div v-if="files.length" class="file-preview-list">
            <div v-for="(f, i) in files" :key="i" class="file-item">
              <div class="file-info">
                <span class="file-name">{{ f.name }}</span>
                <span class="file-size">{{ formatSize(f.size) }}</span>
              </div>
              <button class="remove-btn" type="button" @click="files.splice(i, 1)">删除</button>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn cancel" type="button" @click="showUpload = false">取消</button>
          <button class="dialog-btn confirm" type="button" :disabled="!files.length" @click="confirmUpload">
            确认上传
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { store, SERVICES, persist, toast, pushAudit, now } from '../../store'

const router = useRouter()
const showUpload = ref(false)
const files = ref([])
const fileInput = ref(null)

onMounted(() => {
  store.chatContext = '首页'
  if (!store.loggedIn) router.replace('/h5/login')
})

const rows = computed(() => [SERVICES.slice(0, 3), SERVICES.slice(3, 6)])

const emergencyActive = computed(() => store.emergencyStatus === '00')
const emergencyLabel = computed(() => {
  if (store.emergencyStatus === '00') return '已启动'
  if (store.emergencyStatus === '01') return '已执行'
  if (store.emergencyStatus === '11') return '已取消'
  return '未启动'
})

function goService(s) {
  store.chatContext = s.name
  const has = store.businesses.some((b) => b.businessCode === s.code)
  if (has) {
    router.push(`/h5/business-list/${s.code}`)
  } else {
    router.push(`/h5/notification/${s.code}`)
  }
}

function openChat() {
  store.chatOpen = true
  toast('已打开在线客服')
}

function pickFiles() {
  fileInput.value?.click()
}

function onFiles(e) {
  const picked = Array.from(e.target.files || [])
  files.value.push(...picked)
  e.target.value = ''
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

function confirmUpload() {
  if (!files.value.length) return
  store.emergencyStatus = '00'
  persist()
  pushAudit(store.user.name, `上传紧急遗嘱 ${files.value.length} 个文件`)
  toast('紧急遗嘱已上传，状态已启动')
  showUpload.value = false
  files.value = []
}
</script>
