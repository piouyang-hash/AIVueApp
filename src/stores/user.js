import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        userId: null,
        userInfo: null,
        isLogin: false // 新增：标记用户是否已登录
    }),
    actions: {
        login() { // 核心：移除参数name，删除username赋值逻辑
            this.isLogin = true // 仅保留登录状态标记
        },
        setToken(token) {
            this.token = token
        },
        setUserId(id) {
            this.userId = id
        },
        setUserInfo(info) {
            this.userInfo = info
        },
        logout() {
            this.token = ''
            this.userId = null
            this.userInfo = null
            this.isLogin = false // 登出时自动标记为未登录
            // 核心：删除username清空逻辑
        }
    }
    // persist: true
})