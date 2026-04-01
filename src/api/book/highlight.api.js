import { bookRequest, withAuth } from "@/utils/request.js";

/**
 * 新增书籍高亮记录
 * @param {Object} highlightData 高亮数据
 * @param {number} [highlightData.publicBookId] 公共书籍ID（与privateBookId二选一）
 * @param {number} [highlightData.privateBookId] 私有书籍ID（与publicBookId二选一）
 * @param {string} highlightData.bookHash 书籍哈希值（必填，需与书籍实际哈希一致）
 * @param {string} highlightData.selectCfi CFI定位信息（必填）
 * @param {string} highlightData.pageStartCfi 起始页CFI（必填）
 * @param {string} highlightData.pageEndCfi 结束页CFI（必填）
 * @param {string} highlightData.highlightText 选中文字内容（必填）
 * @param {Object} [highlightData.style] 高亮样式对象（如{ backgroundColor: 'yellow' }）
 * @param {string} [highlightData.styleJson] 高亮样式JSON字符串（二选一style即可）
 * @returns {Promise} 请求Promise（返回新增的高亮记录）
 */
export function addBookHighlight(highlightData) {
    return withAuth(bookRequest, {
        method: 'POST',
        url: '/books/highlight/add',
        data: highlightData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}



/**
 * 获取用户书籍高亮记录
 * @param {Object} params 查询参数
 * @param {number} [params.publicBookId] 公共书籍ID（与privateBookId二选一，正整数）
 * @param {number} [params.privateBookId] 私有书籍ID（与publicBookId二选一，正整数）
 * @param {string} params.fileHash 书籍哈希值（必填，需与书籍实际哈希一致）
 * @returns {Promise} 请求Promise（返回高亮记录列表，按创建时间倒序）
 */
export function getUserBookHighlights(params) {
    return withAuth(bookRequest, {
        method: 'GET',
        url: '/books/highlight/getHighlights',
        params: params // GET请求用params传递，axios自动拼接为URL查询参数
    });
}


/**
 * 删除用户书籍高亮记录
 * @param {Object} params 删除参数
 * @param {number} params.id 高亮记录ID（必填，正整数）
 * @param {number} [params.publicBookId] 公共书籍ID（与privateBookId二选一，正整数）
 * @param {number} [params.privateBookId] 私有书籍ID（与publicBookId二选一，正整数）
 * @param {string} params.fileHash 书籍哈希值（必填，需与书籍实际哈希一致）
 * @returns {Promise} 请求Promise（无返回数据，仅返回操作结果）
 */
export function deleteUserBookHighlight(params) {
    return withAuth(bookRequest, {
        method: 'DELETE',
        url: '/books/highlight/deleteHighlight',
        params: params // DELETE请求用params传递，axios自动拼接为URL查询参数
    });
}