<template>
  <div class="ai-settings-page">
    <!-- 页面头部 -->
    <header class="settings-header">
      <SvgIcon
          icon-class="back"
          size="1.4rem"
          className="header-icon back-icon"
          color="var(--text-primary)"
          @click="handleBack"
      />

      <div class="header-title-wrap">
        <h1 class="settings-title">设置</h1>
      </div>

      <SvgIcon
          icon-class="more-dot"
          size="1.4rem"
          className="header-icon more-icon"
          color="var(--text-primary)"
          @click="toggleMoreMenu"
      />

      <!-- 三点菜单弹窗（循环渲染） -->
      <div class="more-menu" v-show="showMoreMenu">
        <div
            class="menu-item"
            :class="{ danger: item.isDanger }"
            v-for="(item, index) in moreMenuList"
            :key="index"
            @click="handleMoreMenuClick(item.handleKey)"
        >
          {{ item.label }}
        </div>
      </div>
    </header>

    <!-- 主内容区域（循环渲染所有配置项） -->
    <main class="settings-content">
      <div
          class="settings-section"
          v-for="(section, sectionIndex) in settingsSections"
          :key="sectionIndex"
      >
        <h2 class="section-title">{{ section.title }}</h2>
        <div class="settings-list">
          <div
              class="setting-item"
              v-for="(item, itemIndex) in section.items"
              :key="itemIndex"
              @click="handleSettingItemClick(item.handleKey)"
          >
            <div class="item-info">
              <span class="item-label">{{ item.label }}</span>
              <span class="item-hint">{{ item.hint }}</span>
            </div>
            <SvgIcon
                icon-class="goto"
                size="1rem"
                className="goto-icon"
                color="var(--text-tertiary)"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 1. 初始化路由实例
const router = useRouter()

// 2. 响应式数据
const showMoreMenu = ref(false)

// 3. 配置化数据（核心：把重复的配置抽离成数组，便于维护）
// 三点菜单配置
const moreMenuList = [
  { label: '清除缓存', handleKey: 'clearCache', isDanger: false },
  { label: '检查更新', handleKey: 'checkUpdate', isDanger: false },
  { label: '退出登录', handleKey: 'logout', isDanger: true }
]

// 设置项分类配置（按模块拆分，可直接扩展）
const settingsSections = [
  {
    title: '聊天操作',
    items: [
      {
        label: '开启新话题',
        hint: '新建独立的AI对话会话，不关联历史记忆',
        handleKey: 'newTopic'
      },
      {
        label: '查找聊天内容',
        hint: '搜索历史对话中的关键词/内容',
        handleKey: 'searchChat'
      }
    ]
  },
  {
    title: 'AI行为设置',
    items: [
      {
        label: 'AI当前心情',
        hint: '查看当前AI的情绪状态和回复风格倾向',
        handleKey: 'viewMoodDetail'
      },
      {
        label: '主动消息提醒',
        hint: '关闭后AI将不再主动推送消息/建议',
        handleKey: 'toggleActiveMsg'
      }
    ]
  },
  {
    title: '显示设置',
    items: [
      {
        label: '字号大小',
        hint: '调整对话内容的文字大小（默认16px）',
        handleKey: 'fontSizeChange'
      }
    ]
  },
  {
    title: '安全设置',
    items: [
      {
        label: '未成年人模式',
        hint: '开启后限制敏感内容和使用时长',
        handleKey: 'toggleMinorMode'
      }
    ]
  },
  {
    title: '关于与帮助',
    items: [
      {
        label: '帮助和反馈',
        hint: '使用问题解答/意见建议提交',
        handleKey: 'helpFeedback'
      },
      {
        label: '关于萌芽',
        hint: '版本信息/团队介绍/隐私政策',
        handleKey: 'aboutSprout'
      },
      {
        label: '隐私和权限',
        hint: '管理数据授权/权限访问/内容删除',
        handleKey: 'privacyPermission'
      }
    ]
  }
]

// 4. 统一事件处理函数（消除重复的事件函数）
// 三点菜单点击处理
const handleMoreMenuClick = (handleKey) => {
  showMoreMenu.value = false // 点击后关闭菜单
  const actionMap = {
    clearCache: () => console.log('点击清除缓存'),
    checkUpdate: () => console.log('点击检查更新'),
    logout: () => console.log('点击退出登录')
  }
  // 执行对应操作（不存在的key做容错）
  actionMap[handleKey]?.()
}

// 设置项点击处理
const handleSettingItemClick = (handleKey) => {
  const actionMap = {
    newTopic: () => console.log('点击开启新话题，跳转到新建会话页面'),
    searchChat: () => console.log('点击查找聊天内容，跳转到搜索页面'),
    viewMoodDetail: () => console.log('点击查看AI心情，跳转到心情详情页面'),
    toggleActiveMsg: () => console.log('点击主动消息提醒，跳转到消息提醒设置页面'),
    fontSizeChange: () => console.log('点击字号大小，跳转到字号设置页面'),
    toggleMinorMode: () => console.log('点击未成年人模式，跳转到未成年人设置页面'),
    helpFeedback: () => console.log('点击帮助和反馈，跳转到帮助页面'),
    aboutSprout: () => console.log('点击关于萌芽，跳转到关于页面'),
    privacyPermission: () => console.log('点击隐私和权限，跳转到隐私设置页面')
  }
  // 执行对应操作（不存在的key做容错）
  actionMap[handleKey]?.()
}

// 5. 基础事件（保留原有逻辑）
const handleBack = () => {
  console.log('点击返回，返回上一页')
  router.go(-1)
}

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}
</script>

<style scoped>
/* 页面容器 */
.ai-settings-page {
  min-height: 100vh;
  background-color: var(--bg-color);
  font-size: 16px;
}
/* 核心头部样式（线条化设计） */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.2rem;
  background-color: var(--card-bg);
  /* 线条化分割：底部细边框替代模糊阴影，更具线条感 */
  border-bottom: 1px solid var(--border-color);
  /* 极简阴影：弱化阴影，突出线条 */
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
  position: sticky;
  top: 0;
  z-index: 100;
  /* 确保宽度撑满，线条完整 */
  width: 100%;
  box-sizing: border-box;
}

/* 标题容器：居中对齐，限制宽度，避免标题偏移 */
.header-title-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 防止标题挤压图标 */
  margin: 0 1rem;
}

/* 标题样式（简约精致） */
.settings-title {
  font-size: 1.15rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  /* 文字抗锯齿，更细腻 */
  -webkit-font-smoothing: antialiased;
}

/* 三点菜单弹窗（线条化重构） */
.more-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 1.2rem;
  background-color: var(--card-bg);
  /* 线条化边框：细边框替代厚重阴影 */
  border: 1px solid var(--border-color);
  border-radius: 0.6rem;
  /* 极简阴影：配合线条，增加层次感 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 160px;
  z-index: 99;
  /* 线条化内部分割 */
  overflow: hidden;
}

/* 菜单条目（线条化分割） */
.menu-item {
  padding: 0.8rem 1.2rem;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  /* 线条化hover：左侧细线条高亮 */
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}

.menu-item:hover {
  background-color: var(--bg-color);
  border-left-color: var(--primary-color);
}

/* 危险操作条目（线条化高亮） */
.menu-item.danger {
  color: var(--error-color);
}

.menu-item.danger:hover {
  border-left-color: var(--error-color);
}

/* 主内容区域（核心：加左右margin，强制留白） */
.settings-content {
  padding: 1rem;
  max-width: 800px;
  margin: 0 10px; /* 左右各留100px空白，数值越大，离边缘越远 */
  /* 注意：去掉auto，否则margin左右值会被覆盖 */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 分类标题 */
.settings-section {
  width: 100%;
}

.section-title {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 0.8rem 0;
  padding-left: 0.2rem;
}

/* 条目列表容器 */
.settings-list {
  background-color: var(--card-bg);
  border-radius: 0.8rem;
  box-shadow: 0 2px 8px var(--shadow-color);
  overflow: hidden;
}

/* 单个设置条目（核心样式） */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
}

/* 最后一个条目去掉下边框 */
.setting-item:last-child {
  border-bottom: none;
}

/* 条目hover效果 */
.setting-item:hover {
  background-color: var(--bg-color);
}

/* 条目信息区 */
.item-info {
  flex: 1;
}

.item-label {
  display: block;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.3rem;
}

.item-hint {
  font-size: 0.85rem;
  color: var(--text-tertiary);
  line-height: 1.4;
}

/* 前进箭头图标 */
.goto-icon {
  flex-shrink: 0;
}

/* 响应式适配 */
@media (max-width: 600px) {
  .settings-content {
    padding: 0.8rem;
  }

  .setting-item {
    padding: 0.9rem 1rem;
  }

  .item-label {
    font-size: 0.95rem;
  }

  .item-hint {
    font-size: 0.8rem;
  }
}
</style>