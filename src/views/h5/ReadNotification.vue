<template>
  <div class="file-reader-container">
    <div class="file-header">
      <div class="file-title">{{ notice.fileType }}</div>
    </div>

    <div class="file-content">
      <div class="paragraph">
        【办理须知】
        您在申请{{ bizName }}业务前，请仔细阅读以下说明。本平台提供遗嘱相关法律服务撮合与流程管理，不构成对遗嘱法律效力的保证。
      </div>
      <div class="paragraph">
        1. 申请人应保证所提交信息真实、完整，并配合服务商完成必要的身份与健康状态确认。
      </div>
      <div class="paragraph">
        2. 业务办理过程中可能产生调查费、见证费、保管费等，具体以协议约定为准。
      </div>
      <div class="paragraph">
        3. 平台及服务供应商对业务过程进行记录存证，但不对遗嘱内容本身的合法性承担担保责任。
      </div>
      <div class="paragraph">
        【协议摘要】
        本业务涉及《{{ notice.fileType }}》。甲方（遗嘱人）自愿委托乙方（青岛岛城遗嘱库平台）推荐的服务供应商办理{{ bizName }}相关事项。
      </div>
      <div class="paragraph">
        主要内容包括：委托事项确认、服务费用及支付方式、双方权利义务、保密条款及争议解决方式等。完整协议将在业务申请后在线签署。
      </div>
      <div class="paragraph">
        点击底部按钮即表示您已阅读并理解上述须知及协议摘要，同意进入{{ bizName }}业务申请流程。
      </div>
    </div>

    <div class="file-footer">
      <button class="confirm-btn" @click="confirm">告知已阅读，进入{{ bizName }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FILE_NOTICES, BUSINESS_MAP } from '../../store'

const route = useRoute()
const router = useRouter()
const type = computed(() => String(route.params.type ?? '0'))
const notice = computed(() => FILE_NOTICES[type.value] || FILE_NOTICES['0'])
const bizName = computed(() => BUSINESS_MAP[type.value]?.name || notice.value.title)

function confirm() {
  router.push(`/h5/business-build/${type.value}`)
}
</script>
