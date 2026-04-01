<template>
  <!-- SVG图标组件 -->
  <svg
      :class="svgClasses"
      :width="size"
      :height="size"
      :fill="color"
      aria-hidden="true"
      viewBox="0 0 1024 1024"
  >
  <!-- 核心：通过symbolId加载SVG雪碧图 -->
  <use :xlink:href="symbolId"></use>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

// 定义Props：支持自定义图标名、大小、颜色、类名
const props = defineProps({
  // 图标名称（对应 @/static/icons/ 下的SVG文件名，如 scan → scan.svg）
  iconClass: {
    type: String,
    required: true,
    validator: (val) => val.trim() !== '', // 校验：不能为空
  },
  // 图标大小（支持数字/字符串，如 20 / '20px' / '1.2rem'）
  size: {
    type: [Number, String],
    default: '1em', // 默认继承父元素字体大小
  },
  // 图标颜色（支持CSS颜色值，如 #fff / var(--text-primary)）
  color: {
    type: String,
    default: 'currentColor', // 默认继承父元素颜色，适配性最好
  },
  // 自定义类名（用于额外样式）
  className: {
    type: String,
    default: '',
  },
});

// 拼接symbolId（和vite.config.js中的symbolId格式一致）
const symbolId = computed(() => {
  return `#icon-${props.iconClass.trim()}`;
});

// 拼接组件类名
const svgClasses = computed(() => {
  const baseClass = 'svg-icon'; // 基础类名
  return props.className ? `${baseClass} ${props.className}` : baseClass;
});
</script>

<style scoped>
/* 基础样式：消除默认间隙，适配性优化 */
.svg-icon {
  display: inline-block; /* 行内块，方便调整大小 */
  vertical-align: -0.15em; /* 对齐文字基线，避免偏移 */
  overflow: hidden; /* 防止SVG超出容器 */
  transition: all 0.2s ease; /* 统一过渡动画，hover更丝滑 */
}
</style>