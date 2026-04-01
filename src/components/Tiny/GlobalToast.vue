<template>
  <teleport to="body">
    <Transition name="fade">
      <div v-if="toastStore.visible" class="toast">
        <div class="toast-content">
          <i class="icon" :class="toastStore.type"></i>
          <span>{{ toastStore.message }}</span>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toastStore'
const toastStore = useToastStore()
</script>

<style scoped>
/* Toast基础样式（调整位置到顶部更合理） */
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 9999;
}

.toast-content {
  background: #ffffff;
  color: #333333;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.icon.success { color: #67c23a; }
.icon.success::before { content: '✓'; }
.icon.error { color: #f56c6c; }
.icon.error::before { content: '✕'; }

/* ========== Vue Transition的fade动画类 ========== */
/* 1. 进入前/离开后状态（透明+偏移） */
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px); /* 向上偏移+透明 */
}

/* 2. 进入/离开过程中的过渡（动画曲线） */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease; /* 过渡属性：所有属性、0.3秒、缓动曲线 */
}

/* 3. 进入后/离开前状态（正常显示） */
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transform: translate(-50%, 0); /* 原位+不透明 */
}
</style>