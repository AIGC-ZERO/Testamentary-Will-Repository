<template>
  <div class="business-list-container">
    <div class="header">
      <button class="back-btn" type="button" @click="router.back()">←</button>
      <div class="header-title">{{ pageTitle }}</div>
    </div>

    <div v-if="list.length" class="business-list">
      <div
        v-for="item in list"
        :key="item.id"
        class="business-card"
        @click="viewDetail(item)"
      >
        <div class="card-ribbon" :class="ribbonClass(item.businessCode)">
          <div class="ribbon-content">
            <span class="ribbon-text">{{ bizLabel(item.businessCode) }}业务（{{ modelLabel(item.businessModel) }}）</span>
          </div>
        </div>

        <div class="card-header">
          <div class="business-code-section">
            <div class="order-code">
              <span class="code-label">业务编号:</span>
              <span class="code-value">{{ shortCode(item.orderCode) }}</span>
            </div>
            <div class="status-indicator" :class="statusClass(item)">
              <span class="status-dot" />
              <span class="status-text">{{ statusLabel(item) }}</span>
            </div>
          </div>
        </div>

        <div class="card-content">
          <div class="info-grid">
            <div class="grid-row">
              <div class="grid-cell">
                <div class="cell-label">{{ roleLabel(item.businessCode) }}电话</div>
                <div class="phone-container">
                  <div class="phone-number-link" @click.stop="callPhone(item.phoneNumber)">
                    <span class="phone-icon">📱</span>
                    <span class="phone-number">{{ formatPhone(item.phoneNumber) }}</span>
                    <span class="call-hint">点击拨打</span>
                  </div>
                  <div v-if="item.phoneNumber" class="phone-actions">
                    <button class="quick-call-btn" type="button" @click.stop="callPhone(item.phoneNumber)">📞</button>
                    <button class="copy-phone-btn" type="button" @click.stop="copyPhone(item.phoneNumber)">📋</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="grid-row">
              <div class="grid-cell">
                <div class="cell-label">{{ roleLabel(item.businessCode) }}</div>
                <div class="cell-value person-name">{{ item.lawName || '未指定' }}</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">所属机构</div>
                <div class="cell-value company-name">{{ item.companyName || '未指定' }}</div>
              </div>
            </div>
            <div class="grid-row">
              <div class="grid-cell">
                <div class="cell-label">业务时间</div>
                <div class="cell-value time-value">{{ item.registrationTime }}</div>
              </div>
              <div class="grid-cell">
                <div class="cell-label">支付时间</div>
                <div class="cell-value time-value">{{ item.paidFeesTime || '未支付' }}</div>
              </div>
            </div>
            <div class="grid-row">
              <div class="grid-cell full-width">
                <div class="fee-section">
                  <div class="fee-label">费用:</div>
                  <div class="fee-amount" :class="{ unset: !item.paidFees }">
                    {{ item.paidFees ? `¥${item.paidFees}` : '未设置' }}
                  </div>
                  <div v-if="item.paidFeesTime" class="fee-status">
                    <span class="paid-badge">已支付</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="item.note" class="grid-row">
              <div class="grid-cell full-width">
                <div class="note-section">
                  <div class="note-label">备注:</div>
                  <div class="note-content">{{ item.note }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <div class="footer-content">
            <div class="partner-section">
              <div class="partner-label">合作商编码:</div>
              <div class="partner-code">{{ shortPartner(item.partnerCode) }}</div>
            </div>
            <div class="action-section">
              <div class="action-buttons">
                <button
                  v-if="item.businessStatus === '00'"
                  class="action-btn cancel-action"
                  type="button"
                  @click.stop="cancelBiz(item)"
                >
                  <span class="btn-text">取消</span>
                </button>
                <button class="action-btn edit-action" type="button" @click.stop="editBiz(item)">
                  <span class="btn-text">修改</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <div class="empty-text">暂无{{ pageTitle.replace('列表', '') }}记录</div>
      <button class="empty-btn" type="button" @click="createNew">创建新业务</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store, BUSINESS_MAP, ROLE_LABELS, toast, persist, applyBusinesses } from '../../store'
import { fetchBusinesses, cancelBusiness } from '../../api/admin'

const route = useRoute()
const router = useRouter()

const code = computed(() => String(route.params.code ?? 'all'))
const tab = computed(() => route.query.tab || route.query.type || '')

const pageTitle = computed(() => {
  if (code.value === 'all') {
    if (tab.value === 'doing') return '在办业务列表'
    if (tab.value === 'done') return '已办业务列表'
    return '全部业务列表'
  }
  return (BUSINESS_MAP[code.value]?.name || '业务') + '业务列表'
})

const list = computed(() => {
  let items = store.businesses
  if (code.value !== 'all') {
    items = items.filter((b) => b.businessCode === code.value)
  }
  if (tab.value === 'doing') {
    items = items.filter((b) => b.businessStatus === '00')
  } else if (tab.value === 'done') {
    items = items.filter((b) => b.businessStatus === '01' || b.businessStatus === '02')
  }
  return items
})

const STATUS = { '00': '待审批', '01': '审批通过', '02': '已完成', '10': '驳回', '11': '作废' }
const BIZ = { '0': '见证', '1': '执行', '2': '监管', '3': '管理', '4': '纠纷', '5': '保管' }
const MODEL = { '0': '平台业务人', '1': '自选业务人' }

function bizLabel(c) { return BIZ[c] || '未知' }
function modelLabel(m) { return MODEL[m] || '未知' }
function roleLabel(c) { return ROLE_LABELS[c] || '业务人' }
function statusLabel(item) { return STATUS[item.businessStatus] || '未知' }
function shortCode(v) { return v ? v.slice(-8).toUpperCase() : 'N/A' }
function shortPartner(v) { return v ? v.slice(0, 8).toUpperCase() + '...' : '无' }

function ribbonClass(c) {
  return {
    '0': '',
    '1': 'ribbon-execute',
    '2': 'ribbon-supervise',
    '3': 'ribbon-manage',
    '4': 'ribbon-dispute',
    '5': 'ribbon-custody',
  }[c] || ''
}

function statusClass(item) {
  const s = item.businessStatus
  if (s === '00') return 'indicator-pending'
  if (s === '01' || s === '02') return 'indicator-approved'
  if (s === '10' || s === '11') return 'indicator-rejected'
  return ''
}

function formatPhone(p) {
  if (!p) return '未填写'
  const s = String(p)
  if (s.length === 11) return `${s.slice(0, 3)} ${s.slice(3, 7)} ${s.slice(7)}`
  return s
}

function callPhone(p) {
  if (!p) return toast('暂无电话')
  window.location.href = `tel:${p}`
}

async function copyPhone(p) {
  if (!p) return
  try {
    await navigator.clipboard.writeText(String(p))
    toast('已复制电话')
  } catch {
    toast('复制失败')
  }
}

function viewDetail(item) {
  toast(`${item.orderCode} · ${statusLabel(item)}`)
}

function editBiz(item) {
  router.push(`/h5/business-build/${item.businessCode}?mode=1&order=${item.orderCode}`)
}

async function cancelBiz(item) {
  try {
    await cancelBusiness(item.orderCode)
    item.businessStatus = '11'
    persist()
    toast('已取消')
    await refresh()
  } catch {
    item.businessStatus = '11'
    persist()
    toast('已本地取消')
  }
}

function createNew() {
  const c = code.value === 'all' ? '0' : code.value
  router.push(`/h5/notification/${c}`)
}

async function refresh() {
  try {
    const data = await fetchBusinesses({ code: code.value === 'all' ? undefined : code.value })
    applyBusinesses(data)
  } catch {
    /* 保留本地 */
  }
}

onMounted(refresh)
</script>
