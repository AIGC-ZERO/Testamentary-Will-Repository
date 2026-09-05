<template>
  <div class="login" :class="`theme-${adminTheme}`">
    <canvas v-show="adminTheme === 'tech'" ref="bgCanvas" class="bg-canvas"></canvas>
    <div v-if="adminTheme === 'tech'" class="scanline"></div>
    <div v-if="adminTheme === 'aurora'" class="aurora-sky">
      <i class="blob b1"></i>
      <i class="blob b2"></i>
      <i class="blob b3"></i>
    </div>

    <div class="theme-switch login-switch">
      <button type="button" class="ts-btn" :class="{ on: adminTheme === 'light' }" @click="setAdminTheme('light')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <span>经典</span>
      </button>
      <button type="button" class="ts-btn" :class="{ on: adminTheme === 'tech' }" @click="setAdminTheme('tech')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
        <span>深蓝</span>
      </button>
      <button type="button" class="ts-btn" :class="{ on: adminTheme === 'aurora' }" @click="setAdminTheme('aurora')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 5.7 5.7 1.9-5.7 1.9L12 18.2l-1.9-5.7-5.7-1.9 5.7-1.9z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg>
        <span>极光</span>
      </button>
    </div>

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

      <button class="btn btn-primary submit" type="button" :disabled="loading" @click="submit">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? '安全验证中…' : '登 录' }}
      </button>

      <div class="hint">
        开发账号：admin01 / reviewer01 / agent01（详见 docs/backend）
      </div>
      <button class="link" type="button" @click="$router.push('/')">返回门户</button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SealLogo from '../../components/SealLogo.vue'
import { loginAdmin } from '../../api/auth'
import { store, persist, toast } from '../../store'
import { ApiError } from '../../api/http'
import { adminTheme, setAdminTheme } from '../../admin-theme'

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

/* ---------- 科技主题: 粒子网络背景 ---------- */
const bgCanvas = ref(null)
let raf = 0
let particles = []
let ctx = null

function resize() {
  const c = bgCanvas.value
  if (!c) return
  c.width = c.offsetWidth * window.devicePixelRatio
  c.height = c.offsetHeight * window.devicePixelRatio
}

function initParticles() {
  const c = bgCanvas.value
  if (!c) return
  const n = Math.min(90, Math.floor((c.offsetWidth * c.offsetHeight) / 16000))
  particles = Array.from({ length: n }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    vx: (Math.random() - 0.5) * 0.35 * window.devicePixelRatio,
    vy: (Math.random() - 0.5) * 0.35 * window.devicePixelRatio,
    r: (Math.random() * 1.6 + 0.6) * window.devicePixelRatio,
  }))
}

function tick() {
  const c = bgCanvas.value
  if (!c || !ctx) return
  ctx.clearRect(0, 0, c.width, c.height)
  const linkDist = 130 * window.devicePixelRatio
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0 || p.x > c.width) p.vx *= -1
    if (p.y < 0 || p.y > c.height) p.vy *= -1
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(56, 189, 248, 0.75)'
    ctx.fill()
  }
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i]
      const b = particles[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const d = Math.hypot(dx, dy)
      if (d < linkDist) {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.28 * (1 - d / linkDist)})`
        ctx.lineWidth = window.devicePixelRatio * 0.7
        ctx.stroke()
      }
    }
  }
  raf = requestAnimationFrame(tick)
}

function startBg() {
  const c = bgCanvas.value
  if (!c) return
  ctx = c.getContext('2d')
  resize()
  initParticles()
  cancelAnimationFrame(raf)
  tick()
}

function stopBg() {
  cancelAnimationFrame(raf)
}

watch(adminTheme, t => {
  if (t === 'tech') requestAnimationFrame(startBg)
  else stopBg()
})

onMounted(() => {
  window.addEventListener('resize', resize)
  if (adminTheme.value === 'tech') startBg()
})

onBeforeUnmount(() => {
  stopBg()
  window.removeEventListener('resize', resize)
})
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(160deg, #e8f1fa 0%, #f5f8fc 45%, #eef4fa 100%);
  position: relative;
  overflow: hidden;
  transition: background 0.4s ease;
}

/* ---------- 科技主题场景 ---------- */
.login.theme-tech {
  background:
    radial-gradient(1000px 480px at 80% -10%, rgba(59, 130, 246, 0.22), transparent 60%),
    radial-gradient(800px 420px at 10% 110%, rgba(34, 211, 238, 0.14), transparent 55%),
    #050b1d;
}
.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.scanline {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0 3px,
    rgba(120, 180, 255, 0.025) 3px 4px
  );
}

.login-switch {
  position: absolute;
  top: 20px;
  right: 24px;
  z-index: 5;
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid rgba(47, 110, 196, 0.2);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
}
.theme-tech .login-switch {
  border-color: rgba(72, 152, 255, 0.3);
  background: rgba(8, 18, 48, 0.6);
}
.ts-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #6a7d90;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.22s ease;
}
.ts-btn svg { width: 14px; height: 14px; }
.ts-btn.on {
  background: #ffffff;
  color: #1a3a5c;
  box-shadow: 0 2px 8px rgba(36, 79, 120, 0.18);
}
.theme-tech .ts-btn { color: #8299c4; }
.theme-tech .ts-btn.on {
  background: linear-gradient(135deg, #2563eb, #0891b2);
  color: #fff;
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.4);
}

/* ---------- 登录卡 ---------- */
.card {
  width: min(420px, 100%);
  background: #fff;
  border-radius: 16px;
  padding: 30px 26px;
  box-shadow: 0 16px 40px rgba(36, 79, 120, 0.12);
  border: 1px solid rgba(47, 110, 196, 0.12);
  display: grid;
  gap: 14px;
  position: relative;
  z-index: 2;
  animation: card-in 0.5s cubic-bezier(0.22, 0.9, 0.32, 1) both;
}
@keyframes card-in {
  from { opacity: 0; transform: translateY(18px) scale(0.985); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.theme-tech .card {
  background: rgba(12, 24, 52, 0.72);
  border: 1px solid rgba(56, 189, 248, 0.3);
  box-shadow: 0 24px 64px rgba(2, 8, 26, 0.65), 0 0 32px rgba(34, 211, 238, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.theme-tech .card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.7), transparent);
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
.theme-tech h1 { color: #eaf2ff; }
.brand p {
  margin: 4px 0 0;
  color: #6a7d90;
  font-size: 13px;
}
.theme-tech .brand p { color: #8299c4; }

label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  color: #5a6d80;
}
.theme-tech label { color: #a9c8ff; }
input {
  height: 44px;
  border: 1px solid #d7e2ef;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 15px;
  background: #f8fbfe;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
input:focus {
  border-color: #2f6ec4;
  box-shadow: 0 0 0 3px rgba(47, 110, 196, 0.15);
}
.theme-tech input {
  background: rgba(8, 18, 48, 0.8);
  border-color: rgba(72, 152, 255, 0.3);
  color: #d9e6ff;
}
.theme-tech input::placeholder { color: #5b719c; }
.theme-tech input:focus {
  border-color: #22d3ee;
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

.submit {
  height: 46px;
  border: 0;
  border-radius: 10px;
  background: #2f6ec4;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.15em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.submit:hover:not(:disabled) { filter: brightness(1.06); }
.submit:disabled { opacity: 0.65; cursor: not-allowed; }
.theme-tech .submit {
  background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%);
  box-shadow: 0 6px 22px rgba(37, 99, 235, 0.4);
}
.theme-tech .submit:hover:not(:disabled) {
  box-shadow: 0 8px 28px rgba(34, 211, 238, 0.5);
  transform: translateY(-1px);
}

.spinner {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.hint {
  font-size: 12px;
  color: #8a9aac;
  line-height: 1.5;
}
.theme-tech .hint { color: #5b719c; }
.link {
  border: 0;
  background: transparent;
  color: #2f6ec4;
  cursor: pointer;
  font-size: 13px;
}
.theme-tech .link { color: #7dd3fc; }

/* ---------- 极光主题场景 (浅色) ---------- */
.login.theme-aurora {
  background:
    radial-gradient(760px 380px at 8% -6%, rgba(139, 92, 246, 0.18), transparent 62%),
    radial-gradient(820px 420px at 96% 10%, rgba(217, 70, 239, 0.14), transparent 60%),
    radial-gradient(720px 460px at 50% 116%, rgba(34, 211, 238, 0.14), transparent 58%),
    #f7f5ff;
}
.aurora-sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}
.blob.b1 {
  width: 46vw; height: 46vw; min-width: 420px; min-height: 420px;
  top: -14%; left: -8%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.28), transparent 66%);
  animation: blob-drift 22s ease-in-out infinite;
}
.blob.b2 {
  width: 42vw; height: 42vw; min-width: 380px; min-height: 380px;
  top: 6%; right: -10%;
  background: radial-gradient(circle, rgba(217, 70, 239, 0.22), transparent 66%);
  animation: blob-drift 27s ease-in-out infinite reverse;
}
.blob.b3 {
  width: 48vw; height: 48vw; min-width: 440px; min-height: 440px;
  bottom: -22%; left: 28%;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.2), transparent 66%);
  animation: blob-drift-alt 30s ease-in-out infinite;
}
@keyframes blob-drift {
  0%   { transform: translate3d(-5%, -3%, 0) scale(1); }
  50%  { transform: translate3d(4%, 5%, 0) scale(1.1); }
  100% { transform: translate3d(-5%, -3%, 0) scale(1); }
}
@keyframes blob-drift-alt {
  0%   { transform: translate3d(3%, 4%, 0) scale(1.06); }
  50%  { transform: translate3d(-4%, -4%, 0) scale(0.97); }
  100% { transform: translate3d(3%, 4%, 0) scale(1.06); }
}
.theme-aurora .login-switch {
  border-color: rgba(124, 93, 220, 0.28);
  background: rgba(255, 255, 255, 0.65);
}
.theme-aurora .ts-btn { color: #6f6892; }
.theme-aurora .ts-btn.on {
  background: linear-gradient(135deg, #7c3aed, #c026d3);
  color: #fff;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
}
.theme-aurora .card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.9);
  outline: 1px solid rgba(124, 93, 220, 0.2);
  box-shadow: 0 20px 56px rgba(80, 60, 160, 0.18);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.theme-aurora .card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 2px;
  border-radius: 16px 16px 0 0;
  background: linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.7), rgba(34, 211, 238, 0.6), rgba(217, 70, 239, 0.65), transparent);
}
.theme-aurora h1 { color: #241f3d; }
.theme-aurora .brand p { color: #6f6892; }
.theme-aurora label { color: #4a4370; }
.theme-aurora input {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(124, 93, 220, 0.3);
  color: #2d2946;
}
.theme-aurora input::placeholder { color: #a39cc4; }
.theme-aurora input:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.14);
}
.theme-aurora .submit {
  background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);
  box-shadow: 0 6px 22px rgba(124, 58, 237, 0.38);
  position: relative;
  overflow: hidden;
}
.theme-aurora .submit::after {
  content: '';
  position: absolute;
  top: 0;
  left: -70%;
  width: 45%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-20deg);
  animation: submit-sheen 2.8s ease-in-out infinite;
}
@keyframes submit-sheen {
  0%   { left: -70%; }
  55%  { left: 130%; }
  100% { left: 130%; }
}
.theme-aurora .submit:hover:not(:disabled) {
  box-shadow: 0 8px 28px rgba(192, 38, 211, 0.45);
  transform: translateY(-1px);
}
.theme-aurora .hint { color: #a39cc4; }
.theme-aurora .link { color: #7c3aed; }
</style>
