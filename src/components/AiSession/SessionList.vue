<template>
  <!-- 对话列表 -->
  <div class="chat-list" @scroll="handleChatScroll">
    <!-- 修改：使用排序后的 sortedChatList -->
    <div
        v-for="item in sortedChatList"
        :key="item.sessionId"
        class="chat-item"
        :data-session-uuid="item.sessionUuid"
        :class="{
          'chat-item--top': Number(item.isTop) === 1,
          // 🔥 修复：用唯一sessionUuid匹配，绝不因排序错乱
          'chat-item--menu-active': modalStore.componentModals.contextMenu.currentItem?.sessionUuid === item.sessionUuid
          }"
        @click="handleClickItem($event, item)"
        v-longpress="(e) => handleLongPressChatItem(e, item)"
    >
      <div class="chat-badge" v-if="item.status === 'ACTIVE'"></div>
      <div class="avatar">
        <SvgIcon
            icon-class="default-session-icon"
            size="2.5rem"
            className="avatar-icon"
            color="var(--primary-color)"
        />
      </div>
      <div class="chat-info">
        <h3 class="chat-title">{{ item.chatTitle }}</h3>
        <p class="chat-desc">{{ formatMarkdownText(baseSessionStore.sessionLastMessage[item.sessionUuid] || '暂无消息')  }}</p>
      </div>
      <div class="chat-time">{{ formatTime(item.createTime) }}</div>
    </div>
  </div>

</template>

<script setup>
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import { useModalStore } from '@/stores/modalStore.js'
import {sortChatList} from "@/utils/softSession.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";

// 初始化Pinia的modalStore
const modalStore = useModalStore()
const router = useRouter()
const baseSessionStore = useBaseSessionStore()
const aiMessageStore = useAiMessageStore()

// 1. 时间格式化工具函数（适配接口返回的UTC时间）
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const now = new Date();
  const target = new Date(timeStr);
  const nowDate = now.toDateString();
  const targetDate = target.toDateString();

  // 今天
  if (nowDate === targetDate) {
    return `今天 ${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === targetDate) {
    return `昨天 ${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;
  }

  // 更早的时间：月-日
  return `${(target.getMonth() + 1).toString().padStart(2, '0')}-${target.getDate().toString().padStart(2, '0')}`;
};

// 4. 点击列表项跳转（预加载消息，再跳转！）
const handleClickItem = async (e, item) => { // 🔥 加 async 变成异步函数
  console.log('点击了对话项：', item.chatTitle, 'sessionUuid：', item.sessionUuid);

  // 1. 先设置当前会话UUID
  baseSessionStore.setCurrentSessionUuid(item.sessionUuid)
  // 2. 🔥 提前加载当前会话的消息（无参数调用）
  await aiMessageStore.fetchCurrentSessionMessages()
  // 3. 消息加载完成后，再跳转页面
  router.push({
    name: 'AiChat',
    params: {
      sessionUuid: item.sessionUuid
    }
  });
};

const handleLongPressChatItem = (e, item) => {
  console.log('长按会话项：', item.sessionUuid)
  if (!e || !item) return;

  // 🔥 修复：永远获取当前最新的DOM元素（实时查询，不缓存）
  const targetElement = document.querySelector(`.chat-item[data-session-uuid="${item.sessionUuid}"]`);
  if (!targetElement) {
    console.warn('未找到DOM元素');
    return;
  }

  // 只传最新DOM + 正确item
  modalStore.showContextMenu(targetElement, item);
};

// ====================== 会话列表排序核心函数（最终修复版） ======================
const sortedChatList = computed(() => {
  // 🔥 直接调用工具类，一键排序
  return sortChatList(baseSessionStore.chatList)
})

// ====================== AI消息文本格式化（去除Markdown） ======================
const formatMarkdownText = (text) => {
  // 1. 空值兜底
  if (!text) return '';

  // 2. 🔥 只删除【开头】的 1~6 个 # （标题符号，中间#完全保留）
  let formatted = text.replace(/^#{1,6}\s*/, '');

  // 3. 🔥 删除所有 ** 加粗符号（保留文字）
  formatted = formatted.replace(/\*\*/g, '');

  // 4. 🔥 过滤纯 --- 分隔线
  formatted = formatted.trim() === '---' ? '' : formatted;

  // 5. 最后清理首尾空白
  return formatted.trim();
};

let scrollTimer = null;

const handleChatScroll = (e) => {
  // 滚动时添加类名 = 显示滚动条
  const listDom = e.target
  listDom.classList.add('scroll-show')

  // 清空上一次定时器
  clearTimeout(scrollTimer)

  // 停止滚动 300ms 后移除类名 = 隐藏滚动条
  scrollTimer = setTimeout(() => {
    listDom.classList.remove('scroll-show')
  }, 300)
}
</script>

<style scoped>
/* 对话列表容器 */
.chat-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 170px);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
  padding-right: 4px;
  box-sizing: border-box;
}

/* 滚动条容器 */
.chat-list::-webkit-scrollbar {
  width: 4px;
}
.chat-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

/* 默认：滚动条透明隐藏 + 过渡动画 */
.chat-list::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
  transform: translateX(2px);
  /* 淡入淡出过渡 */
  transition: background 0.3s ease;
}

/* 滚动激活时：滚动条显示 */
.chat-list.scroll-show::-webkit-scrollbar-thumb {
  background: rgba(150, 150, 150, 0.3);
}
.chat-list.scroll-show::-webkit-scrollbar-thumb:hover {
  background: rgba(150, 150, 150, 0.5);
}

/* 以下所有样式完全保留，无任何修改 */
.chat-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--card-hover);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  pointer-events: auto;
}
.chat-item > * {
  pointer-events: none;
}
.chat-item--menu-active {
  transition: all 0.2s ease !important;
  transform: scale(0.9) !important;
  z-index: 10000 !important;
  position: relative;
  pointer-events: none !important;
}
.chat-item--top {
  background-color: var(--card-bg);
  border-left: 3px solid var(--primary-color);
}
.chat-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00c853;
  z-index: 1;
  pointer-events: none;
}
.chat-item:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-200);
  box-shadow: 0 2px 8px var(--shadow-color);
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 500;
  margin-right: 16px;
  flex-shrink: 0;
}
.chat-info {
  flex: 1;
  overflow: hidden;
}
.chat-title {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chat-desc {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
.chat-time {
  font-size: 12px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 12px;
  margin-right: 1px;
}
</style>