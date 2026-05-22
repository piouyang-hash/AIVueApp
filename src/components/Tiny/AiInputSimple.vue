<!-- src/components/AiSession/AiChat/AIInput.vue -->
<template>
  <footer class="chat-input-area">
    <!-- 外层椭圆容器：包裹输入区 -->
    <div class="input-ellipse-wrapper">
      <!-- 核心输入区：加号图标 + 输入框 + 圆形发送按钮 -->
      <div class="input-main-wrapper">
        <!-- 加号图标按钮 -->
        <button
            class="input-add-btn"
            @click="openAttachModalHandler"
            :class="{ active: modalStore.componentModals.attachSelectModal.visible }"
        >
          <img
              class="add-icon"
              src="../../static/icons/add-icon.svg"
              alt="更多功能"
          />
        </button>
        <attach-select-modal/>

        <!-- 输入框 -->
        <textarea
            v-model="inputValueProxy"
            class="input-box"
            placeholder="请输入消息..."
            @keyup.enter="handleSendMessage"
            @input="handleInputChange"
            @keyup="handleInputChange"
            :style="{ height: `${inputHeightProxy}px` }"
            maxlength="2000"
        ></textarea>

        <!-- 圆形发送按钮 -->
        <button
            class="send-btn"
            @click="handleSendMessage"
            :disabled="!inputValueProxy.trim()"
        >
          <svg class="send-icon" viewBox="0 0 24 24" width="18" height="18">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
          </svg>
        </button>

      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useModalStore } from '@/stores/modalStore.js'
import AttachSelectModal from "@/components/AiSession/AiChat/attach-select-modal.vue";
import { useRoute, useRouter } from 'vue-router';
import {useAiChatInputConfigStore} from "@/stores/AiChat/session-related/aiChatInputConfigStore.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";

const route = useRoute();
const router = useRouter()
// 初始化仓库
const aiChatInputConfigStore = useAiChatInputConfigStore()
const baseSessionStore = useBaseSessionStore()
const modalStore = useModalStore()

// 定义事件
const emit = defineEmits(['sendMessage'])

// ==============================================
// 输入框内容代理
// ==============================================
const inputValueProxy = computed({
  get() {
    return aiChatInputConfigStore.currentInputConfig.inputValue
  },
  set(newValue) {
    aiChatInputConfigStore.setCurrentSessionInput(newValue, aiChatInputConfigStore.currentInputConfig.inputHeight)
  }
})

// ==============================================
// 输入框高度代理
// ==============================================
const inputHeightProxy = computed(() => {
  return aiChatInputConfigStore.currentInputConfig.inputHeight
})

// 打开附件弹窗
const openAttachModalHandler = () => {
  modalStore.componentModals.attachSelectModal.visible = true
}

// ==============================================
// 输入框高度自适应
// ==============================================
const handleInputChange = (e) => {
  if (!e.target) return
  const target = e.target

  // 重置基础高度
  target.style.height = `${aiChatInputConfigStore.BASE_HEIGHT}px`
  target.style.overflowY = 'hidden'

  // 空内容 → 恢复默认高度
  if (!inputValueProxy.value.trim()) {
    aiChatInputConfigStore.setCurrentSessionInput('', aiChatInputConfigStore.BASE_HEIGHT)
    target.style.height = `${aiChatInputConfigStore.BASE_HEIGHT}px`
    return
  }

  // 计算自适应高度（最大120px）
  const realHeight = target.scrollHeight
  const finalHeight = Math.min(realHeight, 120)

  // 内容溢出显示滚动条
  if (finalHeight === 120) {
    target.style.overflowY = 'auto'
  }

  // 保存到当前会话
  aiChatInputConfigStore.setCurrentSessionInput(inputValueProxy.value, finalHeight)
  target.style.height = `${finalHeight}px`
}

// ==============================================
// 发送消息
// ==============================================
const handleSendMessage = (e) => {
  // Shift + Enter → 换行，不发送
  if (e.shiftKey) {
    return
  }
  e.preventDefault()

  const content = inputValueProxy.value.trim()
  if (!content) return

  // 获取当前会话UUID
  const storeSessionUuid = baseSessionStore.currentSessionUuid;

  // 路由同步校验
  if (route.name === 'AiChat' && route.params.sessionUuid !== storeSessionUuid) {
    router.push({
      name: 'AiChat',
      params: { sessionUuid: storeSessionUuid }
    });
  }

  // 发送消息
  emit('sendMessage', {
    content: content,
    sessionUuid: storeSessionUuid
  })

  // 重置输入框
  aiChatInputConfigStore.resetCurrentSessionInput()
};

</script>

<style scoped>
/* 底部输入区域整体容器 */
.chat-input-area {
  padding: 16px 20px 20px;
  border-top: 1px solid var(--border-color);
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  position: relative;
}

/* 外层椭圆容器 */
.input-ellipse-wrapper {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--gray-50);
  border: 1px solid var(--border-color);
  border-radius: 32px;
  box-shadow: 0 2px 4px var(--shadow-color);
}

/* 核心输入区：横向布局 */
.input-main-wrapper {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  width: 100%;
}

/* 加号图标按钮 */
.input-add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background-color: var(--card-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

/* 激活样式 */
.input-add-btn.active {
  background-color: var(--gray-100);
  border-color: var(--gray-200);
}
.add-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* 输入框 */
.input-box {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background-color: var(--card-hover);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.4;
  outline: none;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  overflow-y: hidden;
  height: auto;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.input-box:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.1);
}

/* 滚动条样式 */
.input-box::-webkit-scrollbar {
  width: 10px;
}
.input-box::-webkit-scrollbar-track {
  background: transparent;
}
.input-box::-webkit-scrollbar-thumb {
  background-color: var(--gray-300);
  border-radius: 20px;
  border: 2px solid transparent;
  background-clip: padding-box;
  min-height: 30px;
}
.input-box::-webkit-scrollbar-thumb:hover {
  background-color: var(--gray-400);
  background-clip: padding-box;
}

/* 圆形发送按钮 */
.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.send-btn:disabled {
  background-color: var(--gray-400);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-icon {
  flex-shrink: 0;
}
</style>