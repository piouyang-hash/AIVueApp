<template>
  <div class="life-sim-game">
    <SimGameHeader />
    <!-- 核心区域：直接调用两个自治组件，无需传参 -->
    <main class="game-main">
      <LocationSection />
      <EventSection />
    </main>

    <!-- 底部提示区 -->
    <footer class="game-footer">
      <p class="tips-text">💡 提示：选择地点后，可执行对应生活事件，提升自身属性哦～</p>
    </footer>
  </div>
</template>

<script setup>
// 仅导入头部组件 + 两个新的自治组件，无任何业务数据定义
import SimGameHeader from "@/components/Game/GameComponents/SimGameHeader.vue";
import LocationSection from "@/components/Game/GameComponents/LocationSection.vue";
import EventSection from "@/components/Game/GameComponents/EventSection.vue";
</script>

<style scoped>
/* 主页面仅保留**全局容器、核心区域、底部**的样式，组件样式由自身管理 */
/* 全局容器样式，贴合CSS变量的背景色 */
.life-sim-game {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
  background-color: var(--bg-color);
  min-height: 100vh;
  box-sizing: border-box;
}

/* 核心区域：仅控制两个组件的间距，布局由组件自身决定 */
.game-main {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 底部提示区 */
.game-footer {
  margin-top: 48px;
  padding: 16px 24px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.tips-text {
  color: var(--text-tertiary);
  font-size: 14px;
  margin: 0;
  text-align: center;
}
</style>