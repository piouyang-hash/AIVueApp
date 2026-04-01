import { bookRequest, withAuth } from "@/utils/request.js";

/**
 * 上传书籍阅读进度（缓存存储）
 * @param {Object} progressData 阅读进度数据
 * @param {number} [progressData.publicBookId] 公共书籍ID（与privateBookId二选一）
 * @param {number} [progressData.privateBookId] 私有书籍ID（与publicBookId二选一）
 * @param {string} progressData.fileHash 书籍哈希值（必填）
 * @param {Object} progressData.location 阅读位置信息（必填，包含locationIndex、displayed等字段）
 * @returns {Promise} 请求Promise
 */
export function uploadBookProgress(progressData) {
    return withAuth(bookRequest, {
        method: 'POST',
        url: '/books/progress/upload',
        data: progressData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


/**
 * 持久化缓存进度到数据库
 * @param {Object} params 持久化参数
 * @param {number} [params.publicBookId] 公共书籍ID（与privateBookId二选一，正整数）
 * @param {number} [params.privateBookId] 私有书籍ID（与publicBookId二选一，正整数）
 * @param {string} params.fileHash 书籍哈希值（必填，需与书籍实际哈希一致）
 * @returns {Promise} 请求Promise
 */
export function persistBookProgress(params) {
    return withAuth(bookRequest, {
        method: 'POST',
        url: '/books/progress/persist',
        params: params, // 后端用@ModelAttribute接收，用params传递（拼接为查询参数或表单参数）
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // 适配@ModelAttribute接收方式
        }
    });
}



/**
 * 获取用户书籍阅读进度
 * @param {Object} params 查询参数
 * @param {number} [params.publicBookId] 公共书籍ID（与privateBookId二选一，正整数）
 * @param {number} [params.privateBookId] 私有书籍ID（与publicBookId二选一，正整数）
 * @param {string} params.fileHash 书籍哈希值（必填，需与书籍实际哈希一致）
 * @returns {Promise} 请求Promise（返回进度数据）
 */
export function getUserBookReadingProgress(params) {
    return withAuth(bookRequest, {
        method: 'GET',
        url: '/books/progress/get',
        params: params // GET请求用params传递，axios自动拼接为URL查询参数
    });
}