<template>
  <MyMessageLayout>
    <div class="message-page">
      <!-- 页面头部 -->
      <PageHeader title="我的消息" @back="handleBack"/>

      <!-- 消息列表主体 -->
      <div class="message-container">
        <!-- 消息列表项1 -->
        <button class="message-item" @click="goToChatPage">
          <div class="avatar">
            <div class="avatar-img">客</div>
          </div>
          <div class="message-content">
            <div class="sender">客服小助手</div>
            <div class="message-text">您的充值订单已成功到账，请注意查收～</div>
          </div>
          <div class="message-time">10:25</div>
        </button>

        <!-- 消息列表项2 -->
        <div class="message-item">
          <div class="avatar">
            <div class="avatar-img">财</div>
          </div>
          <div class="message-content">
            <div class="sender">财务中心</div>
            <div class="message-text">本月账单已生成，点击查看详情</div>
          </div>
          <div class="message-time">昨天</div>
        </div>

        <!-- 消息列表项3 -->
        <div class="message-item">
          <div class="avatar">
            <div class="avatar-img">系</div>
          </div>
          <div class="message-content">
            <div class="sender">系统通知</div>
            <div class="message-text">您的账户安全验证已完成</div>
          </div>
          <div class="message-time">08-15</div>
        </div>
      </div>
    </div>
  </MyMessageLayout>
</template>

<script setup>
import {useRouter} from 'vue-router'

import PageHeader from "@/components/Tiny/PageHeader.vue";
import MyMessageLayout from "@/components/MyPage/MyHomePageComponents/MyMessagePageComponents/MyMessageLayout.vue";

const router = useRouter()
const handleBack = () => {
  router.push({name: 'MyHomePageMain'})
}

// 点击事件：跳转到ChatPage路由
const goToChatPage = () => {
  router.push({ name: 'ChatPage' })
}
</script>

<style scoped>
/* 页面整体容器 */
.message-page {
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-color);
}

/* 消息列表容器 */
.message-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 按钮样式：保留原有布局，清除默认按钮样式 */
.message-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 15px;
  border: none;
  background-color: var(--card-hover);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  gap: 10px;
  /* 清除默认按钮样式 */
  font-size: inherit;
  color: inherit;
  text-align: left;
}

.message-item:hover {
  background-color: var(--card-hover);
}

/* 头像样式 */
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.avatar-img {
  color: var(--gray-50);
  font-size: 18px;
  font-weight: 600;
}

/* 消息内容区域 */
.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sender {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.message-text {
  color: var(--text-tertiary); /* 浅白色/浅灰色文字，符合你的要求 */
  font-size: 14px;
  line-height: 1.4;
}

/* 消息时间 */
.message-time {
  color: var(--text-secondary);
  font-size: 12px;
  margin-left: 12px;
  flex-shrink: 0;
}
</style>
