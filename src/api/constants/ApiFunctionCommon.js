/**
 * 通用响应处理函数（核心封装逻辑）
 * @param {Function} apiFunc - 原始API函数
 * @param  {...any} args - API函数所需参数
 * @returns {any} - 成功返回res.data.data，失败抛出错误
 */
export async function handleApiResponse(apiFunc, ...args) {
    try {
        const res = await apiFunc(...args);
        // 核心判断：code=200视为成功，否则失败
        if (res?.data?.code === 200) {
            return res.data.data; // 直接返回业务数据，组件无需再解析
        } else {
            // 失败时抛出包含错误信息的异常
            throw new Error(res?.data?.msg || "接口请求失败");
        }
    } catch (error) {
        // 捕获网络错误/接口错误，统一抛出友好提示
        throw new Error(error.message || "网络异常，请稍后重试");
    }
}