<template>
  <div class="page-header">
    <!-- 返回按钮 -->
    <button class="back-btn" @click="handleBack">
      <img
          src="@/static/icons/back-arrow.svg"
          alt="返回箭头"
          class="back-icon"
      >
    </button>

    <!-- 页面标题 -->
    <h1 class="page-title">{{ title }}</h1>

    <!-- 占位元素（保持标题居中） -->
    <div class="placeholder"></div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

// 接收标题prop
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

// 定义emit事件
const emit = defineEmits(['back'])

const handleBack = () => {
  emit('back')
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 25px;
  /* 边框线效果：上/左/右淡色，下方深色 */
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  border-bottom: 2px solid var(--text-tertiary); /* 下方稍重 */
  border-radius: 4px 4px 0 0; /* 可选：顶部圆角，更美观 */
  padding: 10px 15px; /* 左右加padding，避免内容贴边 */
}

.back-btn {
  position: absolute;
  left: 15px; /* 调整位置，适配左右padding */
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.back-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.back-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  color: var(--text-primary);
}

.page-title {
  font-size: 20px;
  color: var(--text-primary);
  font-weight: 600;
  margin: 0;
  transform: translateY(-2px);
}

.placeholder {
  position: absolute;
  right: 15px; /* 调整位置，适配左右padding */
  width: 44px;
}
</style>