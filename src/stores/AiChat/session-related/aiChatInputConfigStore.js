// 导入Pinia创建仓库的方法 + Vue响应式API
import { defineStore } from 'pinia'
import {computed, ref} from 'vue'
import {useBaseSessionStore} from "@/stores/AiChat/baseSessionStore.js";

// 创建会话仓库
export const useAiChatInputConfigStore = defineStore('aiChatInputConfig', () => {

    const baseSessionStore = useBaseSessionStore()

    const BASE_HEIGHT = 40

    // 会话输入框配置映射
    const sessionInputConfig = ref({})

    // 设置当前会话输入框
    const setCurrentSessionInput = (value = '', height = BASE_HEIGHT) => {
        // 3. ✅ 直接从会话Store里取UUID！
        const uuid = baseSessionStore.currentSessionUuid
        if (!uuid) return

        sessionInputConfig[uuid] = {
            inputValue: value,
            inputHeight: height
        }
    }

    // 重置当前会话输入框
    const resetCurrentSessionInput = () => {
        const uuid = baseSessionStore.currentSessionUuid
        if (!uuid) return

        sessionInputConfig[uuid] = {
            inputValue: '',
            inputHeight: BASE_HEIGHT
        }
        console.log(`会话${uuid} 输入框已重置`)
    }

    // 当前会话输入框配置（计算属性）
    const currentInputConfig = computed(() => {
        const uuid = baseSessionStore.currentSessionUuid
        return sessionInputConfig[uuid] || {
            inputValue: '',
            inputHeight: BASE_HEIGHT
        }
    })

    return {
        BASE_HEIGHT,
        sessionInputConfig,
        currentInputConfig,
        setCurrentSessionInput,
        resetCurrentSessionInput
    }
})