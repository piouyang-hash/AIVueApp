<!-- src/components/AiSession/AiChat/AIInput.vue -->
<template>
  <footer class="chat-input-area">
    <!-- 外层椭圆容器：包裹输入区+功能栏，和底部留间距 -->
    <div class="input-ellipse-wrapper">
      <!-- 核心输入区：加号图标 + 输入框 + 圆形发送按钮 -->
      <div class="input-main-wrapper">
        <!-- 加号图标按钮：绑定点击事件 + 激活样式class -->
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

        <!-- 修复：v-model 移除可选链，用计算属性兜底，避免赋值语法错误 -->
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

        <!-- 圆形发送按钮（保留原有类名 + 修复disabled逻辑） -->
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

      <!-- 底部功能栏：椭圆按钮 + 激活高亮 -->
      <div class="input-feature-bar">
        <button class="feature-btn" :class="{ active: aiChatConfigStore.isThinkMode }" @click="aiChatConfigStore.toggleThinkMode">
          <span class="feature-text">思考</span>
        </button>
        <button class="feature-btn" :class="{ active: aiChatConfigStore.isNetworkMode }" @click="aiChatConfigStore.toggleNetworkMode">
          <span class="feature-text">联网</span>
        </button>
        <button class="feature-btn">
          <span class="feature-text">导出</span>
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
import {useAiChatConfigStore} from "@/stores/AiChat/aiChatConfigStore.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";

const route = useRoute();
const router = useRouter()
// 🔥 初始化新仓库
const aiChatInputConfigStore = useAiChatInputConfigStore()
const aiChatConfigStore = useAiChatConfigStore()
const baseSessionStore = useBaseSessionStore()
const modalStore = useModalStore()

// 定义事件
const emit = defineEmits(['sendMessage'])

// ==============================================
// 🔥 输入框内容代理（适配新aiChatInputConfigStore）
// ==============================================
const inputValueProxy = computed({
  get() {
    return aiChatInputConfigStore.currentInputConfig.inputValue
  },
  set(newValue) {
    // 自动保存到当前会话的输入框配置
    aiChatInputConfigStore.setCurrentSessionInput(newValue, aiChatInputConfigStore.currentInputConfig.inputHeight)
  }
})

// ==============================================
// 🔥 输入框高度代理（适配新aiChatInputConfigStore）
// ==============================================
const inputHeightProxy = computed(() => {
  return aiChatInputConfigStore.currentInputConfig.inputHeight
})

// 打开附件弹窗（不变）
const openAttachModalHandler = () => {
  modalStore.componentModals.attachSelectModal.visible = true
}

// ==============================================
// 🔥 输入框高度自适应（适配新store）
// ==============================================
const handleInputChange = (e) => {
  if (!e.target) return
  const target = e.target

  // 重置基础高度
  target.style.height = `${aiChatInputConfigStore.BASE_HEIGHT}px`
  target.style.overflowY = 'hidden' // 默认隐藏

  // 空内容 → 恢复默认高度
  if (!inputValueProxy.value.trim()) {
    aiChatInputConfigStore.setCurrentSessionInput('', aiChatInputConfigStore.BASE_HEIGHT)
    target.style.height = `${aiChatInputConfigStore.BASE_HEIGHT}px`
    return
  }

  // 计算自适应高度（最大120px）
  const realHeight = target.scrollHeight
  const finalHeight = Math.min(realHeight, 120)

  // 🔥 关键逻辑：如果实际高度撑开了最大值，说明内容溢出，显示滚动条
  if (finalHeight === 120) {
    target.style.overflowY = 'auto' // 满了才出现
  }

  // 保存到当前会话
  aiChatInputConfigStore.setCurrentSessionInput(inputValueProxy.value, finalHeight)
  target.style.height = `${finalHeight}px`
}

// ==============================================
// 🔥 发送消息（全新逻辑，无旧代码）
// ==============================================
// 发送消息（新增 Shift+Enter 换行逻辑）
const handleSendMessage = (e) => {
  // 🔥 核心：如果按住 Shift + Enter → 不发送，执行原生换行
  if (e.shiftKey) {
    return
  }
  // 否则：阻止默认行为，执行发送
  e.preventDefault()

  const content = inputValueProxy.value.trim()
  if (!content) return

  // 获取当前会话UUID（新store）
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

  // 重置当前会话输入框
  aiChatInputConfigStore.resetCurrentSessionInput()
};

</script>

<style scoped>
/* 底部输入区域整体容器：改为透明背景 */
.chat-input-area {
  padding: 16px 20px 20px; /* 保留原有间距，仅改背景 */
  border-top: 1px solid var(--border-color); /* 如需隐藏边框可改为 transparent */
  background-color: transparent; /* 核心：设置为完全透明 */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none; /* 透明后阴影会显得突兀，建议移除 */
  position: relative;
  z-index: 10;
}

/* 外层椭圆容器：保留原有样式，作为视觉主体 */
.input-ellipse-wrapper {
  width: 100%;
  padding: 12px 16px;
  background-color: var(--gray-50); /* 保留椭圆容器的背景，保证视觉层次 */
  border: 1px solid var(--border-color);
  border-radius: 32px;
  box-shadow: 0 2px 4px var(--shadow-color);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 核心输入区：加号 + 输入框 + 圆形发送按钮 横向布局 */
.input-main-wrapper {
  position: relative; /* 作为弹窗的定位上下文 */
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

/* 激活样式：弹窗显示时生效 */
.input-add-btn.active {
  background-color: var(--gray-100);
  border-color: var(--gray-200);
}
.add-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* 输入框：适配椭圆容器风格 */
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

  /* ✅ 核心修复组合 */
  min-height: 40px;   /* 默认高度 */
  max-height: 120px;  /* 最大高度 */
  overflow-y: hidden; /* 默认隐藏，防止占位 */
  height: auto;       /* 重置高度机制 */

  /* 当内容超出时，由 JS 控制切换 */
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.input-box:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(var(--accent-color-rgb), 0.1);
}

/* 1. 稍微加宽一点点，方便留出边空 */
.input-box::-webkit-scrollbar {
  width: 10px;
}

/* 2. 轨道保持透明 */
.input-box::-webkit-scrollbar-track {
  background: transparent;
}

/* 3. 核心修复：胶囊/圆形滑块 */
.input-box::-webkit-scrollbar-thumb {
  /* 背景色 */
  background-color: var(--gray-300);

  /* 1. 必须设置足够大的圆角 */
  border-radius: 20px;

  /* 2. 关键：添加透明边框，像给滑块穿了一层“隐形外衣” */
  border: 2px solid transparent;

  /* 3. 关键：让背景颜色只显示在 padding 以内，这样 border 的位置就变成了空隙 */
  background-clip: padding-box;

  /* 限制最小高度，确保它看起来像个胶囊而不是一条线 */
  min-height: 30px;
}

.input-box::-webkit-scrollbar-thumb:hover {
  background-color: var(--gray-400);
  background-clip: padding-box; /* hover 时也要保持 clip */
}

/* 圆形发送按钮 */
.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%; /* 保持圆形，和椭圆形成对比 */
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

/* 🔥 删除了 .send-btn:hover:not(:disabled) 相关样式 */

.send-btn:disabled {
  background-color: var(--gray-400);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.send-icon {
  flex-shrink: 0;
}

/* 底部功能栏：椭圆按钮布局 */
.input-feature-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 4px;
}

/* 椭圆功能按钮：核心样式 + 激活高亮 */
.feature-btn {
  padding: 6px 16px;
  border-radius: 16px; /* 椭圆按钮 */
  background-color: transparent;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 功能按钮默认文字 */
.feature-btn .feature-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-tertiary);
  transition: all 0.2s ease;
}

/* 🔥 删除了 .feature-btn:hover .feature-text 相关样式 */

/* 功能按钮激活态：高亮背景+字体色 */
.feature-btn.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.feature-btn.active .feature-text {
  color: white;
  font-weight: 500;
}
</style>