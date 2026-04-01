<template>
  <!-- 地点选择区：完整自治，所有内容/数据内部定义 -->
  <section class="location-section">
    <h2 class="section-title">当前可前往地点</h2>
    <div class="location-card-list">
      <!-- 核心修改：绑定点击事件 + 根据激活ID动态添加active类 -->
      <div
          class="location-card"
          v-for="location in locationList"
          :key="location.id"
          @click="handleLocationClick(location)"
          :class="{ active: location.id === locationStore.activeLocationId }"
      >
        <div class="location-icon">{{ location.icon }}</div>
        <div class="location-name">{{ location.name }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useLocationStore } from '@/stores/locationStore' // 导入Pinia仓库

// 组件内部自治管理地点数据
const locationList = [
  { id: 1, icon: "🏠", name: "家" },
  { id: 2, icon: "🏫", name: "学校" },
  { id: 3, icon: "📚", name: "图书馆" },
  { id: 4, icon: "🍽️", name: "餐馆" },
];

// 初始化Pinia仓库
const locationStore = useLocationStore()

// 地点卡片点击事件处理函数
const handleLocationClick = (location) => {
  // 1. 调用Pinia的激活方法，记录当前点击的地点ID
  locationStore.setActiveLocation(location.id)

  // 2. 控制台打印地点信息（调试用）
  console.log("========== 选择地点 ==========");
  console.log("地点ID：", location.id);
  console.log("地点图标：", location.icon);
  console.log("地点名称：", location.name);
  console.log("==============================");
};
</script>

<style scoped>
/* 基础样式保留，移除hover改为active类样式 */
.section-title {
  color: var(--text-primary);
  font-size: 18px;
  margin: 0 0 16px 0;
  padding-left: 24px;
  border-left: 4px solid var(--primary-color);
}

.location-card-list {
  display: flex;
  gap: 20px;
  padding: 0 24px;
  flex-wrap: wrap;
}

.location-card {
  flex: 1;
  min-width: 120px;
  max-width: 180px;
  padding: 24px 16px;
  background-color: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--shadow-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 核心修改：移除hover，新增active激活样式 */
.location-card.active {
  background-color: var(--card-hover); /* 复用原有hover背景色，也可自定义 */
  box-shadow: 0 4px 8px var(--shadow-color);
  transform: translateY(-2px);
  border-color: var(--primary-color); /* 激活时边框高亮，区分状态 */
}

.location-icon {
  font-size: 32px;
}

.location-name {
  color: var(--text-secondary);
  font-size: 16px;
}
</style>