<template>
  <MessageOption />
  <!-- AI聊天内容区：自治组件核心模板 -->
  <main class="chat-content" ref="chatContentRef">
    <!-- 空状态提示 -->
    <div class="empty-chat" v-if="currentMessages.length === 0">
      <MeridianVein :width="100" :height="100" />
      <p class="empty-text">开始与智能助手对话吧～</p>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" v-else>
      <!-- 外层遍历所有消息组（用户/AI为一组） -->
      <div
          class="message-group"
          v-for="(item, index) in currentMessages"
          :key="index"
      >
        <!-- 1. 用户消息：单条样式 -->
        <div
            class="message-item user-message"
            v-if="item.role === 'USER'"
        >
          <img
              class="message-avatar"
              :src="`${SERVICE_URLS.USER_SERVICE}${userInfo.avatarUrl}`"
              alt="用户"
              @click="handleAvatarClick(item, index)"
              style="cursor: pointer;"
          />
          <div class="message-bubble">
            <!-- 👇 用户消息本体 + 点击事件 -->
            <div
                class="message-content"
                @click="handleUserMsgClick($event, item, index)"
                style="cursor: pointer;"
            >
              {{ item.content }}
            </div>
          </div>
        </div>

        <!-- 2. AI消息：完全保留原有结构，仅根据配置切换渲染内容 -->
        <div
            class="message-item ai-message"
            v-else-if="item.role === 'ASSISTANT'"
            v-for="(splitText, splitIndex) in (
            configStore.isSplitMessageEnabled
            ? (item.splitContent?.map(item => item.content) || [item.content])
            : [item.content]
            )"
            :key="'ai-' + index + '-' + splitIndex"
        >
          <img
              class="message-avatar"
              :src="getAiAvatarUrl(item.roleId)"
              alt="AI角色"
              @click="handleAvatarClick(item, index)"
          />
          <div class="message-bubble">
            <div class="message-content">
              <!-- 👇 AI消息本体 + 点击事件 -->
              <MarkdownViewer
                  :markdown="splitText"
                  @click="handleAiMsgClick($event, item, index, splitIndex)"
                  style="cursor: pointer; display: block;"
              />
            </div>
            <div
                class="message-actions"
                v-if="!configStore.isSplitMessageEnabled && splitText && index === currentMessages.length - 1"
            >
              <!-- 分割横线 -->
              <hr class="action-divider" />
              <!-- 三个操作按钮（雪碧图图标版） -->
              <div class="action-buttons">
                <button @click="handleCopy(item, index, splitIndex)" class="action-btn">
                  <!-- 复制图标 -->
                  <SvgIcon icon-class="copy" size="20px" className="action-icon" />
                </button>
                <button @click="handleCollect(item, index, splitIndex)" class="action-btn">
                  <!-- 收藏图标 -->
                  <SvgIcon icon-class="favorite" size="20px" className="action-icon" />
                </button>
                <button @click="handleRegenerate(item, index, splitIndex)" class="action-btn regenerate-btn">
                  <SvgIcon icon-class="regenerate" size="20px" className="action-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>

<script setup>
import { nextTick, watch, computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
// 导入组件和静态资源
import MeridianVein from "@/components/AiSession/AiChat/meridian-vein.vue";
import { SERVICE_URLS } from '@/api/constants/serviceUrls'
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'
import { useModalStore } from '@/stores/modalStore.js'

const modalStore = useModalStore()
const configStore = useAiSoftwareConfigStore()
// 用户信息
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)
const chatContentRef = ref(null)

// ========== 1. 定义Props ==========
const props = defineProps({
  sessionUuid: {
    type: String,
    required: true,
    default: ''
  }
})

const getAiAvatarUrl = () => {
  const sessionUuid = sessionStore.currentSessionUuid

  if (!sessionUuid) {
    return ''
  }

  // 🔥 只打印一次关键信息
  const currentSession = sessionStore.chatList.find(
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

  if (!role || !role.avatarRelativePath) {
    return ''
  }

  return SERVICE_URLS.AI_CHAT_SERVICE + role.avatarRelativePath
}

// ========== 2. 定义Emit ==========
const emit = defineEmits([
  'avatar-click',
  'init-complete'
])

// ========== 3. 仓库初始化 ==========
import { useSessionStore } from '@/stores/sessionStore'
import MarkdownViewer from "@/components/MarkdownViewer.vue";
import {storeToRefs} from "pinia";
import MessageOption from "@/components/Tiny/MessageOption.vue";
import {ElMessage} from "element-plus";
const sessionStore = useSessionStore()
const { aiRoleList } = storeToRefs(sessionStore)

// ========== 4. 计算属性：当前会话消息 ==========
// 🔥 直接复用 Store 里封装好的 getCurrentMergedMessages
const currentMessages = computed(() => {
  return sessionStore.getCurrentMergedMessages
})

// ========== 5. 同步props会话UUID到Pinia仓库 ==========
watch(
    () => props.sessionUuid,
    (newUuid) => {
      if (newUuid) {
        sessionStore.setCurrentSessionUuid(newUuid)
      }
    },
    { immediate: true }
)

// ========== 6. 滚动到底部工具函数 ==========
const scrollToBottom = () => {
  nextTick(() => {
    const contentEl = chatContentRef.value
    if (!contentEl) return
    contentEl.scrollTop = contentEl.scrollHeight
  })
}

// ========== 7. 监听消息变化 → 自动滚动 ==========
watch(
    () => currentMessages.value.length,
    () => {
      scrollToBottom()
    },
    {
      immediate: true,
      deep: true
    }
)

// ========== 8. 头像点击事件 ==========
const handleAvatarClick = (item, index) => {
  const roleText = item.role === 'USER' ? '用户' : 'AI助手'
  emit('avatar-click', { item, index })
}

// ========== 9. 对外暴露方法 ==========
defineExpose({
  scrollToBottom
})

// 👇 用户消息点击 → 弹出消息选项菜单
const handleUserMsgClick = (e, item, index) => {
  // 获取点击的DOM元素（用于菜单定位）
  const targetElement = e.currentTarget
  // 显示消息菜单
  modalStore.showMessageOptionMenu(targetElement, item)

  // 保留原有日志（可选）
  console.log('==================================')
  console.log('🟢 点击【用户消息】弹出菜单')
  console.log('消息索引：', index)
  console.log('消息对象：', item)
  console.log('==================================')
}

// 👇 AI消息点击 → 弹出消息选项菜单
const handleAiMsgClick = (e, item, msgIndex, splitIndex) => {
  // 获取点击的DOM元素
  const targetElement = e.currentTarget
  // 显示消息菜单
  modalStore.showMessageOptionMenu(targetElement, item)

  // 保留原有日志（可选）
  console.log('==================================')
  console.log('🔵 点击【AI消息】弹出菜单')
  console.log('父消息索引：', msgIndex)
  console.log('切分片段索引：', splitIndex)
  console.log('==================================')
}

// 1. 复制消息（仅复制原始content，适配手机 + ElementPlus提示）
const handleCopy = async (item, index, splitIndex) => {
  // 🔥 仅获取原始消息内容，不处理任何切分逻辑
  const copyContent = item.content

  try {
    // 手机/浏览器通用剪贴板API
    await navigator.clipboard.writeText(copyContent)
    console.log('Message copied to clipboard successfully ✅', {
      index, splitIndex, content: copyContent
    })
    ElMessage.success('Copied successfully!')
  } catch (err) {
    console.error('Failed to copy message ❌', err)
    ElMessage.error('Copy failed!')
  }
}

// 2. 收藏消息（仅打印英文日志）
const handleCollect = (item, index, splitIndex) => {
  console.log('Collect message triggered 📌', { index, splitIndex, item })
}

// 3. 重新生成（仅打印英文日志）
const handleRegenerate = (item, index, splitIndex) => {
  console.log('Regenerate message triggered 🔄', { index, splitIndex, item })
}

</script>

<style scoped>
/* 核心容器：滚动区域基础样式 */
.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f7f8fa; /* 更柔和的背景色 */
  scroll-behavior: smooth;
}

/* 空状态样式 */
.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: #969799; /* 更高级的浅灰色 */
}

.empty-text {
  font-size: 14px;
  margin: 0;
  font-weight: 400;
}

/* 消息列表：控制组间距 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 不同消息组（用户/AI）之间的间距 */
}

/* 消息组：单组内的分段消息间距 */
.message-group {
  display: flex;
  flex-direction: column;
  gap: 12px; /* AI分段消息之间的垂直间距（核心解决间隙问题） */
}

/* 消息项核心布局：头像+气泡 */
.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px; /* 头像与气泡的间距 */
  max-width: 88%;
  animation: fadeIn 0.25s ease-out; /* 更自然的淡入动画 */
}

/* AI消息：靠左对齐 */
.ai-message {
  margin-right: auto;
}

/* 用户消息：靠右对齐 + 反向布局 */
.user-message {
  flex-direction: row-reverse;
  margin-left: auto;
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
  white-space: pre-line;
  min-height: 24px;
  display: block; /* 改为块级，确保内部元素垂直排列 */
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

/* 核心：重新生成按钮靠右 */
.regenerate-btn {
  margin-left: auto;
}

/* ====================== 仿照你的示例：移动端完美按钮样式 ====================== */
.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 8px; /* 扩大点击区域，手机更好按 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  /* 👇 完全照搬你示例的移动端优化核心代码 */
  transition: transform 0.1s ease, background-color 0.1s ease;
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent; /* 去掉手机默认点击高亮 */
}

/* 👇 仅用:active！无hover，手机端绝对不残留样式 */
.action-btn:active {
  transform: scale(0.95); /* 轻微缩小，和你示例效果一致 */
  background-color: rgba(0, 0, 0, 0.04); /* 柔和点击背景 */
}

/* 图标基础样式 */
.action-icon {
  color: #8b8b8b;
  transition: color 0.1s ease;
}

/* 点击时图标同步变色（反馈更统一） */
.action-btn:active .action-icon {
  color: #07c160;
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

/* 滚动条美化：更极简的样式 */
.chat-content::-webkit-scrollbar {
  width: 4px;
}

.chat-content::-webkit-scrollbar-track {
  background: transparent;
}

.chat-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.chat-content::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}
</style>