<template>
  <!-- 事件选择区：根据Pinia激活的地点动态展示事件 -->
  <section class="event-section">
    <!-- 动态标题：有激活地点显示「【地点名】可执行事件」，无则显示提示 -->
    <h2 class="section-title">
      {{ locationStore.getActiveLocationName ? `【${locationStore.getActiveLocationName}】可执行事件` : '请先选择一个可前往的地点' }}
    </h2>

    <!-- 无激活地点：显示提示文案 -->
    <div v-if="!locationStore.activeLocationId" class="empty-tip">
      暂未选择地点，点击左侧地点卡片后可查看对应可执行事件～
    </div>

    <!-- 有激活地点：显示对应事件按钮列表 -->
    <div v-else class="event-btn-list">
      <button
          class="event-btn"
          v-for="event in currentLocationEvents"
          :key="event.id"
          @click="handleEventClick(event)"
      >
        {{ event.icon }} {{ event.name }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLocationStore } from '@/stores/locationStore' // 导入Pinia仓库

// 初始化Pinia仓库（自动响应状态变化）
const locationStore = useLocationStore()

// 定义所有地点对应的事件列表（按地点ID映射）
const allLocationEvents = {
  // 1: 家（原有事件）
  1: [
    { id: 1, icon: "😴", name: "睡觉" },
    { id: 2, icon: "🛋️", name: "休息" },
    { id: 3, icon: "🧹", name: "打扫房间" },
    { id: 4, icon: "📱", name: "刷手机放松" },
  ],
  // 2: 学校（新增事件）
  2: [
    { id: 5, icon: "📖", name: "上课" },
    { id: 6, icon: "✍️", name: "写作业" },
    { id: 7, icon: "🏀", name: "打篮球" },
    { id: 8, icon: "👫", name: "和同学聊天" },
  ],
  // 3: 图书馆（新增事件）
  3: [
    { id: 9, icon: "📚", name: "借阅图书" },
    { id: 10, icon: "💡", name: "自习" },
    { id: 11, icon: "🔍", name: "查找资料" },
  ],
  // 4: 餐馆（新增事件）
  4: [
    { id: 12, icon: "🍚", name: "点餐吃饭" },
    { id: 13, icon: "🍵", name: "喝饮品" },
    { id: 14, icon: "💬", name: "和朋友聚餐" },
  ]
}

// 计算属性：根据激活的地点ID动态获取对应事件列表
const currentLocationEvents = computed(() => {
  const activeId = locationStore.activeLocationId
  return activeId ? allLocationEvents[activeId] || [] : []
})

// 事件按钮点击事件（可选：打印事件信息）
const handleEventClick = (event) => {
  console.log(`在【${locationStore.getActiveLocationName}】执行事件：`, event.name, `(ID: ${event.id})`)
}
</script>

<style scoped>
/* 基础样式保留，新增空提示样式 */
.section-title {
  color: var(--text-primary);
  font-size: 18px;
  margin: 0 0 16px 0;
  padding-left: 24px;
  border-left: 4px solid var(--primary-color);
}

.event-section {
  padding: 0 24px;
}

/* 空提示样式：居中、浅灰色、柔和字体 */
.empty-tip {
  padding: 40px 24px;
  text-align: center;
  color: var(--text-placeholder, #9ca3af);
  font-size: 14px;
  background-color: var(--card-bg, #f9fafb);
  border-radius: 8px;
  margin: 0 24px;
}

.event-btn-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 0 24px;
}

.event-btn {
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.event-btn:hover {
  background-color: var(--accent-color);
  box-shadow: 0 2px 6px var(--shadow-color);
}
</style>