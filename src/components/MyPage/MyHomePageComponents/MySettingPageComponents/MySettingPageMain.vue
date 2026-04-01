<template>
  <MyPageLayout>
    <div class="setting-main-page">
      <!-- 页面头部 -->
      <PageHeader title="设置" @back="handleBack"/>

      <!-- 设置选项列表 -->
      <div class="setting-list">
        <!-- 修改个人资料 -->
        <div class="setting-item" @click="goToEditProfile">
          <span class="item-text">修改个人资料</span>
          <img
              src="@/static/icons/right-arrow.svg"
              alt="箭头"
              class="item-arrow"
          >
        </div>

        <!-- 修改密码 -->
        <div class="setting-item" @click="goToChangePassword">
          <span class="item-text">修改密码（没有做）</span>
          <img
              src="@/static/icons/right-arrow.svg"
              alt="箭头"
              class="item-arrow"
          >
        </div>

        <!-- 修改邮箱 -->
        <div class="setting-item" @click="goToChangeEmail">
          <span class="item-text">修改邮箱</span>
          <img
              src="@/static/icons/right-arrow.svg"
              alt="箭头"
              class="item-arrow"
          >
        </div>

        <!-- 设置页面中的注销入口 -->
        <div class="setting-item" @click="goToCancelAccount">
          <span class="item-text">注销（分布式事务，不会！）</span>
          <img
              src="@/static/icons/right-arrow.svg"
              alt="箭头"
              class="item-arrow"
          >
        </div>
      </div>
    </div>
  </MyPageLayout>

</template>

<script setup>
import { useRouter } from 'vue-router'
import PageHeader from "@/components/Tiny/PageHeader.vue";
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";

const router = useRouter()

// 返回上一页
const handleBack = () => {
  router.push({ name: 'MyHomePageMain' })
}

// 修改个人资料点击事件（跳转到EditProfile路由）
const goToEditProfile = () => {
  router.push({ name: 'EditProfile' })
}

// 修改密码点击事件（跳转到ChangePassword路由）
const goToChangePassword = () => {
  router.push({ name: 'ChangePassword' })
}

// 修改邮箱点击事件（跳转到ChangeEmail路由）
const goToChangeEmail = () => {
  router.push({ name: 'ChangeEmail' })
}

// 其他设置点击事件
const goToCancelAccount = () => {
  router.push({ name: 'CancelAccount' })
}
</script>

<style scoped>
.setting-main-page {
  background-color: var(--bg-color);
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 选项之间的空隙 */
  padding: 0 15px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--card-bg); /* 每个选项独立卡片 */
  border-radius: 8px;
  box-shadow: 0 2px 5px var(--shadow-color);
  cursor: pointer;
  transition: all 0.2s ease; /* 过渡效果 */
}

/* 点击缩小效果 */
.setting-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 3px var(--shadow-color);
}

.setting-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.item-text {
  font-size: 16px;
  color: var(--text-primary);
}

.item-arrow {
  width: 16px;
  height: 16px;
  object-fit: contain;
  color: var(--text-tertiary);
}
</style>