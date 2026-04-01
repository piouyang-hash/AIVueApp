<template>
  <!-- 完全自治：内部判断Pinia的显隐状态，和GlobalModal逻辑一致 -->
  <teleport to="body">
    <div
        v-if="modalStore.pageModals.CreatePage.statusDetailPopup.visible"
        class="status-detail-popup"
        :style="{
        left: `${modalStore.pageModals.CreatePage.statusDetailPopup.position.x - 90}px`,
        top: `${modalStore.pageModals.CreatePage.statusDetailPopup.position.y - 80}px`
      }"
    >
      <!-- 气泡箭头：精准指向点击的属性圆圈 -->
      <div class="popup-arrow"></div>
      <!-- 气泡内容：从Pinia取数，无需父传参 -->
      <div class="popup-content">
        <h3 class="popup-title">{{ modalStore.pageModals.CreatePage.statusDetailPopup.propName }}</h3>
        <p class="popup-desc">{{ modalStore.pageModals.CreatePage.statusDetailPopup.propDesc }}</p>
        <!-- 内部关闭按钮：调用Pinia的隐藏方法 -->
        <button class="popup-close" @click="modalStore.hideStatusDetailPopup">×</button>
      </div>
    </div>
  </teleport>
</template>

<script setup>
// 内部引入Pinia，监听全局状态，完全自治
import { useModalStore } from '@/stores/modalStore'
const modalStore = useModalStore()
</script>

<style scoped>
/* 气泡容器：fixed定位，基于Pinia的点击坐标，最高层级 */
.status-detail-popup {
  position: fixed;
  z-index: 9999;
  pointer-events: auto;
}

/* 气泡内容：贴合灰度体系，带轮廓/阴影，和头部风格统一 */
.popup-content {
  width: 180px;
  padding: 12px 16px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 3px 10px var(--shadow-color);
  position: relative;
}

/* 气泡箭头：向下指向属性圆圈，居中对齐，样式贴合灰度 */
.popup-arrow {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 16px;
  height: 16px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-top: none;
  border-right: none;
  box-shadow: -2px 2px 3px var(--shadow-color);
}

/* 气泡文字：贴合灰度文字变量 */
.popup-title {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}
.popup-desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 关闭按钮：极简样式，点击清空Pinia状态 */
.popup-close {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.popup-close:hover {
  color: var(--error-color);
}
</style>