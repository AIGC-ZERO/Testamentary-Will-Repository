<template>
  <div class="screen" :class="{ flash: flashOn }">
    <div class="bg-grid"></div>
    <div class="bg-glow"></div>
    <div class="scan"></div>

    <header class="head">
      <div class="head-left">
        <button class="chip" @click="goBack">← 返回后台</button>
        <button class="chip" @click="toggleFs">{{ isFs ? '退出全屏' : '全屏' }}</button>
      </div>
      <div class="head-center">
        <div class="deco-l"></div>
        <h1>岛城遗嘱库 · 智慧运营驾驶舱</h1>
        <div class="deco-r"></div>
      </div>
      <div class="head-right">
        <div class="clock">
          <div class="date">{{ clock.date }}</div>
          <div class="time">{{ clock.time }}</div>
        </div>
      </div>
    </header>

    <div class="stage">
      <!-- 全幅地图底层（延伸至 KPI / 侧栏下方，透出毛玻璃） -->
      <section class="map-stage">
        <div class="map-toolbar">
          <div class="mod-hd-l"><i class="dia"></i><span>青岛业务一张图</span></div>
          <div class="map-actions">
            <button class="chip" :class="{ on: mapType === 'vec' }" @click="switchMap('vec')">矢量</button>
            <button class="chip" :class="{ on: mapType === 'img' }" @click="switchMap('img')">卫星影像</button>
            <button class="chip" @click="resetView">定位青岛</button>
            <button class="chip" @click="openTdtSite">天地图官网</button>
            <button class="chip" @click="showTk = !showTk">密钥</button>
          </div>
        </div>
        <div v-if="showTk" class="tk-bar float-tk">
          <input v-model="tdtTk" placeholder="粘贴天地图 Web 服务密钥 tk" />
          <button class="chip on" @click="saveTk">应用密钥</button>
          <a class="link" href="https://console.tianditu.gov.cn/" target="_blank" rel="noopener">申请密钥</a>
        </div>
        <div class="map-wrap">
          <div ref="mapEl" class="map"></div>
          <div class="map-frame tl"></div><div class="map-frame tr"></div>
          <div class="map-frame bl"></div><div class="map-frame br"></div>
          <div class="map-legend">
            <span><i class="dot hq"></i>中心</span>
            <span><i class="dot custody"></i>保管库</span>
            <span><i class="dot franchise"></i>加盟点</span>
            <span><i class="dot dispute"></i>纠纷</span>
          </div>
          <div v-if="selected" class="detail-float">
            <div class="mod-hd"><i class="dia"></i><span>点位详情</span>
              <button class="x" @click="selected = null">×</button>
            </div>
            <dl>
              <dt>名称</dt><dd>{{ selected.title }}</dd>
              <dt>类型</dt><dd>{{ selected.kindLabel }}</dd>
              <dt>区域</dt><dd>{{ selected.region }}</dd>
              <dt>状态</dt><dd>{{ selected.status }}</dd>
              <dt>说明</dt><dd>{{ selected.desc }}</dd>
            </dl>
            <div class="detail-ops">
              <button class="chip on" @click="flyTo(selected)">居中</button>
              <button class="chip" v-if="selected.kind === 'custody' && !selected.ok" @click="fixCustody">恢复正常</button>
              <button class="chip" v-if="selected.kind === 'franchise' && selected.raw?.status === '待审核'" @click="passFranchise">通过入库</button>
              <button class="chip" v-if="selected.kind === 'dispute' && selected.raw?.stage !== '已结案'" @click="advanceDispute">推进阶段</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 顶部 KPI：半透明毛玻璃 -->
      <section class="kpis">
        <button
          v-for="k in kpis"
          :key="k.key"
          class="kpi"
          :class="{ on: filter === k.key }"
          @click="setFilter(k.key)"
        >
          <div class="kpi-label">{{ k.label }}</div>
          <div class="kpi-num">{{ k.value }}</div>
          <div class="kpi-sub">{{ k.sub }}</div>
        </button>
      </section>

      <!-- 左栏浮层 -->
      <aside class="side-col left">
        <div class="side-ticker">
          <div class="ticker-track">
            <span v-for="(t, i) in tickerItems" :key="'l'+i">{{ t }}</span>
            <span v-for="(t, i) in tickerItems" :key="'lb'+i">{{ t }}</span>
          </div>
        </div>

        <div class="mod">
          <div class="mod-hd"><i class="dia"></i><span>业务结构分布</span></div>
          <div class="mod-bd bars">
            <div v-for="b in bizBars" :key="b.label" class="bar-row" @click="focusBiz(b)">
              <span class="lab">{{ b.label }}</span>
              <div class="track"><i :style="{ width: Math.max(b.pct, 8) + '%' }"></i></div>
              <b>{{ b.value }}</b>
            </div>
          </div>
        </div>

        <div class="mod grow">
          <div class="mod-hd"><i class="dia"></i><span>待办任务</span></div>
          <div class="mod-bd list">
            <div
              v-for="t in todos"
              :key="t.id"
              class="row-item"
              @click="focusTodo(t)"
            >
              <span class="lab">{{ t.tag }}</span>
              <div class="mid">
                <strong>{{ t.title }}</strong>
                <em>{{ t.meta }}</em>
              </div>
              <button class="mini" @click.stop="handleTodo(t)">处理</button>
            </div>
            <div v-if="!todos.length" class="empty">暂无待办</div>
          </div>
        </div>

        <div class="mod compact-mod">
          <div class="mod-hd"><i class="dia"></i><span>保管库状态</span></div>
          <div class="mod-bd list">
            <div
              v-for="c in store.custody"
              :key="c.willId"
              class="row-item"
              :class="{ alert: !c.ok }"
              @click="focusCustody(c)"
            >
              <span class="lab">{{ c.ok ? '正常' : '异常' }}</span>
              <div class="mid">
                <strong>{{ c.location }}</strong>
                <em>{{ c.holder }}</em>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 右栏浮层 -->
      <aside class="side-col right">
        <div class="side-ticker">
          <div class="ticker-track reverse">
            <span v-for="(t, i) in tickerItems" :key="'r'+i">{{ t }}</span>
            <span v-for="(t, i) in tickerItems" :key="'rb'+i">{{ t }}</span>
          </div>
        </div>

        <div class="mod grow">
          <div class="mod-hd"><i class="dia"></i><span>实时审计流</span></div>
          <div class="mod-bd list">
            <div v-for="(a, i) in store.audits.slice(0, 12)" :key="i" class="row-item audit">
              <span class="lab time">{{ (a.at || '').slice(5, 16) }}</span>
              <div class="mid">
                <strong>{{ a.who }}</strong>
                <em>{{ a.action }}</em>
              </div>
            </div>
          </div>
        </div>

        <div class="mod grow">
          <div class="mod-hd"><i class="dia"></i><span>短信通道</span></div>
          <div class="mod-bd list">
            <div v-for="s in store.sms.slice(0, 8)" :key="s.id" class="row-item">
              <span class="lab" :class="s.status === '成功' ? 'ok' : 'bad'">{{ s.status }}</span>
              <div class="mid">
                <strong>{{ s.tpl }}</strong>
                <em>{{ s.to }} · {{ s.content }}</em>
              </div>
              <button class="mini" @click="retrySms(s)">重发</button>
            </div>
          </div>
        </div>

        <div class="mod compact-mod">
          <div class="mod-hd"><i class="dia"></i><span>加盟网点</span></div>
          <div class="mod-bd list">
            <div
              v-for="f in store.franchises"
              :key="f.id"
              class="row-item"
              @click="focusFranchise(f)"
            >
              <span class="lab" :class="f.status === '已入库' ? 'ok' : f.status === '待审核' ? 'warn' : 'bad'">{{ f.status.slice(0, 2) }}</span>
              <div class="mid">
                <strong>{{ f.name }}</strong>
                <em>{{ f.region }}</em>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { store, persist, toast, pushAudit, now, BUSINESS_MAP } from '../../store'

const router = useRouter()
const mapEl = ref(null)
const showTk = ref(false)
const tdtTk = ref(localStorage.getItem('will-demo-tdt-tk') || '')
const mapType = ref('img')
const filter = ref('all')
const selected = ref(null)
const isFs = ref(false)
const flashOn = ref(false)
const clock = reactive({ date: '', time: '' })

const QD_CENTER = [36.0671, 120.3826]

/** 青岛业务点位（WGS84，对接天地图） */
const GEO = {
  hq: { lat: 36.0665, lng: 120.3827, region: '市南区' },
  shinanA: { lat: 36.0618, lng: 120.3882, region: '市南区' },
  shinanB: { lat: 36.0702, lng: 120.3755, region: '市南区' },
  huangdao: { lat: 35.9601, lng: 120.1945, region: '黄岛区' },
  shibei: { lat: 36.0876, lng: 120.3550, region: '市北区' },
  chengyang: { lat: 36.3074, lng: 120.3963, region: '城阳区' },
  jiaozhou: { lat: 36.2659, lng: 120.0330, region: '胶州市' },
  jimo: { lat: 36.3893, lng: 120.4470, region: '即墨区' },
}

let map = null
let layerGroups = { vec: null, img: null }
let markerLayer = null
let Lref = null
let clockTimer = null
let usingTianditu = false

const kpis = computed(() => [
  {
    key: 'all',
    label: '综合态势',
    value: store.registrations.length + store.witnessings.length + store.disputes.length,
    sub: '登记+见证+纠纷',
  },
  {
    key: 'reg',
    label: '遗嘱登记',
    value: store.registrations.length,
    sub: `待审 ${store.registrations.filter(r => ['审核中', '已提交', '退回补充'].includes(r.status)).length}`,
  },
  {
    key: 'wit',
    label: '见证案件',
    value: store.witnessings.length,
    sub: `待排期 ${store.witnessings.filter(w => w.status === '待排期').length}`,
  },
  {
    key: 'custody',
    label: '保管台账',
    value: store.custody.length,
    sub: `异常 ${store.custody.filter(c => !c.ok).length}`,
  },
  {
    key: 'dispute',
    label: '纠纷案件',
    value: store.disputes.length,
    sub: `进行中 ${store.disputes.filter(d => d.stage !== '已结案').length}`,
  },
  {
    key: 'franchise',
    label: '加盟网点',
    value: store.franchises.length,
    sub: `待审 ${store.franchises.filter(f => f.status === '待审核').length}`,
  },
])

const bizBars = computed(() => {
  const items = Object.entries(BUSINESS_MAP).map(([code, m]) => ({
    code,
    label: m.name,
    value: store.businesses.filter(b => b.businessCode === code).length,
  }))
  const max = Math.max(...items.map(i => i.value), 1)
  return items.map(i => ({ ...i, pct: Math.round((i.value / max) * 100) }))
})

const todos = computed(() => {
  const list = []
  store.registrations.filter(r => ['审核中', '已提交', '退回补充'].includes(r.status)).forEach(r => {
    list.push({ id: r.id, tag: '登记', tone: 'warn', title: `${r.applicant} · ${r.type}`, meta: r.status, type: 'reg', raw: r })
  })
  store.witnessings.filter(w => w.status === '待审核').forEach(w => {
    list.push({ id: w.id, tag: '见证', tone: 'info', title: `${w.applicant} · 待审核`, meta: w.id, type: 'wit', raw: w })
  })
  store.franchises.filter(f => f.status === '待审核').forEach(f => {
    list.push({ id: f.id, tag: '加盟', tone: 'warn', title: f.name, meta: f.region, type: 'franchise', raw: f })
  })
  store.custody.filter(c => !c.ok).forEach(c => {
    list.push({ id: c.willId, tag: '保管', tone: 'bad', title: `${c.holder} 异常`, meta: c.location, type: 'custody', raw: c })
  })
  return list.slice(0, 8)
})

const tickerItems = computed(() => {
  const items = []
  store.audits.slice(0, 8).forEach(a => items.push(`【审计】${a.at} ${a.who} ${a.action}`))
  store.sms.slice(0, 4).forEach(s => items.push(`【短信】${s.tpl} → ${s.to} · ${s.status}`))
  store.businesses.slice(0, 4).forEach(b => items.push(`【业务】${b.orderCode} ${BUSINESS_MAP[b.businessCode]?.name || ''} ${b.applicantName || ''}`))
  return items.length ? items : ['岛城遗嘱库智慧驾驶舱运行中']
})

function updateClock() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  clock.date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} 星期${week}`
  clock.time = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const l = document.createElement('link')
  l.rel = 'stylesheet'
  l.href = href
  document.head.appendChild(l)
}

function tdtUrl(layer) {
  const tk = tdtTk.value.trim()
  // DataServer 在线链接，浏览器直接请求，不下载到本地
  return `https://t{s}.tianditu.gov.cn/DataServer?T=${layer}&x={x}&y={y}&l={z}&tk=${tk}`
}

function buildLayers(L) {
  const sub = ['0', '1', '2', '3', '4', '5', '6', '7']
  const tk = tdtTk.value.trim()
  usingTianditu = !!tk

  if (tk) {
    layerGroups.vec = L.layerGroup([
      L.tileLayer(tdtUrl('vec_w'), { subdomains: sub, maxZoom: 18, attribution: '天地图' }),
      L.tileLayer(tdtUrl('cva_w'), { subdomains: sub, maxZoom: 18 }),
    ])
    layerGroups.img = L.layerGroup([
      L.tileLayer(tdtUrl('img_w'), { subdomains: sub, maxZoom: 18, attribution: '天地图影像' }),
      L.tileLayer(tdtUrl('cia_w'), { subdomains: sub, maxZoom: 18 }),
    ])
  } else {
    // 无密钥时使用在线科技矢量 + 在线卫星影像（仍为外链，不落地瓦片）
    layerGroups.vec = L.layerGroup([
      L.tileLayer('https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        attribution: 'GeoQ',
      }),
    ])
    layerGroups.img = L.layerGroup([
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Esri',
      }),
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        opacity: 0.85,
      }),
    ])
  }
}

function markerIcon(L, color) {
  return L.divIcon({
    className: 'screen-marker',
    html: `<span style="--c:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function buildPoints() {
  const points = [
    {
      id: 'hq',
      kind: 'hq',
      kindLabel: '服务中心',
      title: '岛城遗嘱库运营中心',
      region: GEO.hq.region,
      status: '运行中',
      desc: store.partyB.address,
      lat: GEO.hq.lat,
      lng: GEO.hq.lng,
      color: '#4de1ff',
      ok: true,
    },
  ]

  store.custody.forEach((c, i) => {
    const geo = c.location.includes('黄岛') ? GEO.huangdao : (i % 2 ? GEO.shinanB : GEO.shinanA)
    points.push({
      id: c.willId,
      kind: 'custody',
      kindLabel: '保管库',
      title: c.location,
      region: geo.region,
      status: c.ok ? '正常' : '异常',
      desc: `持有人 ${c.holder} · 入库 ${c.since} · 巡检 ${c.lastCheck}`,
      lat: geo.lat + (i * 0.004),
      lng: geo.lng + (i * 0.003),
      color: c.ok ? '#3dff9a' : '#ff5b6e',
      ok: c.ok,
      raw: c,
    })
  })

  const regionGeo = {
    市南区: GEO.shinanA,
    市北区: GEO.shibei,
    城阳区: GEO.chengyang,
    胶州市: GEO.jiaozhou,
    即墨区: GEO.jimo,
    黄岛区: GEO.huangdao,
  }
  store.franchises.forEach((f, i) => {
    const g = regionGeo[f.region] || GEO.shinanA
    points.push({
      id: f.id,
      kind: 'franchise',
      kindLabel: '加盟点',
      title: f.name,
      region: f.region,
      status: f.status,
      desc: `联系方式 ${f.contact}`,
      lat: g.lat + 0.01 + i * 0.002,
      lng: g.lng - 0.01 + i * 0.002,
      color: f.status === '已入库' ? '#5b8cff' : f.status === '待审核' ? '#ffc857' : '#9aa7b8',
      ok: f.status === '已入库',
      raw: f,
    })
  })

  store.disputes.forEach((d, i) => {
    points.push({
      id: d.id,
      kind: 'dispute',
      kindLabel: '纠纷案件',
      title: d.title,
      region: '青岛市',
      status: d.stage,
      desc: `申请人 ${d.applicant} · 承办 ${d.owner}`,
      lat: 36.08 + i * 0.015,
      lng: 120.36 + i * 0.02,
      color: d.stage === '已结案' ? '#7a8fa3' : '#ff7a45',
      ok: d.stage === '已结案',
      raw: d,
    })
  })

  return points
}

function refreshMarkers() {
  if (!map || !Lref) return
  if (markerLayer) markerLayer.clearLayers()
  else markerLayer = Lref.layerGroup().addTo(map)

  const points = buildPoints().filter(p => {
    if (filter.value === 'all') return true
    if (filter.value === 'custody') return p.kind === 'custody' || p.kind === 'hq'
    if (filter.value === 'franchise') return p.kind === 'franchise' || p.kind === 'hq'
    if (filter.value === 'dispute') return p.kind === 'dispute' || p.kind === 'hq'
    if (filter.value === 'reg' || filter.value === 'wit') return p.kind === 'hq' || p.kind === 'franchise'
    return true
  })

  points.forEach(p => {
    const m = Lref.marker([p.lat, p.lng], { icon: markerIcon(Lref, p.color) })
    m.bindTooltip(`<b>${p.title}</b><br/>${p.kindLabel} · ${p.status}`, {
      direction: 'top',
      opacity: 0.95,
      className: 'screen-tip',
    })
    m.on('click', () => {
      selected.value = p
      pulse()
    })
    m.addTo(markerLayer)
  })
}

async function initMap() {
  loadCss('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css')
  await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
  Lref = window.L
  buildLayers(Lref)
  map = Lref.map(mapEl.value, {
    center: QD_CENTER,
    zoom: 11,
    zoomControl: false,
    attributionControl: false,
  })
  Lref.control.zoom({ position: 'bottomright' }).addTo(map)
  layerGroups[mapType.value].addTo(map)
  refreshMarkers()
  setTimeout(() => map.invalidateSize(), 200)
  setTimeout(() => map.invalidateSize(), 600)
}

function switchMap(type) {
  if (!map || mapType.value === type) return
  map.removeLayer(layerGroups[mapType.value])
  mapType.value = type
  layerGroups[type].addTo(map)
  toast(type === 'img' ? '已切换卫星影像' : '已切换矢量底图')
}

function saveTk() {
  localStorage.setItem('will-demo-tdt-tk', tdtTk.value.trim())
  if (!map || !Lref) return
  map.removeLayer(layerGroups[mapType.value])
  buildLayers(Lref)
  layerGroups[mapType.value].addTo(map)
  showTk.value = false
  toast(tdtTk.value.trim() ? '已应用天地图密钥（在线加载）' : '已清除密钥，使用备用在线底图')
}

function resetView() {
  map?.setView(QD_CENTER, 11)
  toast('已定位至青岛')
}

function openTdtSite() {
  window.open('https://map.tianditu.gov.cn/', '_blank', 'noopener')
}

function flyTo(p) {
  map?.flyTo([p.lat, p.lng], 14, { duration: 1.1 })
}

function setFilter(key) {
  filter.value = key
  refreshMarkers()
  pulse()
}

function focusBiz() {
  filter.value = 'all'
  refreshMarkers()
}

function focusTodo(t) {
  if (t.type === 'custody') focusCustody(t.raw)
  else if (t.type === 'franchise') focusFranchise(t.raw)
  else if (t.type === 'wit') {
    selected.value = {
      id: t.raw.id,
      kind: 'hq',
      kindLabel: '见证案件',
      title: t.title,
      region: '青岛市',
      status: t.raw.status,
      desc: `费用 ¥${t.raw.fee || 0}`,
      lat: GEO.hq.lat,
      lng: GEO.hq.lng,
      raw: t.raw,
    }
    flyTo(selected.value)
  } else toast(`请至登记审核处理 ${t.id}`)
}

function handleTodo(t) {
  if (t.type === 'reg') {
    t.raw.status = '已受理'
    t.raw.certNo = t.raw.certNo || `QD-WILL-${Date.now().toString().slice(-8)}`
    persist()
    pushAudit(store.adminUser.name, `大屏快捷受理 ${t.raw.id}`)
    toast('登记已受理')
  } else if (t.type === 'wit') {
    t.raw.status = '待排期'
    t.raw.agent = t.raw.agent || '周业务'
    persist()
    pushAudit(store.adminUser.name, `大屏通过见证 ${t.raw.id}`)
    toast('已转入待排期')
  } else if (t.type === 'franchise') {
    t.raw.status = '已入库'
    persist()
    pushAudit(store.adminUser.name, `大屏加盟入库 ${t.raw.id}`)
    toast('加盟已入库')
    refreshMarkers()
  } else if (t.type === 'custody') {
    t.raw.ok = true
    t.raw.lastCheck = now().slice(0, 10)
    persist()
    pushAudit(store.adminUser.name, `大屏恢复保管 ${t.raw.willId}`)
    toast('保管已恢复正常')
    refreshMarkers()
  }
  pulse()
}

function focusCustody(c) {
  const pts = buildPoints().filter(p => p.id === c.willId)
  if (pts[0]) {
    selected.value = pts[0]
    flyTo(pts[0])
  }
}

function focusFranchise(f) {
  const pts = buildPoints().filter(p => p.id === f.id)
  if (pts[0]) {
    selected.value = pts[0]
    flyTo(pts[0])
  }
}

function fixCustody() {
  if (!selected.value?.raw) return
  selected.value.raw.ok = true
  selected.value.raw.lastCheck = now().slice(0, 10)
  selected.value.ok = true
  selected.value.status = '正常'
  persist()
  pushAudit(store.adminUser.name, `大屏恢复保管 ${selected.value.raw.willId}`)
  toast('已恢复正常')
  refreshMarkers()
}

function passFranchise() {
  if (!selected.value?.raw) return
  selected.value.raw.status = '已入库'
  selected.value.status = '已入库'
  persist()
  pushAudit(store.adminUser.name, `大屏加盟入库 ${selected.value.raw.id}`)
  toast('已通过入库')
  refreshMarkers()
}

function advanceDispute() {
  const stages = ['调解中', '取证中', '诉讼中', '已结案']
  const d = selected.value?.raw
  if (!d) return
  const i = stages.indexOf(d.stage)
  if (i < 0 || i >= stages.length - 1) return toast('已结案')
  d.stage = stages[i + 1]
  d.updatedAt = now()
  selected.value.status = d.stage
  persist()
  pushAudit(store.adminUser.name, `大屏推进纠纷 ${d.id} → ${d.stage}`)
  toast(`已推进至「${d.stage}」`)
  refreshMarkers()
}

function retrySms(s) {
  const id = (store.sms[0]?.id || 0) + 1
  store.sms.unshift({ ...s, id, status: '成功', at: now() })
  persist()
  pushAudit(store.adminUser.name, `大屏重发短信 ${s.tpl} → ${s.to}`)
  toast('短信已重发')
}

function pulse() {
  flashOn.value = true
  setTimeout(() => { flashOn.value = false }, 350)
}

function goBack() {
  if (document.fullscreenElement) document.exitFullscreen?.()
  router.push('/admin')
}

function toggleFs() {
  const el = document.documentElement
  if (!document.fullscreenElement) el.requestFullscreen?.()
  else document.exitFullscreen?.()
}

function onFsChange() {
  isFs.value = !!document.fullscreenElement
}

onMounted(async () => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
  document.addEventListener('fullscreenchange', onFsChange)
  document.documentElement.classList.add('screen-mode')
  document.body.classList.add('screen-mode')
  await nextTick()
  try {
    await initMap()
  } catch (e) {
    toast('地图加载失败，请检查网络')
    console.error(e)
  }
})

onUnmounted(() => {
  clearInterval(clockTimer)
  document.removeEventListener('fullscreenchange', onFsChange)
  document.documentElement.classList.remove('screen-mode')
  document.body.classList.remove('screen-mode')
  map?.remove()
  map = null
})
</script>

<style scoped>
.screen {
  --bg: #020b1a;
  --panel: rgba(8, 28, 58, 0.72);
  --line: rgba(64, 168, 255, 0.45);
  --cyan: #3ecbff;
  --blue: #1677ff;
  --text: #d7ecff;
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  background: radial-gradient(ellipse at 50% 0%, #0a2a55 0%, var(--bg) 55%);
  color: var(--text);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 10px;
  padding: 10px 14px 8px;
  box-sizing: border-box;
}
.screen.flash::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at center, rgba(62, 203, 255, 0.12), transparent 55%);
  animation: flash .35s ease;
}
@keyframes flash {
  from { opacity: .8; }
  to { opacity: 0; }
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(40, 120, 220, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(40, 120, 220, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, #000 40%, transparent 85%);
  pointer-events: none;
}
.bg-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 40% 30% at 15% 20%, rgba(22, 119, 255, 0.18), transparent),
    radial-gradient(ellipse 40% 30% at 85% 25%, rgba(62, 203, 255, 0.12), transparent);
  pointer-events: none;
}
.scan {
  position: absolute;
  left: 0; right: 0;
  height: 120px;
  background: linear-gradient(180deg, transparent, rgba(62, 203, 255, 0.06), transparent);
  animation: scan 6s linear infinite;
  pointer-events: none;
  z-index: 1;
}
@keyframes scan {
  from { top: -120px; }
  to { top: 110%; }
}

.head {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 64px;
}
.head-left, .head-right { display: flex; gap: 8px; align-items: center; }
.head-right { justify-content: flex-end; }
.head-center {
  display: flex;
  align-items: center;
  gap: 16px;
}
.head-center h1 {
  margin: 0;
  font-size: clamp(20px, 2.4vw, 32px);
  font-weight: 700;
  letter-spacing: 0.12em;
  background: linear-gradient(180deg, #fff, #7fd4ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 24px rgba(62, 203, 255, 0.25);
  white-space: nowrap;
}
.deco-l, .deco-r {
  width: min(18vw, 160px);
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan));
  position: relative;
}
.deco-r { background: linear-gradient(90deg, var(--cyan), transparent); }
.deco-l::after, .deco-r::before {
  content: '';
  position: absolute;
  top: -3px;
  width: 8px; height: 8px;
  border: 2px solid var(--cyan);
  transform: rotate(45deg);
}
.deco-l::after { right: 0; }
.deco-r::before { left: 0; }
.clock .date { font-size: 12px; color: #8eb6d8; text-align: right; }
.clock .time {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--cyan);
  letter-spacing: 0.06em;
}

.chip {
  border: 1px solid rgba(62, 203, 255, 0.35);
  background: rgba(10, 40, 80, 0.65);
  color: #cce9ff;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: .15s;
}
.chip:hover, .chip.on {
  border-color: var(--cyan);
  color: #fff;
  box-shadow: 0 0 12px rgba(62, 203, 255, 0.35);
  background: rgba(22, 119, 255, 0.35);
}

.kpis {
  position: absolute;
  top: 8px;
  left: 276px;
  right: 276px;
  z-index: 6;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  pointer-events: none;
}
.kpi {
  pointer-events: auto;
  text-align: left;
  border: 1px solid rgba(62, 203, 255, 0.45);
  background: rgba(0, 14, 32, 0.5);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  color: inherit;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
  box-shadow:
    0 0 0 1px rgba(0, 40, 80, 0.2) inset,
    0 8px 24px rgba(0, 0, 0, 0.22),
    0 0 16px rgba(22, 119, 255, 0.1);
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.kpi.on, .kpi:hover {
  border-color: var(--cyan);
  background: rgba(0, 30, 64, 0.55);
  box-shadow:
    inset 0 0 20px rgba(62, 203, 255, 0.12),
    0 0 18px rgba(62, 203, 255, 0.2);
}
.kpi-label { font-size: 12px; color: #b6d4ee; }
.kpi-num {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  text-shadow: 0 0 16px rgba(62, 203, 255, 0.45);
}
.kpi-sub { font-size: 11px; color: #8aa9c4; margin-top: 2px; }

.stage {
  position: relative;
  z-index: 2;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgba(46, 130, 210, 0.4);
  border-radius: 6px;
  box-shadow: 0 0 24px rgba(22, 119, 255, 0.12);
}

.map-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.map-toolbar {
  position: absolute;
  top: 92px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: calc(100% - 560px);
  padding: 8px 12px;
  background: rgba(0, 14, 32, 0.5);
  border: 1px solid rgba(62, 203, 255, 0.4);
  border-radius: 6px;
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  pointer-events: auto;
}
.map-toolbar .mod-hd-l {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.map-toolbar .dia {
  width: 8px;
  height: 8px;
  background: #3ecbff;
  box-shadow: 0 0 10px #3ecbff;
  transform: rotate(45deg);
  flex-shrink: 0;
}
.map-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.float-tk {
  position: absolute;
  top: 138px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 7;
  width: min(520px, calc(100% - 560px));
  background: rgba(0, 14, 32, 0.5);
  border: 1px solid rgba(62, 203, 255, 0.35);
  border-radius: 6px;
  padding: 8px 10px;
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
}

/* 左右浮层：260px，叠在地图上 */
.side-col {
  position: absolute;
  top: 8px;
  bottom: 8px;
  width: 260px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  pointer-events: none;
}
.side-col.left { left: 8px; }
.side-col.right { right: 8px; }
.side-col .mod,
.side-col .side-ticker {
  pointer-events: auto;
}

/* 侧栏顶部滚动条（原底栏迁入） */
.side-ticker {
  flex: 0 0 auto;
  height: 34px;
  overflow: hidden;
  border: 1px solid rgba(62, 203, 255, 0.45);
  border-radius: 6px;
  background: rgba(0, 14, 32, 0.5);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  box-shadow:
    0 0 0 1px rgba(0, 40, 80, 0.2) inset,
    0 8px 24px rgba(0, 0, 0, 0.22);
}
.side-ticker .ticker-track {
  display: inline-flex;
  gap: 36px;
  white-space: nowrap;
  padding: 8px 0;
  animation: ticker 36s linear infinite;
  font-size: 11px;
  color: #b6d4ee;
}
.side-ticker .ticker-track.reverse {
  animation-name: ticker-rev;
}
@keyframes ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes ticker-rev {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

/* —— 科技半透明模块框（约 50% 透明度） —— */
.mod {
  position: relative;
  background: rgba(0, 14, 32, 0.5);
  border: 1px solid rgba(62, 203, 255, 0.45);
  border-radius: 6px;
  padding: 12px 12px 10px;
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  box-shadow:
    0 0 0 1px rgba(0, 40, 80, 0.2) inset,
    0 8px 28px rgba(0, 0, 0, 0.28),
    0 0 18px rgba(22, 119, 255, 0.1);
  overflow: hidden;
}
.mod::before,
.mod::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(62, 203, 255, 0.7);
  pointer-events: none;
}
.mod::before {
  top: 4px; left: 4px;
  border-right: 0; border-bottom: 0;
}
.mod::after {
  bottom: 4px; right: 4px;
  border-left: 0; border-top: 0;
}
.mod.grow {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.compact-mod {
  flex: 0 0 auto;
  max-height: 132px;
  display: flex;
  flex-direction: column;
}
.mod-hd {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}
.mod-hd .dia {
  width: 8px;
  height: 8px;
  background: #3ecbff;
  box-shadow: 0 0 10px #3ecbff, 0 0 2px #fff;
  transform: rotate(45deg);
  flex-shrink: 0;
}
.mod-bd {
  min-height: 0;
  flex: 1;
}

.bars { display: grid; gap: 10px; }
.bar-row {
  display: grid;
  grid-template-columns: 56px 1fr 18px;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
}
.bar-row .lab {
  color: rgba(220, 236, 255, 0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-row .track {
  height: 10px;
  background: rgba(20, 50, 90, 0.55);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.35);
}
.bar-row .track i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0088ff, #00d4ff);
  box-shadow: 0 0 10px rgba(0, 180, 255, 0.75);
}
.bar-row b {
  text-align: right;
  color: #fff;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.list {
  display: grid;
  gap: 6px;
  overflow: auto;
  align-content: start;
  /* 滚动条与半透明模块同色系 */
  scrollbar-width: thin;
  scrollbar-color: rgba(62, 203, 255, 0.35) rgba(0, 14, 32, 0.35);
}
.list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.list::-webkit-scrollbar-track {
  background: rgba(0, 14, 32, 0.35);
  border-radius: 999px;
  backdrop-filter: blur(8px);
}
.list::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(62, 203, 255, 0.45), rgba(22, 119, 255, 0.35));
  border-radius: 999px;
  border: 1px solid rgba(62, 203, 255, 0.25);
  box-shadow: 0 0 8px rgba(62, 203, 255, 0.2);
}
.list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(62, 203, 255, 0.65), rgba(22, 119, 255, 0.5));
}
.row-item {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 6px;
  align-items: center;
  padding: 6px 4px;
  border-bottom: 1px solid rgba(46, 130, 210, 0.22);
  cursor: pointer;
  min-width: 0;
}
.row-item:last-child { border-bottom: 0; }
.row-item:hover { background: rgba(22, 119, 255, 0.12); }
.row-item.alert .lab { color: #ff8b9a; }
.row-item .lab {
  font-size: 11px;
  color: #8fd4ff;
  white-space: nowrap;
}
.row-item .lab.time { font-size: 10px; color: #6f97b8; letter-spacing: -0.02em; }
.row-item .lab.ok { color: #7dffc0; }
.row-item .lab.bad { color: #ff8b9a; }
.row-item .lab.warn { color: #ffd27a; }
.row-item .mid {
  min-width: 0;
  display: grid;
  gap: 1px;
}
.row-item .mid strong {
  font-size: 12px;
  color: #eaf6ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
}
.row-item .mid em {
  font-style: normal;
  font-size: 10px;
  color: #9bb8d4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-item.audit { grid-template-columns: 52px 1fr; cursor: default; }
.mini {
  border: 0;
  background: rgba(0, 140, 255, 0.4);
  color: #fff;
  border-radius: 3px;
  padding: 3px 6px;
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
}
.mini:hover { background: rgba(0, 180, 255, 0.6); }
.empty { color: #6f97b8; font-size: 12px; padding: 8px 0; }

.tk-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 0;
  flex-wrap: wrap;
}
.tk-bar input {
  flex: 1;
  min-width: 140px;
  background: rgba(0, 20, 50, 0.55);
  border: 1px solid var(--line);
  color: #dff2ff;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
}
.tk-bar .link { color: var(--cyan); font-size: 12px; }

.map-wrap {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.map {
  width: 100%;
  height: 100%;
  min-height: 100%;
  background: #031428;
}
/* 缩放控件避开右侧浮层，保证可操作 */
.map-stage :deep(.leaflet-bottom.leaflet-right) {
  right: 276px;
  bottom: 10px;
}
.map-stage :deep(.leaflet-control-zoom a) {
  background: rgba(0, 14, 32, 0.55) !important;
  color: #dff2ff !important;
  border-color: rgba(62, 203, 255, 0.4) !important;
  backdrop-filter: blur(8px);
}
.map-frame {
  position: absolute;
  width: 22px; height: 22px;
  border: 2px solid var(--cyan);
  z-index: 500;
  pointer-events: none;
  box-shadow: 0 0 8px rgba(62,203,255,.5);
}
.map-frame.tl { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
.map-frame.tr { top: 8px; right: 8px; border-left: 0; border-bottom: 0; }
.map-frame.bl { bottom: 8px; left: 8px; border-right: 0; border-top: 0; }
.map-frame.br { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }
.map-legend {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  z-index: 500;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  background: rgba(2, 16, 36, 0.5);
  border: 1px solid rgba(62,203,255,.35);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 11px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.map-legend .dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-right: 4px;
  box-shadow: 0 0 6px currentColor;
}
.dot.hq { background: #4de1ff; color: #4de1ff; }
.dot.custody { background: #3dff9a; color: #3dff9a; }
.dot.franchise { background: #5b8cff; color: #5b8cff; }
.dot.dispute { background: #ff7a45; color: #ff7a45; }

.detail-float {
  position: absolute;
  top: 148px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 600;
  width: min(320px, calc(100% - 560px));
  background: rgba(0, 14, 32, 0.5);
  border: 1px solid rgba(62, 203, 255, 0.5);
  border-radius: 6px;
  padding: 10px 12px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4), 0 0 20px rgba(22, 119, 255, 0.2);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
}
.detail-float .mod-hd { margin-bottom: 8px; }
.detail-float .x {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: #9ec7e8;
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
}
.detail-float dl {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 6px 8px;
  font-size: 12px;
  margin: 0 0 8px;
}
.detail-float dt { color: #7fa4c4; }
.detail-float dd { margin: 0; color: #eaf6ff; }
.detail-ops { display: flex; gap: 6px; flex-wrap: wrap; }

@media (max-width: 1200px) {
  .kpis {
    left: 8px;
    right: 8px;
    grid-template-columns: repeat(3, 1fr);
  }
  .side-col {
    top: 118px;
    width: min(260px, 42vw);
  }
  .map-toolbar { top: 118px; }
  .float-tk { top: 164px; }
  .map-toolbar,
  .float-tk,
  .detail-float {
    max-width: calc(100% - 24px);
    width: auto;
  }
  .detail-float { width: min(320px, calc(100% - 24px)); top: 174px; }
}
@media (max-width: 900px) {
  .kpis {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    margin: 8px;
    pointer-events: auto;
  }
  .side-col {
    position: relative;
    width: 100%;
    top: auto;
    bottom: auto;
    left: auto !important;
    right: auto !important;
    pointer-events: auto;
    max-height: 320px;
    padding: 0 8px 8px;
  }
  .stage {
    display: flex;
    flex-direction: column;
    overflow: auto;
  }
  .map-stage {
    position: relative;
    min-height: 420px;
    flex: 1;
  }
  .map-toolbar { top: 10px; max-width: calc(100% - 24px); }
}
</style>

<style>
/* 全局：大屏模式与 Leaflet 标记 */
html.screen-mode,
body.screen-mode {
  background: #020b1a !important;
  overflow: hidden;
}
.screen-marker {
  background: transparent !important;
  border: 0 !important;
}
.screen-marker span {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--c, #3ecbff);
  box-shadow: 0 0 0 2px rgba(255,255,255,.85), 0 0 16px var(--c, #3ecbff), 0 0 28px var(--c, #3ecbff);
  animation: markerPulse 1.8s ease-in-out infinite;
}
@keyframes markerPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: .85; }
}
.screen-tip {
  background: rgba(4, 24, 52, 0.92) !important;
  border: 1px solid rgba(62, 203, 255, 0.55) !important;
  color: #e8f6ff !important;
  border-radius: 4px !important;
  box-shadow: 0 0 16px rgba(22, 119, 255, 0.35) !important;
}
.screen-tip::before {
  border-top-color: rgba(4, 24, 52, 0.92) !important;
}
</style>
