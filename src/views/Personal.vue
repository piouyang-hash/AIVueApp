<template>
  <!-- 🔥 根容器：全屏弹性布局，接管所有滚动 -->
  <div class="personal-layout">
    <!-- 路由容器：自动占满剩余空间，内部滚动 -->
    <div class="page-container">
      <router-view v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" v-if="route.meta.keepAlive" />
        </KeepAlive>
        <component :is="Component" v-if="!route.meta.keepAlive" />
      </router-view>
    </div>

    <!-- 底部导航：固定在底部，不参与滚动 -->
    <AppFooterNav class="footer-nav" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
import AppFooterNav from "@/components/AppFooterNav.vue";
</script>

<style scoped>
/* 🔥 根布局：占满整个屏幕，垂直弹性布局 */
.personal-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 禁止全局页面滚动 */
}

/* 🔥 页面容器：自动填充除底部栏外的所有空间，内部独立滚动 */
.page-container {
  flex: 1;
  overflow-y: auto; /* 只有这里会滚动，滚动条永远不碰到底部栏 */
}

/* 底部导航：固定高度，自动居底 */
.footer-nav {
  flex-shrink: 0;
  /* 这里写你的底部栏真实高度，和组件内一致即可 */
  height: 60px;
}
</style>