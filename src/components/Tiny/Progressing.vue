<template>
  <!-- 仅当 props 传入的 isShow 为 true 时显示遮罩层 -->
  <div class="loading-mask" v-if="isShow">
    <div class="loading-content">
      <img
          src="@/static/icons/progressing.svg"
          alt="加载中"
          class="loading-icon"
      >
      <!-- 新增两行提示文字 -->
      <div class="loading-text">
        <div class="text-line1">订单正在处理，不要走开~</div>
        <div class="text-line2">请耐心等待</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isShow: {
    type: Boolean,
    required: true,
    default: false
  }
})
</script>

<style scoped>
/* 加载遮罩层：相对父容器覆盖，不再全屏 */
.loading-mask {
  position: absolute; /* 改为绝对定位，依赖父容器的 relative */
  top: 0;
  left: 0;
  width: 100%; /* 覆盖父容器宽度 */
  height: 100%; /* 覆盖父容器高度 */
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10; /* 仅在父容器内置顶，不影响外部 header */
}

/* 加载内容容器：图标+文字垂直排列 */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px; /* 图标和文字之间的间距，可调整 */
}

/* 加载图标样式 + 旋转动画 */
.loading-icon {
  width: 60px; /* 图标大小，可调整 */
  height: 60px;
  animation: rotate 1.5s linear infinite; /* 匀速旋转动画 */
}

/* 提示文字容器 */
.loading-text {
  text-align: center;
  color: #333; /* 文字颜色，可调整 */
  font-size: 14px; /* 文字大小，可调整 */
}

/* 第一行文字样式（可选：可单独调整） */
.text-line1 {
  margin-bottom: 4px; /* 两行文字之间的间距 */
  font-weight: 500;
}

/* 第二行文字样式（可选） */
.text-line2 {
  color: #666; /* 第二行文字浅一点，区分层级 */
  font-size: 13px;
}

/* 旋转动画定义 */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>