// src/api/authApi.js
// 用户微服务的api（authApi.js）
import {userRequest, withAuth} from '@/utils/request'

// 用户信息更新（加token）
export async function updateUserProfile(formData) {
    return withAuth(userRequest, { // 用withAuth包装，自动加token
        url: '/user-profile/api/update',
        method: 'POST',
        data: formData
    })
}

/**
 * 获取当前登录用户的资料
 * 自动从token中获取用户信息，无需参数
 */
export async function getCurrentUserProfile() {
    return withAuth(userRequest, {
        url: '/user-profile/api/profile',
        method: 'GET',
    });
}

export async function submitUserFeedback(feedbackForm) {
    return withAuth(userRequest, { // 用userRequest（用户模块请求实例）+ withAuth自动加token
        url: '/user-api/feedback/submit', // 对应后端控制器的接口路径
        method: 'POST',
        data: feedbackForm // 前端表单数据直接传，无需额外处理
    })
}

/**
 * 修改当前登录用户密码（登录态）
 * @param {Object} passwordForm - 修改密码表单参数
 * @param {string} passwordForm.oldPassword - 原密码（明文，用于身份验证）
 * @param {string} passwordForm.newPassword - 新密码（明文，需≥6位）
 * @returns {Promise} 接口请求Promise，成功返回{code:200, msg:"密码更新成功"}
 * 注意：
 * 1. 接口自动携带JWT Token（withAuth封装）
 * 2. 接口30秒内最多调用5次，前端无需额外处理限流
 * 3. 密码复杂度由后端校验，前端可前置做≥6位的简单校验
 */
export async function changePassword(passwordForm) {
    return withAuth(userRequest, { // 复用userRequest实例 + withAuth自动注入token
        url: '/api/user/change-password', // 对应后端@PostMapping("/change-password")，前缀和反馈接口保持一致
        method: 'POST',
        data: passwordForm // 表单数据直接传（结构：{oldPassword: "", newPassword: ""}）
    })
}

/**
 * 修改当前登录用户邮箱（登录态）
 * @param {string} email - 新QQ邮箱地址（需符合QQ邮箱格式，如123456@qq.com、abc@foxmail.com）
 * @param {string} code - 新邮箱收到的验证码（必填，用于验证新邮箱归属）
 * @returns {Promise} 接口请求Promise，成功返回{code:200, msg:"邮箱更新成功"}
 * 注意：
 * 1. 接口自动携带JWT Token（withAuth封装）
 * 2. 接口30秒内最多调用5次，前端无需额外处理限流
 * 3. 邮箱格式（仅支持QQ邮箱体系）由后端校验，前端可前置做QQ邮箱格式校验
 * 4. 需先完成原邮箱验证码验证，再调用该接口（防止未验证直接修改）
 */
export async function changeEmailApi(email, code) {
    return withAuth(userRequest, {
        url: '/api/user/change-email',
        method: 'POST',
        params: { email, code } // 核心修改：data → params，参数拼到URL上
        // 若后端是@RequestParam（URL参数），可替换为：params: { email, code }
    })
}

/**
 * 注销用户账号（需登录，且通常只能注销自己）
 * @param {number} userId - 要注销的用户ID
 * @returns {Promise<AxiosResponse>}
 */
export async function cancelAccount(userId) {
    return withAuth(userRequest, {
        url: `/api/user/${userId}/cancel`,
        method: 'DELETE'
    })
}

/**
 * 查询当前登录用户的脱敏邮箱（登录态）
 * @returns {Promise} 接口请求Promise，成功返回{code:200, msg:"查询脱敏邮箱成功", data:"123****@qq.com"}
 * 注意：
 * 1. 接口自动携带JWT Token（withAuth封装）
 * 2. 接口30秒内最多调用5次，前端无需额外处理限流
 * 3. 返回的data为脱敏邮箱字符串，无邮箱/非法邮箱返回空字符串
 */
export async function getUserDesensitizeEmailApi() {
    return withAuth(userRequest, { // 复用userRequest实例 + withAuth自动注入token
        url: '/api/user/desensitize-email', // 对应后端接口路径（前缀和反馈接口保持一致）
        method: 'GET' // 查询类接口用GET，无需传参/传data
    })
}