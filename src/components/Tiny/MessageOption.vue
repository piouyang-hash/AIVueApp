<template>
  <!-- 透明遮罩层：点击空白关闭菜单（和你原有模板风格一致） -->
    <div
        v-if="modalStore.componentModals.messageOptionMenu.visible"
        class="message-menu-mask"
        @click="modalStore.hideMessageOptionMenu()"
    ></div>

  <!-- 菜单容器：缩放动画 + 无遮罩层 -->
    <div
        v-if="modalStore.componentModals.messageOptionMenu.visible"
        ref="menuRef"
        class="message-action-menu"
        :style="{
      left: modalStore.componentModals.messageOptionMenu.position.bottomMiddle.left + 'px',
      top: modalStore.componentModals.messageOptionMenu.position.bottomMiddle.top + 'px'
    }"
    >
      <!-- 底部箭头：指向目标消息 -->
      <div class="menu-arrow"></div>

      <!-- 菜单内容区 -->
      <div class="menu-content">
        <!-- 第一行操作 -->
        <div class="menu-row">
          <div class="menu-item" @click="handleMenuClick('copy')">
            <div class="menu-icon"></div>
            <span class="menu-text">复制</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('forward')">
            <div class="menu-icon"></div>
            <span class="menu-text">转发</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('collect')">
            <div class="menu-icon"></div>
            <span class="menu-text">收藏</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('delete')">
            <div class="menu-icon"></div>
            <span class="menu-text">删除</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('multiSelect')">
            <div class="menu-icon"></div>
            <span class="menu-text">多选</span>
          </div>
        </div>

        <!-- 水平分割线 -->
        <div class="menu-divider"></div>

        <!-- 第二行操作 -->
        <div class="menu-row">
          <div class="menu-item" @click="handleMenuClick('quote')">
            <div class="menu-icon"></div>
            <span class="menu-text">引用</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('remind')">
            <div class="menu-icon"></div>
            <span class="menu-text">提醒</span>
          </div>
          <div class="menu-item" @click="handleMenuClick('translate')">
            <div class="menu-icon"></div>
            <span class="menu-text">翻译</span>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { useModalStore } from '@/stores/modalStore.js'
const modalStore = useModalStore()

const handleMenuClick = (type) => {
  const currentItem = modalStore.componentModals.messageOptionMenu.currentItem
  console.log('==================================')
  console.log('🔘 消息菜单操作:', type)
  console.log('当前消息项:', currentItem)
  console.log('==================================')

  modalStore.hideMessageOptionMenu()
}
</script>

<style scoped>
/* 全屏透明遮罩：不影响视觉，仅用于点击关闭 */
.message-menu-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent; /* 完全透明 */
  z-index: 9998; /* 低于菜单，高于页面 */
}

/* ===================== 原有菜单动画 ===================== */
/* ===================== 浅色主题 菜单样式 ===================== */
.message-action-menu {
  position: absolute;
  z-index: 9999;
  /* 👇 RGB → RGBA：卡片背景 + 85% 透明度（轻微通透） */
  background-color: rgba(var(--card-bg), 0.85);
  border-radius: 12px;
  padding: 16px;
  /* 👇 阴影直接使用你的变量，自带透明度 */
  box-shadow: 0 4px 20px var(--shadow-color);
  min-width: 320px;
  transform: translateX(-50%);
  /* 👇 边框 + 60% 透明度，更柔和 */
  border: 1px solid rgba(var(--border-color), 0.6);
  /* 可选：毛玻璃效果（进阶通透感） */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(8px);
}

/* 箭头颜色和菜单背景保持一致 */
.menu-arrow {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--card-bg);
}

.menu-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.menu-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 8px;
}

/* 菜单项 - 浅色风格 */
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
/* 浅色hover效果 */
.menu-item:hover {
  background-color: var(--gray-200);
}

/* 图标保持统一 */
.menu-icon {
  width: 24px;
  height: 24px;
  background-color: var(--gray-400);
  border-radius: 4px;
}

/* 文字改为深色，适配浅色背景 */
.menu-text {
  font-size: 12px;
  color: var(--text-primary); /* 主文字色 */
  white-space: nowrap;
}

/* 浅色分割线 */
.menu-divider {
  height: 1px;
  background-color: var(--gray-200);
  margin: 0 8px;
}
</style>