<template>
  <div class="contact-wrapper">

    <ContactHeader />

    <!-- 统一扁平化联系人列表（适配AI角色字段） -->
    <div class="contact-list">
      <div
          class="contact-item"
          v-for="contact in filteredContactList"
          :key="contact.roleId"
      @click="handleClickContact(contact)"
      >
      <img
          class="avatar"
          :src="SERVICE_URLS.AI_CHAT_SERVICE + contact.avatarRelativePath"
          alt="角色头像"
      >
      <!-- 🔥 名称：name → roleDesc -->
      <div class="name">{{ contact.roleDesc }}</div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// 导入你写好的联系人Pinia仓库
import { useContactStore } from '@/stores/ContactStore.js' // 替换成你实际的仓库文件路径

import { SERVICE_URLS } from '@/api/constants/serviceUrls.js'
// 1. 导入路由钩子（必加）
import { useRouter } from 'vue-router'
import ContactHeader from "@/components/Contact/ContactHeader.vue";

// 2. 获取路由实例
const router = useRouter()
// 实例化仓库
const contactStore = useContactStore()

// 搜索关键词（保留不变）
const searchKey = ref('')

// 🔥 页面挂载时，调用仓库方法获取角色列表
onMounted(() => {
  contactStore.fetchMyAiRoleList()
})

// 搜索过滤后的列表（数据源改为仓库的 aiRoleList）
const filteredContactList = computed(() => {
  const key = searchKey.value.trim()
  // 无关键词时返回仓库的全部角色列表
  if (!key) return contactStore.aiRoleList
  // 关键词过滤
  return contactStore.aiRoleList.filter(item => item.name.includes(key))
})

// 点击联系人（保留日志 + 存入完整实体 + 无参跳转）
const handleClickContact = (contact) => {

  // 🔥 核心：把完整 contact 实体存入 Pinia
  contactStore.setCurrentContact(contact)

  // 无参路由跳转
  router.push({ name: 'ContactProfilePage' })
}

// 添加联系人（保留不变）
const handleAddContact = () => {
  console.log('添加新联系人')
}
</script>

<style scoped>
/* 核心修改：减去底部60px导航栏高度 */
.contact-wrapper {
  width: 100%;
  height: calc(100vh - 60px); /* 避让固定底边栏 */
  background-color: var(--bg-color);
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  user-select: none;
}

/* 列表容器：透明背景，露出父级灰色背景 */
.contact-list {
  flex: 1;
  overflow-y: auto;
  background-color: transparent;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 联系人项：与页面背景一致（透明），通过边框线实现上下间隔 */
.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 12px;
  background-color: transparent;   /* 透明背景，与页面背景统一 */
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid var(--border-color); /* 下边框作为分隔线 */
}

/* 最后一项无分隔线 */
.contact-item:last-child {
  border-bottom: none;
}

/* 悬停效果：轻微背景色变化，提升交互感 */
.contact-item:hover {
  background-color: var(--card-hover);
}

/* 头像 */
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  flex-shrink: 0;
}

/* 联系人姓名 */
.name {
  font-size: 16px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 滚动条美化 */
.contact-list::-webkit-scrollbar {
  width: 4px;
}
.contact-list::-webkit-scrollbar-thumb {
  background-color: var(--gray-300);
  border-radius: 2px;
}
</style>