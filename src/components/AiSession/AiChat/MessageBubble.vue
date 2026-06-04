<template>
  <!-- 合并版：通用消息项，通过 role 自动区分用户/AI -->
  <div
      ref="rootRef"
      class="message-item"
      :class="[
      item.role === 'USER' ? 'user-message' : 'ai-message',
      {
        'long-press': activeMessageId === item.messageId && isLongPressing,
        'restore': activeMessageId === item.messageId && isRestoring,
        'active': activeMessageId === item.messageId
      }
    ]"
      :data-message-id="item.messageId"
  >
    <!-- 通用头像 -->
    <img
        class="message-avatar"
        :src="item.role === 'USER' ? `${SERVICE_URLS.USER_SERVICE}${userInfo.avatarUrl}` : getAiAvatarUrl()"
        :alt="item.role === 'USER' ? '用户' : 'AI角色'"
        @click="handleAvatarClick(item)"
        style="cursor: pointer"
        @click.stop
    />

    <!-- 通用消息气泡 -->
    <div
        ref="bubbleRef"
        class="message-bubble"
        @touchstart="onTouchStart($event, item)"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onTouchStart($event, item)"
        @mouseup="onTouchEnd"
        @click.stop
    >
      <div class="message-content" style="cursor: pointer">
        <!-- 用户消息：纯文本 -->
        <template v-if="item.role === 'USER'">
          {{ item.content }}
        </template>
        <!-- AI消息：Markdown渲染 -->
        <LatexMarkdownViewer
            v-else
            :markdown="item.content"
            :render-block="true"
        />
      </div>

      <!-- AI消息专属按钮：🔥 改用 item.index 判断最后一条 -->
      <div
          class="message-actions"
          v-if="item.role === 'ASSISTANT' && item.content && item.index === currentMessages.length - 1"
      >
        <hr class="action-divider" />
        <div class="action-buttons">
          <button @click="handleCopy(item)" class="action-btn">
            <SvgIcon icon-class="copy" size="20px" className="action-icon" />
          </button>
          <button
              @click="handleCollect(item)"
              class="action-btn"
              :class="{ collected: item.collected }"
          >
            <SvgIcon
                icon-class="favorite"
                size="20px"
                className="action-icon"
            />
          </button>
          <button
              @click="handleRegenerate(item)"
              class="action-btn regenerate-btn"
          >
            <SvgIcon
                icon-class="regenerate"
                size="20px"
                className="action-icon"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { SERVICE_URLS } from '@/api/constants/serviceUrls'
import { useUserStore } from '@/stores/user'
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'
import { useModalStore } from '@/stores/modalStore.js'
import { useMessageStore } from '@/stores/messageStore'
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import NewMarkdownViewer from "@/components/NewMarkdownViewer.vue";
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";
import {useAiRoleStore} from "@/stores/AiChat/aiRoleStore.js";
import LatexMarkdownViewer from "@/components/LatexMarkdownViewer.vue";

// 1. Props 定义：🔥 已删除 index，只保留 item
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

// 2. 仓库
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const baseSessionStore = useBaseSessionStore()
const aiMessageStore = useAiMessageStore()
const aiRoleStore = useAiRoleStore()
const { aiRoleList } = storeToRefs(aiRoleStore)
const modalStore = useModalStore()
const messageStore = useMessageStore()
const { activeMessageId } = storeToRefs(messageStore)
const { setActiveMessageId } = messageStore

// 3. 从 Pinia 读取当前消息列表
const currentMessages = computed(() => {
  return aiMessageStore.getCurrentMergedMessages
})

// 1.创建根dom引用
const rootRef = ref(null)
// 绑定 bubble DOM
const bubbleRef = ref(null)

// 暴露出去
defineExpose({
  rootRef,
  bubbleRef
})

// 4. 事件
const emit = defineEmits(['avatar-click'])

// 5. 长按动画状态
const isLongPressing = ref(false)
const isRestoring = ref(false)
const startX = ref(0)
const startY = ref(0)
let touchTimer = null

// 6. 方法
const getAiAvatarUrl = () => {
  const sessionUuid = baseSessionStore.currentSessionUuid
  if (!sessionUuid) return ''
  const currentSession = baseSessionStore.chatList.find(s => s.sessionUuid === sessionUuid)
  if (!currentSession) return ''
  const roleId = currentSession.roleId
  if (!roleId) return ''
  const role = aiRoleList.value.find(r => String(r.roleId) === String(roleId))
  return role?.avatarPath ? SERVICE_URLS.AI_CHAT_SERVICE + role.avatarPath : ''
}

// 头像点击：🔥 只传 item，内部用 item.index
const handleAvatarClick = (item) => {
  emit('avatar-click', { item })
}

// 收藏
const handleCollect = (item) => {
  item.collected = !item.collected
  ElMessage.success(item.collected ? '收藏成功！' : '已取消收藏！')
}

// 重新生成
const handleRegenerate = (item) => {
  console.log('重新生成消息:', item)
}

// 复制
const handleCopy = (item) => {
  navigator.clipboard.writeText(item.content).then(() => {
    ElMessage.success('复制成功！')
  })
}

// 长按事件
const onTouchStart = (e, item) => {
  if (modalStore.pageModals.ChatListPage.messageOptionMenu.visible) return
  if (activeMessageId.value === item.messageId) return

  isLongPressing.value = false
  isRestoring.value = false
  setActiveMessageId(item.messageId)

  const dom = e.currentTarget
  const touch = e.touches ? e.touches[0] : e
  startX.value = touch.clientX
  startY.value = touch.clientY

  touchTimer = setTimeout(() => {
    isLongPressing.value = true
    setTimeout(() => {
      isLongPressing.value = false
      isRestoring.value = true
      setTimeout(() => {
        isRestoring.value = false
        modalStore.showOverlay(dom, item)
      }, 200)
    }, 300)
  }, 100)
}

const onTouchMove = (e) => {
  if (modalStore.pageModals.ChatListPage.messageOptionMenu.visible) return
  if (!e.touches) return

  const touch = e.touches[0]
  const moveX = Math.abs(touch.clientX - startX.value)
  const moveY = Math.abs(touch.clientY - startY.value)

  if (moveX > 5 || moveY > 5) {
    clearTimeout(touchTimer)
    isLongPressing.value = false
    isRestoring.value = false
  }
}

const onTouchEnd = () => {
  clearTimeout(touchTimer)
  if (modalStore.pageModals.ChatListPage.messageOptionMenu.visible) return
}
</script>

<style scoped>
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: fadeIn 0.25s ease-out;
  user-select: none;
}

.ai-message {
  margin-right: auto;
  max-width: 90%;
}

.user-message {
  flex-direction: row-reverse;
  margin-left: 30px !important;
}

.message-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #fff;
  border: 1px solid #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.message-bubble {
  position: relative;
  padding: 11px 15px;
  border-radius: 8px;
  line-height: 1.55;
  font-size: 15px;
  word-wrap: break-word;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  max-width: 95%;
}

.ai-message .message-bubble {
  background-color: #FFFBEF;
  color: #1d1d1f;
  border: 1px solid #f0f0f0;
}

.ai-message .message-bubble::before {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  left: -6px;
  top: 12px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #ffffff;
  filter: drop-shadow(-1px 0 0 #f0f0f0);
}

.user-message .message-bubble {
  background-color: #07c160;
  color: #ffffff;
}

.user-message .message-bubble::after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  right: -6px;
  top: 12px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #07c160;
}

.message-content {
  min-height: 24px;
  display: block;
  font-weight: 400;
}

.message-actions {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

.action-divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 0 0 8px 0;
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: flex-start;
  width: 100%;
}

.regenerate-btn {
  margin-left: auto;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: transform 0.1s ease, background-color 0.1s ease;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.action-btn:active {
  transform: scale(0.95);
  background-color: rgba(0, 0, 0, 0.04);
}

.action-icon {
  fill: #8b8b8b;
  transition: fill 0.2s ease;
}

.action-btn.collected .action-icon {
  fill: #ff4d4f !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.active .message-bubble {
  z-index: 8888;
}

@keyframes messageScale {
  0% { transform: scale(1); }
  100% { transform: scale(0.9); }
}

@keyframes messageRestore {
  0% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.message-item.long-press .message-bubble {
  z-index: 10000;
  animation: messageScale 0.15s forwards ease-out;
}

.message-item.restore .message-bubble {
  z-index: 10000;
  animation: messageRestore 0.15s forwards ease-out;
}

@media (max-width: 480px) {
  .message-item {
    max-width: 92%;
    gap: 10px;
  }
  .message-avatar {
    width: 36px;
    height: 36px;
  }
  .message-bubble {
    padding: 10px 14px;
    font-size: 14px;
  }
}
</style>