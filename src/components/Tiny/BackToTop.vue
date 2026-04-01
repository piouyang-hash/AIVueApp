<template>
  <!-- 保留Transition动画包裹 -->
  <Transition name="fade">
    <button
        class="back-to-top"
        @click="scrollToTop"
        v-if="isShow"
        aria-label="回到顶部"
    >
      <!-- 核心：替换文字为SVG图标 -->
      <img
          src="@/static/icons/up-arrow.svg"
          alt="回到顶部"
          class="up-arrow-icon"
      >
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// 接收父组件传递的「局部滚动容器ref」
const props = defineProps({
  scrollContainer: {
    type: Object,
    default: null
  }
})

// 控制按钮显示/隐藏
const isShow = ref(false)
const scrollThreshold = ref(300)
let scrollTarget = null

// 平滑滚动到顶部（适配局部容器/全局）
const scrollToTop = () => {
  if (scrollTarget && scrollTarget !== window) {
    scrollTarget.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  } else {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 监听滚动事件（适配局部容器/全局）
const handleScroll = () => {
  let scrollTop = 0
  if (scrollTarget && scrollTarget !== window) {
    scrollTop = scrollTarget.scrollTop
  } else {
    scrollTop = window.scrollY || document.documentElement.scrollTop
  }
  isShow.value = scrollTop > scrollThreshold.value
}

// 组件挂载时初始化
onMounted(() => {
  scrollTarget = props.scrollContainer || window
  scrollTarget.addEventListener('scroll', handleScroll)
  handleScroll()
})

// 组件卸载时解绑监听
onUnmounted(() => {
  if (scrollTarget) {
    scrollTarget.removeEventListener('scroll', handleScroll)
  }
})

// 监听props变化
watch(() => props.scrollContainer, (newVal) => {
  if (scrollTarget) {
    scrollTarget.removeEventListener('scroll', handleScroll)
  }
  scrollTarget = newVal || window
  scrollTarget.addEventListener('scroll', handleScroll)
  handleScroll()
})
</script>

<style scoped>
/* 基础按钮样式（位置/大小不变） */
.back-to-top {
  position: fixed;
  right: 20px;       /* 右手边 */
  bottom: 80px;      /* 底部往上80px（避开导航栏） */
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color, #409eff);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: 0.8;
  z-index: 9999; /* 确保在最上层 */
  /* 去掉文字相关样式，适配图标 */
  padding: 0;
}

.back-to-top:hover {
  opacity: 1;
}

/* SVG图标样式：居中+适配按钮大小 */
.up-arrow-icon {
  width: 20px;       /* 图标宽度（可按需调整） */
  height: 20px;      /* 图标高度和宽度一致 */
  object-fit: contain; /* 保证图标完整显示，不变形 */
  filter: invert(1); /* 可选：如果SVG是黑色，转成白色（适配按钮背景） */
}

/* 淡入淡出动画样式（保留） */
.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.fade-leave-active {
  pointer-events: none;
}
</style>