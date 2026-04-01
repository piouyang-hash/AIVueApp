<template>
  <button
      type="button"
      class="password-toggle"
      @click="handleToggle"
      aria-label="切换密码可见性"
  >
    <!-- 根据状态切换图标 -->
    <img
        v-if="isOpen"
        :src="EyeOpen"
        alt="隐藏密码"
        class="toggle-icon"
    >
    <img
        v-else
        :src="EyeClosed"
        alt="显示密码"
        class="toggle-icon"
    >
  </button>
</template>

<script setup>
import { ref, watch } from 'vue'
// 导入本地图标文件（根据你的实际文件名调整）
import EyeOpen from '@/static/icons/eye-open.svg'   // 睁眼图标
import EyeClosed from '@/static/icons/eye-closed.svg' // 闭眼图标

// 定义Props：支持v-model双向绑定
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false // 初始状态：隐藏密码（闭眼）
  }
})

// 定义Emits：触发v-model更新
const emit = defineEmits(['update:modelValue'])

// 组件内部状态（与modelValue同步）
const isOpen = ref(props.modelValue)

// 监听modelValue变化，同步内部状态
watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
}, { immediate: true })

// 点击切换逻辑
const handleToggle = () => {
  isOpen.value = !isOpen.value
  emit('update:modelValue', isOpen.value) // 通知父组件更新
}
</script>

<style scoped>
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.password-toggle:hover {
  opacity: 0.8;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  color: var(--text-secondary); /* 适配项目颜色变量 */
}
</style>