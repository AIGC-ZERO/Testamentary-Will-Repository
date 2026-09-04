<template>
  <div class="login">
    <div class="card">
      <div class="brand">
        <SealLogo :size="44" :font="12" />
        <div>
          <h1>岛城遗嘱库后台</h1>
          <p>审核员 / 业务员 / 管理员登录</p>
        </div>
      </div>

      <label>
        <span>账号</span>
        <input v-model="account" placeholder="如 admin01" autocomplete="username" />
      </label>
      <label>
        <span>密码</span>
        <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" @keyup.enter="submit" />
      </label>

      <button class="btn btn-primary" type="button" :disabled="loading" @click="submit">
        {{ loading ? '登录中…' : '登录' }}
      </button>

      <div class="hint">
        开发账号：admin01 / reviewer01 / agent01（详见 docs/backend）
      </div>
      <button class="link" type="button" @click="$router.push('/')">返回门户</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SealLogo from '../../components/SealLogo.vue'
import { loginAdmin } from '../../api/auth'
import { store, persist, toast } from '../../store'
import { ApiError } from '../../api/http'

const router = useRouter()
const route = useRoute()
const account = ref('admin01')
const password = ref('')
const loading = ref(false)

async function submit() {
  if (!account.value.trim()) return toast('请输入账号')
  if (!password.value) return toast('请输入密码')
  loading.value = true
  try {
    const data = await loginAdmin(account.value.trim(), password.value)
    store.adminUser = {
      name: data.user?.name || '管理员',
      role: data.user?.role || '管理员',
      account: data.user?.account || account.value.trim(),
    }
    persist()
    toast('登录成功')
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin'
    router.replace(redirect.startsWith('/admin') ? redirect : '/admin')
  } catch (err) {
    toast(err instanceof ApiError ? err.message : '登录失败，请确认后端已启动')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(160deg, #e8f1fa 0%, #f5f8fc 45%, #eef4fa 100%);
}
.card {
  width: min(420px, 100%);
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 16px 40px rgba(36, 79, 120, 0.12);
  border: 1px solid rgba(47, 110, 196, 0.12);
  display: grid;
  gap: 14px;
}
.brand {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 8px;
}
h1 {
  margin: 0;
  font-size: 20px;
  color: #1a3a5c;
}
.brand p {
  margin: 4px 0 0;
  color: #6a7d90;
  font-size: 13px;
}
label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: #5a6d80;
}
input {
  height: 44px;
  border: 1px solid #d7e2ef;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 15px;
  background: #f8fbfe;
}
.btn {
  height: 44px;
  border: 0;
  border-radius: 10px;
  background: #2f6ec4;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.btn:disabled { opacity: 0.65; cursor: not-allowed; }
.hint {
  font-size: 12px;
  color: #8a9aac;
  line-height: 1.5;
}
.link {
  border: 0;
  background: transparent;
  color: #2f6ec4;
  cursor: pointer;
  font-size: 13px;
}
</style>
