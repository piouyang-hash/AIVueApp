<template>
  <header class="chat-header">
    <!-- 左侧：加号雪碧图 -->
    <div class="chat-header__side left">
      <SvgIcon
          icon-class="add-icon"
          size="1.5rem"
          className="icon"
          color="var(--text-tertiary)"
          @click="handleAddContact"
      />
    </div>

    <!-- 中间：标题（固定显示） -->
    <div class="chat-header__main">
      <h2 class="chat-header__title">智能体</h2>
    </div>

    <!-- 右侧：导航雪碧图（与加号样式统一） -->
    <div class="chat-header__side right">
      <SvgIcon
          icon-class="navigate"
          size="1.5rem"
          className="icon"
          color="var(--text-tertiary)"
          @click="handleNavigate"
      />
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 左侧加号：跳转新建智能体页面
const handleAddContact = () => {
  console.log('【加号】跳转至新建智能体页面');
  router.push({
    name: 'ContactEditProfilePage'
  });
};

// 右侧导航：仅打印日志（逻辑后续自行补充）
const handleNavigate = () => {
  console.log('【导航按钮】被点击');
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

/* 左右两侧固定宽度 */
.chat-header__side {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.left {
  justify-content: flex-start;
}

.right {
  justify-content: flex-end;
}

/* 中间标题居中 */
.chat-header__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-header__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 图标统一样式 */
.icon {
  cursor: pointer;
  flex-shrink: 0;
}
</style>