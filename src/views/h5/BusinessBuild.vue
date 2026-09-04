<template>
  <div class="business-container">
    <div class="business-header">
      <h1>{{ bizName }}{{ isEdit ? '修改' : '申请' }}</h1>
    </div>

    <div class="business-content">
      <div class="witness-business">
        <div class="witness-tabs">
          <div class="tab-item" :class="{ active: tab === 'self' }" @click="tab = 'self'">
            自己指定{{ roleLabel }}
          </div>
          <div class="tab-item" :class="{ active: tab === 'platform' }" @click="tab = 'platform'">
            平台选择{{ roleLabel }}
          </div>
        </div>

        <div v-if="tab === 'self'" class="self-witness-form">
          <div class="form-item">
            <label>{{ roleLabel }}姓名：</label>
            <input v-model="selfForm.name" type="text" :placeholder="`请输入${roleLabel}姓名`" />
          </div>
          <div class="form-item">
            <label>{{ roleLabel }}性别：</label>
            <select v-model="selfForm.gender" class="form-select">
              <option value="0">男</option>
              <option value="1">女</option>
            </select>
          </div>
          <div class="form-item">
            <label>{{ roleLabel }}电话：</label>
            <div class="phone-input">
              <input
                v-model="selfForm.phone"
                type="tel"
                :placeholder="`请输入${roleLabel}电话`"
                maxlength="11"
                :disabled="phoneVerified || isEdit"
              />
              <button
                v-if="!isEdit"
                class="send-code-btn"
                type="button"
                :disabled="sending || !selfForm.phone || phoneVerified"
                @click="sendCode"
              >
                {{ phoneVerified ? '已验证' : sendLabel }}
              </button>
              <span v-else class="verified-tag">已认证</span>
            </div>
          </div>
          <div class="form-item">
            <label>{{ roleLabel }}类型：</label>
            <select v-model="selfForm.witnessType" class="form-select">
              <option value="0">个人</option>
              <option value="1">法人单位</option>
              <option value="2">其他组织</option>
            </select>
          </div>
        </div>

        <div v-else class="platform-witness">
          <div class="franchisee-tabs">
            <div class="tab-item" :class="{ active: franchiseType === '0' }" @click="setFranchiseType('0')">个人加盟人</div>
            <div class="tab-item" :class="{ active: franchiseType === '1' }" @click="setFranchiseType('1')">法人单位</div>
            <div class="tab-item" :class="{ active: franchiseType === '2' }" @click="setFranchiseType('2')">其他组织</div>
          </div>

          <div class="search-box">
            <input v-model="searchKey" type="text" placeholder="输入名称搜索" />
          </div>

          <div v-if="selectedEmployee" class="selected-employee">
            <div class="selected-header">
              <h3>已选择的{{ roleLabel }}</h3>
              <button class="change-btn" type="button" @click="clearEmployee">重新选择</button>
            </div>
            <div class="employee-card">
              <div class="employee-photo"><div class="avatar-img">👤</div></div>
              <div class="employee-info">
                <div class="info-row"><span class="label">姓名：</span><span class="value">{{ selectedEmployee.name }}</span></div>
                <div class="info-row"><span class="label">性别：</span><span class="value">{{ selectedEmployee.gender }}</span></div>
                <div class="info-row"><span class="label">所属机构：</span><span class="value">{{ selectedFranchise?.name }}</span></div>
                <div class="info-row"><span class="label">加盟时间：</span><span class="value">{{ selectedEmployee.registrationTime }}</span></div>
              </div>
            </div>
          </div>

          <div v-else class="franchisee-list">
            <div
              v-for="(f, i) in filteredFranchisees"
              :key="i"
              class="franchisee-item"
              @click="openEmployeeDialog(f)"
            >
              <div class="franchisee-photo"><div class="avatar-img">🏢</div></div>
              <div class="franchisee-info">
                <div class="info-row"><span class="label">名称：</span><span class="value">{{ f.name }}</span></div>
                <div class="info-row"><span class="label">类型：</span><span class="value">{{ franchiseTypeLabel(f.type) }}</span></div>
                <div class="info-row"><span class="label">加盟日期：</span><span class="value">{{ f.joinDate }}</span></div>
              </div>
            </div>
            <div v-if="!filteredFranchisees.length" class="empty-tip">暂无相关加盟商信息</div>
          </div>
        </div>
      </div>
    </div>

    <div class="business-footer">
      <button class="submit-btn" type="button" :disabled="!canSubmit" @click="submit">
        {{ isEdit ? '修改' : '提交' }}{{ bizName }}申请
      </button>
    </div>

    <div v-if="showCodeDialog" class="dialog-mask">
      <div class="code-dialog">
        <div class="dialog-title">请输入验证码</div>
        <input v-model="smsCode" type="text" placeholder="请输入6位验证码" maxlength="6" class="code-input" />
        <div class="dialog-buttons">
          <button class="dialog-btn cancel" type="button" @click="showCodeDialog = false">取消</button>
          <button class="dialog-btn confirm" type="button" @click="verifyCode">确认</button>
        </div>
      </div>
    </div>

    <div v-if="showEmployeeDialog" class="employee-dialog-mask" @click="showEmployeeDialog = false">
      <div class="employee-dialog" @click.stop>
        <div class="dialog-header">
          <div class="dialog-title">{{ selectedFranchise?.name }} - 成员列表</div>
          <button class="close-btn" type="button" @click="showEmployeeDialog = false">×</button>
        </div>
        <div class="employee-list">
          <div
            v-for="(emp, i) in employees"
            :key="i"
            class="employee-item"
            @click="pickEmployee(emp)"
          >
            <div class="employee-photo"><div class="avatar-img">👤</div></div>
            <div class="employee-info">
              <div class="info-row"><span class="label">姓名：</span><span class="value">{{ emp.name }}</span></div>
              <div class="info-row"><span class="label">性别：</span><span class="value">{{ emp.gender }}</span></div>
              <div class="info-row"><span class="label">电话：</span><span class="value">{{ emp.phoneNumber }}</span></div>
            </div>
          </div>
          <div v-if="!employees.length" class="empty-tip">暂无成员信息</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  store,
  BUSINESS_MAP,
  ROLE_LABELS,
  MOCK_FRANCHISEES,
  MOCK_EMPLOYEES,
  createBusiness,
  toast,
  persist,
} from '../../store'

const route = useRoute()
const router = useRouter()

const bizCode = computed(() => String(route.params.type ?? '0'))
const bizName = computed(() => BUSINESS_MAP[bizCode.value]?.name || '业务')
const roleLabel = computed(() => ROLE_LABELS[bizCode.value] || '业务人')
const isEdit = computed(() => route.query.mode === '1')

const tab = ref('self')
const franchiseType = ref('0')
const searchKey = ref('')
const selfForm = ref({ name: '', gender: '0', phone: '', witnessType: '0' })
const phoneVerified = ref(false)
const showCodeDialog = ref(false)
const smsCode = ref('')
const sending = ref(false)
const sendLabel = ref('获取验证码')
const count = ref(60)

const selectedFranchise = ref(null)
const selectedEmployee = ref(null)
const showEmployeeDialog = ref(false)
const employees = ref([])

const filteredFranchisees = computed(() =>
  MOCK_FRANCHISEES.filter(
    (f) => f.type === franchiseType.value && (!searchKey.value || f.name.includes(searchKey.value)),
  ),
)

const canSubmit = computed(() => {
  if (tab.value === 'self') return selfForm.value.name && selfForm.value.phone && (phoneVerified.value || isEdit.value)
  return selectedEmployee.value != null
})

watch(
  () => route.query.businessData,
  (raw) => {
    if (!raw) return
    try {
      const data = JSON.parse(raw)
      if (data.businessModel === '1') {
        tab.value = 'self'
        selfForm.value.name = data.lawName || ''
        selfForm.value.phone = data.phoneNumber || ''
        phoneVerified.value = true
      } else {
        tab.value = 'platform'
        selectedEmployee.value = {
          name: data.lawName,
          phoneNumber: data.phoneNumber,
          gender: '男',
          registrationTime: data.registrationTime,
          partnerCode: data.partnerCode,
        }
        selectedFranchise.value = { name: data.companyName || '未知机构', identificationCode: data.partnerCode }
      }
    } catch { /* ignore */ }
  },
  { immediate: true },
)

function setFranchiseType(t) {
  franchiseType.value = t
}

function franchiseTypeLabel(t) {
  return { '0': '个人', '1': '法人单位', '2': '其他组织' }[t] || '未知'
}

function sendCode() {
  if (!selfForm.value.phone) return toast('请输入手机号')
  sending.value = true
  count.value = 60
  toast('验证码已发送')
  showCodeDialog.value = true
  const t = setInterval(() => {
    count.value--
    sendLabel.value = `${count.value}秒后重新获取`
    if (count.value <= 0) {
      clearInterval(t)
      sending.value = false
      sendLabel.value = '获取验证码'
    }
  }, 1000)
}

function verifyCode() {
  if (smsCode.value.length !== 6) return toast('请输入6位验证码')
  if (!/^\d{4,6}$/.test(smsCode.value)) return toast('请输入验证码')
  phoneVerified.value = true
  showCodeDialog.value = false
  toast('手机号验证成功')
}

function openEmployeeDialog(f) {
  selectedFranchise.value = f
  employees.value = MOCK_EMPLOYEES[f.identificationCode] || []
  showEmployeeDialog.value = true
}

function pickEmployee(emp) {
  selectedEmployee.value = emp
  showEmployeeDialog.value = false
}

function clearEmployee() {
  selectedEmployee.value = null
  selectedFranchise.value = null
}

function submit() {
  if (!canSubmit.value) return

  if (isEdit.value) {
    toast('业务修改成功')
    router.back()
    return
  }

  let payload
  if (tab.value === 'self') {
    payload = {
      businessModel: '1',
      lawName: selfForm.value.name,
      phoneNumber: selfForm.value.phone,
    }
  } else {
    payload = {
      businessModel: '0',
      lawName: selectedEmployee.value.name,
      phoneNumber: selectedEmployee.value.phoneNumber,
      companyName: selectedFranchise.value?.name || '',
      partnerCode: selectedEmployee.value.partnerCode,
    }
  }

  createBusiness(bizCode.value, payload)

  if (tab.value === 'platform') {
    const path = BUSINESS_MAP[bizCode.value]?.agreementPath || '/h5/witness-agreement'
    router.push(path)
  } else {
    toast('业务申请提交成功')
    router.push(`/h5/business-list/${bizCode.value}`)
  }
}
</script>
