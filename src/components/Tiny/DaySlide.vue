<template>
  <div class="important-switch" :class="{ 'is-active': isActive }" @click="handleClick">
    <div class="switch-rail">
      <div class="switch-handle">
        <div class="handle-gloss"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 1. 在顶层接收 defineProps 的返回值
const props = defineProps({
  isActive: {
    type: Boolean,
    required: true
  },
  onToggle: {
    type: Function,
    required: true
  }
})

// 2. 通过 props 变量来调用函数
const handleClick = () => {
  props.onToggle()
}
</script>

<style scoped>
.important-switch {
  --switch-width: 46px;
  --switch-height: 24px;
  --active-color: #007aff; /* 重要选项建议用明亮的蓝色或鲜绿色 #34c759 */
  --inactive-color: #e9e9ea;

  width: var(--switch-width);
  height: var(--switch-height);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.switch-rail {
  width: 100%;
  height: 100%;
  background-color: var(--inactive-color);
  border-radius: 100px;
  position: relative;
  /* 关键：增加内阴影，营造沉入感 */
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 激活状态下的背景：高亮对比 */
.important-switch.is-active .switch-rail {
  background-color: var(--active-color);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2), 0 4px 12px rgba(0, 122, 255, 0.3); /* 外发光增加重要感 */
}

.switch-handle {
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  /* 关键：滑块要“浮起来”，使用分层阴影 */
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); /* 回弹动效，更有手感 */
}

/* 激活后的位移 */
.important-switch.is-active .switch-handle {
  transform: translateX(22px);
}

/* 交互增强：点击瞬间滑块稍微变长（拉伸效果） */
.important-switch:active .switch-handle {
  width: 24px;
}
.important-switch.is-active:active .switch-handle {
  transform: translateX(18px); /* 往回挤压一点点 */
}

/* 装饰性细节：让滑块看起来更精致 */
.handle-gloss {
  position: absolute;
  top: 20%;
  left: 20%;
  width: 30%;
  height: 30%;
  background: rgba(255, 255, 255, 0.5);
  filter: blur(2px);
  border-radius: 50%;
}
</style>