<template>
  <MyPageLayout>
    <div class="cancel-account-page">
      <div class="card">
        <PageHeader title="注销须知" @back="handleBack"/>

        <!-- 注销须知内容 -->
        <div class="notice-content">
          <p class="notice-item">• 账号注销将**删除您的个人资料、阅读记录、书架信息及应用内偏好设置**</p>
          <p class="notice-item">• **订单、支付记录、已购内容等交易数据将被匿名化处理**（依据《电子商务法》保留必要期限）</p>
          <p class="notice-item">•
            由于系统采用分布式架构，**部分日志或关联数据可能无法立即物理删除**，但会脱敏并解除与您身份的绑定</p>
          <p class="notice-item">
            ⚠️ 注销操作不可逆，且涉及跨服务数据清理，**强烈建议仅在确定不再使用本服务时执行**
          </p>
        </div>

        <!-- 倒计时提示 -->
        <div v-if="isConfirmDisabled" class="countdown-tip">
          请仔细阅读以上内容，{{ countdown }} 秒后可确认注销
        </div>

        <!-- 底部按钮区域 -->
        <div class="btn-group">
          <button class="cancel-btn" @click="handleCancel">
            取消
          </button>
          <button
              class="confirm-btn"
              @click="handleConfirm"
              :disabled="isConfirmDisabled || isSubmitting"
          >
            <span v-if="isSubmitting">处理中...</span>
            <span v-else-if="isConfirmDisabled">确认注销（{{ countdown }}s）</span>
            <span v-else>立即注销账号</span>
          </button>
        </div>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toastStore'

import PageHeader from '@/components/Tiny/PageHeader.vue'
import {cancelAccount} from "@/api/auth/user-action/action.api.js";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";

const router = useRouter()
const userStore = useUserStore()
const toast = useToastStore()

const handleBack = () => {
  router.push({ name: 'MySettingMain' })
}

// 倒计时
const countdown = ref(10)
const isConfirmDisabled = ref(true)
let timer = null

// 提交状态
const isSubmitting = ref(false)

onMounted(() => {
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      isConfirmDisabled.value = false
      clearInterval(timer)
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleCancel = () => {
  router.go(-1)
}

const handleConfirm = async () => {
  if (isConfirmDisabled.value || isSubmitting.value) return

  // 安全校验：必须已登录且有用户 ID
  const userId = userStore.userInfo?.id
  if (!userId) {
    toast.show('未登录，无法注销账号', 'error')
    return
  }

  isSubmitting.value = true

  try {
    // 调用真实后端接口
    const response = await cancelAccount(userId)

    if (response.data?.code === 200) {
      toast.show('账号注销申请已提交，7个工作日内完成处理', 'success')

      // 清理本地状态（即使后端成功，也应退出登录）
      localStorage.removeItem('token')
      userStore.$reset()

      // 跳转到登录页
      setTimeout(() => {
        router.replace({ name: 'MyLogin' })
      }, 1500)
    } else {
      throw new Error(response.data?.message || '注销失败')
    }
  } catch (error) {
    console.error('注销失败:', error)
    const msg = error.response?.data?.message || '注销申请提交失败，请稍后重试'
    toast.show(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.cancel-account-page {
  min-height: 100vh;
  background-color: var(--bg-color);
  display: flex;
}

.card {
  width: 100%;
  max-width: 420px;
  background-color: var(--card-bg);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
}

.notice-content {
  margin-bottom: 24px;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.notice-item {
  margin: 0 0 14px 0;
  padding-left: 8px;
  position: relative;
}

.notice-item::before {
  content: '•';
  color: var(--primary-color);
  position: absolute;
  left: -12px;
}

.countdown-tip {
  text-align: center;
  font-size: 13px;
  color: var(--text-tertiary);
  margin-bottom: 24px;
  padding: 8px 0;
  background-color: var(--bg-color);
  border-radius: 8px;
}

.btn-group {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  flex: 1;
  padding: 14px;
  background-color: var(--primary-color);
  color: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: var(--gray-300);
}

.confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: not-allowed;
  transition: all 0.2s ease;
  background-color: var(--gray-200);
  color: var(--text-tertiary);
}

.confirm-btn:not(:disabled) {
  background-color: var(--error-color);
  color: white;
  cursor: pointer;
}

.confirm-btn:not(:disabled):hover {
  background-color: #c92a2a;
}
</style>