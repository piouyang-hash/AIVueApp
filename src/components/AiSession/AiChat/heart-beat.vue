<template>
  <div
      class="heart-container"
      :style="containerStyles"
      title="定时触发心跳"
  >
    <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        class="heart-svg"
        :class="{ 'is-animating': isAnimating }"
    >
      <defs>
        <path
            id="heart-path"
            d="M50 88.9 C 24.7 73.6 5 56.6 5 35.5 C 5 18.6 18.2 5 35 5 C 44.5 5 50 10 50 10 C 50 10 55.5 5 65 5 C 81.8 5 95 18.6 95 35.5 C 95 56.6 75.3 73.6 50 88.9 Z"
        />

        <filter id="vein-noise" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
              type="fractalNoise"
              baseFrequency="0.12"
              numOctaves="2"
              result="noise"
          />
          <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 6 -3"
              in="noise"
              result="veins"
          />
          <feComposite operator="in" in="veins" in2="SourceGraphic" />
        </filter>

        <radialGradient id="blood-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" :stop-color="bloodColorStart" />
          <stop offset="100%" :stop-color="bloodColorEnd" />
        </radialGradient>

        <mask id="spread-mask">
          <rect x="0" y="0" width="100" height="100" fill="black" />
          <circle cx="50" cy="40" r="0" fill="white" class="mask-circle" />
        </mask>
      </defs>

      <use
          href="#heart-path"
          fill="#f0f0f0"
      />

      <g
          class="vein-layer"
          mask="url(#spread-mask)"
      >
        <use
            href="#heart-path"
            fill="url(#blood-gradient)"
            filter="url(#vein-noise)"
            style="opacity: 0.9;"
        />
        <use
            href="#heart-path"
            fill="url(#blood-gradient)"
            style="opacity: 0.3; mix-blend-mode: multiply;"
        />
      </g>

      <use
          href="#heart-path"
          fill="none"
          stroke="#e5e5e5"
          stroke-width="1.5"
      />
    </svg>
  </div>
</template>

<script setup>
import {ref, computed, onBeforeUnmount, watch, nextTick} from 'vue';
import {useHeartbeatStore} from '@/stores/heartbeatStore';
import {useUserStore} from '@/stores/user'; // 导入用户Store监听登录状态

// --- Props 定义 ---
const props = defineProps({
  size: {type: [Number, String], default: 30},
  bloodColorStart: {type: String, default: '#54a828'},
  bloodColorEnd: {type: String, default: '#ff0000'},
  autoPlay: {type: Boolean, default: true} // 仅控制“登录后是否自动动画”
});

// --- 初始化Store ---
const heartbeatStore = useHeartbeatStore();
const userStore = useUserStore();

// --- 状态管理（仅动画开关） ---
const isAnimating = ref(false);

// --- 计算属性（全透传Store） ---
const containerStyles = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  cursor: userStore.isLogin ? 'pointer' : 'default' // 未登录时禁用点击
}));
const formattedCountdown = computed(() => heartbeatStore.formattedCountdown);
const canHeartbeat = computed(() => heartbeatStore.canHeartbeat); // 是否允许心跳

// --- 动画逻辑（仅在允许心跳时生效） ---
const triggerAnimation = () => {
  if (!canHeartbeat.value) return; // 未登录/WS未连，不触发动画

  if (isAnimating.value) {
    isAnimating.value = false;
    nextTick(() => {
      void document.querySelector('.heart-container')?.offsetWidth;
      isAnimating.value = true;
    });
  } else {
    isAnimating.value = true;
  }

  heartbeatStore.triggerManualBeat(); // 仅允许心跳时调用
};

// --- 监听倒计时：到0自动触发动画（仅允许心跳时） ---
watch(
    () => heartbeatStore.countdownSeconds,
    (val) => {
      if (val === 0 && canHeartbeat.value && props.autoPlay) {
        triggerAnimation();
      }
    }
);

// --- 监听登录状态变化：未登录时重置动画 ---
watch(
    () => userStore.isLogin,
    (isLogin) => {
      if (!isLogin) {
        isAnimating.value = false; // 登出后停止动画
      }
    }
);

// --- 生命周期：仅清除动画状态 ---
onBeforeUnmount(() => {
  isAnimating.value = false;
});
</script>

<style scoped>
.heart-container {
  display: inline-block;
  position: relative;
  /* 禁止文本选中 */
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.heart-svg {
  width: 100%;
  height: 100%;
  overflow: visible; /* 允许微弱的缩放溢出 */
  transform-origin: center center;
}

/* 动画编排
  总时长：2s
  阶段1：0s - 1.2s (0% - 60%) -> 血丝扩散
  阶段2：1.2s - 1.5s (60% - 75%) -> 心脏颤动
  阶段3：1.5s - 2.0s (75% - 100%) -> 血丝消退
*/

/* 1. 遮罩扩散动画 */
.is-animating .mask-circle {
  animation: spread-anim 2s linear forwards;
}

/* 2. 心脏本体颤动动画 */
.is-animating {
  animation: heartbeat-anim 2s linear forwards;
}

/* 3. 血丝层透明度重置动画 */
.is-animating .vein-layer {
  animation: fade-anim 2s linear forwards;
}

/* --- Keyframes --- */

@keyframes spread-anim {
  0% { r: 0; }
  60% { r: 60; } /* 1.2s 到达最大半径覆盖整个心脏 */
  100% { r: 60; } /* 保持直到结束 */
}

@keyframes heartbeat-anim {
  0%, 60% {
    transform: scale(1) rotate(0deg);
  }
  65% {
    /* 模拟收缩 */
    transform: scale(0.95) rotate(-3deg);
  }
  70% {
    /* 模拟舒张，带一点过冲 */
    transform: scale(1.1) rotate(3deg);
  }
  75% {
    /* 恢复 */
    transform: scale(1) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes fade-anim {
  0%, 75% { opacity: 1; }
  100% { opacity: 0; } /* 最后 0.5s 渐隐 */
}
</style>