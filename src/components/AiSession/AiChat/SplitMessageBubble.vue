<template>
  <!-- 🔥 合并版：通用消息项，自动区分 用户/AI分片消息 -->
  <div
      ref="rootRef"
      class="message-item"
      :class="[
      item.role === 'USER' ? 'user-message' : 'ai-message',
      {
        'long-press': activeMessageId === getActiveId(item) && isLongPressing,
        'restore': activeMessageId === getActiveId(item) && isRestoring,
        'active': activeMessageId === getActiveId(item)
      }
    ]"
      :data-message-id="item.messageId"
      :data-split-index="item.role === 'ASSISTANT' ? item.splitIndex : undefined"
  >
    <!-- 通用头像 -->
    <img
        class="message-avatar"
        :src="item.role === 'USER'
        ? `${SERVICE_URLS.USER_SERVICE}${userInfo.avatarUrl}`
        : getAiAvatarUrl(item)"
        :alt="item.role === 'USER' ? '用户' : 'AI角色'"
        @click="handleAvatarClick(item.source, index)"
        style="cursor: pointer"
        @click.stop
    />

    <!-- 通用消息气泡 + 触摸交互 -->
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
        <!-- 🔥 用户消息：纯文本渲染 -->
        <template v-if="item.role === 'USER'">
          {{ item.source.content }}
        </template>
        <!-- 🔥 AI分片消息：Markdown渲染 -->
        <NewMarkdownViewer
            v-else
            :markdown="item.split.content"
            style="cursor: pointer; display: block"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { SERVICE_URLS } from '@/api/constants/serviceUrls'
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'
import { useModalStore } from '@/stores/modalStore.js'
import { storeToRefs } from 'pinia'
import NewMarkdownViewer from '../../NewMarkdownViewer.vue'
// 🔥 导入你的消息Pinia仓库
import { useMessageStore } from '@/stores/messageStore'
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";
import {useAiRoleStore} from "@/stores/AiChat/aiRoleStore.js";

// 1. 定义Props（补全规范定义）
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

// 2. 仓库初始化
const baseSessionStore = useBaseSessionStore()
const aiMessageStore = useAiMessageStore()
const aiRoleStore = useAiRoleStore()
const { aiRoleList } = storeToRefs(aiRoleStore)
const modalStore = useModalStore()
const configStore = useAiSoftwareConfigStore()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const messageStore = useMessageStore()
const { activeMessageId } = storeToRefs(messageStore)
const { setActiveMessageId } = messageStore

// 1.创建根dom引用
const rootRef = ref(null)
// 绑定 bubble DOM
const bubbleRef = ref(null)

// 暴露出去
defineExpose({
  rootRef,
  bubbleRef
})

// 3. 事件抛出
const emit = defineEmits(['avatar-click', 'init-complete'])

// 4. 工具函数：生成唯一激活ID（兼容用户+AI分片）
const getActiveId = (item) => {
  return item.role === 'ASSISTANT'
      ? `${item.messageId}-${item.splitIndex}`
      : `${item.messageId}-0`
}

// 5. AI头像获取（修复传参，适配原逻辑）
const getAiAvatarUrl = () => {
  const sessionUuid = baseSessionStore.currentSessionUuid

  if (!sessionUuid) {
    return ''
  }

  // 🔥 只打印一次关键信息
  const currentSession = baseSessionStore.chatList.find(
      session => session.sessionUuid === sessionUuid
  )

  // ✅ 极简打印：找不到才输出 1 行，绝不刷屏
  if (!currentSession) {
    console.log('[头像] 未找到会话:', sessionUuid)
    return ''
  }

  const roleId = currentSession.roleId
  if (!roleId) {
    return ''
  }

  const role = aiRoleList.value.find(
      r => String(r.roleId) === String(roleId)
  )

  if (!role || !role.avatarPath) {
    return ''
  }

  return SERVICE_URLS.AI_CHAT_SERVICE + role.avatarPath
}

// 6. 头像点击事件
const handleAvatarClick = (item, index) => {
  emit('avatar-click', { item, index })
}

// 7. 长按交互状态（完全保留原有逻辑）
const isLongPressing = ref(false)
const isRestoring = ref(false)
const activeId = ref(null)
const startX = ref(0)
const startY = ref(0)
let touchTimer = null

const onTouchStart = (e, item) => {
  if (modalStore.pageModals.ChatListPage.messageOptionMenu.visible) return

  // 🔥 对齐参考：重置状态
  isLongPressing.value = false
  isRestoring.value = false
  // 🔥 核心：设置全局Pinia长按ID（分片唯一ID）
  setActiveMessageId(getActiveId(item))

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
        // modalStore.showMessageOptionMenu(dom, item)
        modalStore.showOverlay(dom, item)
      }, 200)
    }, 300)
  }, 100)
}

// 触摸滑动（参考代码原版逻辑）
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

// 触摸结束（参考代码原版逻辑）
const onTouchEnd = () => {
  clearTimeout(touchTimer)
  if (modalStore.pageModals.ChatListPage.messageOptionMenu.visible) return
}
</script>

<style scoped>
/* 消息项核心布局：头像+气泡 */
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px; /* 头像与气泡的间距 */
  animation: fadeIn 0.25s ease-out; /* 更自然的淡入动画 */
  user-select: none;
}

/* AI消息：靠左对齐 */
.ai-message {
  margin-right: auto;
  max-width: 90%;
}

/* 用户消息：靠右对齐 + 反向布局 */
.user-message {
  flex-direction: row-reverse;
  margin-left: 30px !important;
}

/* 头像样式：圆形+精致边框（主流聊天软件风格） */
.message-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%; /* 圆形头像更符合主流设计 */
  object-fit: cover;
  flex-shrink: 0;
  background-color: #fff;
  border: 1px solid #ffffff; /* 更细腻的边框 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); /* 轻微阴影提升质感 */
}

/* 气泡基础样式：极简+高级感 */
.message-bubble {
  position: relative;
  padding: 11px 15px;
  border-radius: 8px; /* 更现代的圆角 */
  line-height: 1.55;
  font-size: 15px;
  word-wrap: break-word;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); /* 更柔和的阴影 */
  max-width: 95%;
}

/* AI气泡样式：纯白+极简边框 */
.ai-message .message-bubble {
  background-color: #FFFBEF;
  color: #1d1d1f; /* 更舒适的文字色 */
  border: 1px solid #f0f0f0;
}

/* AI气泡左侧小三角：匹配气泡样式 */
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
  filter: drop-shadow(-1px 0 0 #f0f0f0); /* 三角带边框阴影，更精致 */
}

/* 用户气泡样式：微信绿+无边界（更高级） */
.user-message .message-bubble {
  background-color: #07c160;
  color: #ffffff;
}

/* 用户气泡右侧小三角 */
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

/* 消息内容：优化行高和对齐 */
.message-content {
  min-height: 24px;
  display: block; /* 改为块级，确保内部元素垂直排列 */
  font-weight: 400;
}

/* 淡入动画：更自然的过渡 */
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

/* 响应式适配：移动端优化 */
@media (max-width: 480px) {
  .chat-content {
    padding: 16px 12px;
  }

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

/* 激活置顶（Z轴最高，防止被遮挡） */
.message-item.active .message-bubble {
  z-index: 8888;
}

/* 长按缩小 */
@keyframes messageScale {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.9);
  }
}

/* 松开还原 */
@keyframes messageRestore {
  0% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* 仅气泡执行动画 */
.message-item.long-press .message-bubble {
  z-index: 10000;
  animation: messageScale 0.15s forwards ease-out;
}

.message-item.restore .message-bubble {
  z-index: 10000;
  animation: messageRestore 0.15s forwards ease-out;
}

</style>