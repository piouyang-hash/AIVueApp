import { defineStore } from 'pinia'

export const useDelayTaskStore = defineStore('delayTask', {
    state: () => ({
        isWaiting: false,    // 是否正在等待执行
        timerId: null,       // 定时器ID
        endTime: 0,          // 结束时间戳
        // 内部存储外部传入的回调（单任务，无需数组）
        taskCallback: null,
    }),

    actions: {
        /**
         * 开启通用延迟任务
         * @param {number} delayTime - 延迟时间（毫秒）
         * @param {Function} callback - 时间到后执行的回调函数
         */
        startDelayTask(delayTime, callback) {
            // 防重复开启 + 参数校验
            if (this.isWaiting) return
            if (typeof delayTime !== 'number' || delayTime <= 0) {
                console.error('❌ 延迟时间必须是正整数（毫秒）')
                return
            }
            if (typeof callback !== 'function') {
                console.error('❌ 必须传入一个回调函数')
                return
            }

            // 保存状态
            this.isWaiting = true
            this.endTime = Date.now() + delayTime
            this.taskCallback = callback

            // 开启定时器
            this.timerId = setTimeout(() => {
                try {
                    // 执行外部传入的函数！！！核心
                    this.taskCallback()
                    console.log('✅ 延迟任务执行完成')
                } catch (err) {
                    console.error('❌ 任务执行异常：', err)
                } finally {
                    // 执行完毕重置状态
                    this.resetTask()
                }
            }, delayTime)

            console.log(`⏳ 延迟任务已开启，将在 ${delayTime}ms 后执行`)
        },

        /** 手动停止任务 */
        stopTask() {
            if (this.timerId) clearTimeout(this.timerId)
            this.resetTask()
            console.log('⏹️  延迟任务已手动停止')
        },

        /** 重置所有状态 */
        resetTask() {
            this.timerId = null
            this.isWaiting = false
            this.endTime = 0
            this.taskCallback = null
        }
    }
})