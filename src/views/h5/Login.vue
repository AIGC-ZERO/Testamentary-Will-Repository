<template>
  <div class="login-page">
    <div class="login-container">
      <h1 class="login-header">欢迎登录岛城遗嘱库</h1>

      <div class="login-tabs">
        <div class="tab-item" :class="{ active: tab==='sms' }" @click="tab='sms'">验证码登录</div>
        <div class="tab-item" :class="{ active: tab==='pwd' }" @click="tab='pwd'">密码登录</div>
      </div>

      <div class="login-form">
        <div class="form-item">
          <input v-model="mobile" placeholder="请输入手机号" maxlength="11" />
        </div>

        <div class="form-item code-item" v-if="tab==='sms'">
          <input v-model="code" placeholder="请输入验证码" maxlength="6" />
          <button class="send-code-btn" type="button" @click="sendCode">{{ counting ? `${count}s` : '获取验证码' }}</button>
        </div>
        <div class="form-item" v-else>
          <input v-model="password" type="password" placeholder="请输入密码" />
        </div>

        <div class="form-item">
          <select v-model="role" class="identity-select">
            <option value="0">用户</option>
            <option value="1">加盟人</option>
            <option value="2">管理员</option>
            <option value="3">合作伙伴</option>
          </select>
        </div>

        <button class="login-btn" @click="login">登录</button>
      </div>

      <div class="login-footer">
        <button class="register-btn" @click="$router.push('/h5/register')">注册账号</button>
        <div class="agreement">
          登录即表示您同意<span>用户协议</span>和<span>隐私政策</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { store, persist, toast } from '../../store'

const router = useRouter()
const tab = ref('pwd')
const mobile = ref('')
const password = ref('')
const code = ref('')
const role = ref('0')
const counting = ref(false)
const count = ref(60)

function sendCode() {
  if (counting.value) return
  if (!/^1\d{10}$/.test(mobile.value)) return toast('请输入正确手机号')
  counting.value = true
  count.value = 60
  toast('验证码已发送')
  const t = setInterval(() => {
    count.value--
    if (count.value <= 0) { clearInterval(t); counting.value = false }
  }, 1000)
}

function login() {
  if (!/^1\d{10}$/.test(mobile.value)) {
    return toast('请输入正确手机号')
  }
  if (tab.value === 'pwd' && !password.value) {
    return toast('请输入密码')
  }
  if (tab.value === 'sms' && !/^\d{4,6}$/.test(code.value)) {
    return toast('请输入验证码')
  }
  if (role.value === '2') {
    toast('正在跳转管理后台')
    return router.push('/admin')
  }
  store.loggedIn = true
  store.user.mobile = mobile.value
  if (!store.user.name || store.user.name === '注册用户') {
    store.user.name = '用户' + mobile.value.slice(-4)
  }
  persist()
  toast('登录成功')
  router.push('/h5')
}
</script>

<style scoped>
.login-page {
  min-height: 100%;
  background: #fff;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 24px 32px;
}
.login-container { width: 100%; max-width: 360px; }
.login-header {
  margin: 0 0 28px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #333;
}
.login-tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 22px;
  border-bottom: 1px solid #f0f0f0;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  color: #999;
  font-size: 15px;
  cursor: pointer;
  position: relative;
}
.tab-item.active {
  color: var(--blue);
  font-weight: 600;
}
.tab-item.active::after {
  content: "";
  position: absolute;
  left: 28%;
  right: 28%;
  bottom: -1px;
  height: 2px;
  background: var(--blue);
  border-radius: 2px;
}
.form-item { margin-bottom: 14px; }
.form-item input, .identity-select {
  width: 100%;
  height: 46px;
  border: none;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 0 14px;
  color: #333;
  font-size: 15px;
}
.code-item { display: flex; gap: 10px; }
.code-item input { flex: 1; }
.send-code-btn {
  border: none;
  background: #f5f5f5;
  color: var(--blue);
  border-radius: 8px;
  padding: 0 12px;
  white-space: nowrap;
  font-size: 13px;
  min-width: 96px;
}
.login-btn {
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 8px;
  background: var(--blue);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}
.login-footer { margin-top: 18px; text-align: center; }
.register-btn {
  border: none;
  background: transparent;
  color: var(--blue);
  font-size: 14px;
  margin-bottom: 16px;
}
.agreement {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}
.agreement span { color: var(--blue); }
</style>
