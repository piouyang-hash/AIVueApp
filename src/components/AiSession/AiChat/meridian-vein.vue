<template>
  <!-- 核心：添加Vue原生transition组件实现淡入淡出 -->
  <transition
      name="meridian-fade"
      :duration="fadeDuration"
      appear
  >
    <!-- 【新增】绑定整体点击事件 → 跳转到AiSettings路由 -->
    <div
        class="meridian-container"
        :style="containerStyle"
        :class="statusClass"
        @click="goToAiSettings"
    style="cursor: pointer"
    >
    <svg
        class="meridian-svg"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="`grad-${uid}`" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" :stop-color="fillColorStart" />
          <stop offset="100%" :stop-color="fillColorEnd" />
        </linearGradient>

        <clipPath :id="`clip-${uid}`">
          <rect
              x="0"
              :y="1024 - clampedFillHeight"
              width="1024"
              :height="clampedFillHeight"
              class="fill-mask-rect"
          />
        </clipPath>
      </defs>

      <path
          :d="pathData"
          fill="#666666"
          class="base-path"
      />

      <path
          :d="pathData"
          :fill="`url(#grad-${uid})`"
          :clip-path="`url(#clip-${uid})`"
          class="fill-path"
      />
    </svg>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
// 引入Vue Router的useRouter钩子
import { useRouter } from 'vue-router';

// 创建router实例
const router = useRouter();

// 【新增】定义跳转方法 → 通过路由name跳转到AiSettings
const goToAiSettings = () => {
  // 核心：使用路由name跳转（匹配你配置的name: 'AiSettings'）
  router.push({ name: 'AiSettings' })
};

// --- Props 定义 ---
const props = defineProps({
  // 宽度（移除默认值，强制手动传递）
  width: {
    type: [Number, String],
    required: true // 新增：标记为必传，未传递时控制台会报错提示
  },
  // 高度（移除默认值，强制手动传递）
  height: {
    type: [Number, String],
    required: true // 新增：标记为必传
  },
  // 核心驱动数值 0-100
  fillValue: { type: Number, default: 50 },
  // 颜色配置
  fillColorStart: { type: String, default: '#00f34a' },
  fillColorEnd: { type: String, default: '#44fa03' },
  // 动画时长配置 (ms)
  flashDuration: { type: Number, default: 500 },
  fadeDuration: { type: Number, default: 800 },
  resetAfterFade: { type: Boolean, default: true }
});

const emit = defineEmits(['animation-complete']);

// --- 内部状态管理 ---
// 生成唯一ID，解决多组件同屏时 ID 冲突问题
const uid = Math.random().toString(36).substr(2, 9);
// 动画状态机: 'idle' | 'flashing' | 'fading'
const animationStatus = ref('idle');
// 经脉路径数据 (提取自 SVG)
const pathData = "M837.46133333 301.056c-3.39057778-24.71253333-6.91768889-43.89546667-10.0352-60.80284445-5.33617778-29.00195555-9.94417778-54.04444445-12.52693333-98.37226666-5.64337778-96.73386667-17.62417778-130.9696-47.43395555-135.63448889-14.77973333-2.34382222-22.51662222 5.14275555-41.21031112 23.32444445-26.14613333 25.37244445-74.80888889 72.6016-132.80142222 99.31662222-51.72337778 23.83644445-76.03768889 32.03982222-99.55555556 39.99288888-22.56213333 7.62311111-43.86133333 14.81386667-84.6848 34.08782223-125.45137778 59.25546667-165.81973333 105.15342222-185.2871111 134.53084444-17.94275555 27.14737778-32.31288889 61.49688889-41.56302223 99.37351111-36.40888889 149.0944-5.39306667 384.59164445 123.73333333 451.62951112-6.59911111 39.82222222-10.99093333 75.19573333-12.8455111 101.6832-1.01262222 14.55217778 9.96693333 27.18151111 24.5191111 28.19413333 0.62577778 0.05688889 1.25155555 0.06826667 1.86595556 0.06826667 13.75573333 0 25.36106667-10.6496 26.33955556-24.576 1.7408-25.04248889 5.70026667-56.32 11.28675555-90.55573334 4.72177778 0.35271111 9.55733333 0.58026667 14.55217778 0.58026667 105.25582222 0 265.87591111-75.68497778 273.78346667-79.45102223 52.41742222-24.94008889 90.20302222-46.00035555 135.95306666-109.056 52.18986667-71.8848 77.17546667-149.2992 74.26275556-230.11555555-2.1504-60.09742222-10.49031111-126.85084445-18.35235556-184.2176z m-98.66808888 383.30595555c-39.27608889 54.13546667-69.632 70.3488-115.89404445 92.3648-86.34595555 41.03964445-196.69902222 76.93653333-256.25031111 74.46755556 11.264-57.38951111 26.2144-118.84088889 43.49724444-173.29493333 68.61937778-5.59786667 188.416-48.85617778 214.6304-58.5728 13.68746667-5.07448889 20.66204445-20.26382222 15.58755556-33.95128889-5.07448889-13.67608889-20.30933333-20.66204445-33.95128889-15.58755556-48.71964445 18.04515555-126.37297778 43.15591111-176.68551111 52.40604445 9.67111111-24.71253333 19.78595555-46.52373333 30.16248889-63.71555556 4.90382222-8.12373333 9.56871111-15.39413333 14.34737777-22.60764444 33.16622222-0.28444445 87.7568-28.54684445 192.0568889-113.72088889 11.29813333-9.23875555 12.98204445-25.88444445 3.75466666-37.19395556-9.23875555-11.28675555-25.87306667-12.98204445-37.1712-3.75466666-46.1824 37.71733333-79.38275555 61.36035555-103.2192 76.288 51.04071111-69.07448889 106.87146667-135.86204445 166.95751111-198.97457778 10.05795555-10.55857778 9.64835555-27.28391111-0.91022222-37.34186667-10.56995555-10.05795555-27.29528889-9.68248889-37.36462222 0.91022223-64.78506667 68.01635555-124.65493333 140.29937778-179.14311111 215.06275555-0.56888889-40.84622222-2.08213333-84.5824-4.608-132.7104-0.76231111-14.56355555-13.22097778-25.38382222-27.77315556-25.00835555-14.56355555 0.77368889-25.77066667 13.19822222-24.99697778 27.76177777 3.25404445 62.16817778 4.84693333 116.86115555 4.8128 167.86773333 0 9.728 0.05688889 20.87822222 3.7888 31.27751112-5.19964445 7.85066667-10.36515555 15.88337778-15.75822222 24.81493333-13.78986667 22.8352-26.65813333 51.37066667-38.55928889 82.93262222-18.80746667-22.6304-42.30257778-76.32213333-56.32-132.66488889-3.50435555-14.15395555-17.80622222-22.78968889-32.00568889-19.26257778-14.15395555 3.50435555-22.77831111 17.84035555-19.27395555 31.99431112 8.71537778 35.13457778 38.35448889 139.0592 89.2928 173.03324444-16.75946667 53.48693333-30.78826667 111.62737778-41.52888889 165.80835556-91.22702222-64.67128889-111.74115555-263.9872-82.5344-383.61315556 7.81653333-32.00568889 19.68355555-60.63217778 34.304-82.7392 9.19324445-13.86951111 37.15982222-56.09244445 163.78311111-115.90542222 38.07004445-17.97688889 57.04817778-24.39395555 79.03004445-31.82364444 23.66577778-7.97582222 50.49457778-17.04391111 104.7552-42.05226667 59.97226667-27.62524445 110.66026667-73.94417778 139.29813333-101.46702223 2.53724445 13.824 5.30204445 35.60106667 7.28177777 69.5296 2.77617778 47.616 7.89617778 75.42328889 13.312 104.86897778 3.15164445 17.16906667 6.42844445 34.9184 9.64835556 58.43626667 7.70275555 56.05831111 15.83786667 121.16195555 17.90862222 178.92693333 2.4576 69.72302222-18.54577778 134.22364445-64.26168888 197.21102222z";

// --- 计算属性 ---
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  // 注入 CSS 变量以控制动画时长
  '--flash-duration': `${props.flashDuration}ms`,
  '--fade-duration': `${props.fadeDuration}ms`
}));

const statusClass = computed(() => ({
  'is-flashing': animationStatus.value === 'flashing',
  'is-fading': animationStatus.value === 'fading'
}));

// 计算裁切矩形的高度 (对应 SVG viewBox 高度 1024)
// 当褪色时，我们需要强制保持满填充状态，直到褪色结束
const clampedFillHeight = computed(() => {
  if (animationStatus.value === 'fading' || animationStatus.value === 'flashing') {
    return 1024; // 动画期间强制满格
  }
  const val = Math.max(0, Math.min(100, props.fillValue));
  return (val / 100) * 1024;
});

// --- 逻辑处理 ---
const triggerCompleteAnimation = () => {
  // 防止重复触发
  if (animationStatus.value !== 'idle') return;

  // 1. 开始闪烁
  animationStatus.value = 'flashing';

  // 2. 闪烁结束后 -> 褪色
  setTimeout(() => {
    animationStatus.value = 'fading';

    // 3. 褪色结束后 -> 重置
    setTimeout(() => {
      animationStatus.value = 'idle';
      if (props.resetAfterFade) {
        emit('animation-complete'); // 通知父组件重置
      }
    }, props.fadeDuration);

  }, props.flashDuration);
};

// 监听 fillValue 变化
watch(
    () => props.fillValue,
    (newVal) => {
      if (newVal >= 100) {
        triggerCompleteAnimation();
      }
    },
    { immediate: true }
);
</script>

<style scoped>
/* 核心：淡入淡出动画样式（对应transition的name="meridian-fade"） */
.meridian-fade-enter-from,
.meridian-fade-leave-to {
  opacity: 0; /* 进入前/离开后：完全透明 */
}

.meridian-fade-enter-active,
.meridian-fade-leave-active {
  /* 过渡动画：仅针对opacity，时长绑定CSS变量，缓动函数ease更自然 */
  transition: opacity var(--fade-duration) ease;
}

.meridian-fade-enter-to,
.meridian-fade-leave-from {
  opacity: 1; /* 进入后/离开前：完全不透明 */
}

.meridian-container {
  display: inline-block;
  position: relative;
  /* 允许鼠标事件 */
  pointer-events: auto;
}

.meridian-svg {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* 优化 SVG 渲染质量 */
  shape-rendering: geometricPrecision;
}

.base-path {
  stroke: none; /* 明确无描边，只用填充 */
}

.fill-path {
  /* 默认无事件响应，透传给底层 */
  pointer-events: none;
}

/* --- 核心动画：水位平滑升降 --- */
.fill-mask-rect {
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* --- 状态 1: 闪烁 (Flashing) --- */
.meridian-container.is-flashing .meridian-svg {
  animation: flash-anim var(--flash-duration) ease-in-out forwards;
}

/* --- 状态 2: 褪色 (Fading) --- */
.meridian-container.is-fading .fill-path {
  animation: fade-out-anim var(--fade-duration) ease-out forwards;
}

/* --- Keyframes --- */
@keyframes flash-anim {
  0%, 100% {
    filter: drop-shadow(0 0 0px rgba(52, 199, 89, 0));
    transform: scale(1);
  }
  20%, 60% {
    filter: drop-shadow(0 0 8px rgba(52, 199, 89, 0.8));
    transform: scale(1.05);
  }
  40%, 80% {
    filter: drop-shadow(0 0 2px rgba(52, 199, 89, 0.3));
    transform: scale(0.98);
  }
}

@keyframes fade-out-anim {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>