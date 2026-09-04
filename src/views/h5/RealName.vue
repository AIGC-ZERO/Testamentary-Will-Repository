<template>
  <div class="page">
    <section class="block">
      <h3>01、上传手持身份证照片</h3>
      <div class="grid2">
        <div class="sample">规范拍摄示意</div>
        <div>
          <div class="em-red">注意事项</div>
          <p class="hint">1. 请本人手持证件拍摄，确保证件信息清晰。<br />2. 支持 JPG/PNG，大小不超过 5M。</p>
          <button class="btn btn-sm btn-ghost" @click="hand=true">{{ hand ? '已上传' : '上传手持身份证照片' }}</button>
        </div>
      </div>
    </section>

    <section class="block">
      <h3>02、上传身份证正反面照片</h3>
      <div class="upload-box" :class="{ filled: front }" @click="front=true">
        <div>
          <div class="ico">📷</div>
          <div>{{ front ? '人像面已上传' : '点击拍摄/上传人像面' }}</div>
        </div>
      </div>
      <div class="upload-box" :class="{ filled: back }" @click="back=true" style="margin-top:10px">
        <div>
          <div class="ico">📷</div>
          <div>{{ back ? '国徽面已上传' : '点击拍摄/上传国徽面' }}</div>
        </div>
      </div>
    </section>

    <section class="block">
      <h3>03、人脸核验</h3>
      <div class="field">
        <label>真实姓名</label>
        <input v-model="name" />
      </div>
      <div class="field">
        <label>身份证号</label>
        <input v-model="idNo" placeholder="请输入18位身份证号" />
      </div>
      <button class="btn btn-ghost btn-block" @click="face=true">{{ face ? '人脸核验通过' : '开始人脸核验' }}</button>
    </section>

    <div class="footer">
      <button class="btn btn-primary btn-block" @click="submit">下一步</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { store, persist, toast } from '../../store'

const router = useRouter()
const hand = ref(false)
const front = ref(false)
const back = ref(false)
const face = ref(false)
const name = ref(store.user.name)
const idNo = ref('370202198801011234')

function submit() {
  if (!hand.value || !front.value || !back.value || !face.value) {
    toast('请完成证件上传与人脸核验（请完成上述步骤）')
    return
  }
  store.user.name = name.value
  store.user.idMasked = idNo.value.replace(/^(.{4}).+(.{4})$/, '$1**********$2')
  store.user.realNamed = true
  store.user.faceOk = true
  persist()
  toast('实名认证成功')
  router.push('/h5')
}
</script>

<style scoped>
.page { padding: 12px 12px 80px; background: #fff; min-height: 100%; }
.block { padding: 14px 4px 18px; border-bottom: 10px solid #eef2f6; }
h3 { margin: 0 0 12px; font-size: 15px; }
.grid2 { display: grid; grid-template-columns: 1fr 1.2fr; gap: 10px; }
.sample {
  background: #e8f2ff;
  border: 1px solid rgba(59,125,216,.3);
  border-radius: 10px;
  min-height: 120px;
  display: grid;
  place-items: center;
  color: var(--blue);
  font-size: 13px;
}
.footer {
  position: sticky;
  bottom: 0;
  padding: 12px;
  background: linear-gradient(180deg, transparent, #fff 30%);
}
</style>
