// @/stores/toastStore.js
import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
    state: () => ({
        visible: false,
        message: '',
        type: 'success', // 'success' | 'error'
        duration: 2000
    }),
    actions: {
        show(message, type = 'success', duration = 2000) {
            this.message = message
            this.type = type
            this.duration = duration
            this.visible = true

            // 自动隐藏
            setTimeout(() => {
                this.visible = false
            }, duration)
        }
    }
})




/************************** toastStore 使用说明（直接复制使用） **************************/
// 1. 导入toastStore（在需要使用的.vue文件的script中导入）
// import { useToastStore } from '@/stores/toastStore'

// 2. 实例化toastStore（在setup语法中调用）
// const toastStore = useToastStore()

// 3. 调用show方法展示提示（支持三种常用场景）
// - 成功提示（默认类型，可省略type）
// toastStore.show('操作成功！')
// - 错误提示
// toastStore.show('操作失败，请重试！', 'error')
// - 自定义时长的提示（比如5秒后消失）
// toastStore.show('提示信息', 'success', 5000)