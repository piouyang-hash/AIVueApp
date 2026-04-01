<template>
  <!-- 对话列表 -->
  <div class="chat-list">
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
        <p class="chat-desc">{{ item.lastMessageContent }}</p>
      </div>
      <div class="chat-time">{{ formatTime(item.createTime) }}</div>
    </div>
  </div>

</template>

<script setup>
import {computed} from 'vue'
import {useRouter} from 'vue-router'
import { useModalStore } from '@/stores/modalStore.js'
import { useSessionStore } from '@/stores/sessionStore'
import {sortChatList} from "@/utils/softSession.js";

// 初始化Pinia的modalStore
const modalStore = useModalStore()
const router = useRouter()
const sessionStore = useSessionStore()

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
  sessionStore.setCurrentSessionUuid(item.sessionUuid)
  // 2. 🔥 提前加载当前会话的消息（无参数调用）
  await sessionStore.fetchCurrentSessionMessages()
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
  return sortChatList(sessionStore.chatList)
})
</script>

<style scoped>
/* 对话列表容器 */
.chat-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 单条对话项 - 原有样式不动 */
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
/* 所有子元素禁止拦截点击，穿透到父级（不动！这是最优写法） */
.chat-item > * {
  pointer-events: none;
}

/* 右键菜单激活时：缩小样式 + 禁止点击（CSS控制，自动恢复） */
.chat-item--menu-active {
  transition: all 0.2s ease !important;
  transform: scale(0.9) !important;
  z-index: 10000 !important;
  position: relative;
  /* 👇 新增这一行：完全禁止鼠标点击/悬停等所有交互 */
  pointer-events: none !important;
}

/* ====================== 🔥 置顶会话样式（加深背景） ====================== */
.chat-item--top {
  /* 置顶：背景色加深 + 左边框高亮标记 */
  background-color: var(--card-bg);
  border-left: 3px solid var(--primary-color);
}

/* 右上角绿色小球样式 */
.chat-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00c853;
  z-index: 1;
  pointer-events: none; /* 额外声明：小球也不拦截事件（冗余但保险） */
}

/* 列表项 hover 效果 */
.chat-item:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-200);
  box-shadow: 0 2px 8px var(--shadow-color);
}

/* 左侧圆形头像 */
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

/* 中间文字区域（标题+描述） */
.chat-info {
  flex: 1;
  overflow: hidden;
}

/* 对话标题 */
.chat-title {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 对话描述（第一句话） */
.chat-desc {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

/* 右侧时间 */
.chat-time {
  font-size: 12px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 12px;
  margin-right: 1px;
}
</style>