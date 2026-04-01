<template>
  <div class="chat-list-container">
    <!-- 页面标题 -->
    <chat-header/>

    <ContextMenu/>
    <SessionList v-show="!isAgentEnabled"/>

    <RoleList v-show="isAgentEnabled"/>

  </div>
  <ConfirmModal />
</template>

<script setup>
import {onMounted} from 'vue'
import ChatHeader from "@/components/AiSession/chat-header.vue";
import ContextMenu from "@/components/AiSession/ContextMenu.vue";
import { useSessionStore } from '@/stores/sessionStore'
import ConfirmModal from "@/components/Tiny/ConfirmModal.vue";
// 🔥 新增：导入AI配置仓库
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'
import SessionList from "@/components/AiSession/SessionList.vue";
import RoleList from "@/components/AiSession/RoleList.vue";

// 🔥 新增：获取开关状态
const { isAgentEnabled } = useAiSoftwareConfigStore()
const sessionStore = useSessionStore()

// 3. 页面挂载后调用真实接口
onMounted(async () => {
  // 🔥 异步并行：两个接口同时请求，速度更快
  await Promise.all([
    sessionStore.fetchUserSessions(),
    sessionStore.fetchMyAiRoleList()
  ])
})

</script>

<style scoped>
/* 页面容器 */
.chat-list-container {
  width: 100vw;
  height: calc(100vh - 60px); /* 避让固定底边栏 */
  background-color: var(--bg-color);
  padding: 0 20px;
  box-sizing: border-box;
  user-select: none;
}
</style>