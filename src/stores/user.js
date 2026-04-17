import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        refreshTokenVO: null,
        // ===================== 原有代码【完全保留，不动】 =====================
        token: '',          // 原有旧token（保留，保证老接口正常）
        userId: null,
        userInfo: null,
        isLogin: false,
        rememberMe: false
    }),
    actions: {
        // ===================== 原有方法【完全保留，不动】 =====================
        login() {
            this.isLogin = true
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
            // 原有清空逻辑
            this.token = ''
            this.userId = null
            this.userInfo = null
            this.isLogin = false
            // 新增：登出时清空双Token（不影响原有功能）
            this.accessToken = ''
            this.refreshToken = ''
        },

        // ===================== 新增：2个Set方法【满足你的要求】 =====================
        setRememberMe(rememberMe) {
            this.rememberMe = rememberMe
        },
        setRefreshTokenVO(refreshTokenVO) {
            this.refreshTokenVO = refreshTokenVO
        }
    }
})