<template>
  <header class="chat-header">
    <!-- 左侧：搜索图标（不变） -->
    <div class="chat-header__side left">
      <SvgIcon
          icon-class="search"
          size="1.5rem"
          className="icon"
          color="var(--text-tertiary)"
          @click="handleSearchClick"
      />
    </div>

    <!-- 中间：滑动动画 → 输入框从左到右铺开 -->
    <div class="chat-header__main">

      <h2 class="chat-header__title" v-show="!showSearch">智能体</h2>
      <input
          v-show="showSearch"
          class="search-input"
          placeholder="搜索会话..."
          type="text"
          @keyup.enter="handleConfirmSearch"
      />

    </div>

    <!-- 右侧：淡入淡出动画 → 按钮切换 -->
    <div class="chat-header__side right">

      <SvgIcon
          v-show="!showSearch"
          icon-class="add-icon"
          size="1.5rem"
          className="icon"
          color="var(--text-tertiary)"
          @click="handleAddContact"
      />
      <span v-show="showSearch" class="search-btn" @click="handleConfirmSearch">
          搜索
        </span>
    </div>
  </header>
</template>

<script setup>
// 保留原有核心导入
import {useRouter} from 'vue-router'
import {ref} from "vue";

const router = useRouter()
// 🔥 新增：控制搜索框显示/隐藏（默认关闭）
const showSearch = ref(false)

// 搜索图标点击事件
const handleSearchClick = () => {
  console.log('【搜索图标】被点击了');
  // 🔥 新增：切换搜索模式
  showSearch.value = !showSearch.value
};

// 添加联系人 → 跳转到编辑/新建智能体页面
const handleAddContact = () => {
  console.log('【添加联系人】跳转至新建智能体页面');
  // 🔥 核心：路由跳转（使用路由name，最稳定）
  router.push({
    name: 'ContactEditProfilePage'
  });
};
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  padding: 0 1.2rem;
  height: 3.5rem;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow-color);
  box-sizing: border-box;
  user-select: none;
  gap: 1rem;
}

/* 左右两侧固定宽度，不拉伸 */
.chat-header__side {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.chat-header__side.left {
  justify-content: flex-start;
}

.chat-header__side.right {
  justify-content: flex-end;
  gap: 0.8rem;
}

/* 中间区域铺满剩余空间 + 隐藏溢出（必须加，才能实现铺开动画） */
.chat-header__main {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.chat-header__title {
  width: 100%;
  text-align: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
}

/* 搜索输入框 */
.search-input {
  width: 100%;
  height: 36px;
  border: none;
  outline: none;
  border-radius: 18px;
  padding: 0 16px;
  background: var(--card-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.icon {
  cursor: pointer;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.search-btn {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 2px;
  white-space: nowrap;
}

/* ====================================== */
/* 🔥 Vue 过渡动画：搜索框从左到右铺开 */
/* ====================================== */
.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.28s ease;
}

.search-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px); /* 从左侧滑入 */
  width: 0;
}

.search-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
  width: 0;
}

/* ====================================== */
/* 🔥 Vue 过渡动画：淡入淡出 */
/* ====================================== */
.search-fade-enter-active,
.search-fade-leave-active {
  transition: opacity 0.22s ease;
}

.search-fade-enter-from {
  opacity: 0;
}

.search-fade-leave-to {
  opacity: 0;
}
</style>