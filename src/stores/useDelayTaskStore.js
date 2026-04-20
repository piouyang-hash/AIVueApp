import { defineStore } from 'pinia'

export const useDelayTaskStore = defineStore('delayTask', {
    state: () => ({
        isWaiting: false,
        timerId: null,
        endTime: 0,
        taskCallback: null,
    }),

    actions: {
        startDelayTask(delayTime, callback) {
            // 1. 【修复坑1】强制兜底：时间<=0 → 立即执行（解决Token过期临界值问题）
            if (typeof delayTime !== 'number') {
                console.error('❌ 延迟时间必须是数字')
                return
            }
            if (typeof callback !== 'function') {
                console.error('❌ 必须传入回调函数')
                return
            }

            // 【关键】先停止旧任务，再开新任务（适配你的Token接力）
            this.stopTask()

            // 立即执行场景（时间已到/负数）
            if (delayTime <= 0) {
                console.log('⏳ 延迟时间已过期，立即执行任务')
                try {
                    callback()
                } catch (err) {
                    console.error('❌ 任务执行异常：', err)
                }
                return
            }

            // 正常延迟执行
            this.isWaiting = true
            this.endTime = Date.now() + delayTime
            this.taskCallback = callback

            this.timerId = setTimeout(() => {
                try {
                    this.taskCallback()
                    console.log('✅ 延迟任务执行完成')
                } catch (err) {
                    console.error('❌ 任务执行异常：', err)
                } finally {
                    this.resetTask()
                }
            }, delayTime)

            console.log(`⏳ 延迟任务已开启，${delayTime}ms 后执行`)
        },

        stopTask() {
            if (this.timerId) clearTimeout(this.timerId)
            this.resetTask()
            console.log('⏹️ 延迟任务已停止')
        },

        resetTask() {
            this.timerId = null
            this.isWaiting = false
            this.endTime = 0
            this.taskCallback = null
        },

        // 【修复坑3】页面卸载/登出时调用，彻底清理
        destroyTask() {
            this.stopTask()
        }
    }
})