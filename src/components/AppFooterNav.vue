<template>
  <div class="app-footer-nav" v-if="pageStore.footerNavVisible">
    <!-- 列表：基于 branch=ListPage 激活 -->
    <router-link
        :to="{ name: 'ChatListPage' }"
        class="nav-item"
        :class="{ active: isListActive }"
    >
      <!-- 使用封装的 SvgIcon 组件，动态绑定激活状态属性 -->
      <SvgIcon
          :icon-class="isListActive ? 'list-active' : 'list'"
          size="1rem"
          className="nav-icon"
          :color="isListActive ? '#1890ff' : 'var(--text-tertiary)'"
      />
      <span class="nav-text">列表</span>
    </router-link>

    <!-- ====================== 核心修改 ====================== -->
    <!-- 智能体开启 → 显示 微智能（合并项） -->
    <template v-if="!configStore.isAgentEnabled">
      <router-link
          :to="{ name: 'WeAgentPage' }"
          class="nav-item"
          :class="{ active: isWeAgentActive }"
      >
        <!-- 使用你指定的图标：agent / agent-active -->
        <SvgIcon
            :icon-class="isWeAgentActive ? 'agent-active' : 'agent'"
            size="1rem"
            className="nav-icon we-agent-icon"
            :color="isWeAgentActive ? '#1890ff' : 'var(--text-tertiary)'"
        />
        <span class="nav-text">微智能</span>
      </router-link>
    </template>

    <!-- 智能体关闭 → 显示原来的 模拟游戏 + 消息 -->
    <template v-else>
      <!-- 通讯 -->
      <router-link
          :to="{ name: 'ContactPage' }"
          class="nav-item"
          :class="{ active: isContactActive }"
      >
        <SvgIcon
            :icon-class="isContactActive ? 'contact-active' : 'contact'"
            size="1rem"
            className="nav-icon"
            :color="isContactActive ? '#1890ff' : 'var(--text-tertiary)'"
        />
        <span class="nav-text">通讯</span>
      </router-link>

      <!-- 消息 -->
      <router-link
          :to="{ name: 'MessagePage' }"
          class="nav-item"
          :class="{ active: isMessageActive }"
      >
        <SvgIcon
            :icon-class="isMessageActive ? 'message-active' : 'message'"
            size="1rem"
            className="nav-icon"
            :color="isMessageActive ? '#1890ff' : 'var(--text-tertiary)'"
        />
        <span class="nav-text">消息</span>
      </router-link>
    </template>
    <!-- ======================================================= -->

    <!-- 个人：基于 branch=MyHomePageMain 激活，保留头像逻辑 -->
    <router-link
        :to="{ name: 'MyHomePageMain' }"
        class="nav-item"
        :class="{ active: isMyPageActive }"
    >
      <div class="nav-icon-wrapper">
        <!-- 有头像：显示头像（无文字），保留原有逻辑 -->
        <img
            v-if="userAvatar"
            :src="userAvatar"
            alt="个人头像"
            class="avatar-icon"
            @error="handleAvatarError(isMyPageActive)"
        />
        <!-- 无头像：使用 SvgIcon 组件，动态绑定激活状态 -->
        <SvgIcon
            v-else
            :icon-class="isMyPageActive ? 'profile-active' : 'profile'"
            size="1rem"
            className="nav-icon"
            :color="isMyPageActive ? '#1890ff' : 'var(--text-tertiary)'"
        />
      </div>
      <!-- 无头像时才显示文字 -->
      <span class="nav-text" v-if="!userAvatar">个人</span>
    </router-link>
  </div>
</template>

<script setup>
// ========== 依赖引入（与原组件一致） ==========
import { useUserStore } from '@/stores/user';
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from "vue";
import { SERVICE_URLS } from "@/api/constants/serviceUrls.js";
import { usePageStore } from '@/stores/PageStore'
import { useAiSoftwareConfigStore } from '@/stores/aiSoftwareConfig'

// 引入配置
const configStore = useAiSoftwareConfigStore()
// ========== 实例化核心对象 ==========
const pageStore = usePageStore()
const router = useRouter()
const userStore = useUserStore(); // Pinia用户仓库
const fallbackAvatar = ref(''); // 头像加载失败的降级图标
const route = useRoute() // 当前路由

// ========== 头像逻辑（与原组件一致） ==========
// 拼接头像完整地址（Pinia有头像则使用，无则为false）
const userAvatar = computed(() => {
  const avatarUrl = userStore.userInfo?.avatarUrl;
  // 确保avatarUrl存在且不为空字符串
  if (avatarUrl && avatarUrl.trim()) {
    // 拼接完整地址：USER_SERVICE + 头像相对路径
    return `${SERVICE_URLS.USER_SERVICE}${avatarUrl}`;
  }
  return false;
});

// 头像加载失败时降级为默认图标
const handleAvatarError = (isActive) => {
  fallbackAvatar.value = isActive ? profileActiveIcon : profileIcon;
};

// ========== 导航激活状态判断（基于route.meta.branch） ==========
// 列表激活：匹配 branch=ListPage
const isListActive = computed(() => {
  return route.meta.branch === 'ChatListPage'
})

const isWeAgentActive = computed(() => {
  return route.meta.branch === 'WeAgentPage'
})

// 最终定档：通讯页面激活
const isContactActive = computed(() => {
  return route.meta.branch === 'ContactPage'
})

// 消息激活：匹配 branch=MessagePage
const isMessageActive = computed(() => {
  return route.meta.branch === 'MessagePage'
})

// 个人激活：匹配 branch=MyPage
const isMyPageActive = computed(() => {
  return route.meta.branch === 'MyPage'
})
</script>

<style scoped>
/* ========== 底部导航核心样式（与原组件一致） ========== */
.app-footer-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--card-bg);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--border-color);
  z-index: 100;
  transition: background-color 0.3s ease, border-color 0.3s ease;
  user-select: none;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: 12px;
  flex: 1;
  height: 100%;
  transition: color 0.2s ease;
}

/* 激活状态样式：文字+图标高亮 */
.nav-item.active {
  color: var(--primary-color);
}

/* 头像激活态样式 */
.nav-item.active .avatar-icon {
  border-color: var(--primary-color);
  box-shadow: 0 2px 10px rgba(73, 80, 87, 0.15);
}

/* 普通图标样式 */
.nav-icon {
  width: 20px;
  height: 20px;
  /* 核心修复：给图标一个固定的容器感 */
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 建议给一个统一的最小高度，比如 32px，确保无论图标多大，文字开头都对齐 */
  min-height: 32px;
}

/* 单独放大：微智能底部导航图标（完全照搬你的写法） */
.we-agent-icon {
  width: 28px !important;
  height: 28px !important;
}

/* 头像样式：圆形、适配导航高度 */
.avatar-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%; /* 圆形头像 */
  object-fit: cover; /* 填充不拉伸 */
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.nav-text {
  margin-top: 2px;
  font-size: 12px;
}
</style>