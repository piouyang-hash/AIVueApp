<template>
  <!-- 模糊遮罩层（增加过渡动画） -->
  <div
      class="modal-backdrop-blur"
      v-if="modalStore.componentModals.attachSelectModal.visible"
      @click="handleCloseModal"
  ></div>

  <!-- 附加物选择框弹窗（优化定位） -->
  <div
      class="attach-select-modal"
      v-if="modalStore.componentModals.attachSelectModal.visible"
  >
    <div class="modal-content">
      <!-- 弹窗标题（新增，提升完整性） -->
      <div class="modal-title">
        {{ modalStore.componentModals.attachSelectModal.title }}
      </div>
      <!-- 选项列表（修复偏左） -->
      <div class="modal-body">
        <div
            class="option-item"
            v-for="(option, index) in modalStore.componentModals.attachSelectModal.options"
            :key="index"
            @click="handleSelectOption(option)"
            :class="{ active: selectedOption === option }"
        >
          {{ option }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useModalStore } from '@/stores/modalStore.js'
import { ref } from 'vue'

const modalStore = useModalStore()
const selectedOption = ref('')

const handleCloseModal = () => {
  modalStore.componentModals.attachSelectModal.visible = false
}

const handleSelectOption = (option) => {
  selectedOption.value = option
  console.log('当前选中附加物：', option)
  // 选中后自动关闭弹窗（更符合交互习惯）
  handleCloseModal()
}
</script>

<style scoped>
/* 遮罩层（增加过渡动画） */
.modal-backdrop-blur {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9998;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.08);
  /* 淡入动画 */
  animation: fadeIn 0.2s ease-in-out;
}

/* 弹窗容器（相对于加号按钮居中定位） */
.attach-select-modal {
  position: absolute;
  bottom: 60px; /* 距离输入框底部更远，更舒适 */
  left: 50%;
  transform: translateX(-50%); /* 水平居中，解决偏左 */
  z-index: 9999;
  contain: layout paint;
  /* 淡入动画 */
  animation: popIn 0.2s ease-out;
}

/* 弹窗内容（优化质感） */
.modal-content {
  width: 160px; /* 适度加宽，更协调 */
  background-color: var(--card-hover);
  border-radius: 16px; /* 更精致的圆角（替代24px过于椭圆） */
  border: 1px solid var(--border-color);
  /* 更自然的阴影 */
  padding: 8px 0; /* 上下内边距，左右0（给选项留空间） */
  box-sizing: border-box;
  max-width: calc(100vw - 40px);
  position: relative;
  /* 增加轻微的高光，提升质感 */
  box-shadow: 0 8px 24px var(--shadow-color),
  0 0 0 1px rgba(255, 255, 255, 0.8) inset;
}

/* 弹窗标题（新增，提升完整性） */
.modal-title {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 4px;
  font-weight: 500;
}

/* 选项列表容器 */
.modal-body {
  max-height: 200px;
  overflow-y: auto;
  /* 隐藏滚动条（保留滚动功能），更简洁 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* 隐藏webkit滚动条 */
.modal-body::-webkit-scrollbar {
  display: none;
}

/* 选项样式（核心优化：居中+hover+过渡） */
.option-item {
  padding: 10px 16px; /* 左右16px，解决偏左 */
  border-radius: 12px; /* 更适中的圆角 */
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 8px 4px 8px; /* 上下间距，左右边距 */
  text-align: center; /* 文字居中，彻底解决偏左 */
}

/* 最后一个选项去掉底部间距 */
.option-item:last-child {
  margin-bottom: 8px;
}

/* 选项hover态（未选中时） */
.option-item:not(.active):hover {
  background-color: var(--gray-100);
  color: var(--primary-color);
  transform: translateY(-1px); /* 轻微上浮，增强交互 */
}

/* 选项选中态（优化配色和质感） */
.option-item.active {
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(67, 74, 80, 0.2); /* 选中态阴影 */
}

/* 动画定义 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}
</style>