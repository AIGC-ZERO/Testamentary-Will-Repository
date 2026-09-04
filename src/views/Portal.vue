<template>
  <div class="portal">
    <div class="aurora"></div>
    <div class="wrap">
      <header class="hero">
        <SealLogo :size="56" :font="14" />
        <div>
          <div class="brand">岛城遗嘱库综合服务平台</div>
          <p>青岛市遗嘱登记、见证、保管与纠纷调解一体化服务入口</p>
        </div>
      </header>

      <section class="grid">
        <article class="card paper-card" @click="$router.push('/h5/login')">
          <div class="kicker">用户端 H5</div>
          <h2>手机端业务办理</h2>
          <p>登录 → 首页服务入口 → 办理须知 → 业务申请 → 协议签署 → 业务查询 → 个人中心。</p>
          <ul>
            <li>移动端自适应全屏布局</li>
            <li>遗嘱见证、执行、监管、保管等全流程</li>
            <li>紧急遗嘱、在线客服、电子票夹</li>
          </ul>
          <button class="btn btn-primary">进入用户端</button>
        </article>

        <article class="card paper-card" @click="$router.push('/admin')">
          <div class="kicker">管理端 WEB</div>
          <h2>后台审核与作业</h2>
          <p>登记审核、见证排期、业务员工作台、保管巡检、纠纷流转、加盟审核与运营统计。</p>
          <ul>
            <li>多角色权限与操作审计</li>
            <li>审核补件、排期上传、存证管理</li>
            <li>短信记录与业务统计看板</li>
          </ul>
          <button class="btn btn-primary">进入管理后台</button>
        </article>
      </section>

      <section class="meta paper-card">
        <div>
          <strong>业务模块</strong>
          <span>覆盖登记、见证、仪式、保管、纠纷、加盟等核心能力</span>
        </div>
        <div class="tags">
          <span class="tag tag-blue" v-for="t in tags" :key="t">{{ t }}</span>
        </div>
        <p class="hint">登录账号 19526955095 · 密码/验证码 123456</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import SealLogo from '../components/SealLogo.vue'
const tags = ['用户认证','模板引擎','遗嘱登记','遗嘱见证','立遗嘱仪式','审核补件','业务员工作台','遗嘱保管','遗嘱纠纷','客服','统一存证','短信','管理后台','加盟','紧急修改']
</script>

<style scoped>
.portal {
  min-height: 100vh;
  background: linear-gradient(160deg, #e8f1fa 0%, #f5f8fc 45%, #eef4fa 100%);
  position: relative;
}
.aurora {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 20%, rgba(47,110,196,.12), transparent),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(90,157,224,.1), transparent);
  pointer-events: none;
}
.wrap {
  position: relative;
  max-width: 1080px;
  margin: 0 auto;
  padding: 48px 24px 64px;
}
.hero {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 36px;
}
.brand {
  font-size: 28px;
  font-weight: 700;
  color: #1a3a5c;
  font-family: var(--font-serif, 'Noto Serif SC', serif);
}
.hero p { margin: 8px 0 0; color: #5a6d80; font-size: 15px; }
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}
.card {
  padding: 28px 24px;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(36,79,120,.12);
}
.kicker {
  font-size: 12px;
  color: #2f6ec4;
  font-weight: 600;
  letter-spacing: .05em;
  margin-bottom: 8px;
}
.card h2 { margin: 0 0 10px; color: #1a3a5c; font-size: 20px; }
.card p { color: #5a6d80; font-size: 14px; line-height: 1.6; margin: 0 0 14px; }
.card ul {
  margin: 0 0 20px;
  padding-left: 18px;
  color: #4a6078;
  font-size: 13px;
  line-height: 1.8;
}
.meta {
  padding: 20px 24px;
  display: grid;
  gap: 14px;
}
.meta strong { color: #1a3a5c; }
.meta span { margin-left: 12px; color: #6a7d90; font-size: 14px; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.hint { font-size: 13px; color: #8a9aac; margin: 0; }
@media (max-width: 768px) {
  .grid { grid-template-columns: 1fr; }
  .brand { font-size: 22px; }
}
</style>
