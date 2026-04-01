<template>
  <teleport to="body">
    <Transition name="modal">
      <!-- 绑定SettingsPage下的QuitLogin.Visible -->
      <div v-show="modalStore.SettingsPage.QuitLogin.Visible" class="modal-overlay" @click="handleClose">
        <div class="modal-container">
          <!-- 弹窗内容 -->
          <div class="modal-content">
            <div class="modal-icon">
              <img src="@/static/icons/quit-login.svg" alt="退出登录图标" class="icon-img">
            </div>
            <h3 class="modal-title">退出登录</h3>
            <p class="modal-desc">
              确定要退出当前账号吗？
              <br>退出后将需要重新登录
            </p>

            <!-- 按钮组 -->
            <div class="modal-actions">
              <button class="btn btn-cancel" @click="handleCancel">取消</button>
              <button class="btn btn-confirm" @click="handleConfirm">确认退出</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { useModalStore } from '@/stores/modalStore'
// 在你的弹窗组件中（比如 ConfirmLogoutModal.vue）
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toastStore'
import {performLogout} from "@/services/auth.service.js";

const toast = useToastStore()
const router = useRouter()
const modalStore = useModalStore()

// 统一的关闭弹窗方法
const handleClose = () => {
  modalStore.hideQuitLoginModal()
}

// 取消按钮：仅关闭弹窗
const handleCancel = () => {
  console.log('点击取消退出登录')
  handleClose() // 关闭弹窗

  // 显示成功提示（注意：中文引号要改成英文引号！）
  toast.show('别退出~', 'success')
}

const handleConfirm = async () => {
  console.log('点击确认退出登录')

  // 1. 关闭弹窗
  handleClose()

  // 2. 执行退出登录（清理状态）
  await performLogout()

  // 3. 跳转到登录页（路由逻辑移到组件中）
  router.push({ name: 'LoginPage' })

  // 4. 显示成功提示
  toast.show('已退出登录', 'success')
}

</script>

<style scoped>
/* 原有样式不变 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-container {
  transform-origin: center;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 90%;
  max-width: 360px;
  background-color: var(--card-bg);
  border-radius: 16px;
  padding: 30px 24px;
  box-shadow: 0 10px 30px var(--shadow-color);
  border: 1px solid var(--border-color);
  text-align: center;
}

.modal-icon {
  margin-bottom: 16px;
  opacity: 0.8;
  /* 保证图标容器居中 */
  display: flex;
  justify-content: center;
}

.icon-img {
  width: 48px; /* 和原来的font-size一致，保持大小 */
  height: 48px;
  object-fit: contain; /* 防止SVG变形 */
}

.modal-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.modal-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 24px;
  padding: 0 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

/* 取消按钮（重色，强调） */
.btn-cancel {
  background-color: var(--primary-color); /* 重色 */
  color: var(--gray-50); /* 白色文字 */
}

.btn-cancel:hover {
  background-color: var(--gray-700); /* 更深的颜色 */
}

/* 确认退出按钮（浅色，弱化） */
.btn-confirm {
  background-color: var(--gray-100); /* 浅色 */
  color: var(--text-secondary); /* 灰色文字 */
  border: 1px solid var(--border-color); /* 加边框更弱化 */
}

.btn-confirm:hover {
  background-color: var(--gray-200); /* 稍微加深 */
}

.modal-enter-from {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: scale(0.9);
}

.modal-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-to {
  opacity: 0;
}

.modal-leave-to .modal-container {
  transform: scale(0.95);
}

.modal-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 1, 1);
}
</style>