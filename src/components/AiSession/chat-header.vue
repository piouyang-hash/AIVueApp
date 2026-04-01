<template>
  <header class="chat-header">
    <div class="chat-header__side left">
      <!-- 第一个图标：扫描 - 绑定handleScanClick事件 -->
      <SvgIcon
          icon-class="scan"
          size="1.5rem"
          className="icon"
          color="var(--text-tertiary)"
          @click="handleScanClick"
      />
    </div>

    <div class="chat-header__main">
      <h2 class="chat-header__title">对话</h2>
    </div>

    <div class="chat-header__side right">
      <!-- 第二个图标：搜索 - 绑定handleSearchClick事件 -->
      <SvgIcon
          icon-class="search"
          size="1.5rem"
          className="icon"
          color="var(--text-tertiary)"
          @click="handleSearchClick"
      />
      <!-- 第三个图标：编辑/写 - 绑定handleWriteClick事件 -->
      <SvgIcon
          icon-class="write"
          size="1.5rem"
          className="icon"
          color="var(--text-tertiary)"
          @click="handleWriteClick"
      />
    </div>
  </header>
</template>

<script setup>
// 引入路由和接口函数
import { useRouter } from 'vue-router'
// 先导入UUID生成工具函数（根据实际路径调整）
import generateUUID from '@/utils/uuid';
import { useSessionStore } from '@/stores/sessionStore.js'
const sessionStore = useSessionStore() // 初始化新仓库
// 初始化路由实例

const router = useRouter()


// 扫描图标点击事件
const handleScanClick = () => {
  console.log('【扫描图标】被点击了，可在这里编写扫描相关逻辑');
};

// 搜索图标点击事件
const handleSearchClick = () => {
  console.log('【搜索图标】被点击了，可在这里编写对话搜索相关逻辑');
};

// 编辑/写图标点击事件（适配新 sessionStore）
const handleWriteClick = async () => {
  try {
    // 1. 生成标准UUIDv4（不变）
    const sessionUuid = generateUUID();
    console.log('生成的新会话UUID：', sessionUuid);

    // 2. ✅ 核心替换：使用新 store 的 setCurrentSessionUuid 方法
    sessionStore.setCurrentSessionUuid(sessionUuid);

    // 3. ✅ 跳转到AiChat页面，路由参数传入生成的UUID（标准规范）
    await router.push({
      name: 'AiChat',
      params: {
        sessionUuid: null
      }
    });
  } catch (error) {
    console.error('创建新会话并跳转失败：', error);
  }
};
</script>
<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  /* 确保内边距一致 */
  padding: 0 1.2rem;
  height: 4.5rem; /* 固定高度让垂直居中更稳定 */
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow-color);
  box-sizing: border-box;
  user-select: none;
}

/* 核心：让左右两侧平分剩余空间 */
.chat-header__side {
  flex: 1;
  display: flex;
  align-items: center;
}

.chat-header__side.left {
  justify-content: flex-start;
}

.chat-header__side.right {
  justify-content: flex-end;
  gap: 1.2rem; /* 图标之间的间距 */
}

/* 中间标题部分 */
.chat-header__main {
  flex: 0 0 auto; /* 宽度由内容决定 */
  display: flex;
  justify-content: center;
}

.chat-header__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap; /* 防止标题换行 */
}

.icon {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

</style>