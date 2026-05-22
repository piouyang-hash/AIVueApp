// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {ref} from 'vue'

// 创建会话仓库
export const useAiChatConfigStore = defineStore('aiChatConfig', () => {

    const isThinkMode = ref(false)      // 全局：思考模式
    const isNetworkMode = ref(false)    // 全局：联网模式

    // 切换全局思考模式
    const toggleThinkMode = () => {
        isThinkMode.value = !isThinkMode.value
    }

    // 切换全局联网模式
    const toggleNetworkMode = () => {
        isNetworkMode.value = !isNetworkMode.value
    }

    // 暴露所有数据和方法
    return {
        // ======================================
        // 🔥 5. 功能模式开关
        // ======================================
        isThinkMode,             // 思考模式
        isNetworkMode,           // 联网模式
        toggleThinkMode,         // 切换思考模式
        toggleNetworkMode,       // 切换联网模式

    }
})