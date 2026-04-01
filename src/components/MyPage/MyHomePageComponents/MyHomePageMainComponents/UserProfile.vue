<template>
  <div class="user-info">
    <!-- 头像：拼接完整URL，无则用占位图 -->
    <div class="avatar-container">
      <img
          :src="userInfo?.avatarUrl ? `${SERVICE_URLS.USER_SERVICE}${userInfo.avatarUrl}` : 'https://via.placeholder.com/80'"
          alt="头像"
          class="avatar-img"
      />
    </div>
    <div class="user-detail">
      <!-- 优先显示userInfo的昵称，其次是username，最后兜底 -->
      <h2 class="username">
        {{ userInfo?.nickname || username || '阅读器用户' }}
      </h2>

      <!-- 显示userInfo的个性签名，无则兜底 -->
      <p class="user-bio">
        {{ userInfo?.bio || '暂无个人简介' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user.js'
import { storeToRefs } from 'pinia'
// 导入SERVICE_URLS配置
import { SERVICE_URLS } from '@/api/constants/serviceUrls.js' // 根据实际路径调整

const userStore = useUserStore()
// 解构Pinia中的响应式字段
const { username, userInfo } = storeToRefs(userStore)
</script>

<style scoped>
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--card-bg);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px var(--shadow-color);
}

/* 头像容器：固定宽高，圆形裁剪 */
.avatar-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden; /* 裁剪超出容器的部分 */
  border: 2px solid var(--border-color);
}

/* 头像图片：覆盖容器，保持比例不变形 */
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键：裁剪填充，保持图片比例 */
  object-position: center; /* 可选：居中显示图片主体 */
}

.user-detail {
  flex: 1;
}

.username {
  font-size: 18px;
  color: var(--text-primary);
  margin: 0 0 5px 0;
  font-weight: 600;
}

</style>