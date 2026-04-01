import {userRequest, withAuth} from '@/utils/request'

/**
 * 第一层封装：发送验证码基础请求（适配后端接口）
 * @param {string} email - 接收验证码的邮箱（必填）
 * @returns {Promise} - 原始请求Promise
 */
export function sendVerificationCodeApi(email) {
    return userRequest({
        method: 'POST',
        url: 'code/verification-code/send',
        params: { email } // 后端用@RequestParam接收，前端用params传参（拼接为查询参数）
    });
}

/**
 * 第一层封装：验证邮箱验证码请求（需要登录认证）
 * @param {string} code - 邮箱收到的验证码（必填）
 * @returns {Promise} - 原始请求Promise
 * @note 该接口需要登录态（JWT在请求头由withAuth自动携带），仅需传验证码参数，无需传邮箱（后端通过JWT获取当前用户绑定邮箱）
 */
export async function verifyEmailCodeApi(code) {
    // withAuth：自动添加JWT登录凭证到请求头，无需手动处理
    return withAuth(userRequest, {
        method: 'POST',
        url: 'code/verification-code/verify/current-user', // 对应后端/verification-code/verify接口
        params: { code } // 仅传验证码参数，邮箱由后端通过JWT获取
    });
}

/**
 * 第一层封装：发送验证码（登录态用户）
 * @returns {Promise} - 原始请求Promise
 * @note 该接口需要登录态，无请求参数，自动使用当前登录用户绑定的邮箱发送验证码
 */
export async function sendVerificationCodeForCurrentUserApi() {
    // withAuth：给请求添加登录认证凭证（如token），确保接口需要登录才能访问
    return withAuth(userRequest, {
        method: 'POST',
        url: 'code/verification-code/send/current-user', // 对应后端/verification-code/send/current-user接口
        params: {} // 无请求参数，传空对象保持格式统一
    });
}