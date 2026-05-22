<template>
  <!-- 下拉展开动画 -->
  <transition name="expand">
    <div
        class="role-dropdown"
        v-show="aiRoleStore.expandedRoleId === item.roleId"
    >
      <div class="dropdown-empty" v-if="!getRoleSortedSessions(item.roleId).length">
        该角色暂无会话
      </div>

      <!-- 🔥 改造：会话项侧滑结构（和父组件风格完全统一） -->
      <div
          class="dropdown-item-slide-wrapper"
          v-for="session in getRoleSortedSessions(item.roleId)"
          :key="session.sessionUuid"
          :data-session-uuid="session.sessionUuid"
          @touchstart="handleSessionTouchStart($event, session)"
          @touchmove="handleSessionTouchMove"
          @touchend="handleSessionTouchEnd"
          @touchcancel="closeSessionSlide"
      >
        <!-- 下层：侧滑操作按钮（置顶 + 删除） -->
        <div
            class="slide-bottom-action-session"
            :style="{ pointerEvents: activeSessionUuid === session.sessionUuid ? 'auto' : 'none' }"
        >
          <div class="action-btn delete-btn" @click.stop="handleDeleteSession(session)">
            <span class="btn-text">删除</span>
          </div>
          <div class="action-btn top-btn" @click.stop="handleTopSession(session)">
            <span class="btn-text">{{ Number(session.isTop) === 1 ? '取消置顶' : '置顶' }}</span>
          </div>
        </div>

        <!-- 上层：会话内容（可滑动） -->
        <div
            class="dropdown-item"
            :class="{
            'is-animating': !isDragging,
            'dropdown-item--top': Number(session.isTop) === 1,
            'dropdown-item--active': session.status === 'ACTIVE'
            }"
            :style="{ transform: `translateX(${activeSessionUuid === session.sessionUuid ? dragX : 0}px)` }"
            @click="handleClickSession(session)"
            @touchstart="handleLongPressStart(session)"
            @touchend="handleLongPressEnd"
            @touchcancel="handleLongPressCancel"
        >
          <span class="session-icon">💬</span>
          <span class="session-text">{{ formatMarkdownText(baseSessionStore.sessionLastMessage[session.sessionUuid]) }}</span>
          <div
              class="session-badge"
              v-show="unReadMessageStore.getSessionUnread(session.sessionUuid) > 0"
          >
            {{ unReadMessageStore.getSessionUnread(session.sessionUuid) }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import {sortChatList} from "@/utils/softSession.js";
import {useRouter} from 'vue-router'
import {ref} from "vue";
import { useModalStore } from '@/stores/modalStore'
import {ElMessage} from "element-plus";
import {deleteChatSession, topChatSession, untopChatSession} from "@/services/ai_chat.session.service.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import {useAiMessageStore} from "@/stores/AiChat/session-related/aiMessageStore.js";
import {useChatDomainStore} from "@/stores/AiChat/session-related/combineMethod/ChatDomainStore.js";
import {useAiRoleStore} from "@/stores/AiChat/aiRoleStore.js";
import {useUnReadMessageStore} from "@/stores/AiChat/session-related/combineMethod/unReadMessageStore.js"; // 如需提示，按需导入

// 接收父组件传递的 item
const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const router = useRouter()
const baseSessionStore = useBaseSessionStore()
const aiMessageStore = useAiMessageStore()
const aiRoleStore = useAiRoleStore()
const chatDomainStore = useChatDomainStore()
const unReadMessageStore = useUnReadMessageStore()
const modalStore = useModalStore()

// ======================
// 原有会话点击逻辑
// ======================
const handleClickSession = async (session) => {
  // 点击时关闭所有侧滑
  closeSessionSlide()
  console.log('点击了下拉会话：', session.chatTitle, 'sessionUuid：', session.sessionUuid);

  // 1. 设置当前会话
  baseSessionStore.setCurrentSessionUuid(session.sessionUuid);

  // 2. 获取当前会话消息
  await aiMessageStore.fetchCurrentSessionMessages();

  // 🔥 核心：点击进入会话 → 调用清空未读（非0才执行，自动调接口）
  await unReadMessageStore.clearSessionUnread(session.sessionUuid);

  // 3. 跳转路由到聊天页
  await router.push({
    name: 'AiChat',
    params: {sessionUuid: session.sessionUuid}
  });
};

const getRoleSortedSessions = (roleId) => {
  const sessionList = chatDomainStore.roleSessionMap[roleId] || []
  return sortChatList(sessionList)
}

// ======================
// 原有长按逻辑
// ======================
const longPressTimer = ref(null)
const longPressSession = ref(null)
const LONG_PRESS_DURATION = 1500

const handleLongPressStart = (session) => {
  longPressSession.value = session
  clearTimeout(longPressTimer.value)
  longPressTimer.value = setTimeout(() => {
    longPressTimer.value = 'valid'
    console.log('✅ 长按已触发，等待释放...', session.sessionUuid)
  }, LONG_PRESS_DURATION)
}
const handleLongPressEnd = () => {
  if (longPressTimer.value === 'valid') {
    console.log('🔔 用户长按了会话：', longPressSession.value.sessionUuid)
  }
  clearTimeout(longPressTimer.value)
  longPressTimer.value = null
  longPressSession.value = null
}
const handleLongPressCancel = () => {
  clearTimeout(longPressTimer.value)
  longPressTimer.value = null
  longPressSession.value = null
}

// ======================
// 🔥 新增：会话项侧滑逻辑（和父组件完全统一）
// ======================
const dragX = ref(0)
const activeSessionUuid = ref(null) // 当前激活侧滑的会话
const isDragging = ref(false)
const maxDrag = -160 // 左滑最大距离
let startX = 0
let startY = 0
let lastDragX = 0

// 触摸开始
const handleSessionTouchStart = (e, session) => {
  if (activeSessionUuid.value && activeSessionUuid.value !== session.sessionUuid) {
    closeSessionSlide()
    return
  }
  activeSessionUuid.value = session.sessionUuid
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  lastDragX = dragX.value
  isDragging.value = true
}

// 触摸移动
const handleSessionTouchMove = (e) => {
  if (!isDragging.value) return
  if (!e.cancelable) return

  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - startX
  const deltaY = currentY - startY

  // 方向锁定：只允许水平滑动
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
    e.preventDefault()
  }

  let finalX = lastDragX + deltaX
  if (finalX > 0) finalX = 0
  if (finalX < maxDrag) finalX = maxDrag
  dragX.value = finalX
}

// 触摸结束
const handleSessionTouchEnd = () => {
  isDragging.value = false
  if (dragX.value < -80) {
    dragX.value = maxDrag
  } else {
    closeSessionSlide()
  }
}

// 关闭侧滑
const closeSessionSlide = () => {
  dragX.value = 0
  activeSessionUuid.value = null
  isDragging.value = false
}

// 🔥 新增：会话操作（置顶 + 删除）
// 置顶会话（完整对接示例逻辑）
const handleTopSession = async (session) => {
  try {
    // 判断当前状态：已置顶 → 取消置顶；未置顶 → 置顶
    if (Number(session.isTop) === 1) {
      // 1. 调用后端【取消置顶】接口
      await untopChatSession(session.sessionUuid)
      // 2. 前端乐观更新
      session.isTop = 0
      session.topAt = null
      ElMessage.success('已取消置顶')
    } else {
      // 1. 调用后端【置顶】接口
      await topChatSession(session.sessionUuid)
      // 2. 前端乐观更新
      session.isTop = 1
      session.topAt = Date.now().toString()
      ElMessage.success('会话已置顶')
    }
  } catch (err) {
    ElMessage.error('操作失败，请重试')
    console.error('置顶/取消置顶接口报错：', err)
  } finally {
    // 无论成功失败，关闭侧滑
    closeSessionSlide()
  }
}

// 删除会话（使用项目 confirm 模态框 + 对接示例逻辑）
const handleDeleteSession = (session) => {
  const sessionUuid = session.sessionUuid

  // 打开项目确认弹窗（参数顺序对齐版）
  modalStore.showConfirmModal(
      "确认删除该会话吗？",  // 1. title 标题 ✔️
      "",                  // 2. message 提示文本（填空即可，也可以写提示语） ✔️
      async () => {        // 3. confirmFn 确认函数 ✔️
        try {
          // 1. 调用后端删除接口
          await deleteChatSession(sessionUuid)
          // 2. 前端乐观更新
          session.isDeleted = 1
          // 3. 调用store删除会话
          chatDomainStore.deleteSessionByUuid(sessionUuid)

          ElMessage.success('删除成功')
        } catch (err) {
          ElMessage.error('删除失败，请重试')
          console.error('删除接口报错：', err)
        } finally {
          closeSessionSlide()
        }
      },
      () => {              // 4. cancelFn 取消函数 ✔️
        closeSessionSlide()
        console.log('用户取消删除会话')
      }
  )

}

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
</script>

<style scoped>
/* ====================== */
/* 下拉面板原有样式 */
/* ====================== */
.role-dropdown {
  width: calc(100% - 32px);
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 8px 12px;
  margin: 8px auto 0;
  border-radius: 16px;
  max-height: min(300px, 50vh);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  /* 🔥 核心修复：永远预留滚动条的位置，不挤压文字！ */
  scrollbar-gutter: stable;
}

/* 修复后的过渡动画 - 完美平滑，无拉伸突兀 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* 关键：和下拉面板最大高度完全一致，不写死固定值 */
  max-height: min(300px, 50vh);
  opacity: 1;
  /* 关键：展开时允许滚动，收起时隐藏内容 */
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  /* 收起时彻底隐藏溢出 */
  overflow: hidden;
}

.dropdown-empty {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 48px;
  text-align: center;
  pointer-events: none;
  font-weight: 400;
}

/* ====================== */
/* 🔥 会话项侧滑样式（全量使用全局CSS变量） */
/* ====================== */
.dropdown-item-slide-wrapper {
  position: relative;
  margin-bottom: 6px;
  border-radius: 12px;
}
.dropdown-item-slide-wrapper:last-child {
  margin-bottom: 0;
}

/* 下层操作按钮 */
.slide-bottom-action-session {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 160px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 0 12px;
  z-index: 1;
  background: var(--gray-100);
  border-radius: 12px;
}

/* 上层滑动内容 */
.dropdown-item {
  position: relative;
  z-index: 2;
  background: var(--bg-color);
  width: 100%;
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  border: 1px solid var(--border-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-item--top {
  background: var(--bg2-color);
}

/* 🔥 新增：ACTIVE 状态（绿色背景） */
.dropdown-item--active {
  background: var(--green-line);
}

/* 置顶+ACTIVE 同时存在时，优先显示绿色（可根据需求调整） */
.dropdown-item--top.dropdown-item--active {
  background: linear-gradient(90deg, var(--bg2-color), var(--green-line));
}

.dropdown-item.is-animating {
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

/* 按钮样式（完全适配全局高级灰主题，无硬编码色值） */
.action-btn {
  width: 60px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 12px;
  color: var(--gray-50);
  border: none;
}
/* 置顶按钮：使用全局主色 */
.top-btn {
  background: var(--primary-color);
}
/* 删除按钮：使用全局深灰警示色 */
.delete-btn {
  background: var(--accent-color);
}

.btn-text {
  font-size: 10px;
}

/* 原有内容样式 */
.session-icon {
  font-size: 14px;
  opacity: 0.7;
  flex-shrink: 0;
  color: var(--text-tertiary);
}
.session-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 🔥 会话未读徽章：和之前图标徽章风格统一 */
.session-badge {
  position: absolute;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
  min-width: 1.2rem;
  height: 1.2rem;
  border-radius: 0.6rem;
  background-color: var(--primary-color);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  max-width: 2.2rem;
}

/* 滚动条 */
.role-dropdown::-webkit-scrollbar {
  width: 4px;
}
.role-dropdown::-webkit-scrollbar-track {
  background: var(--gray-100);
  border-radius: 4px;
}
.role-dropdown::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 4px;
}
</style>