// src/stores/locationStore.js
import { defineStore } from 'pinia'

/**
 * 地点状态管理仓库
 * 核心功能：记录当前激活的地点ID，提供激活/重置方法
 */
export const useLocationStore = defineStore('location', {
    state: () => ({
        // 当前激活的地点ID（初始为null，无默认激活项）
        activeLocationId: null
    }),
    actions: {
        /**
         * 激活指定地点
         * @param {number} locationId - 地点ID
         */
        setActiveLocation(locationId) {
            this.activeLocationId = locationId
            // 控制台打印激活状态（便于调试）
            console.log(`已激活地点ID：${locationId}`)
        },

        /**
         * 重置激活状态（可选：清空激活）
         */
        resetActiveLocation() {
            this.activeLocationId = null
            console.log('已重置地点激活状态')
        }
    },
    // 可选：计算属性（获取当前激活的地点信息）
    getters: {
        getActiveLocation: (state) => {
            return state.activeLocationId
        }
    }
})