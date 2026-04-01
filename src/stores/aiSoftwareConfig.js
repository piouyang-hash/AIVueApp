// stores/aiSoftwareConfig.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {getUserAiConfig} from "@/services/ai_chat.config.service.js";

export const useAiSoftwareConfigStore = defineStore('aiSoftwareConfig', () => {
    // --- State ---
    // 1. 智能体开关 (对应你刚才的 DaySlide 组件)
    const isAgentEnabled = ref(false)

    // 2. AI消息切分开关
    const isSplitMessageEnabled = ref(false)

    // 3. 主题设置 (可选扩展)
    const theme = ref('light') // 'light' | 'dark'

    // 4. 其他通用配置 (可自行扩展)
    const language = ref('zh-CN')

    // --- Actions ---
    // 切换智能体开关
    const toggleAgent = () => {
        isAgentEnabled.value = !isAgentEnabled.value
    }

    // 🔥 新增：切换AI消息切分开关
    const toggleSplitMessage = () => {
        isSplitMessageEnabled.value = !isSplitMessageEnabled.value
    }

    // 直接设置智能体状态
    const setAgentStatus = (status) => {
        isAgentEnabled.value = status
    }

    // 设置主题
    const setTheme = (newTheme) => {
        theme.value = newTheme
    }

    // 🔥 极简版：从后端获取配置
    const fetchAiConfig = async () => {
        const res = await getUserAiConfig()
        console.log('【后端AI配置返回结果】：', res)
        // 解析主动聊天模式（原有逻辑不变）
        isAgentEnabled.value = res?.activeChatMode !== 0
        // 🔥 新增：解析消息切分模式（和主动聊天逻辑完全对齐）
        isSplitMessageEnabled.value = res?.splitAiMessage !== 0

        console.log('解析智能体开关状态：', isAgentEnabled.value)
        console.log('解析消息切分开关状态：', isSplitMessageEnabled.value)
    }

    // 重置所有设置
    const resetConfig = () => {
        // 原有重置逻辑
        isAgentEnabled.value = false
        theme.value = 'light'
        language.value = 'zh-CN'
        // 🔥 新增：重置消息切分开关为默认关闭
        isSplitMessageEnabled.value = false
    }

    return {
        // State
        isAgentEnabled,
        isSplitMessageEnabled,
        theme,
        language,
        // Actions
        toggleAgent,
        toggleSplitMessage,
        fetchAiConfig,
        setAgentStatus,
        setTheme,
        resetConfig
    }
})