<template>
  <div class="role-list" v-show="isAgentEnabled">
    <div
        v-for="item in filteredRoleList"
        :key="item.roleId"
        class="role-item-wrapper"
    >
      <!-- 你的角色项侧滑代码（完全不动） -->
      <div
          class="role-item"
          :data-role-id="item.roleId"
          @touchstart="handleTouchStart($event, item)"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          @click="handleClickRole($event, item)"
          v-longpress="(e) => handleLongPressRoleItem(e, item)"
      >
        <!-- 侧滑按钮（不动） -->
        <div
            class="slide-bottom-action"
            :style="{ pointerEvents: activeRoleId === item.roleId ? 'auto' : 'none' }"
        >
          <div class="action-btn delete-btn" @click.stop="handleDeleteRole">
            <span class="btn-icon">-</span>
            <span class="btn-text">删除</span>
          </div>
          <div class="action-btn create-btn" @click.stop="handleCreateNewChat(item)">
            <span class="btn-icon">+</span>
            <span class="btn-text">创建新对话</span>
          </div>
        </div>

        <!-- 角色卡片内容（不动） -->
        <div
            class="slide-content"
            :class="{ 'is-animating': !isDragging }"
            :style="{ transform: `translateX(${activeRoleId === item.roleId ? dragX : 0}px)` }"
        >
          <div
              class="role-unread-badge"
          :class="item.status === 'ACTIVE'
          ? 'badge-green ' + ((isSplitMessageEnabled ? item.roleTotalSplitUnreadCount : item.roleTotalNormalUnreadCount) ? '' : 'badge-green-empty')
          : 'badge-gray'"
          v-if="item.status === 'ACTIVE' || (isSplitMessageEnabled ? item.roleTotalSplitUnreadCount > 0 : item.roleTotalNormalUnreadCount > 0)"
          >
          {{ (isSplitMessageEnabled ? item.roleTotalSplitUnreadCount : item.roleTotalNormalUnreadCount) || '' }}
        </div>
          <div class="avatar">
            <img
                :src="SERVICE_URLS.AI_CHAT_SERVICE + item.avatarPath"
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

      <!-- 👇 🔥 这里直接用封装好的组件，完美替换原有代码 -->
      <DropDownList :item="item" />

    </div>
  </div>
</template>

<script setup>
import {useAiSoftwareConfigStore} from '@/stores/aiSoftwareConfig'
import {useRouter} from 'vue-router'
import {computed, ref} from "vue";
import { SERVICE_URLS } from '@/api/constants/serviceUrls.js'
import generateUUID from "@/utils/uuid.js";
import DropDownList from "@/components/AiSession/DropDownList.vue";
import {useModalStore} from "@/stores/modalStore.js";
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";
import {useAiRoleStore} from "@/stores/AiChat/aiRoleStore.js";
import {useChatDomainStore} from "@/stores/AiChat/session-related/combineMethod/ChatDomainStore.js";

const router = useRouter()
const {isAgentEnabled, isSplitMessageEnabled} = useAiSoftwareConfigStore()
const baseSessionStore = useBaseSessionStore()
const aiRoleStore = useAiRoleStore()
const chatDomainStore = useChatDomainStore()
const modalStore = useModalStore()

// ======================
// 🔥 新增：原生侧滑核心变量
// ======================
const dragX = ref(0)               // 滑动位移
const activeRoleId = ref(null)     // 当前激活滑动的项
const isDragging = ref(false)      // 是否正在拖拽
const maxDrag = -255               // 最大左滑距离（增加以容纳更宽的按钮）
let startX = 0                     // 触摸起点
let startY = 0                     // 添加垂直起点用于方向锁定
let lastDragX = 0                  // 上一次位移

// ======================
// 🔥 新增：原生触摸滑动方法（无BUG版 + 方向锁定）
// ======================
// 触摸开始
const handleTouchStart = (e, item) => {
  if (activeRoleId.value && activeRoleId.value !== item.roleId) {
    closeSlide()
    return
  }
  activeRoleId.value = item.roleId
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  lastDragX = dragX.value
  isDragging.value = true
}

// 触摸移动
const handleTouchMove = (e) => {
  if (!isDragging.value) return

  // 🔥 核心修复：如果事件不可取消，直接跳过，不执行阻止
  if (!e.cancelable) return;

  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const deltaX = currentX - startX
  const deltaY = currentY - startY

  // 方向锁定：水平滑动 > 垂直滑动，阻止页面滚动
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
    e.preventDefault()
  }

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

// 创建新对话（补充关闭滑动）
const handleCreateNewChat = async (item) => {
  try {
    console.log("创建新对话：", item)
    // 1. 关闭滑动（你要求的）
    closeSlide()

    // 2. 核心：设置当前角色ID（你指定的store方法）
    aiRoleStore.setCurrentRoleId(item.roleId)
    console.log('已设置当前角色ID：', item.roleId)

    // 3. 生成标准UUID（对标你的写法）
    const sessionUuid = generateUUID()
    console.log('生成的新会话UUID：', sessionUuid)

    // 4. 设置当前会话UUID（对标你的写法）
    baseSessionStore.setCurrentSessionUuid(sessionUuid)

    // 5. 跳转AiChat页面 ✅ 不传入任何参数
    await router.push({
      name: 'AiChat'
    })

    console.log('创建新对话并跳转成功！')
  } catch (error) {
    console.error('创建新对话并跳转失败：', error)
  }
}

// 角色删除点击事件
const handleDeleteRole = () => {
  modalStore.showConfirmModal(
      "确认删除该角色吗？", // 标题
      "会删除所有会话", // 你要的提示消息 ✅
      async () => {
        // ====================
        // 🔥 confirmFn 确认函数（后续在这里写真实删除逻辑）
        // ====================
        console.log("执行删除角色逻辑")
        // ElMessage.success('角色删除成功')
      },
      () => {
        // cancelFn 取消函数
        closeSlide() // 关闭滑动面板 ✅
        console.log("取消删除角色")
      }
  )
}

// 长按（保留原有）
const handleLongPressRoleItem = (e, item) => {
 console.log("长按")
}

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

// 🔥 Processed role list: Filter sessions + Attach status + ACTIVE roles first
// 整理后的角色列表：过滤会话 + 挂载状态 + ACTIVE置顶 + 统计角色总未读数
const filteredRoleList = computed(() => {
  return aiRoleStore.aiRoleList.filter(role => {
    // Only keep roles with sessions
    const sessions = chatDomainStore.roleSessionMap[role.roleId] || []
    return sessions.length > 0
  }).map(role => {
    const sessions = chatDomainStore.roleSessionMap[role.roleId] || []
    const hasActive = sessions.some(session => session.status === 'ACTIVE')

    // ===================== 新增：统计角色全会话未读总数 =====================
    let roleTotalNormalUnreadCount = 0
    let roleTotalSplitUnreadCount = 0
    // 遍历该角色下的所有会话，累加未读数
    sessions.forEach(session => {
      // 累加普通未读（兜底0，防止无字段报错）
      roleTotalNormalUnreadCount += session.normalUnreadCount || 0
      // 累加切分未读（兜底0）
      roleTotalSplitUnreadCount += session.splitUnreadCount || 0
    })

    // Add status + 未读总数字段 to role
    return {
      ...role,
      status: hasActive ? 'ACTIVE' : 'CLOSED',
      // 挂载两个新增字段
      roleTotalNormalUnreadCount: roleTotalNormalUnreadCount,
      roleTotalSplitUnreadCount: roleTotalSplitUnreadCount
    }
  }).sort((a, b) => {
    // Core sorting: Pin ACTIVE role to the top, others keep original order
    // 核心排序：ACTIVE置顶，其余保持原样
    if (a.status === 'ACTIVE') return -1
    return 0
  })
})

const handleClickRole = async (e, item) => {
  // 点击时关闭侧滑
  if(dragX.value !== 0){
    closeSlide()
    return
  }
  console.log('点击了AI角色：', item.roleDesc, 'roleId：', item.roleId);
  aiRoleStore.toggleExpandRole(item.roleId);
  console.log('当前角色-会话映射表 roleSessionMap：', chatDomainStore.roleSessionMap);
};
</script>

<style scoped>
/* ====================== */
/* 🔥 严格使用你提供的设计变量 */
/* ====================== */
.role-list {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 4px;
}

.role-item-wrapper {
  position: relative;
}

/* 角色项卡片 */
.role-item {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 2px 8px var(--shadow-color), 0 4px 16px var(--shadow-color);
  transition: box-shadow 0.3s ease;
}

.role-item:active {
  box-shadow: 0 4px 12px var(--shadow-color);
}

/* 下层操作按钮容器 */
.slide-bottom-action {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 270px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 1;
  background: var(--gray-100);
  border-radius: 20px;
  gap: 12px;
}

/* 操作按钮通用 */
.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 16px;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: var(--gray-50);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

/* 删除按钮（独立样式） */
.delete-btn {
  flex: 5;
  background: var(--accent-color);
  color: var(--gray-50); /* 白色文字 */
  border: none;
}

/* 创建会话按钮 - 主色（不变） */
.create-btn {
  flex: 5;
  background: var(--primary-color);
  color: var(--gray-50);
  border: none;
}

.action-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}

.btn-icon {
  font-size: 18px;
  font-weight: 500;
}

/* 新增：仅针对删除按钮的减号，向上微调 */
.delete-btn .btn-icon {
  /* 数值自己调：-2px / -3px 都可以，越小越往上 */
  transform: translateY(-2px);
}

.btn-text {
  font-size: 14px;
  font-weight: 500;
}

/* 上层滑动内容 */
.slide-content {
  position: relative;
  z-index: 2;
  background: var(--card-bg);
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 20px;
  border: 1px solid var(--border-color);
}

/* 拖拽动画 */
.slide-content.is-animating {
  transition: transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
}

/* ====================== */
/* 角色卡片内容 */
/* ====================== */
.avatar {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: var(--gray-200);
  margin-right: 14px;
  box-shadow: 0 2px 8px var(--shadow-color);
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.role-item:active .avatar-img {
  transform: scale(0.98);
}

/* 数字圆球基础样式 → 改造为：高度固定+宽度自适应椭圆 */
.role-unread-badge {
  position: absolute;
  top: 10px;
  right: 20px;
  /* 核心：固定高度，宽度自适应 */
  height: 20px;
  /* 最小宽度=高度，保证1个数字时是正圆 */
  min-width: 20px;
  /* 左右内边距，让数字不贴边，自动撑开宽度 */
  padding: 0 4px;
  /* 高度一半 → 永远是椭圆（正圆/长椭圆） */
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #fff;
  /* 防止数字折行 */
  white-space: nowrap;
  /* 优化：数字居中不偏移 */
  box-sizing: border-box;
}

/* 活跃状态：绿色（沿用你原有的成功色） */
.badge-green {
  background: var(--success-color);
}

/* 活跃无消息 → 缩小绿点（完全保留原效果） */
.badge-green.badge-green-empty {
  width: 12px !important;
  height: 12px !important;
  min-width: 12px !important;
  padding: 0 !important;
  font-size: 0;
}

/* 非活跃状态：灰色 */
.badge-gray {
  background: var(--text-tertiary);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--green-line-rgb), 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(var(--green-line-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--green-line-rgb), 0);
  }
}

.role-info {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.role-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.3px;
  line-height: 1.4;
}

.role-desc {
  margin: 6px 0 0 0;
  font-size: 13px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  font-weight: 400;
}

.role-time {
  font-size: 12px;
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: 12px;
  font-weight: 400;
  letter-spacing: 0.2px;
  margin-top: 25px;
}

/* ====================== */
/* 移动端适配 */
/* ====================== */
@media (max-width: 768px) {
  .role-list {
    gap: 10px;
    margin-top: 12px;
  }

  .slide-content {
    padding: 14px 16px;
  }

  .avatar {
    width: 48px;
    height: 48px;
    margin-right: 12px;
  }

  .role-title {
    font-size: 16px;
  }

  .role-desc {
    font-size: 12px;
  }

  .action-btn {
    padding: 12px 12px;
  }

  .btn-text {
    font-size: 13px;
  }
}
</style>