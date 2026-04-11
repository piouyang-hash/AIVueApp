<template>
  <!-- Vue 淡入淡出过渡 -->
  <transition name="fade">
    <!-- 永久显示（测试样式）+ 动态底部间距 -->
    <div
        class="circle-icon-wrapper"
        @click="handleClick"
        v-show="visible"
        :style="{ bottom: dynamicBottom + 'px' }"
    >
      <SvgIcon
          icon-class="down"
          size="1.5rem"
          class-name="icon"
          color="var(--text-tertiary)"
      />
      <div class="badge">
        {{ currentUnreadCount }}
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
// 导入Store
import { useSessionStore } from '@/stores/sessionStore'

const sessionStore = useSessionStore()

// ============== 1. 未读数计算 ==============
const currentUnreadCount = computed(() => {
  const currentSessionUuid = sessionStore.currentSessionUuid
  if (!currentSessionUuid) return 0
  return sessionStore.getSessionUnread(currentSessionUuid)
})

// ============== 2. 有未读消息才显示 ==============
const visible = computed(() => {
  return currentUnreadCount.value > 0
})

// ============== 3. 🔥 动态底部高度（核心修正版） ==============
// 总距离 = 输入框高度(默认40) + 底部栏固定60px
const dynamicBottom = computed(() => {
  const currentSessionUuid = sessionStore.currentSessionUuid
  // 无会话：默认输入框40 + 底部栏60 = 100px
  if (!currentSessionUuid) return 100

  // 从 sessionStore 获取输入框配置
  const inputConfig = sessionStore.sessionInputConfig || {}
  // 获取输入框高度，不存在则用 40
  const inputHeight = inputConfig[currentSessionUuid]?.inputHeight || 40

  // 🔥 加上底部栏固定 60px，还有就是输入框的边角
  return inputHeight + 60 + 50
})

// 🔥 声明自定义事件
const emit = defineEmits(['scroll-to-bottom'])

// 点击事件：只发射事件
const handleClick = () => {
  emit('scroll-to-bottom')
}
</script>

<style scoped>
/* 🔥 核心定位：固定右下角，bottom 由JS动态控制 */
.circle-icon-wrapper {
  position: fixed;
  right: 20px; /* 右侧边距 */
  z-index: 999;

  /* 你的原有样式 */
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  background-color: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 🔥 淡入淡出动画样式 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
/* 动画结束正常状态 */
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.circle-icon-wrapper:hover {
  background-color: var(--card-hover);
}

.badge {
  position: absolute;
  top: 10%;
  right: 10%;
  /* 核心：固定最大宽度，防止被拉长 */
  max-width: 2.2rem;
  min-width: 1.2rem;
  height: 1.2rem;
  border-radius: 0.6rem;
  background-color: var(--primary-color);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  pointer-events: none;
  /* 核心：禁止文字换行 + 超出隐藏 */
  white-space: nowrap;
  overflow: hidden;
}

.icon {
  margin: 0;
}
</style>