// src/api/authApi.js
// 用户微服务的api（authApi.js）
import {userRequest, withAuth} from '@/utils/request'

/**
 * 用户注册（无需登录）- 底层请求封装
 * @param {Object} loginDTO - 后端要求的LoginDTO结构：{ email, password, appType }
 * @param {string} code - 邮箱验证码
 * @returns {Promise<AxiosResponse>}
 */
export async function register(loginDTO, code) {
    return userRequest({
        url: '/api/user/register',
        method: 'POST',
        data: loginDTO,        // 请求体：适配后端的LoginDTO（含appType）
        params: { code }       // 查询参数：?code=xxxx
    })
}

export async function quickLogin(loginDTO) {
    return userRequest({
        url: '/api/user/quick-login',
        method: 'POST',
        data: loginDTO
    })
}

// 新增：退出登录（需携带 token）
export async function logout() {
    return withAuth(userRequest, {
        url: '/api/user/logout', // 注意：路径要和后端 @PostMapping 一致
        method: 'POST' // Spring 的 @PostMapping 对应 POST 请求
    })
}

/**
 * 未登录状态下找回/重置密码（需邮箱验证码）
 * @param {string} email - 用户绑定的邮箱（用于定位用户）
 * @param {string} newPassword - 新密码（需符合密码格式要求）
 * @param {string} code - 邮箱验证码（绑定邮箱收到的6位验证码）
 * @returns {Promise} 接口请求Promise
 */
export async function resetPasswordApi(email, newPassword, code) {
    return userRequest({
        url: '/api/user/reset-password', // 后端接口路径（需和后端实际路由前缀一致）
        method: 'POST',
        params: { // 后端用@RequestParam接收，参数名和后端保持一致：email
            email,
            newPassword,
            code
        }
    })
}



