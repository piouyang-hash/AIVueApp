// src/stores/PageStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePageStore = defineStore('page', () => {
    // ==================== 原有逻辑（底部导航显示隐藏）====================
    const footerNavVisible = ref(true)  // 默认显示

    const showFooterNav = () => {
        footerNavVisible.value = true
    }

    const hideFooterNav = () => {
        footerNavVisible.value = false
    }

    const setFooterNavVisible = (visible) => {
        footerNavVisible.value = visible
    }

    // ==================== 🔥 新增：导航栏页面历史记录 ====================
    /**
     * 数据结构：键值对对象
     * key: 导航主页面标识（路由meta.branch，如 ContactPage、BookStorePage）
     * value: 该主页面下最后访问的子页面/详情页路由（path 或 name）
     * 示例：{ ContactPage: '/personal/contact/agent-store', BookStorePage: '/book/123' }
     */
    const navLastPage = ref({})

    /**
     * 🔥 核心 set 方法：每次路由跳转时调用
     * @param {string} branch - 导航主页面标识（必须传路由meta.branch）
     * @param {string} routePath - 最后访问的页面路由（fullPath / path / name 都可以）
     */
    const setNavLastPage = (branch, routePath) => {
        // 非空校验，避免无效数据
        if (!branch || !routePath) return
        // 覆盖更新：同一个主页面，只保留最后一次访问的页面
        navLastPage.value[branch] = routePath
    }

    /**
     * 配套 get 方法：获取指定主页面的最后访问页面
     * @param {string} branch - 导航主页面标识
     * @param {string} defaultPath - 兜底默认路由（无记录时返回）
     * @returns {string} 最后访问的路由
     */
    const getNavLastPage = (branch, defaultPath = '/') => {
        return navLastPage.value[branch] || defaultPath
    }

    // 统一返回，外部可调用
    return {
        // 原有
        footerNavVisible,
        showFooterNav,
        hideFooterNav,
        setFooterNavVisible,
        // 新增
        navLastPage,
        setNavLastPage,
        getNavLastPage
    }
})