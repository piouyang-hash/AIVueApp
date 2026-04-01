<template>
  <div class="login-register-page"
       :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <!-- 顶部跳过区域 -->
    <div class="top-bar">
      <button class="skip-btn" @click="handleSkip">跳过</button>
    </div>

    <!-- 圆形窗户区域 -->
    <div class="window-effect"></div>

    <!-- 白色遮罩板 -->
    <div class="white-mask"></div>


    <!-- 按钮容器 -->
    <div class="button-container">
      <!-- 登录按钮：点击 + 长按 -->
      <button class="login-btn" @click="handleLogin" v-longpress="handleLongPressLogin">登录</button>
      <!-- 注册按钮：点击 + 长按 -->
      <button class="register-btn" @click="handleRegister" v-longpress="handleLongPressRegister">注册</button>
    </div>
    <ContextMenu />
  </div>
</template>

<script setup>
import bgImage from '@/static/images/FirstL.jpeg';
import { useRouter } from 'vue-router';

const router = useRouter();

// 跳过按钮点击事件：跳转到AI会话列表页
const handleSkip = () => {
  router.push({ name: 'HomeChatPage' });
  console.log('跳过按钮点击，跳转到AI会话列表页面');
};

// 登录 → 跳转到登录页（通过 name 跳转）
const handleLogin = () => {
  router.push({name: 'HomeLoginPage'}); // 对应你之前定义的登录页 name
};

// 注册 → 跳转到注册页（通过 name 跳转，假设注册页路由 name 为 HomeRegisterPage）
const handleRegister = () => {
  router.push({name: 'HomeRegisterPage'}); // 对应你新增的注册页 name
};

// 先引入 Pinia 的 modalStore（要确保路径正确）
import { useModalStore } from '@/stores/modalStore.js'
import ContextMenu from "@/components/AiSession/ContextMenu.vue";
const modalStore = useModalStore()

// 登录按钮长按（触发弹出菜单）
const handleLongPressLogin = (e) => {
  console.log('长按了登录按钮', e);
  const targetElement = e.target;
  const rect = targetElement.getBoundingClientRect();
  const left = rect.left; // 登录按钮左上角x坐标
  const top = rect.top;   // 登录按钮左上角y坐标

  // 👇 在这里试！核心：调用 Pinia 方法显示菜单
  modalStore.showContextMenu({
    left: left,  // 菜单定位到按钮左上角x
    top: top     // 菜单定位到按钮左上角y
  });

  console.log('登录按钮左上角坐标：', { left, top });
};

// 注册按钮长按（显示可视化坐标提示）
const handleLongPressRegister = (e) => {
  console.log('长按了注册按钮', e);
  const targetElement = e.target;
  const rect = targetElement.getBoundingClientRect();
  const left = rect.left;
  const top = rect.top ;

  // 显示可视化提示框
  // 👇 在这里试！核心：调用 Pinia 方法显示菜单
  modalStore.showContextMenu({
    left: left,  // 菜单定位到按钮左上角x
    top: top     // 菜单定位到按钮左上角y
  });
  console.log('注册按钮左上角坐标：', { left, top });
};
</script>

<style scoped>
.login-register-page {
  width: 100%;
  height: 100vh;
  background-color: var(--bg-color);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  user-select: none;
}

/* 顶部跳过栏 */
.top-bar {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  z-index: 10;
  position: relative;
}

.skip-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  cursor: pointer;
  padding: 8px 20px;
  transition: all 0.3s ease;
  border-radius: 20px;
  margin-top: 15px;
  z-index: 10;
  position: relative;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.skip-btn:hover {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.5);
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow:
      0 6px 16px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.skip-btn:active {
  transform: translateY(0);
  box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 圆形窗户效果 */
.window-effect {
  position: absolute;
  top: 33.33vh; /* 距离顶部1/3处 */
  left: 50%;
  transform: translate(-50%, -50%);
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background-image: inherit;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  border: 8px solid rgba(255, 255, 255, 0.9);
  box-shadow:
      0 0 40px rgba(255, 255, 255, 0.3),
      inset 0 0 40px rgba(255, 255, 255, 0.2),
      0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 2;
  overflow: hidden;
  animation: window-glow 3s ease-in-out infinite alternate;
}

/* 窗户发光动画 */
@keyframes window-glow {
  from {
    box-shadow:
        0 0 30px rgba(255, 255, 255, 0.3),
        inset 0 0 30px rgba(255, 255, 255, 0.2),
        0 8px 25px rgba(0, 0, 0, 0.25);
  }
  to {
    box-shadow:
        0 0 50px rgba(255, 255, 255, 0.4),
        inset 0 0 50px rgba(255, 255, 255, 0.3),
        0 12px 35px rgba(0, 0, 0, 0.35);
  }
}

/* 白色遮罩板 */
.white-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 30%,
      rgba(255, 255, 255, 0.85) 40%,
      rgba(255, 255, 255, 0.95) 100%
  );
  z-index: 1;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

/* 按钮容器 */
.button-container {
  position: absolute;
  bottom: 11.11vh;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
  box-sizing: border-box;
  z-index: 3;
}

/* 登录按钮 - 科技感深色主题 */
.login-btn {
  width: 100%;
  max-width: 320px;
  height: 56px;
  background: linear-gradient(145deg, #2a2e3a, #1a1e2a);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.4),
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15),
      inset 0 -4px 6px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
      135deg,
      rgba(64, 224, 208, 0.1) 0%,
      rgba(0, 191, 255, 0.15) 50%,
      rgba(138, 43, 226, 0.1) 100%
  );
  border-radius: 12px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.login-btn::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  bottom: 1px;
  background: linear-gradient(145deg, #2a2e3a, #1a1e2a);
  border-radius: 11px;
  z-index: -1;
}

.login-btn:hover {
  transform: translateY(-3px);
  box-shadow:
      0 12px 25px rgba(0, 0, 0, 0.5),
      0 6px 12px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -4px 6px rgba(0, 0, 0, 0.5);
  color: #ffffff;
}

.login-btn:hover::before {
  opacity: 1;
}

.login-btn:active {
  transform: translateY(1px);
  transition-duration: 0.1s;
  box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.3),
      0 2px 5px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 注册按钮 - 高级浅色主题 */
.register-btn {
  width: 100%;
  max-width: 320px;
  height: 56px;
  background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.95),
      rgba(245, 245, 255, 0.9)
  );
  color: #2a2e3a;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.25),
      0 4px 8px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset,
      0 2px 0 rgba(255, 255, 255, 0.2) inset;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 1;
}

.register-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.4) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.4) 100%
  );
  border-radius: 12px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.register-btn::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  bottom: 1px;
  background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.95),
      rgba(245, 245, 255, 0.9)
  );
  border-radius: 11px;
  z-index: -1;
}

.register-btn:hover {
  background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 1),
      rgba(250, 250, 255, 0.95)
  );
  border-color: rgba(255, 255, 255, 0.8);
  color: #1a1e2a;
  transform: translateY(-3px);
  box-shadow:
      0 12px 25px rgba(0, 0, 0, 0.35),
      0 6px 12px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.2) inset,
      0 2px 0 rgba(255, 255, 255, 0.3) inset;
}

.register-btn:hover::before {
  opacity: 1;
}

.register-btn:active {
  transform: translateY(1px);
  transition-duration: 0.1s;
  box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.2),
      0 2px 5px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}
</style>