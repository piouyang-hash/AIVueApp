<template>
  <header class="game-header">
    <div class="status-container">
      <div class="status-bar">
        <div
            class="status-circle-item"
            v-for="status in statusList"
            :key="status.id"
            :style="{
            '--progress-percent': status.percent + '%',
            '--progress-gradient': status.gradient
          }"
            @click="handleCircleClick($event, status.name, status.desc)"
        >
        <div class="progress-circle-bg"></div>
        <SvgIcon
            :icon-class="status.iconClass"
            size="1.2rem"
            class="status-icon"
            color="var(--gray-700)"
        />
      </div>
    </div>
    </div>

    <!-- 注册气泡组件（暂不调用，仅注册）：后续需调用时取消注释 -->
    <StatusDetailPopup />
  </header>
</template>

<script setup>
import { useModalStore } from '@/stores/modalStore'
import StatusDetailPopup from "@/components/Tiny/StatusDetailPopup.vue";
const modalStore = useModalStore()


// 定义状态列表：补充name和desc字段（用于气泡显示）
const statusList = [
  {
    id: 1,
    iconClass: "life-point",
    percent: 75,
    gradient: "linear-gradient(180deg, #f5e0e0, #e03131)",
    name: "体力",
    desc: "体力代表角色的身体活力，可通过睡觉、休息恢复，进行跑步、搬东西等活动会消耗体力。"
  },
  {
    id: 2,
    iconClass: "hungry-point",
    percent: 40,
    gradient: "linear-gradient(180deg, #f9f2d6, #f59f00)",
    name: "饱腹",
    desc: "饱腹度代表角色的饥饿状态，可通过吃饭、吃零食恢复，长时间不进食会降低饱腹度，影响心情和体力。"
  },
  {
    id: 3,
    iconClass: "mood-point",
    percent: 88,
    gradient: "linear-gradient(180deg, #d1e8c2, #37b24d)",
    name: "心情",
    desc: "心情代表角色的情绪状态，可通过散步、刷手机、和朋友聊天提升，负面事件会降低心情值。"
  }
];

// 头部自治：自主获取鼠标点击位置，直接调用Pinia显示方法
const handleCircleClick = (e, propName, propDesc) => {
  // 精准获取鼠标点击的坐标（clientX/Y是鼠标相对于视口的精准位置）
  const clickPosition = {
    x: e.clientX,
    y: e.clientY
  }
  // 直接调用Pinia方法，传入「文字+坐标」，头部到此为止，后续交给Pinia+气泡
  modalStore.showStatusDetailPopup(propName, propDesc, clickPosition)
};
</script>

<style scoped>
.game-header {
  padding: 8px 8px;
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow-color);
  margin-bottom: 32px;
  position: relative;
  min-height: 80px;
  box-sizing: border-box;
}

.status-container {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  padding-top: 16px;
}

.status-bar {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.status-circle-item {
  --progress-percent: 0%;
  --progress-gradient: linear-gradient(180deg, #eee, #666);
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--gray-100);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 6px var(--shadow-color), inset 0 1px 1px rgba(255,255,255,0.8);
  cursor: pointer; /* 点击指针，提示可点击 */
}

.progress-circle-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--progress-percent);
  background: var(--progress-gradient);
  transition: height 0.3s ease-in-out;
  z-index: 1;
}

.status-icon {
  position: relative;
  z-index: 2;
  display: inline-block;
  height: 1.2rem;
  width: 1.2rem;
}
</style>