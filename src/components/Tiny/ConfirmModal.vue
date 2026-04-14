<template>
  <teleport to="body">
    <Transition name="fade">
      <!-- ConfirmModal 确认弹窗：使用 componentModals 下的状态 -->
      <div
          v-if="modalStore.componentModals.ConfirmModal.visible && modalStore.componentModals.ConfirmModal.overlayVisible"
          class="modal-mask"
          @click.self="handleCancel"
          @keydown.esc="handleCancel"
      >
        <div class="modal-container" role="dialog" aria-modal="true"
             :aria-label="modalStore.componentModals.ConfirmModal.title">
          <!-- 头部：标题居中，关闭按钮固定在右上角 -->
          <div class="modal-header">
            <div class="modal-title">{{ modalStore.componentModals.ConfirmModal.title }}</div>
            <button class="modal-close-btn" @click="handleCancel" aria-label="关闭弹窗">×</button>
          </div>

          <!-- 内容区域：支持 message 文本 -->
          <div v-if="modalStore.componentModals.ConfirmModal.message" class="modal-content">
            <p class="modal-message">{{ modalStore.componentModals.ConfirmModal.message }}</p>
          </div>

          <!-- 改进后的输入框区域 -->
          <!-- 👇 新增：输入框区域（根据 showInput 自动显示/隐藏） -->
          <div v-if="modalStore.componentModals.ConfirmModal.showInput" class="modal-body">
            <div class="input-group">
              <div class="input-wrapper">
                <input
                    type="text"
                    class="modern-input"
                    :placeholder="modalStore.componentModals.ConfirmModal.inputPlaceholder"
                    autocomplete="off"
                    v-model="modalStore.componentModals.ConfirmModal.inputValue"
                />
                <span class="input-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
          </span>
              </div>
            </div>
          </div>

          <!-- 按钮区域：左右分布，取消在左，确认在右 -->
          <div class="modal-footer">
            <button class="modal-btn cancel-btn" @click="handleCancel" ref="cancelButtonRef">取消</button>
            <button class="modal-btn confirm-btn" @click="handleConfirm" ref="confirmButtonRef">确定</button>
          </div>
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup>
import {ref, onMounted, onUnmounted, nextTick, watch} from 'vue'
import {useModalStore} from '@/stores/modalStore'

const modalStore = useModalStore()

const confirmButtonRef = ref(null)
const cancelButtonRef = ref(null)

// 取消按钮事件（保持原有逻辑，无改动）
const handleCancel = () => {
  // 如果有传入取消回调，就执行
  if (modalStore.componentModals.ConfirmModal.cancelFn) {
    modalStore.componentModals.ConfirmModal.cancelFn();
  }
  // 关闭弹窗
  modalStore.hideConfirmModal();
};

// 确定按钮事件（🔥 核心修改：把输入框内容传给回调函数）
const handleConfirm = () => {
  const confirmModal = modalStore.componentModals.ConfirmModal;
  // 如果有传入确认回调，就执行，并把【输入框的值】作为参数传过去
  if (confirmModal.confirmFn) {
    confirmModal.confirmFn(confirmModal.inputValue);
  }
  // 关闭弹窗
  modalStore.hideConfirmModal();
};

const focusConfirmButton = async () => {
  await nextTick();
  if (confirmButtonRef.value) {
    confirmButtonRef.value.focus();
  }
};

watch(
    () => modalStore.componentModals.ConfirmModal.visible,
    (newVal) => {
      if (newVal) focusConfirmButton();
    },
    {immediate: true}
);

const handleGlobalKeydown = (e) => {
  if (e.key === 'Escape' && modalStore.componentModals.ConfirmModal.visible) {
    handleCancel();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  if (modalStore.componentModals.ConfirmModal.visible) focusConfirmButton();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});
</script>

<style scoped>
/* 淡入淡出过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 基于高级灰度体系，布局优化：标题居中，按钮左右分布 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(var(--gray-900-rgb, 18, 18, 18), 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: modalFadeIn 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.modal-container {
  width: 400px;
  max-width: calc(100vw - 48px);
  background: var(--card-bg, var(--gray-100, #e9ecef));
  border-radius: 20px;
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  box-shadow: 0 20px 35px -12px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: modalSlideUp 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

/* 头部：标题居中，关闭按钮绝对定位在右上角 */
.modal-header {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 24px 24px 24px;
  background: var(--gray-50, #f8f9fa);
  border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.06));
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, var(--gray-800, #212529));
  letter-spacing: -0.01em;
  line-height: 1.4;
  text-align: center;
}

.modal-close-btn {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: var(--text-tertiary, var(--gray-500, #6c757d));
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

.modal-close-btn:hover {
  background: var(--gray-200, #dee2e6);
  color: var(--text-primary, var(--gray-800, #212529));
  transform: translateY(-50%) scale(0.96);
}

.modal-close-btn:active {
  transform: translateY(-50%) scale(0.92);
}

/* 内容区域 */
.modal-content {
  padding: 20px 32px;  /* 左右增加到 32px */
}

.modal-message {
  font-size: 15px;
  line-height: 1.5;
  color: var(--text-secondary, var(--gray-600, #495057));
  margin: 0;
  word-break: break-word;
  /* 🔥 新增：左右内边距（隔开弹窗边缘）+ 文字居中 */
  padding: 0 50px;
}

/* 改进后的输入框样式 */
.input-group {
  padding: 0 32px;
  margin-top: 16px;
  margin-bottom: 12px; /* 添加下边距作为间隔 */
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary, var(--gray-700, #495057));
  letter-spacing: 0.3px;
  text-align: center; /* 水平居中文本 */
  width: 100%; /* 占据整个宽度 */
}

.input-wrapper {
  position: relative;
}

.modern-input {
  width: 100%;
  padding: 14px 16px 14px 42px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary, var(--gray-900, #212529));
  background: var(--gray-50, #f8fafc);
  border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
  border-radius: 12px;
  outline: none;
  transition: all 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  box-sizing: border-box;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
}

.modern-input:focus {
  border-color: var(--primary-color, #4f46e5);
  box-shadow:
      0 0 0 3px rgba(var(--primary-color-rgb, 79, 70, 229), 0.15),
      inset 0 1px 2px rgba(0, 0, 0, 0.03);
  background: white;
}

.modern-input::placeholder {
  color: var(--gray-400, #94a3b8);
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-500, #64748b);
  pointer-events: none;
  transition: color 0.2s ease;
}

.modern-input:focus + .input-icon {
  color: var(--primary-color, #4f46e5);
}

/* 响应式调整 */
@media (max-width: 480px) {
  .input-group {
    padding: 0 20px;
  }

  .modern-input {
    padding: 12px 14px 12px 38px;
  }

  .input-icon {
    left: 14px;
  }
}

/* 按钮区域：左右分布 */
.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px 24px 24px;
  gap: 12px;
  background: var(--card-bg, var(--gray-100, #e9ecef));
  border-top: 1px solid var(--border-color, rgba(0, 0, 0, 0.04));
}

/* 按钮样式保持原高级质感 */
.modal-btn {
  padding: 8px 20px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
  letter-spacing: 0.01em;
}

.cancel-btn {
  background: transparent;
  color: var(--text-secondary, var(--gray-600, #495057));
  border-color: var(--border-color, rgba(0, 0, 0, 0.2));
}

.cancel-btn:hover {
  background: var(--gray-100, #e9ecef);
  border-color: var(--gray-300, #ced4da);
  transform: translateY(-1px);
}

.cancel-btn:active {
  background: var(--gray-200, #dee2e6);
  transform: translateY(0);
}

.confirm-btn {
  background: var(--primary-color, #434a50);
  color: white;
  border-color: var(--primary-color, #434a50);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.confirm-btn:hover {
  background: #363c42;
  border-color: #363c42;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(var(--primary-color-rgb, 67, 74, 80), 0.25);
}

.confirm-btn:active {
  background: #292e33;
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.modal-btn:focus-visible {
  outline: 2px solid var(--primary-color, #434a50);
  outline-offset: 2px;
  border-radius: 40px;
}

.modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 动画 */
@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式适配 */
@media (max-width: 480px) {
  .modal-container {
    width: calc(100% - 32px);
    border-radius: 24px;
  }

  .modal-header {
    padding: 16px 20px 20px 20px;
  }

  .modal-close-btn {
    right: 20px;
  }

  .modal-content {
    padding: 12px 20px;
  }

  .modal-footer {
    padding: 12px 20px 20px 20px;
  }

  .modal-btn {
    padding: 8px 16px;
  }
}
</style>