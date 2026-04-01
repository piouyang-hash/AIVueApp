// src/services/auth.service.js
import {register, logout, quickLogin, resetPasswordApi} from '@/api/auth/auth.api.js' // 导入原有的quickLogin API请求
import { useUserStore } from '@/stores/user.js' // 导入Pinia的userStore
import router from '@/router/index.js'
import {APP_CONSTANTS} from "@/api/constants/appType.js";
import {useAiSoftwareConfigStore} from "@/stores/aiSoftwareConfig.js";
import {pollUserProfileUntilSuccess} from "@/services/user.action.service.js";

// 获取userStore实例
const userStore = useUserStore()
const useAiConfig = useAiSoftwareConfigStore()
/**
 * 用户登录服务（邮箱登录）
 * @param {string} email - 用户邮箱（原username）
 * @param {string} password - 密码
 * @returns {Promise<Object>} 登录结果（含loginResult）
 */
export const loginService = async (email, password) => { // 保持两个参数，组件调用不变！
    try {
        // 1. 内部组装LoginDTO：自动补充appType，组件完全无感知
        const loginDTO = {
            email,
            password,
            appType: APP_CONSTANTS.APP_TYPE // 从常量取AI_CHAT，组件不用传！
        };
        console.log('内部组装的LoginDTO：', loginDTO);

        // 2. 调用登录API（传递完整LoginDTO）
        const response = await quickLogin(loginDTO);
        const loginResult = response.data.data;

        if (loginResult) {
            const { token, userId, profile } = loginResult;
            console.log('LoginResult:', loginResult);

            // 3. 更新Pinia存储
            userStore.login();
            userStore.setToken(token);
            userStore.setUserId(userId);
            userStore.setUserInfo(profile);

            // 4. 新增：如果profile为null，启动轮询获取用户资料
            if (!profile) {

                // 启动异步轮询，不阻塞登录流程
                // fetchProfileAndSync函数内部会自动更新Pinia
                pollUserProfileUntilSuccess({
                    maxAttempts: 15,  // 适当增加轮询次数
                    interval: 800,    // 间隔800ms
                    timeout: 15000    // 15秒超时
                }).then(() => {
                    // 轮询成功后，fetchProfileAndSync已经自动更新了Pinia
                    console.log('✅ 轮询成功，用户资料已自动同步到Pinia');
                }).catch(error => {
                    console.warn('⚠️ 轮询用户资料失败，但登录已成功:', error.message);
                    // 轮询失败不影响登录流程
                });
            }

            // 5. 新增：获取用户ai软件基础配置
            await useAiConfig.fetchAiConfig();
            return { success: true, data: loginResult };
        }

        return { success: false, message: '登录结果为空' };
    } catch (error) {
        console.error('登录失败：', error);
        const errorMsg = error.response?.data?.msg || '邮箱或密码错误';
        throw new Error(errorMsg);
    }
};

/**
 * 注册业务层封装：组件直接传入原始数据，Service处理参数构建
 * @param {Object} params - 组件传入的原始注册数据
 * @param {string} params.email - 注册邮箱（必填）
 * @param {string} params.password - 密码（必填）
 * @param {string} params.code - 邮箱验证码（必填）
 * @param {string} [params.username] - 用户名（可选，后端无需则不传）
 * @returns {Promise<AxiosResponse>} - 最终请求结果
 */
export async function userRegister(params) {
    try {
        // 1. 解构组件传入的原始参数（仅取需要的字段）
        const { email, password, code } = params;

        // 2. 构建后端要求的LoginDTO（核心修改：自动注入appType，组件无需传）
        const loginDTO = {
            email: email.trim(),       // 邮箱
            password: password.trim(), // 密码
            appType: APP_CONSTANTS.APP_TYPE // 自动填充AI_CHAT，无需组件传入
        };

        // 3. 调用底层请求封装，发起注册（参数名从user改为loginDTO，更贴合后端）
        return await register(loginDTO, code.trim());

    } catch (error) {
        // 4. 统一错误捕获
        console.error('注册请求失败：', error);
        return Promise.reject(error);
    }
}

/**
 * 退出登录服务
 */
// 独立的退出登录函数（简化版）
export async function performLogout() {
    const userStore = useUserStore()

    try {
        // 调用后端退出接口（即使失败也不影响本地退出）
        await logout()
        console.log('✅ 后端退出接口调用成功')
    } catch (error) {
        // 简化错误提示，不中断流程
        console.warn('⚠️ 后端退出接口调用失败（可能token已过期），继续清理本地状态', error)
    }

    // 无论接口是否成功，都清理本地状态
    userStore.$reset()
}

/**
 * 重置密码 Service（二次封装，处理错误+打印消息）
 * @param {string} email - 用户绑定的邮箱
 * @param {string} newPassword - 新密码
 * @param {string} code - 邮箱验证码
 * @returns {Promise<any>} 接口返回数据
 */
export const resetPasswordService = async (email, newPassword, code) => {
    try {
        // 调用底层接口
        const res = await resetPasswordApi(email, newPassword, code);

        // 打印后端返回的消息（满足需求：res.data.message）
        if (res?.data?.message) {
            console.log('【重置密码】接口返回消息：', res.data.message);
        }

        // 返回数据给组件，方便组件后续处理（比如跳转）
        return res.data;
    } catch (error) {
        // 统一错误处理：覆盖网络错误、接口报错、无返回值等场景
        let errorMsg = '重置密码失败！';
        if (error?.response?.data?.message) {
            // 后端返回的错误消息
            errorMsg = error.response.data.message;
        } else if (error?.message) {
            // 网络/前端错误消息
            errorMsg = error.message;
        }

        // 打印错误信息，方便调试
        console.error('【重置密码】失败原因：', errorMsg);

        // 抛出错误，让组件能捕获并处理（比如提示用户）
        throw new Error(errorMsg);
    }
};