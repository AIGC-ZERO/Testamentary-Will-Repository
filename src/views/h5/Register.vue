<template>
  <div class="register-container">
    <div class="register-header">
      <h1>用户注册</h1>
    </div>

    <div class="register-form">
      <div class="form-section">
        <div class="section-title">手机号验证</div>
        <div class="form-item code-item">
          <input
            v-model="form.phoneNumber"
            type="tel"
            placeholder="请输入手机号(必输项)"
            maxlength="11"
            :disabled="verified"
          />
          <button
            class="send-code-btn"
            type="button"
            :disabled="sending || verified"
            @click="sendCode"
          >
            {{ verified ? '已验证' : sendLabel }}
          </button>
        </div>
      </div>

      <div v-if="showCodeDialog" class="dialog-mask">
        <div class="code-dialog">
          <div class="dialog-title">请输入验证码</div>
          <input
            v-model="smsCode"
            type="text"
            placeholder="请输入6位验证码"
            maxlength="6"
            class="code-input"
          />
          <div class="dialog-buttons">
            <button class="dialog-btn cancel" type="button" @click="closeCodeDialog">取消</button>
            <button class="dialog-btn confirm" type="button" @click="verifyCode">确认</button>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">基本信息</div>
        <div class="form-item">
          <input v-model="form.password" type="password" placeholder="请设置登录密码" />
        </div>
        <div class="form-item">
          <input v-model="form.name" type="text" placeholder="请输入姓名" />
        </div>
        <div class="form-item">
          <select v-model="form.gender" class="form-select">
            <option value="" disabled>请选择性别</option>
            <option value="0">男</option>
            <option value="1">女</option>
          </select>
        </div>
        <div class="form-item">
          <input v-model="form.idNumber" type="text" placeholder="请输入身份证号(必输项)" maxlength="18" />
        </div>
        <div class="form-item">
          <select v-model="form.isMarried" class="form-select">
            <option value="" disabled>请选择婚姻状况</option>
            <option value="已婚">已婚</option>
            <option value="未婚">未婚</option>
            <option value="离异">离异</option>
            <option value="再婚">再婚</option>
            <option value="丧偶">丧偶</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">地址信息</div>
        <div class="form-item">
          <input v-model="form.address" type="text" placeholder="请输入现居住地址" />
        </div>
        <div class="form-item">
          <input v-model="form.domicile" type="text" placeholder="请输入户籍地址" />
        </div>
        <div class="form-item">
          <input v-model="form.registrationAddress" type="text" placeholder="请输入注册地址" />
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">其他信息</div>
        <div class="form-item">
          <input v-model="form.idCardProof" type="text" placeholder="身份证佐证信息" />
        </div>
        <div class="form-item">
          <textarea v-model="form.note" placeholder="备注信息" class="form-textarea" />
        </div>
      </div>

      <button class="submit-btn" type="button" :disabled="!canSubmit" @click="submit">
        提交注册
      </button>
    </div>

    <div class="register-footer">
      <div class="agreement">
        注册即表示您同意<span>用户协议</span>和<span>隐私政策</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { store, persist, toast, now } from '../../store'
import { registerUser, sendSms } from '../../api/auth'
import { ApiError } from '../../api/http'

const router = useRouter()
const form = ref({
  phoneNumber: '',
  password: '',
  name: '',
  gender: '',
  idNumber: '',
  isMarried: '',
  address: '',
  domicile: '',
  registrationAddress: '',
  idCardProof: '',
  note: '',
})
const smsCode = ref('')
const verified = ref(false)
const showCodeDialog = ref(false)
const sending = ref(false)
const sendLabel = ref('获取验证码')
const count = ref(60)
const submitting = ref(false)

const canSubmit = computed(() => verified.value && form.value.idNumber && form.value.password)

async function sendCode() {
  if (!form.value.phoneNumber) return toast('请输入手机号')
  if (!/^1[3-9]\d{9}$/.test(form.value.phoneNumber)) return toast('请输入正确的手机号')
  sending.value = true
  count.value = 60
  try {
    await sendSms(form.value.phoneNumber, 'register')
    toast('验证码已发送')
  } catch (err) {
    toast(err instanceof ApiError ? `${err.message}（可试 888888）` : '验证码发送失败，可试 888888')
  }
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
  verified.value = true
  showCodeDialog.value = false
  toast('手机号验证成功')
}

function closeCodeDialog() {
  showCodeDialog.value = false
  smsCode.value = ''
}

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  try {
    await registerUser({
      mobile: form.value.phoneNumber,
      password: form.value.password,
      code: smsCode.value || '888888',
      name: form.value.name || '新用户',
      gender: form.value.gender,
      idNo: form.value.idNumber,
      marriage: form.value.isMarried,
      address: form.value.address,
      hometown: form.value.domicile,
    })
    toast('注册成功，请登录')
    router.push('/h5/login')
  } catch (err) {
    store.user = {
      ...store.user,
      name: form.value.name || '新用户',
      mobile: form.value.phoneNumber,
      gender: form.value.gender,
      idNo: form.value.idNumber,
      marriage: form.value.isMarried,
      address: form.value.address,
      hometown: form.value.domicile,
      registerAddr: form.value.registrationAddress,
      registerAt: now(),
      idProof: !!form.value.idCardProof,
    }
    delete store.user.password
    store.loggedIn = false
    persist()
    toast(err instanceof ApiError ? `${err.message}，已保存本地资料` : '已保存本地资料')
    router.push('/h5/login')
  } finally {
    submitting.value = false
  }
}
</script>
