<template>
  <div class="contact-wrapper">
    <!-- 搜索框 + 添加按钮 同行布局 -->
    <div class="search-toolbar">
      <input
          type="text"
          placeholder="搜索联系人"
          v-model="searchKey"
          class="search-input"
      />
      <button class="add-btn" @click="handleAddContact">
        添加
      </button>
    </div>

    <!-- 联系人列表 -->
    <div class="contact-list">
      <!-- 情况1：联系人 ≤5个 → 无字母分组，扁平化展示 -->
      <template v-if="totalContactCount <= 5">
        <div
            class="contact-item"
            v-for="contact in flatContactList"
            :key="contact.id"
            @click="handleClickContact(contact)"
        >
          <div class="avatar">{{ contact.name.slice(0, 1) }}</div>
          <div class="name">{{ contact.name }}</div>
        </div>
      </template>

      <!-- 情况2：联系人 >5个 → 显示字母分组（当前默认启用） -->
      <template v-else>
        <div class="letter-group" v-for="group in contactGroups" :key="group.letter">
          <div class="letter-title">{{ group.letter }}</div>
          <div
              class="contact-item"
              v-for="contact in filterContacts(group.list)"
              :key="contact.id"
              @click="handleClickContact(contact)"
          >
            <div class="avatar">{{ contact.name.slice(0, 1) }}</div>
            <div class="name">{{ contact.name }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 搜索关键词
const searchKey = ref('')

// 示例联系人数据
const contactGroups = ref([
  { letter: 'A', list: [{ id: 1, name: 'AI助手' }, { id: 2, name: '安警官' }] },
  { letter: 'B', list: [{ id: 3, name: '白月' }, { id: 4, name: '不熬夜' }] },
  { letter: 'C', list: [{ id: 5, name: '陈经理' }, { id: 6, name: '春风' }] },
  { letter: 'W', list: [{ id: 7, name: '微智能' }, { id: 8, name: '王同学' }] },
  { letter: 'Z', list: [{ id: 9, name: '张三' }, { id: 10, name: '赵总' }] }
])

// 计算总联系人数量
const totalContactCount = computed(() => {
  return contactGroups.value.reduce((total, group) => total + group.list.length, 0)
})

// 扁平化联系人列表（≤5个时使用）
const flatContactList = computed(() => {
  let all = []
  contactGroups.value.forEach(group => all = all.concat(group.list))
  return filterContacts(all)
})

// 搜索过滤
const filterContacts = (list) => {
  if (!searchKey.value) return list
  return list.filter(item => item.name.includes(searchKey.value.trim()))
}

// 点击联系人
const handleClickContact = (contact) => {
  console.log('打开聊天：', contact)
}

// 添加联系人
const handleAddContact = () => {
  console.log('添加新联系人')
}
</script>

<style scoped>
.contact-wrapper {
  width: 100%;
  height: 100vh;
  background-color: var(--bg-color);
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 搜索栏 + 添加按钮 同行布局 */
.search-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.search-input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  box-sizing: border-box;
  border-radius: 20px;
  border: none;
  outline: none;
  background-color: var(--card-bg);
  color: var(--text-primary);
  font-size: 15px;
}

.search-input:focus {
  background-color: var(--card-hover);
  box-shadow: 0 2px 6px var(--shadow-color);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.add-btn {
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  border: none;
  background-color: var(--primary-color);
  color: var(--gray-50);
  font-size: 15px;
  cursor: pointer;
  white-space: nowrap;
}

.add-btn:active {
  opacity: 0.9;
}

/* 列表容器 */
.contact-list {
  flex: 1;
  overflow-y: auto;
}

/* 字母分组标题 */
.letter-title {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-tertiary);
  background-color: var(--gray-100);
  border-radius: 4px;
  margin: 8px 0;
}

/* 联系人项：上下间隔 + 底部分隔线 */
.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px; /* 上下隔开 */
  border-bottom: 1px solid var(--border-color); /* 分隔线 */
  cursor: pointer;
  border-radius: 8px;
}

.contact-item:hover {
  background-color: var(--card-hover);
}

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
}

.name {
  font-size: 16px;
  color: var(--text-primary);
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