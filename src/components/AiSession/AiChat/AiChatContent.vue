<template>
  <MessageOption/>
  <!-- AI聊天内容区：自治组件核心模板 -->
  <main class="chat-content" ref="chatContentRef">
    <!-- 空状态提示 -->
    <div class="empty-chat" v-if="currentMessages.length === 0">
      <MeridianVein :width="100" :height="100"/>
      <p class="empty-text">开始与智能助手对话吧～</p>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" v-else>
      <!-- 🔥 切分模式：扁平化全局排序 -->
      <template v-if="configStore.isSplitMessageEnabled">
        <div
            class="message-group"
            v-for="(item, index) in flatSortedMessagesForSplitMode"
            :key="index"
        >
          <!-- 用户消息 -->
          <div
              class="message-item user-message"
              v-if="item.type === 'USER'"
              :data-message-id="item.messageId"
          >
            <img
                class="message-avatar"
                :src="`${SERVICE_URLS.USER_SERVICE}${userInfo.avatarUrl}`"
                alt="用户"
                @click="handleAvatarClick(item.source, index)"
                style="cursor: pointer;"
            />
            <div class="message-bubble">
              <div
                  class="message-content"
                  @click="handleUserMsgClick($event, item.source, index)"
                  style="cursor: pointer;"
              >
                {{ item.source.content }}
              </div>
            </div>
          </div>

          <!-- AI 分片消息 -->
          <div
              class="message-item ai-message"
              v-if="item.type === 'AI_SPLIT'"
              :data-message-id="item.messageId"
              :data-split-index="item.splitIndex"
          >
            <img
                class="message-avatar"
                :src="getAiAvatarUrl(item.source.roleId)"
                alt="AI角色"
                @click="handleAvatarClick(item.source, index)"
            />
            <div class="message-bubble">
              <div class="message-content">
                <NewMarkdownViewer
                    :markdown="item.split.content"
                    @click="handleAiMsgClick($event, item.source, index, item.splitIndex)"
                    style="cursor: pointer; display: block;"
                />
              </div>
            </div>
          </div>

        </div>
      </template>

      <!-- 🔥 非切分模式：原有逻辑（标签结构已修正） -->
      <template v-else>
        <div
            class="message-group"
            v-for="(item, index) in sortedMessages"
            :key="index"
        >
          <!-- 用户消息 -->
          <div
              class="message-item user-message"
              v-if="item.role === 'USER'"
              :data-message-id="item.messageId"
          >
            <img
                class="message-avatar"
                :src="`${SERVICE_URLS.USER_SERVICE}${userInfo.avatarUrl}`"
                alt="用户"
                @click="handleAvatarClick(item, index)"
                style="cursor: pointer;"
            />
            <div class="message-bubble">
              <div
                  class="message-content"
                  @click="handleUserMsgClick($event, item, index)"
                  style="cursor: pointer;"
              >
                {{ item.content }}
              </div>
            </div>
          </div>

          <!-- AI 消息（非切分模式，清理冗余判断） -->
          <div
              class="message-item ai-message"
              v-else-if="item.role === 'ASSISTANT'"
              v-for="(splitText, splitIndex) in [item.content]"
              :key="'ai-' + index + '-' + splitIndex"
              :data-message-id="item.messageId"
          >
            <img
                class="message-avatar"
                :src="getAiAvatarUrl(item.roleId)"
                alt="AI角色"
                @click="handleAvatarClick(item, index)"
            />
            <div class="message-bubble">
              <div class="message-content">
                <NewMarkdownViewer
                    :markdown="splitText"
                    @click="handleAiMsgClick($event, item, index, splitIndex)"
                    :render-block="true"
                />
              </div>
              <div
                  class="message-actions"
                  v-if="splitText && index === currentMessages.length - 1"
              >
                <hr class="action-divider"/>
                <div class="action-buttons">
                  <button @click="handleCopy(item, index, splitIndex)" class="action-btn">
                    <SvgIcon icon-class="copy" size="20px" className="action-icon"/>
                  </button>
                  <button
                      @click="handleCollect(item, index, splitIndex)"
                      class="action-btn"
                      :class="{ 'collected': item.collected }"
                  >
                    <SvgIcon
                        icon-class="favorite"
                        size="20px"
                        className="action-icon"
                    />
                  </button>
                  <button @click="handleRegenerate(item, index, splitIndex)" class="action-btn regenerate-btn">
                    <SvgIcon icon-class="regenerate" size="20px" className="action-icon"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>
  <CircleDownIcon @scroll-to-bottom="scrollToBottom" />
</template>

<script setup>
import {nextTick, watch, computed, ref, onUnmounted, onMounted, onUpdated} from 'vue'
import {useUserStore} from '@/stores/user'
// 导入组件和静态资源
import MeridianVein from "@/components/AiSession/AiChat/meridian-vein.vue";
import {SERVICE_URLS} from '@/api/constants/serviceUrls'
import {useAiSoftwareConfigStore} from '@/stores/aiSoftwareConfig'
import {useModalStore} from '@/stores/modalStore.js'
// ========== 3. 仓库初始化 ==========
import {useSessionStore} from '@/stores/sessionStore'
import {storeToRefs} from "pinia";
import MessageOption from "@/components/Tiny/MessageOption.vue";
import {ElMessage} from "element-plus";
import NewMarkdownViewer from "../../NewMarkdownViewer.vue";
import CircleDownIcon from "../../Tiny/CircleDownIcon.vue";


const sessionStore = useSessionStore()
const {aiRoleList} = storeToRefs(sessionStore)

const modalStore = useModalStore()
const configStore = useAiSoftwareConfigStore()
// 用户信息
const userStore = useUserStore()
const {userInfo} = storeToRefs(userStore)
const chatContentRef = ref(null)

// ==============================================
// 核心：动态控制 全局 * { margin:0 } 样式
// ==============================================
let dynamicStyle = null

// 创建/移除 全局样式
const updateGlobalMarginStyle = (enabled) => {
  // 如果已经有样式节点，先删除
  if (dynamicStyle) {
    dynamicStyle.remove()
    dynamicStyle = null
  }

  // 【切分模式开启】→ 加入全局 margin:0
  if (enabled) {
    dynamicStyle = document.createElement('style')
    // 只加你要的这一行！
    dynamicStyle.innerText = `* { margin: 0 !important; }`
    document.head.appendChild(dynamicStyle)
  }
  // 【非切分模式】→ 不添加，样式自动失效
}

const messageObserver = ref(null)

// 2. 初始化「消息可视区监听器」
const initMessageReadObserver = () => {
  // 初始化配置仓库
  const configStore = useAiSoftwareConfigStore()
  // 1. 先销毁旧的监听器（防止重复创建）
  if (messageObserver.value) {
    messageObserver.value.disconnect()
  }

  // 2. 创建新的监听器
  messageObserver.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // 只处理【进入可视区域】的消息
      if (entry.isIntersecting) {
        const msgDom = entry.target
        // 从 DOM 上获取核心标识
        const messageId = msgDom.dataset.messageId
        const splitIndex = msgDom.dataset.splitIndex

        // 没有消息ID直接跳过
        if (!messageId) return

        // ==============================================
        // 🔥 核心：根据切分模式，分流调用不同方法
        // ==============================================
        const currentSessionUuid = sessionStore.currentSessionUuid
        if (configStore.isSplitMessageEnabled) {
          // ✅ 切分模式开启：需要 messageId + splitIndex，标记单个分片
          const index = Number(splitIndex)
          // 校验分片序号合法
          if (!isNaN(index) && index >= 0) {
            sessionStore.markSingleSplitMessageAsRead(
                currentSessionUuid,
                messageId,
                index
            )
          }
        } else {
          // ✅ 切分模式关闭：原有逻辑，标记整条消息
          sessionStore.markMessageAsRead(
              currentSessionUuid,
              messageId
          )
        }

        // 标记完成后，取消监听（只执行一次）
        messageObserver.value.unobserve(msgDom)
      }
    })
  }, {
    root: chatContentRef.value,
    threshold: 0.5, // 50%显示就算阅读（你原配置）
    rootMargin: '0px 0px -80px 0px'
  })

  // 给页面所有消息绑定监听
  document.querySelectorAll('.message-item').forEach(item => {
    messageObserver.value.observe(item)
  })
}


// 合并后的：页面挂载（打开页面执行一次）
// 1. 滚动到底部
// 2. 清空当前会话所有未读消息（normal + split）
// 3. 初始化消息已读监听
onMounted(async () => {
  // 1. 页面初始化滚到底部
  scrollToBottom()

  // 2. 🔥 清空【当前选中会话】的所有未读（非切分+切分全部清零）
  sessionStore.clearSessionUnread(sessionStore.currentSessionUuid)

  // 3. 等待DOM渲染完成，启动消息监听
  await nextTick()
  initMessageReadObserver()
})

// 页面更新（新消息渲染）→ 重新绑定监听
onUpdated(async () => {
  await nextTick()
  initMessageReadObserver()
})

// 🔥 合并后的：页面销毁（退出页面执行一次）
// 1. 销毁消息监听器
// 2. 清理动态样式
onUnmounted(() => {
  // 1. 销毁消息监听器（防内存泄漏）
  if (messageObserver.value) {
    messageObserver.value.disconnect()
    messageObserver.value = null
  }

  // 2. 清理你的动态样式
  if (dynamicStyle) {
    dynamicStyle.remove()
  }
})

// 监听切分模式开关变化
watch(
    () => configStore.isSplitMessageEnabled,
    (newVal) => {
      updateGlobalMarginStyle(newVal)
    },
    {immediate: true} // 页面加载立即执行一次
)


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


// ========== 4. 计算属性：当前会话消息 ==========
// 🔥 直接复用 Store 里封装好的 getCurrentMergedMessages
const currentMessages = computed(() => {
  return sessionStore.getCurrentMergedMessages
})

// ==============================================
// ✅ 新增：按 sortTimestamp 排序的消息数组（核心实现）
// ==============================================
const sortedMessages = computed(() => {
  // 1. 不切分消息模式 → 执行排序；切分模式 → 直接返回原数组
  if (configStore.isSplitMessageEnabled) {
    return currentMessages.value
  }

  // 2. 不切分模式：按时间戳升序排序（时间越早越靠前，标准聊天顺序）
  return [...currentMessages.value].sort((a, b) => {
    // 字符串时间戳转数字，无时间戳则默认0
    const timeA = Number(a.sortTimestamp) || 0
    const timeB = Number(b.sortTimestamp) || 0
    // 升序：旧消息在上，新消息在下
    return timeA - timeB
    // 如需 最新消息在上 → 改为 return timeB - timeA
  })
})

// ✅ 🔥 新增：切分模式下的【全局扁平化时间排序】核心
const flatSortedMessagesForSplitMode = computed(() => {
  if (!configStore.isSplitMessageEnabled) return []

  const flatList = []

  // 遍历所有消息，把用户消息 + AI分片全部拍平
  currentMessages.value.forEach(msg => {
    if (msg.role === 'USER') {
      // 用户：直接加入，使用自己的时间戳 + 携带 messageId
      flatList.push({
        type: 'USER',
        messageId: msg.messageId, // 🔥 保留 messageId
        timestamp: Number(msg.sortTimestamp) || 0,
        source: msg
      })
    }

    if (msg.role === 'ASSISTANT') {
      // AI：把每一片都拆成独立项，使用片内 timestamp
      const splits = msg.splitContent || []
      splits.forEach((split, idx) => {
        flatList.push({
          type: 'AI_SPLIT',
          messageId: msg.messageId, // 🔥 核心修复：给分片消息绑定原始消息的 messageId
          timestamp: Number(split.timestamp) || 0,
          source: msg,  // source 是原始消息
          split,
          splitIndex: idx
        })
      })
    }
  })

  // 全局按时间戳升序排序
  return flatList.sort((a, b) => a.timestamp - b.timestamp)
})

const printSortedMessages = () => {
  console.log('【排序后消息数组】', sortedMessages.value)
  // 额外打印每条的时间戳，方便你核对顺序（更直观）
  sortedMessages.value.forEach((item, idx) => {
    console.log(`第${idx}条 | 角色：${item.role} | 时间戳：${item.sortTimestamp}`)
  })
}

// ========== 5. 同步props会话UUID到Pinia仓库 ==========
watch(
    () => props.sessionUuid,
    (newUuid) => {
      if (newUuid) {
        sessionStore.setCurrentSessionUuid(newUuid)
      }
    },
    {immediate: true}
)

// ========== 6. 滚动到底部工具函数 ==========
const scrollToBottom = () => {
  nextTick(() => {
    const contentEl = chatContentRef.value
    if (!contentEl) return
    contentEl.scrollTop = contentEl.scrollHeight
  })
}

// ========== 7. 监听用户消息变化 → 自动滚动 ==========
watch(
    () => sessionStore.waitingUserMessage,
    () => {
      // 用户消息新增 → 立即滚到底部
      scrollToBottom()
    },
    {
      deep: true, // 监听嵌套对象变化（必须加！）
      flush: 'post' // 等待DOM更新后再滚动，避免错位
    }
)

// ========== 8. 头像点击事件 ==========
const handleAvatarClick = (item, index) => {
  const roleText = item.role === 'USER' ? '用户' : 'AI助手'
  emit('avatar-click', {item, index})
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

// 1. 复制消息（仅复制原始content，适配手机 + ElementPlus中文提示）
const handleCopy = async (item, index, splitIndex) => {
  // 🔥 仅获取原始消息内容，不处理任何切分逻辑
  const copyContent = item.content

  try {
    // 手机/浏览器通用剪贴板API
    await navigator.clipboard.writeText(copyContent)
    console.log('消息复制成功 ✅', {
      index, splitIndex, content: copyContent
    })
    // 👇 改为中文提示
    ElMessage.success('复制成功！')
  } catch (err) {
    console.error('消息复制失败 ❌', err)
    // 👇 改为中文提示
    ElMessage.error('复制失败！')
  }
}

// 2. 收藏消息（中文日志 + ElementPlus中文提示）
const handleCollect = (item, index, splitIndex) => {
  // 🔥 核心：切换收藏状态（true/false）
  item.collected = !item.collected;

  // 👇 根据状态弹出中文提示
  if (item.collected) {
    ElMessage.success('收藏成功！')
  } else {
    ElMessage.success('已取消收藏！')
  }

  console.log("收藏状态：", item.collected);
}

// 3. 重新生成（仅打印英文日志）
const handleRegenerate = (item, index, splitIndex) => {
  console.log('Regenerate message triggered 🔄', {index, splitIndex, item})
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
  animation: fadeIn 0.25s ease-out; /* 更自然的淡入动画 */

}

/* AI消息：靠左对齐 */
.ai-message {
  margin-right: auto;
  max-width: 90%;
}

/* 用户消息：靠右对齐 + 反向布局 */
.user-message {
  flex-direction: row-reverse;
  margin-left: 12px;
  max-width: 100% !important;
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

/* 重新生成按钮靠右 */
.regenerate-btn {
  margin-left: auto;
}

/* 按钮基础样式 */
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

/* 点击按压效果（保留，这是微缩放的视觉反馈，没有背景色） */
.action-btn:active {
  transform: scale(0.95);
  /* 如果你也不想要任何背景，可以注释掉下面这行 */
  background-color: rgba(0, 0, 0, 0.04);
}

/* ====================== 核心：SVG图标用 fill 控制颜色 ====================== */
.action-icon {
  fill: #8b8b8b; /* 未收藏时的灰色 */
  transition: fill 0.2s ease;
}

/* 已收藏：图标变为红色，且按钮背景保持不变 */
.action-btn.collected .action-icon {
  fill: #ff4d4f !important;
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