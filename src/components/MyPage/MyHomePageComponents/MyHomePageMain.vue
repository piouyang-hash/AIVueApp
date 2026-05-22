<template>
  <!-- 🔥 新增根节点外容器，包裹所有组件 -->
  <div class="my-home-container">
    <MyHomeHeader/>
    <UserProfile/>
    <FunctionButton/>
  </div>
</template>

<script setup>
import UserProfile from "@/components/MyPage/MyHomePageComponents/MyHomePageMainComponents/UserProfile.vue";
import FunctionButton from "@/components/MyPage/MyHomePageComponents/MyHomePageMainComponents/FunctionButton.vue";
import MyHomeHeader from "@/components/MyPage/MyHomePageComponents/MyHomePageMainComponents/MyHomeHeader.vue";

import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";
defineOptions({
  name: 'MyHomePageMain'
})
</script>

<style scoped>
/* 外容器样式：15px内边距 + 统一项目背景 */
.my-home-container {
  padding: 15px;
}
</style>