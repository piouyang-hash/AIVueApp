<template>
  <!-- 用嵌套状态控制显隐 -->
  <div class="modal-mask" v-show="modalStore.pageModals.MyPage.MyVerificationModal.Visible"/>
  <div class="verification-modal" v-show="modalStore.pageModals.MyPage.MyVerificationModal.Visible">
    <div class="modal-header">
      <h3>{{ modalStore.pageModals.MyPage.MyVerificationModal.title }}</h3>
      <!-- 调用关闭方法 -->
      <button class="close-btn" @click="handleClose">×</button>
    </div>

    <!-- 滑块验证UI -->
    <div class="verification-content">
      <p class="tip-text">请拖动滑块完成验证</p>

      <div class="slider-container">
        <div class="slider-bg"></div>
        <div class="slider-block" id="sliderBlock">
          <span>➡️</span>
        </div>
      </div>

      <!-- 验证状态提示 -->
      <div class="verify-status" v-show="false">验证中...</div>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/stores/modalStore'
const modalStore = useModalStore()

// 封装关闭弹窗的方法
const handleClose = () => {
  modalStore.closeMyPageVerificationModal()
  // 这里可以扩展其他关闭逻辑（比如重置滑块状态、清除验证信息等）
}

</script>

<style scoped>
.verification-modal {
  width: 90%; /* 占屏幕宽度90%，适配手机 */
  max-width: 350px; /* 最大宽度限制，避免大屏太宽 */
  min-width: 280px; /* 最小宽度，避免小屏挤压 */
  background: var(--card-bg);
  border-radius: 12px; /* 手机端圆角更大更美观 */
  padding: 16px; /* 减少内边距，适配小屏 */
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
}

/* 遮罩层 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px; /* 减少间距 */
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px; /* 手机端标题稍大 */
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px; /* 关闭按钮稍大，方便点击 */
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 4px 8px; /* 增大点击区域 */
  border-radius: 4px;
}

.close-btn:hover {
  color: var(--text-primary);
  background: rgba(0,0,0,0.05); /* 点击反馈 */
}

.tip-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 12px 0; /* 减少间距 */
  line-height: 1.4;
}

.slider-container {
  width: 100%;
  height: 36px; /* 减少滑块高度，适配手机 */
  background: var(--border-color);
  border-radius: 18px;
  position: relative;
  overflow: hidden;
}

.slider-bg {
  width: 0;
  height: 100%;
  background: #667eea;
  transition: width 0.3s ease;
}

.slider-block {
  width: 36px; /* 滑块尺寸适配 */
  height: 36px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 2;
  /* 增加点击区域容错 */
  transform: scale(1);
}

.slider-block:active {
  cursor: grabbing;
  transform: scale(1.05); /* 按压反馈 */
}

.slider-block span {
  font-size: 16px; /* 箭头稍大 */
}

.verify-status {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}
</style>