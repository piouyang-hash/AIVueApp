<template>
  <div class="profile-wrapper">
    <!-- 🔥 左侧返回按钮 -->
    <button class="back-btn" @click="goBack">
      ← 返回
    </button>

    <!-- 头像 + 姓名 模块 -->
    <div class="profile-info">
      <div class="profile-avatar">
        <img
            class="avatar-img"
            :src="`${SERVICE_URLS.AI_CHAT_SERVICE}${currentContact.avatarPath}`"
            alt="角色头像"
        >
      </div>
      <h2 class="profile-name">{{ currentContact.roleDesc }}</h2>
    </div>

    <!-- 简介模块 -->
    <div class="profile-bio">
      <p>{{ currentContact.personaCore }}</p>
      <p class="tone">语气风格：{{ currentContact.personaTone }}</p>
    </div>

    <!-- 操作按钮组 -->
    <div class="action-buttons">
      <button class="btn gift-btn">送礼物</button>
      <button class="btn message-btn" @click="handleCreateNewChat">发消息</button>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useContactStore } from '@/stores/ContactStore.js'
import { SERVICE_URLS } from '@/api/constants/serviceUrls.js'
import { useSessionStore } from '@/stores/sessionStore.js' // 补全会话仓库
// 导入路由
import { useRouter } from 'vue-router'
import generateUUID from "@/utils/uuid.js";

const sessionStore = useSessionStore() // 初始化会话store
const router = useRouter()
const contactStore = useContactStore()
const { currentContact } = storeToRefs(contactStore)
// 返回上一页
const goBack = () => {
  router.back()
}

const handleCreateNewChat = async () => {
  try {
    // 当前选中的联系人（就是页面展示的这个）
    const item = currentContact.value
    console.log("联系人发消息：", item)

    // 2. 设置当前AI角色ID
    sessionStore.setCurrentRoleId(item.roleId)
    console.log('已设置当前角色ID：', item.roleId)

    // 3. 生成新会话UUID
    const sessionUuid = generateUUID()
    console.log('生成的新会话UUID：', sessionUuid)

    // 4. 设置当前会话
    sessionStore.setCurrentSessionUuid(sessionUuid)

    // 5. 跳转AI聊天页
    await router.push({ name: 'AiChat' })

    console.log('发消息 → 跳转对话成功！')
  } catch (error) {
    console.error('发消息失败：', error)
  }
}
</script>

<style scoped>
/* 高级全屏容器：优雅留白 + 垂直弹性布局 + 避让底部导航栏（上移60px） */
.profile-wrapper {
  width: 100%;
  min-height: calc(100vh - 60px); /* 🔥 核心：减去底部栏高度，整体上移60px */
  background-color: var(--bg-color);
  padding: 60px 24px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
}

/* 🔥 左侧返回按钮 - 高级轻奢样式 */
.back-btn {
  position: absolute;
  left: 24px;
  top: 30px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 99;
}

/* 头像姓名组：超大间距，视觉聚焦 */
.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}

/* 轻奢级圆形头像：双层柔和阴影 + 精致边框 */
.profile-avatar {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  overflow: hidden;
  /* 双层阴影 = 高级感核心 */
  box-shadow: 0 4px 20px var(--shadow-color),
  0 1px 2px rgba(var(--accent-color-rgb), 0.1);
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

/* 头像图片：完美填充不变形 */
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* 头像悬浮：微放大，柔和不夸张 */
.profile-avatar:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 24px var(--shadow-color);
}

/* 姓名：高级标题字体 */
.profile-name {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}

/* 简介：磨砂轻卡片 + 精致内边距，超长文本滚动 + 美化滚动条 */
.profile-bio {
  width: 100%;
  max-width: 340px;
  max-height: 350px; /* 🔥 核心：设置最大高度，控制超长内容 */
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.7;
  border: 1px solid var(--border-color);
  margin-bottom: auto;
  overflow-y: auto; /* 🔥 垂直滚动（内容超长自动出现） */
  /* 新增：内边距兜底，避免滚动条贴文字 */
  padding-right: 16px;
}

.profile-bio p {
  margin: 0 0 12px;
}

.profile-bio .tone {
  color: var(--text-tertiary);
  font-size: 14px;
  margin: 0;
}

/* 🔥 专属高级滚动条（严格使用你的设计变量） */
.profile-bio::-webkit-scrollbar {
  width: 4px; /* 纤细滚动条，高级感 */
}
.profile-bio::-webkit-scrollbar-track {
  background: var(--gray-100); /* 滚动轨道颜色 */
  border-radius: 2px;
}
.profile-bio::-webkit-scrollbar-thumb {
  background: var(--gray-300); /* 滚动滑块颜色 */
  border-radius: 2px;
}
.profile-bio::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400); /* hover 加深 */
}

/* 按钮组：全屏适配 + 顶级间距 */
.action-buttons {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 340px;
  margin-top: 30px;
}

/* 通用按钮：圆润大圆角 + 细腻过渡 */
.btn {
  flex: 1;
  height: 52px;
  border-radius: 26px;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

/* 主按钮：深灰蓝轻奢质感 */
.gift-btn {
  background-color: var(--primary-color);
  color: var(--gray-50);
  box-shadow: 0 2px 8px var(--shadow-color);
}

/* 次按钮：墨黑底色，高级对比 */
.message-btn {
  background-color: var(--gray-800);
  color: var(--gray-50);
}

/* 按钮交互：极简高级效果 */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
  opacity: 0.95;
}

.btn:active {
  transform: translateY(0);
}
</style>