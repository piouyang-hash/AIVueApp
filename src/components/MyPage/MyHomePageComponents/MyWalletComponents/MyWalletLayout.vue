<template>
  <MyPageLayout>
    <div class="my-wallet-page">
      <!-- 父组件容器（贴合灰度体系） -->
      <div class="page-container">
        <!--：渲染MyMessage/ChatPage子组件 -->
        <slot/>
      </div>
    </div>
  </MyPageLayout>
</template>

<script setup>
import MyPageLayout from "@/components/MyPage/MyPageLayout.vue";
</script>

<style scoped>

</style>