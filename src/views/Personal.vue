<template>
  <router-view v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" v-if="route.meta.keepAlive" />
    </KeepAlive>
    <component :is="Component" v-if="!route.meta.keepAlive" />
  </router-view>

  <!-- 底部导航不动 -->
  <AppFooterNav />
</template>

<script setup>
// 1. 导入路由钩子（核心修正）
import { useRoute } from 'vue-router'
// 2. 定义路由变量
const route = useRoute()

// 你的底部导航
import AppFooterNav from "@/components/AppFooterNav.vue";
</script>

<style scoped>
</style>