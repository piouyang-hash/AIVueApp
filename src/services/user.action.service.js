// @/services/userService.js
import {
    changeEmailApi,
    changePassword, getCurrentUserProfile,
    getUserDesensitizeEmailApi,
    submitUserFeedback,
    updateUserProfile
} from '@/api/auth/user-action/action.api.js' // 假设这是你的 API 函数
import { useUserStore } from '@/stores/user.js'

/**
 * 更新用户资料并自动同步到本地状态
 * @param {Object} userProfileObj - 用户核心信息对象（id、userId、nickname、bio 等）
 * @param {File|undefined} [file] - 头像文件（可选，不传则不更新头像）
 */
export async function updateProfileAndSync(userProfileObj, file) {
    const userStore = useUserStore()

    try {
        // 1. 内部构建 FormData（原组件逻辑迁移至此）
        const formData = new FormData();
        // 追加 JSON 格式的用户信息（Blob 包装）
        const userProfileBlob = new Blob(
            [JSON.stringify(userProfileObj)],
            { type: 'application/json' }
        );
        formData.append("userProfile", userProfileBlob, "userProfile.json");
        // 有头像文件时追加
        if (file) {
            formData.append("file", file, file.name);
        }

        // 2. 调用后端更新接口
        const response = await updateUserProfile(formData);
        const updatedProfile = response.data.data; // AppResponse<T> 的 data 字段

        // 3. 自动更新 Pinia 状态（用后端返回的最新数据覆盖）
        userStore.$patch({
            userInfo: {
                ...userStore.userInfo,
                ...updatedProfile
            }
        });

        console.log('✅ 个人信息更新成功！');
    } catch (error) {
        console.error('❌ 更新用户资料失败:', error);
        throw error; // 抛出错误让调用方处理（如弹窗提示）
    }
}

/**
 * 获取用户资料并自动同步到本地状态
 * @returns {Promise<UserProfile|null>} 用户资料对象，如果没有则返回null
 */
export async function fetchProfileAndSync() {
    const userStore = useUserStore();

    try {
        // 调用后端接口获取用户资料
        const response = await getCurrentUserProfile();
        const userProfile = response.data.data; // AppResponse<T> 的 data 字段

        // 更新 Pinia 状态（如果用户资料存在）
        if (userProfile) {
            userStore.$patch({
                userInfo: {
                    ...userStore.userInfo,
                    ...userProfile
                }
            });
        } else {
            console.log('用户资料为空，等待异步初始化...');
        }

        console.log('✅ 获取用户资料成功！');
        return userProfile;
    } catch (error) {
        console.error('❌ 获取用户资料失败:', error);
        throw error; // 抛出错误让调用方处理
    }
}

/**
 * 轮询用户资料直到获取成功
 * @param {Object} options 配置选项
 * @param {number} options.maxAttempts 最大尝试次数，默认10次
 * @param {number} options.interval 轮询间隔（毫秒），默认1000ms
 * @param {number} options.timeout 超时时间（毫秒），默认10000ms
 * @returns {Promise<UserProfile>} 用户资料
 * @throws {Error} 超时或达到最大尝试次数时抛出错误
 */
export async function pollUserProfileUntilSuccess(options = {}) {
    const {
        maxAttempts = 10,
        interval = 1000,
        timeout = 10000
    } = options;

    let attempts = 0;
    let userProfile = null;
    let timeoutId;

    return new Promise((resolve, reject) => {
        // 设置超时定时器
        timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error('获取用户资料超时'));
        }, timeout);

        // 轮询函数
        const poll = async () => {
            try {
                attempts++;
                console.log(`尝试获取用户资料 (第${attempts}次)...`);

                // 尝试获取用户资料
                userProfile = await fetchProfileAndSync();

                if (userProfile) {
                    // 成功获取到用户资料
                    clearTimeout(timeoutId);
                    console.log(`✅ 成功获取用户资料，共尝试${attempts}次`);
                    resolve(userProfile);
                } else if (attempts >= maxAttempts) {
                    // 达到最大尝试次数仍为空
                    clearTimeout(timeoutId);
                    reject(new Error(`获取用户资料失败，已达到最大尝试次数(${maxAttempts}次)`));
                } else {
                    // 继续轮询
                    console.log(`用户资料尚未初始化，${interval}ms后重试...`);
                    setTimeout(poll, interval);
                }
            } catch (error) {
                // 发生错误
                clearTimeout(timeoutId);
                console.error('❌ 轮询用户资料时发生错误:', error);
                reject(error);
            }
        };

        // 开始轮询
        poll();
    });
}

/**
 * 第二层封装：带参数校验 + try-catch 错误处理 + 友好提示（组件直接调用）
 * @param {Object} feedbackForm - 表单数据（需包含feedbackType、content，contact可选）
 * @returns {Promise<Object>} 后端响应数据（成功）/ undefined（失败）
 */
export async function submitFeedbackWithHandle(feedbackForm) {
    // 1. 前置参数校验（和后端@Parameter要求对齐）
    if (!feedbackForm.feedbackType) {
        return;
    }
    if (!feedbackForm.content?.trim()) { // 可选链避免content为undefined时报错
        return;
    }
    console.log(feedbackForm.feedbackType);

    try {
        // 2. 调用第一层接口，仅传后端需要的核心字段（避免冗余）
        const response = await submitUserFeedback({
            feedbackType: feedbackForm.feedbackType,
            content: feedbackForm.content.trim(), // 去除首尾空格
            contact: feedbackForm.contact || '' // 无则传空字符串，符合后端可选要求
        });

        console.log('✅ 反馈提交成功，后端响应：', response.data.message);
        return response; // 组件可接收后端返回的反馈ID等数据

    } catch (error) {
        // 4. 错误处理：统一捕获 + 友好提示
        console.error('❌ 反馈提交失败：', error);
        // 区分网络错误/业务错误（按需扩展）
        const errorMsg = error.message || '网络异常，提交失败，请稍后重试～';
    }
}

/**
 * 【二次封装】修改当前登录用户密码（组件直接调用版）
 * @param {string} oldPassword - 原密码（明文）
 * @param {string} newPassword - 新密码（明文）
 * @returns {Promise} 接口请求Promise，成功返回{code:200, msg:"密码更新成功"}
 * 特点：
 * 1. 组件无需构建对象，直接传两个字符串即可
 * 2. 前置校验（非空+≥6位），提前拦截无效请求
 * 3. 内部自动调用第一层封装的changePassword函数
 */
export async function updateUserPassword(oldPassword, newPassword) {
    // 前置参数校验（和后端@Size(min=6)、@NotBlank规则对齐）
    if (!oldPassword || oldPassword.trim() === "") {
        return Promise.reject(new Error("原密码不能为空"));
    }
    if (oldPassword.length < 6) {
        return Promise.reject(new Error("原密码长度不能少于6位"));
    }
    if (!newPassword || newPassword.trim() === "") {
        return Promise.reject(new Error("新密码不能为空"));
    }
    if (newPassword.length < 6) {
        return Promise.reject(new Error("新密码长度不能少于6位"));
    }

    // 自动构建接口所需的参数对象
    const passwordForm = {
        oldPassword: oldPassword.trim(), // 去除首尾空格，避免无效空格导致校验失败
        newPassword: newPassword.trim()
    };

    // 调用第一层封装的changePassword函数
    return changePassword(passwordForm);
}

/**
 * 【二次封装】获取当前登录用户的脱敏邮箱（组件直接调用版）
 * @returns {string} 脱敏邮箱字符串（无则返回空字符串）
 * 特点：
 * 1. 组件无需处理Promise/错误，直接调用
 * 2. 错误仅控制台打印，不弹提示
 * 3. 自动解析res.data.data（用户指定的邮箱字段路径）
 */
export async function getUserDesensitizeEmail() {
    try {
        const res = await getUserDesensitizeEmailApi();
        // 按你要求：res.data.data 才是邮箱，兜底空字符串
        return res?.data?.data || "";
    } catch (err) {
        // 仅控制台打印错误，不弹ElMessage
        console.error("获取脱敏邮箱失败：", err?.msg || err?.message || "未知错误");
        // 错误时返回空字符串，组件无需处理异常
        return "";
    }
}

// 封装后的调用函数（核心：简单处理结果+错误打印）
export async function changeEmail(email, code) { // 补code参数
    try {
        // 调用api接口：传email+code两个参数
        const res = await changeEmailApi(email, code);
        // 仅判断code=200返回true，其他情况返回false
        return res.data?.code === 200;
    } catch (err) {
        // 错误仅打印，无多余逻辑
        console.error('修改邮箱失败：', err);
        // 出错返回false
        return false;
    }
}