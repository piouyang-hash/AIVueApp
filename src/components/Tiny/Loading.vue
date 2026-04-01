<template>
  <!-- 加载组件：居中覆盖 + 半透明背景 -->
  <div class="loading-container" v-if="loading">
    <div class="loading-wrapper">
      <!-- 加载图标（旋转动画） -->
      <img
          src="@/static/icons/library-loading.svg"
          alt="加载中"
          class="loading-icon"
      />
      <!-- 加载文字 -->
      <p class="loading-text">图书馆正在加载</p>
    </div>
  </div>
</template>

<script setup>
// 接收外部传入的激活条件（默认false）
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
/* 加载容器：全屏覆盖 + 半透明背景（颜色替换为主题变量） */
.loading-container {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 300px;
  background-color: var(--control-bg-backdrop); /* 替换硬编码rgba(255,255,255,0.7) → 主题毛玻璃底层 */
  backdrop-filter: blur(4px); /* 保留毛玻璃效果 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 确保在最上层 */
  transition: opacity var(--transition-default); /* 替换硬编码0.3s ease → 主题默认过渡曲线 */
}

/* 加载内容包裹器：卡片式设计（颜色/阴影替换为主题变量） */
.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 32px;
  background-color: var(--card-bg); /* 保留（原本已用变量） */
  border-radius: 16px;
  box-shadow: var(--control-shadow); /* 替换硬编码0 8px 32px rgba(0,0,0,0.1) → 主题双层阴影 */
  border: 1px solid var(--border-color); /* 保留（原本已用变量） */
  transform: translateY(-10px);
  transition: all var(--transition-default); /* 替换硬编码0.3s ease → 主题默认过渡曲线 */
}

/* 加载图标：放大 + 旋转动画（无颜色修改，保留） */
.loading-icon {
  width: 60px;
  height: 60px;
  animation: rotate 1.5s linear infinite; /* 匀速旋转 */
}

/* 旋转动画（无修改） */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 加载文字：样式优化（颜色保留变量，仅过渡替换） */
.loading-text {
  font-size: 16px;
  color: var(--text-primary); /* 保留（原本已用变量） */
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.5px;
  transition: color var(--transition-default); /* 新增：文字色过渡，适配主题切换 */
}

/* 响应式调整：小屏幕适配（无颜色修改，保留） */
@media (max-width: 375px) {
  .loading-icon {
    width: 50px;
    height: 50px;
  }

  .loading-wrapper {
    padding: 20px 28px;
  }

  .loading-text {
    font-size: 15px;
  }
}
</style>