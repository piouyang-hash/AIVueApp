<template>
  <div class="ai-chat-container">
    <!-- 顶部导航栏（父组件保留） -->
    <header class="chat-header">
      <button class="back-btn" @click="handleBack">
        <img
            class="back-icon"
            :src="BackIcon"
            alt="返回"
            width="18"
            height="18"
        />
      </button>

      <!-- 会话信息区 -->
      <div class="session-info">
        <div class="session-text">
          <h1
              class="ai-name"
              :style="{ color: isAiReplying ? 'rgb(55, 178, 77)' : 'var(--text-primary)' }"
              @click="handleRoleClick"
          >
            {{ isAiReplying ? '对方输入中...' : (aiRoleStore.aiRoleList.find(item => item.roleId === aiRoleStore.currentRoleId)?.roleDesc || '智能助手') }}
          </h1>
        </div>
      </div>

      <!-- 修改为 → 包裹图标容器 -->
      <div class="header-icons">
        <SvgIcon
            v-if="(aiMessageStore.sessionMessages[baseSessionStore.currentSessionUuid] || []).length > 0"
            icon-class="add-icon"
            size="1.5rem"
            className="icon"
            @click="handleAddIconClick"
            color="var(--text-tertiary)"
        />
        <meridian-vein
            v-if="(aiMessageStore.sessionMessages[baseSessionStore.currentSessionUuid] || []).length > 0"
            :width="30"
            :height="30"
        />
        <heart-beat />
      </div>
    </header>

    <!-- 中间对话区域：替换为自治组件AiChatContent -->
    <AiChatContent
        :session-uuid="route.params.sessionUuid"
        @avatar-click="handleAvatarClick"
        @init-complete="handleInitComplete"
        ref="aiChatContentRef"
    />

    <!-- 引入独立的输入框组件 -->
    <!-- 核心修改：给AIInput绑定sendMessage事件 -->
    <AiInputSimple @sendMessage="handleAIInputSendMessage" />
  </div>
</template>

<script setup>
import {computed, nextTick, ref} from 'vue'
import { useRoute, useRouter } from 'vue-router'
// 导入资源（仅保留顶部导航/输入框相关）
import BackIcon from '@/static/icons/back.svg'
import HeartBeat from "@/components/AiSession/AiChat/heart-beat.vue";
import MeridianVein from "@/components/AiSession/AiChat/meridian-vein.vue";
import AiChatContent from "@/components/AiSession/AiChat/AiChatContent.vue";
import {
  testAsyncStream
} from "@/services/ai_chat.service.js";
// 导入自治组件AiChatContent
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import {useChatDomainStore} from "@/stores/AiChat/session-related/combineMethod/ChatDomainStore.js";
import {useAiMessageTaskStore} from "@/stores/AiChat/session-related/aiMessageTaskStore.js";
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";
import AiInputSimple from "@/components/Tiny/AiInputSimple.vue";
import {useAiRoleStore} from "@/stores/AiChat/aiRoleStore.js";

// 初始化仓库实例
const aiRoleStore = useAiRoleStore()
// 初始化新仓库
const baseSessionStore = useBaseSessionStore()
const chatDomainStore = useChatDomainStore()
const aiMessageTaskStore = useAiMessageTaskStore()
const aiMessageStore = useAiMessageStore()

// 初始化实例（仅保留核心依赖）
const route = useRoute()
const router = useRouter()
const aiChatContentRef = ref(null) // 可选：获取AiChatContent组件实例

// AI是否正在回复（响应式状态，模板可用）
const isAiReplying = computed(() => {
  const currentSid = baseSessionStore.currentSessionUuid
  // 无当前会话 → 未回复
  if (!currentSid) return false
  // 获取当前会话的所有任务
  const taskList = aiMessageTaskStore.sessionTaskMap[currentSid] || []
  // 存在【进行中 pending】任务 → AI 正在回复
  return taskList.some(task => task.status === 'pending')
})

// AI角色名称点击事件（分支逻辑）🔥 修复：加 .value
const handleRoleClick = () => {
  // ✅ 正确写法：computed 属性必须用 .value 取值
  if (isAiReplying.value) {
    console.log('点击：AI正在输入中，暂不可操作');
  } else {
    console.log('点击：查看AI角色信息');
  }
};

// ==============================================
// 你的原有发送消息函数（仅替换流式请求部分）
// ==============================================
const handleAIInputSendMessage = async ({ content, sessionUuid }) => {

  try {
    chatDomainStore.setPlaceholderSession(sessionUuid)

    // 🔥 核心：发送消息时 → 仅激活当前会话（关闭所有其他）
    baseSessionStore.activateOnlyOneSession(sessionUuid)

    await nextTick(() => aiChatContentRef.value?.scrollToBottom())

    // 1. 获取任务ID（后端返回：sessionUuid:taskId:userMessageId）
    const uniqueKey = await testAsyncStream(content, sessionUuid)
    // 拆分出三个参数：会话ID、任务ID、用户消息ID
    const [resSessionUuid, taskId, userMessageId] = uniqueKey.split(':')

    // 核心：将 messageId 传给创建等待消息的方法
    aiMessageStore.createUserWaitingMessage(sessionUuid, content, taskId, userMessageId)

    // 2. 保存任务
    aiMessageTaskStore.addSessionTask(sessionUuid, taskId)

  } catch (err) {
    console.error('发送失败：', err)
  }
}


// ========== 仅保留父组件专属逻辑 ==========
// 返回按钮逻辑
const handleBack = () => {
  router.push({ name: 'ChatListPage' })
}

// 顶部add-icon点击事件
const handleAddIconClick = () => {
  console.log('点击了add-icon图标');
};

// 可选：接收AiChatContent组件的头像点击事件（按需扩展）
const handleAvatarClick = ({ item, index }) => {
// 父组件可在此扩展头像点击逻辑（比如删除消息、复制内容等）
// 基础日志保留（也可删除，子组件内部已打印）
  const roleText = item.role === 'USER' ? '用户' : 'AI助手'
  console.log(`父组件接收：点击了第${index+1}条${roleText}消息的头像`);
};

// 可选：监听AiChatContent初始化完成
const handleInitComplete = () => {
  console.log('AI聊天内容区初始化完成');
// 如需在初始化后执行额外逻辑，可在此处理
};
// 可选：父组件手动调用子组件的滚动方法（比如输入框发送消息后）
// 示例：const forceScroll = () => aiChatContentRef.value?.scrollToBottom()
</script>


<style scoped>
/* 保留原有的非输入框样式 */
.ai-chat-container {
  width: 100%;
  height: 100vh;
  max-width: 100%;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
  box-shadow: 0 0 12px var(--shadow-color);
  user-select: none;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: var(--card-hover);
  box-shadow: 0 2px 8px var(--shadow-color);
  position: relative;
  z-index: 10;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 14px;
}

.back-btn:hover {
  background-color: var(--gray-100);
  color: var(--primary-color);
}

.back-icon {
  flex-shrink: 0;
}

/* 文字父容器 - 核心修复 */
.session-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.session-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  /* 🔥 新增：嵌套flex必须加，否则文字无法收缩 */
  min-width: 0;
}

/* 🔥 强化文字省略样式，永久不重叠 */
.ai-name {
  margin: 0;
  font-size: 17px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  font-family: -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", BlinkMacSystemFont, Roboto, "Helvetica Neue", Arial, sans-serif;

  /* 核心修复：左对齐 + 强制尾部省略 */
  width: 100%;
  max-width: 100%;
  text-align: left; /* 👈 新增：文字左对齐，省略号在末尾 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 图标容器 - 固定间距+不缩小+不重叠 */
.header-icons {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  /* 文字和图标之间的间距，自行调整 */
  margin-left: 16px;
}

/* 输入中状态样式 */
.ai-name:has(> span.typing) {
  color: var(--text-secondary);
  font-weight: 400;
}
</style>