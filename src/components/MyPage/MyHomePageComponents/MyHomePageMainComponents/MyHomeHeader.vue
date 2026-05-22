<template>
  <!-- 新增头部区域 -->
  <header class="page-header">
    <h1 class="page-title">个人主页</h1>
    <!-- 新增信封图标按钮（在设置按钮左侧） -->
    <button class="message-btn" @click="handleMessageClick">
      <img
          src="@/static/icons/personal-message.svg"
          alt="消息"
          class="message-icon"
      >
    </button>
    <button class="setting-btn" @click="handleSettingClick">
      <!-- 使用SVG图标 -->
      <img
          src="@/static/icons/my-home-settings.svg"
          alt="设置"
          class="setting-icon"
      >
    </button>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router' // 导入路由

const router = useRouter() // 初始化路由实例

// 设置按钮点击事件 - 跳转到MySettings页面
const handleSettingClick = () => {
  router.push({ name: 'MySettingMain' }) // 按路由名称跳转
}

// 新增信封按钮点击事件（先打印指定内容，逻辑可自行扩展）
const handleMessageClick = () => {
  console.log('用户点击了信封按钮')
  router.push({ name: 'MyMessagePage' })
}
</script>

<style scoped>
/* 头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 15px; /* 与下方内容隔开 */
  border-bottom: 1px solid var(--border-color); /* 可选：加下划线分隔 */
  margin-bottom: 15px;
  /* 新增：给右侧按钮组加间距，避免挤在一起 */
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  /* 新增：占满左侧空间，让按钮组靠右 */
  flex: 1;
}

/* 信封按钮样式（与设置按钮保持视觉统一） */
.message-btn {
  padding: 6px; /* 调整内边距适配图标 */
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 信封图标样式（与设置图标尺寸一致） */
.message-icon {
  width: 20px; /* 图标宽度，可根据需要调整 */
  height: 20px; /* 图标高度，保持宽高比 */
  object-fit: contain; /* 防止图标变形 */
}

.setting-btn {
  padding: 6px; /* 调整内边距适配图标 */
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* SVG图标样式 */
.setting-icon {
  width: 20px; /* 图标宽度，可根据需要调整 */
  height: 20px; /* 图标高度，保持宽高比 */
  object-fit: contain; /* 防止图标变形 */
}
</style>