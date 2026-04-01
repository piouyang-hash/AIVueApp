import {
    sendVerificationCodeApi,
    sendVerificationCodeForCurrentUserApi,
    verifyEmailCodeApi
} from "@/api/auth/vertification.api.js";


/**
 * 简化版：发送登录验证码（只打印console，无任何提示组件）
 * @param {string} email - 接收验证码的邮箱
 * @returns {Promise<{success: boolean}>} 成功返回{success: true}，失败reject
 */
export async function sendVerificationCode(email) {
    try {
        // 1. 发起请求
        const res = await sendVerificationCodeApi(email);
        // 核心判断：code为 200 代表验证成功
        if (res.data?.code === 200) {
            return true;
        } else {
            // 后端返回非200，视为验证失败
            console.error('验证码验证失败：', res.data?.msg || '未知错误');
            return false;
        }
    } catch (error) {
        // 4. 错误日志（提取关键信息）
        const errorMsg = error.response?.data?.message || error.message || '验证码发送失败';
        console.error('验证码发送异常：', errorMsg);

        // 失败返回rejected Promise，方便组件处理
        return Promise.reject(new Error(errorMsg));
    }
}

/**
 * 二次封装：验证邮箱验证码（登录态版）
 * @param {string} code - 邮箱收到的验证码（必填）
 * @returns {Promise<boolean>} - 验证成功返回true，失败返回false
 * @description 封装底层verifyEmailCodeApi，统一判断res.data.code===200为成功，包含异常捕获
 */
export async function verifyEmailCode(code) {
    try {
        // 调用底层Api函数
        const res = await verifyEmailCodeApi(code);
        // 核心判断：code为 200 代表验证成功
        if (res.data?.code === 200) {
            return true;
        } else {
            // 后端返回非200，视为验证失败
            console.error('验证码验证失败：', res.data?.msg || '未知错误');
            return false;
        }
    } catch (err) {
        // 捕获网络错误/接口报错等异常
        console.error('验证码验证请求异常：', err);
        return false;
    }
}

/**
 * 二次封装：发送验证码（登录态用户）
 * @returns {Promise<boolean>} - 发送成功返回true，失败返回false
 * @description 封装底层sendVerificationCodeForCurrentUserApi，统一判断res.data.code===200为成功，包含异常捕获
 */
export async function sendVerificationCodeForCurrentUser() {
    try {
        // 调用底层Api函数（无参数）
        const res = await sendVerificationCodeForCurrentUserApi();
        // 核心判断：code为 200 代表发送成功
        if (res.data?.code === 200) {
            return true;
        } else {
            // 后端返回非200，视为发送失败
            console.error('验证码发送失败：', res.data?.msg || '未知错误');
            return false;
        }
    } catch (err) {
        // 捕获网络错误/接口报错等异常
        console.error('验证码发送请求异常：', err);
        return false;
    }
}