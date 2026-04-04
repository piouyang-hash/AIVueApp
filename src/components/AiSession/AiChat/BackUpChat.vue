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
          <!-- 根据isAiReplying状态切换文本：AI回复中显示“对方输入中...”，否则显示“智能助手” -->
          <h1 class="ai-name">{{ isAiReplying ? '对方输入中...' : '智能助手' }}</h1>
        </div>
      </div>

      <!-- 占位 -->
      <div class="header-placeholder"></div>
      <!-- ✅ 修正：使用sessionStore判断当前会话消息数量 -->
      <SvgIcon
          v-if="(sessionStore.sessionMessages[sessionStore.currentSessionUuid] || []).length > 0"
          icon-class="add-icon"
          size="1.5rem"
          className="icon"
          @click="handleAddIconClick"
          color="var(--text-tertiary)"
      />
      <meridian-vein
          v-if="(sessionStore.sessionMessages[sessionStore.currentSessionUuid] || []).length > 0"
          :width="30"
          :height="30"
      />
      <heart-beat />
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
    <AIInput @sendMessage="handleAIInputSendMessage" />
  </div>
</template>

<script setup>
import {nextTick, ref} from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 导入资源（仅保留顶部导航/输入框相关）
import BackIcon from '@/static/icons/back.svg'
import HeartBeat from "@/components/AiSession/AiChat/heart-beat.vue";
import MeridianVein from "@/components/AiSession/AiChat/meridian-vein.vue";
import AIInput from "@/components/Tiny/AIInput.vue";
import AiChatContent from "@/components/AiSession/AiChat/AiChatContent.vue";
import {parseChatChunk, userChatWithMemory, userSlidingWindowStreamChat} from "@/services/ai_chat.service.js";
// 导入自治组件AiChatContent
import { useSessionStore } from '@/stores/sessionStore.js'

// 初始化新仓库
const sessionStore = useSessionStore()

// 初始化实例（仅保留核心依赖）
const route = useRoute()
const router = useRouter()
const aiChatContentRef = ref(null) // 可选：获取AiChatContent组件实例

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

// 存储当前流式请求的取消函数（新消息时取消上一次请求）
let currentStreamCancel = null;
// AI是否正在回复（响应式状态，模板可用）
const isAiReplying = ref(false);

// ==============================================
// 🔥 核心重写：适配新sessionStore的流式发送消息
// ==============================================
const handleAIInputSendMessage = async ({ content, sessionUuid }) => {
  try {
    console.log('父组件接收到AIInput消息：', { content, sessionUuid });

    sessionStore.setPlaceholderSession(sessionUuid);

    // ========== 步骤1：展示用户消息（存入当前会话） ==========
    const userMessage = {
      content: content,
      role: 'USER',
      createTime: new Date().toLocaleString()
    }
    sessionStore.pushMessageToSession(sessionUuid, userMessage)

    // 发送消息滚动到底部
    await nextTick(() => {
      aiChatContentRef.value?.scrollToBottom()
    })

    // ========== 步骤2：取消上一次未完成的流式请求 ==========
    if (currentStreamCancel) {
      currentStreamCancel();
      console.log('因新消息触发，取消上一次流式请求');
      isAiReplying.value = false;
    }

    // ========== 步骤3：初始化变量 ==========
    const finalSessionUuid = sessionUuid;
    let aiMessageId = null;
    isAiReplying.value = true;

    // ========== 步骤4：调用流式AI接口 ==========
    currentStreamCancel = userSlidingWindowStreamChat(
        content,
        finalSessionUuid,
        (chunk) => {
          parseChatChunk(
              chunk,
              (meta) => {
                console.log('✅ 首帧元数据', meta);
                const newSessionUuid = meta.sessionUuid;
                const targetSessionUuid = newSessionUuid || finalSessionUuid;

                if (!finalSessionUuid && newSessionUuid) {
                  sessionStore.setCurrentSessionUuid(newSessionUuid);
                }

                aiMessageId = sessionStore.createAiReplyMessage(targetSessionUuid, meta);
                sessionStore.fillTempMessage(targetSessionUuid, meta);
              },
              (text) => {
                if (!aiMessageId) return;
                sessionStore.updateAiReplyMessage(finalSessionUuid, aiMessageId, text);

                // 🔥 流式回复时也自动滚动（可选，体验更好）
                // nextTick(() => {
                //   aiChatContentRef.value?.scrollToBottom()
                // })
              },
              () => {
                console.log('🔚 流式传输完成');
                currentStreamCancel = null;
                isAiReplying.value = false;
              },
              (err) => {
                console.error('解析错误：', err);
              }
          );
        },
        // 🔥 修复后的请求错误回调（唯一改动点）
        (err) => {
          if (err) console.error('请求失败：', err);
        }
    );

  } catch (err) {
    console.error('发送消息初始化失败：', err);
    isAiReplying.value = false;
    const errorMsg = {
      userId: 'ai',
      content: '抱歉，发送消息失败，请稍后再试～',
      type: 'ASSISTANT',
      createTime: new Date().toLocaleString()
    };
    sessionStore.pushMessageToSession(sessionUuid, errorMsg);
  }
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

.session-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.session-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-name {
  margin: 0;
  font-size: 17px;
  color: var(--text-primary);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  /* 修正：前面加中文字体，后面保留原有西文兜底 */
  font-family:  -apple-system, "Segoe UI",  "Microsoft YaHei" ,"PingFang SC", BlinkMacSystemFont,  Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 可选：“对方输入中...” 单独加样式，更醒目但不突兀 */
.ai-name:has(> span.typing) {
  color: var(--text-secondary); /* 稍浅的颜色，区分静态/动态状态 */
  font-weight: 400;
}

.header-placeholder {
  width: 40px;
}
</style>