// src/stores/PageStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePageStore = defineStore('page', () => {
    const footerNavVisible = ref(true)  // 默认显示

    const showFooterNav = () => {
        footerNavVisible.value = true
    }

    const hideFooterNav = () => {
        footerNavVisible.value = false
    }

    // 新增：外部调用，根据 meta 设置 visible
    const setFooterNavVisible = (visible) => {
        footerNavVisible.value = visible
    }

    return {
        footerNavVisible,
        showFooterNav,
        hideFooterNav,
        setFooterNavVisible
    }
})