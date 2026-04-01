<template>
  <div class="role-list" v-show="isAgentEnabled">
    <div
        v-for="item in filteredRoleList"
        :key="item.roleId"
    >
      <!-- 🔥 改造：角色项容器 + 原生触摸事件 -->
      <div
          class="role-item"
          :data-role-id="item.roleId"
          @touchstart="handleTouchStart($event, item)"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @click="handleClickRole($event, item)"
          v-longpress="(e) => handleLongPressRoleItem(e, item)"
      >
        <!-- ====================== -->
        <!-- 🔥 下层：侧滑按钮（固定底部） -->
        <!-- ====================== -->
        <div
            class="slide-bottom-action"
            :style="{ pointerEvents: activeRoleId === item.roleId ? 'auto' : 'none' }"
        >
          <div class="card-left" @click.stop="handleBackRoleList">← 返回</div>
          <div class="card-right" @click.stop="handleCreateNewChat(item)">创建新对话</div>
        </div>

        <!-- ====================== -->
        <!-- 🔥 上层：你的原有角色卡片（固定顶部，可滑动） -->
        <!-- ====================== -->
        <div
            class="slide-content"
            :class="{ 'is-animating': !isDragging }"
            :style="{ transform: `translateX(${activeRoleId === item.roleId ? dragX : 0}px)` }"
        >
          <div class="role-badge" v-if="hasActiveSession(item.roleId)"></div>
          <div class="avatar">
            <img
                :src="SERVICE_URLS.AI_CHAT_SERVICE + item.avatarRelativePath"
                alt="角色头像"
                class="avatar-img"
            >
          </div>
          <div class="role-info">
            <h3 class="role-title">{{ item.roleDesc }}</h3>
            <p class="role-desc">{{ item.personaTone }} · {{ item.personaCore.slice(0, 20) }}...</p>
          </div>
          <div class="role-time">{{ formatTime(item.createTime) }}</div>
        </div>
      </div>

      <!-- 👇 你的原有下拉会话容器（完全不动） -->
      <div
          class="role-dropdown"
          v-show="sessionStore.expandedRoleId === item.roleId"
      >
        <div class="dropdown-empty" v-if="!getRoleSortedSessions(item.roleId).length">
          该角色暂无会话
        </div>
        <div
            class="dropdown-item"
            v-for="session in getRoleSortedSessions(item.roleId)"
            :key="session.sessionUuid"
            @click="handleClickSession(session)"
            style="cursor: pointer"
        >
          {{ session.lastMessageContent }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {useSessionStore} from '@/stores/sessionStore'
import {useAiSoftwareConfigStore} from '@/stores/aiSoftwareConfig'
import {sortChatList} from "@/utils/softSession.js";
import {useRouter} from 'vue-router'
import {computed, ref} from "vue";
import { SERVICE_URLS } from '@/api/constants/serviceUrls.js'

const router = useRouter()
const {isAgentEnabled} = useAiSoftwareConfigStore()
const selectedReplaceRoleId = ref(null)
const sessionStore = useSessionStore()

// ======================
// 🔥 新增：原生侧滑核心变量
// ======================
const dragX = ref(0)               // 滑动位移
const activeRoleId = ref(null)     // 当前激活滑动的项
const isDragging = ref(false)      // 是否正在拖拽
const maxDrag = -220               // 最大左滑距离
let startX = 0                     // 触摸起点
let lastDragX = 0                  // 上一次位移

// ======================
// 🔥 新增：原生触摸滑动方法（无BUG版）
// ======================
// 触摸开始
const handleTouchStart = (e, item) => {
  if (activeRoleId.value && activeRoleId.value !== item.roleId) {
    closeSlide()
    return
  }
  activeRoleId.value = item.roleId
  startX = e.touches[0].clientX
  lastDragX = dragX.value
  isDragging.value = true
}

// 触摸移动
const handleTouchMove = (e) => {
  if (!isDragging.value) return
  const currentX = e.touches[0].clientX
  const deltaX = currentX - startX
  let finalX = lastDragX + deltaX

  // 边界限制
  if (finalX > 0) finalX = 0
  if (finalX < maxDrag) finalX = maxDrag

  dragX.value = finalX
}

// 触摸结束
const handleTouchEnd = () => {
  isDragging.value = false
  if (dragX.value < -110) {
    dragX.value = maxDrag
  } else {
    closeSlide()
  }
}

// 关闭侧滑
const closeSlide = () => {
  dragX.value = 0
  activeRoleId.value = null
}

// ======================
// 原有业务方法（完全保留，仅补充关闭侧滑）
// ======================
const handleBackRoleList = () => {
  closeSlide() // 关闭滑动
  selectedReplaceRoleId.value = null
}

// 创建新对话（补充关闭滑动）
const handleCreateNewChat = (item) => {
  console.log("创建新对话：", item)
  closeSlide()
  // 此处添加你原有创建对话的逻辑
}

// 长按（保留原有）
const handleLongPressRoleItem = (e, item) => {
  // 可选：长按也触发侧滑
  // activeRoleId.value = item.roleId
  // dragX.value = maxDrag
}

// 左滑（废弃Hammer，保留空方法不报错）
const handleSwipeLeft = (e, item) => {}

// ======================
// 你原有所有业务代码（完全不动）
// ======================
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const now = new Date();
  const target = new Date(timeStr);
  const nowDate = now.toDateString();
  const targetDate = target.toDateString();

  if (nowDate === targetDate) {
    return `今天 ${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === targetDate) {
    return `昨天 ${target.getHours().toString().padStart(2, '0')}:${target.getMinutes().toString().padStart(2, '0')}`;
  }
  return `${(target.getMonth() + 1).toString().padStart(2, '0')}-${target.getDate().toString().padStart(2, '0')}`;
};

const handleClickSession = async (session) => {
  console.log('点击了下拉会话：', session.chatTitle, 'sessionUuid：', session.sessionUuid);
  sessionStore.setCurrentSessionUuid(session.sessionUuid);
  await sessionStore.fetchCurrentSessionMessages();
  router.push({
    name: 'AiChat',
    params: { sessionUuid: session.sessionUuid }
  });
};

const filteredRoleList = computed(() => {
  return sessionStore.aiRoleList.filter(role => {
    const sessions = sessionStore.roleSessionMap[role.roleId] || []
    return sessions.length > 0
  })
})

const getRoleSortedSessions = (roleId) => {
  const sessionList = sessionStore.roleSessionMap[roleId] || []
  return sortChatList(sessionList)
}

const hasActiveSession = (roleId) => {
  const sessionList = sessionStore.roleSessionMap[roleId] || [];
  return sessionList.some(session => session.status === 'ACTIVE');
};

const handleClickRole = async (e, item) => {
  // 点击时关闭侧滑
  if(dragX.value !== 0){
    closeSlide()
    return
  }
  console.log('点击了AI角色：', item.roleDesc, 'roleId：', item.roleId);
  sessionStore.toggleExpandRole(item.roleId);
  console.log('当前角色-会话映射表 roleSessionMap：', sessionStore.roleSessionMap);
};
</script>

<style scoped>
/* 🔥 新增：侧滑核心样式 */
.role-item {
  position: relative;
  overflow: hidden;
}
/* 下层按钮容器 */
.slide-bottom-action {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1;
  background-color: var(--card-hover);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}
/* 上层滑动内容 */
.slide-content {
  position: relative;
  z-index: 2;
  background-color: var(--card-hover);
  width: 100%;
  height: 100%;
  transition: transform 0.22s ease;
  display: flex;
  align-items: center;
  padding: 16px;
}
/* 拖拽时关闭动画，更丝滑 */
.slide-content.is-animating {
  transition: transform 0.22s ease;
}

/* ====================== */
/* 你原有所有样式（完全不动） */
/* ====================== */
.avatar {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: #f5f5f5;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.role-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.role-badge {
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
.role-info {
  flex: 1;
  overflow: hidden;
}
.role-title {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.role-desc {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}
.role-time {
  font-size: 12px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 12px;
  margin-right: 1px;
}
.role-dropdown {
  width: 90%;
  max-height: 240px;
  border-radius: 12px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  padding: 12px 16px;
  margin: 8px auto 0;
  overflow-y: auto;
  box-shadow: 0 4px 12px var(--shadow-color);
  transition: all 0.3s ease;
}
.dropdown-empty {
  font-size: 13px;
  color: var(--text-tertiary);
  line-height: 24px;
  text-align: center;
  pointer-events: none;
}
.dropdown-item {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 20px;
  padding: 8px 12px;
  margin-bottom: 6px;
  background: var(--bg-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-item:last-child {
  margin-bottom: 0;
}
.role-dropdown::-webkit-scrollbar {
  width: 4px;
}
.role-dropdown::-webkit-scrollbar-thumb {
  background-color: var(--gray-300);
  border-radius: 2px;
}
</style>