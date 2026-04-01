import { createApp } from 'vue'

import App from './App.vue'
import '@/assets/styles/theme.css' // 必须全局导入！

// 1. 引入 Element Plus 及核心样式（必须）
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 2. 引入 Vue Router 路由实例
import router from './router'
// 1. 引入SVG插件的样式（必须！）
import 'virtual:svg-icons-register';

// 2. 引入SvgIcon组件
import SvgIcon from '@/components/SvgIcon.vue';
// 3. 引入 Pinia 及持久化插件
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'


// 4. 引入 hammerjs 手势库（仅引入即可生效）
import 'hammerjs'
import gestureDirectives from './directives/gesture';

// 创建 Vue 应用实例
const app = createApp(App)

// 配置 Pinia（先创建实例，再注册持久化插件）
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.component('SvgIcon', SvgIcon); // 全局注册，任意页面可直接用<SvgIcon />
// 注册所有插件（顺序不影响核心功能）
app.use(pinia)        // 注册 Pinia
app.use(router)       // 注册路由
app.use(ElementPlus)  // 注册 Element Plus

// 注册所有手势指令
Object.keys(gestureDirectives).forEach((directiveName) => {
    app.directive(directiveName, gestureDirectives[directiveName]);
});
// 挂载应用到 #app 节点
app.mount('#app')