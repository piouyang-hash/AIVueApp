// src/utils/request.js
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toastStore'

// ========== 抽离通用登录/Token逻辑（仅修改这里：新增返回accessToken/refreshToken） ==========
function getLoginStateAndToken() {
    const userStore = useUserStore()
    const token = userStore.token // 原token保留（兼容旧代码）
    // 从VO中获取最新双Token，兼容空值
    const { accessToken, refreshToken } = userStore.refreshTokenVO || {}

    // ===================== 核心修改 =====================
    // 登录条件：两个Token 必须 都有值（缺一不可）
    const isLogin = !!(accessToken && refreshToken)

    // 返回：原有token + VO中的最新双Token
    return { isLogin, token, accessToken, refreshToken }
}

function showLoginTip() {
    const toast = useToastStore()
    toast?.show('请先登录~！', 'error')
    console.warn('请求拦截：用户未登录，token不存在，已取消请求')
}

// ========== 1. 创建Axios实例（支持自定义超时，无修改） ==========
/**
 * 创建基础axios实例的函数（支持动态传baseURL和timeout）
 * @param {string} baseURL - 接口基础地址
 * @param {number} [timeout=5000] - 超时时间（默认5000ms）
 * @returns {AxiosInstance} axios实例
 */
export function createRequest(baseURL, timeout = 5000) {
    return axios.create({
        baseURL: baseURL,
        timeout: timeout
    });
}

// ========== 【新增1】短期AccessToken专用（业务接口用） ==========
export function addAccessAuthHeader(config) {
    const { isLogin, accessToken } = getLoginStateAndToken();
    if (!isLogin) {
        showLoginTip();
        return null;
    }
    config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${accessToken}`
    };
    return config;
}

// ========== 【新增2】长期RefreshToken专用（续期用） ==========
export function addRefreshAuthHeader(config) {
    const { isLogin, refreshToken } = getLoginStateAndToken();
    if (!isLogin) {
        showLoginTip();
        return null;
    }
    config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${refreshToken}`
    };
    return config;
}

// ========== 3. 核心：withAuth 伪重载（支持选择Token，新架构强制版） ==========
/**
 * 鉴权函数（伪重载，兼容2种调用方式 + 2种Token选择）
 * ✅ 方式1（Axios）：withAuth(requestInstance, config, authType?) → 带鉴权发起Axios请求
 * ✅ 方式2（Fetch）：withAuth(config, authType?) → 仅返回带鉴权头的配置
 * @param {AxiosInstance|Object} arg1 - Axios实例 / Fetch配置
 * @param {Object|String} [arg2] - Axios配置 / 鉴权类型
 * @param {String} [arg3] - 鉴权类型（仅Axios调用需要）
 * @param {'access'|'refresh'} [authType='access'] - 鉴权token类型：
 *         access=【默认】短期AccessToken | refresh=长期RefreshToken
 * @returns {Promise<Object>} 结果（Axios返回请求Promise / Fetch返回配置Promise）
 */
export async function withAuth(arg1, arg2, arg3) {
    // ====================== 核心：Token类型选择（移除common，强制新架构） ======================
    // 仅保留 access/refresh 两种类型，access 为默认值
    const authHandlerMap = {
        access: addAccessAuthHeader,  // 【默认】短期AccessToken
        refresh: addRefreshAuthHeader // 长期RefreshToken
    };

    // 默认鉴权类型：access（强制新架构，无common）
    let authType = 'access';
    // 情况1：Axios调用 (实例, 配置, 类型)
    if (arg1?.defaults?.baseURL && arg2 && arg3) {
        authType = arg3;
    }
    // 情况2：Fetch调用 (配置, 类型)
    else if (typeof arg1 === 'object' && arg2 && typeof arg2 === 'string') {
        authType = arg2;
    }

    // 校验token类型合法性（仅支持 access/refresh）
    const authHandler = authHandlerMap[authType];
    if (!authHandler) {
        return Promise.reject(new Error(`withAuth不支持的token类型：${authType}，仅支持 access/refresh`));
    }

    // ====================== 原有逻辑（无修改，仅替换头处理函数） ======================
    // 情况1：Axios调用（参数1=Axios实例，参数2=配置）
    if (arg1?.defaults?.baseURL && arg2) {
        const authConfig = authHandler(arg2);
        if (!authConfig) {
            return Promise.reject(new Error('用户未登录，请求已拦截'));
        }
        return arg1(authConfig);
    }

    // 情况2：Fetch调用（仅1个参数=配置）
    if (typeof arg1 === 'object' && !arg2 || (arg2 && typeof arg2 === 'string')) {
        const authConfig = authHandler({ ...arg1 });
        if (!authConfig) {
            return Promise.reject(new Error('用户未登录，请求已拦截'));
        }
        return Promise.resolve(authConfig);
    }

    // 非法调用
    return Promise.reject(new Error('withAuth调用参数错误！\nAxios用法：withAuth(axios实例, 配置, [token类型])\nFetch用法：withAuth(配置, [token类型])'));
}

// ========== 4. 流式请求处理（移除硬编码鉴权，改为可选插槽） ==========
/**
 * 处理流式响应的请求（Fetch版，鉴权通过外部withAuth控制，非内置）
 * @param {Object} config - 请求配置（url/method/data/headers等，可带/不带鉴权头）
 * @param {Function} onData - 流式数据回调（每次收到chunk触发）
 * @param {Function} onEnd - 流结束回调
 * @param {Function} onError - 错误回调
 * @returns {Function} 取消请求的函数（用于手动终止流）
 */
export function withStream(config, onData, onEnd, onError) {
    // 1. 创建AbortController用于取消请求
    const controller = new AbortController();
    const signal = controller.signal;

    // 2. 拼接完整URL
    const baseUrl = SERVICE_URLS.AI_CHAT_SERVICE;
    const fullUrl = new URL(config.url, baseUrl).href;

    // 3. 构建fetch请求配置（仅使用传入的config，不内置鉴权）
    const fetchConfig = {
        method: config.method || 'POST',
        headers: {
            'Content-Type': 'application/json', // 默认JSON
            ...config.headers, // 外部传入的headers（含鉴权头/自定义头）
        },
        signal: signal,
        body: config.data ? JSON.stringify(config.data) : null,
    };

    // 4. 发送请求并处理流式响应
    (async () => {
        try {
            const response = await fetch(fullUrl, fetchConfig);

            // 校验HTTP状态码
            if (!response.ok) {
                throw new Error(`请求失败：${response.status} ${response.statusText}`);
            }

            // 校验流式响应体
            if (!response.body) {
                onError?.(new Error('响应体不是流式数据'));
                onEnd?.();
                return;
            }

            // 读取流式数据
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    onEnd?.(); // 流读取完成
                    break;
                }
                // 解码并回调给外部
                const data = decoder.decode(value, { stream: true });
                onData?.(data);
            }
        } catch (error) {
            // 排除主动取消请求的错误
            if (error.name !== 'AbortError') {
                onError?.(error);
            }
            onEnd?.();
        }
    })();

    // 返回取消请求的函数
    return () => controller.abort();
}

// ==============================================
// 👉 新增：后端SSE格式专用解析函数（核心！）
// ==============================================
/**
 * 适配后端 SSE 流式接口（data: JSON\n\n 格式）
 * @param {Object} config - 请求配置（同withStream）
 * @param {Function} onChunk - 回调：返回解析后的DTO对象（ChatChunkDTO）
 * @param {Function} onEnd - 流结束回调
 * @param {Function} onError - 错误回调
 * @returns {Function} 取消请求函数
 */
export function withSSEChatStream(config, onChunk, onEnd, onError) {
    // 1. 缓存残片：解决流式分块导致的消息不完整问题（关键！）
    let sseBuffer = '';

    // 2. 调用你原有的 withStream，只做解析逻辑增强
    return withStream(
        config,
        // 原始流式文本 → 解析为DTO对象
        (rawText) => {
            try {
                // 拼接残片 + 新收到的数据
                sseBuffer += rawText;

                // 3. 按 SSE 标准分隔符 \n\n 拆分完整消息
                const messageList = sseBuffer.split('\n\n');
                // 最后一段是未完成的残片，放回缓存
                sseBuffer = messageList.pop() || '';

                // 4. 遍历处理每一条完整的 SSE 消息
                messageList.forEach(msg => {
                    // 空消息直接过滤
                    if (!msg.trim()) return;

                    // 5. 剥离后端封装的 SSE 前缀：data:
                    let jsonStr = msg.replace(/^data:\s*/, '').trim();
                    if (!jsonStr) return;

                    // 6. JSON 反序列化为前端对象（对应后端 ChatChunkDTO）
                    const dto = JSON.parse(jsonStr);

                    // 7. 回调给业务层：直接拿到结构化对象！
                    onChunk?.(dto);
                });
            } catch (err) {
                console.error('SSE消息解析失败', err);
                onError?.(new Error('流式数据解析异常：' + err.message));
            }
        },
        // 流结束
        () => {
            sseBuffer = ''; // 清空缓存
            onEnd?.();
        },
        // 错误透传
        onError
    );
}

// ========== 核心修改：仅给aiChatRequest配置更长的超时时间 ==========
import { SERVICE_URLS } from '@/api/constants/serviceUrls.js'
export const testRequest = createRequest(SERVICE_URLS.TEST_METHOD, 10000)
export const userRequest = createRequest(SERVICE_URLS.USER_SERVICE) // 仍用默认5000ms
export const bookRequest = createRequest(SERVICE_URLS.BOOK_SERVICE) // 仍用默认5000ms
export const orderRequest = createRequest(SERVICE_URLS.ORDER_SERVICE); // 仍用默认5000ms
export const accountRequest = createRequest(SERVICE_URLS.ACCOUNT_SERVICE); // 仍用默认5000ms
export const connectRequest = createRequest(SERVICE_URLS.CONNECT_SERVICE); // 仍用默认5000ms
// AI聊天请求：单独配置30000ms（30秒）超时，根据需要调整
export const aiChatRequest = createRequest(SERVICE_URLS.AI_CHAT_SERVICE, 30000);

