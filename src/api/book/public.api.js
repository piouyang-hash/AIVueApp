// src/api/bookApi.js （建议新建书籍专属API文件，避免和用户API混在一起）
import {bookRequest, withAuth} from '@/utils/request' // 假设书籍微服务的请求实例（推荐）
// 如果暂时没有bookRequest，可先用userRequest：import { userRequest } from '@/utils/request'

/**
 * 分页获取随机书籍列表（底层请求函数）
 * @param {Object} params - 请求参数
 * @param {number} [params.pageNum=1] - 页码（从1开始，默认1）
 * @param {number} [params.pageSize=10] - 每页条数（默认10，后端限制最大10）
 * @returns {Promise<Object>} 后端原始响应对象（{ code, data: [...], message }）
 */
export async function getRandomBooksByPage({ pageNum = 1, pageSize = 10 } = {}) {
    // 前端简单校验，防止无效请求（与后端保持一致）
    if (!Number.isInteger(pageNum) || pageNum < 1) {
        pageNum = 1;
    }
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 10) {
        pageSize = 10;
    }
    return bookRequest({
        url: '/public-api/books/random/page',  // 请确保与后端实际路径一致
        method: 'POST',                        // 统一使用 POST（推荐，最兼容请求体）
        data: {                                // POST 请求用 data 传 JSON 请求体
            pageNum,
            pageSize
        }
    });
}

/**
 * 根据文件哈希查询书籍详情
 * @param {string} fileHash - 书籍文件哈希值（不能为空）
 * @returns {Promise<Object>} 包含书籍详情的响应数据
 */
export async function getBookByFileHash(fileHash) {
    // 参数校验：哈希值不能为空
    if (!fileHash || typeof fileHash !== 'string') {
        throw new Error('文件哈希值不能为空且必须为字符串类型');
    }

    return bookRequest({
        url: `/public-api/books/file-hash/${fileHash}`, // 路径参数拼接
        method: 'GET' // 后端是@GetMapping，使用GET请求
    })
}

/**
 * 根据标题模糊搜索公共书籍（公开接口，无需登录）
 * @param {string} title - 搜索关键词，比如 "Java"、"React"...
 */
export function searchPublicBooksApi(title) {
    // 后端要求 title 不能为空，所以前端也简单防一下
    if (!title || !title.trim()) {
        return Promise.reject(new Error('搜索关键词不能为空'))
    }

    return bookRequest({
        url: '/public-api/books/search',   // 注意你后端是 /search，不是 /books/search
        method: 'get',
        params: { title: title.trim() }     // @RequestParam("title")
    })
}

/**
 * 获取当前用户图书馆中的所有公共书籍详情（需登录）
 * 无入参，userId从请求头Token中解析，后端自动处理
 * @returns {Promise<AxiosResponse>} 响应数据包含EpubBookDTO列表
 */
export function getUserLibraryPublicBooksApi() {
    // 无需参数校验（接口无入参），直接发起认证请求
    return withAuth(bookRequest, {
        url: '/library-api/books/query-public-books',   // 你自行替换成实际后端地址即可
        method: 'get'                                   // GET请求，无params/body参数
    })
}

/**
 * 获取公共书籍二进制文件流（公开接口，无需登录）
 * @param {number|string} id - 公共书籍ID，必须为大于0的数字
 */
export function getPublicBookBinaryStreamApi(id) {
    // 1. 前端参数校验（对齐后端校验规则：ID不能为空/小于等于0）
    const bookId = Number(id);
    if (!id || bookId <= 0 || isNaN(bookId)) {
        return Promise.reject(new Error('公共书籍ID无效（不能为空或小于等于0）'));
    }

    // 2. 发起GET请求，适配文件流响应（设置responseType: 'blob'）
    return bookRequest({
        url: `/public-api/books/public-books/${bookId}/binary`,  // 后端接口路径：/public-books/{id}/binary
        method: 'get',
        responseType: 'arraybuffer',  // 核心：文件流必须设置blob类型，否则解析乱码
        // 无需params/body：ID是路径参数，不是查询参数
    });
}