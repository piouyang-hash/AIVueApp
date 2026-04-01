<template>
  <div class="my-page">
    <slot />
  </div>
</template>

<script setup>
// 空容器，只负责渲染子路由
defineOptions({
  name: 'MyPageLayout'
})
</script>

<style scoped>
.my-page {
  min-height: 100vh;
  padding: 15px;
  background-color: var(--bg-color);
}
</style>