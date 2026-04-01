// src/services/public.book.service.js
import {
    getBookByFileHash, getPublicBookBinaryStreamApi,
    getRandomBooksByPage, getUserLibraryPublicBooksApi,
    searchPublicBooksApi
} from '@/api/book/public.api.js'
import {addBookToLibraryApi} from "@/api/book/action.api.js";

/**
 * 分页获取随机书籍列表（直接返回书籍数组）
 * @param {Object} params - 请求参数
 * @param {number} [params.pageNum=1] - 页码
 * @param {number} [params.pageSize=10] - 每页条数
 * @returns {Promise<Array>} 书籍列表数组（失败返回空数组）
 */
export const getRandomBookList = async ({ pageNum = 1, pageSize = 10 } = {}) => {
    try {
        // 调用API接口
        const response = await getRandomBooksByPage({ pageNum, pageSize })
        // 直接返回AppResponse中的data数组（后端返回的书籍列表）
        return response.data?.data || []
    } catch (error) {
        console.error('获取随机书籍失败：', error.message)
        // 失败时返回空数组，避免组件报错
        return []
    }
}

/**
 * 根据文件哈希获取书籍详情（直接返回书籍详情对象）
 * @param {string} fileHash - 书籍文件哈希值
 * @returns {Promise<Object|null>} 书籍详情对象（失败返回null）
 */
export const getBookDetailByFileHash = async (fileHash) => {
    try {
        // 调用API接口
        const response = await getBookByFileHash(fileHash)
        // 直接返回AppResponse中的data对象（后端返回的书籍详情）
        return response.data?.data || null
    } catch (error) {
        console.error('根据哈希获取书籍详情失败：', error.message)
        // 失败时返回null，避免组件报错
        return null
    }
}

/**
 * 【最终版·极致清纯封装】
 * 搜索公共书籍，直接返回书籍数组，不用你再 .data.data 了！
 * @param {string} title - 搜索关键词
 */
export const searchPublicBooks = async (title) => {
    if (!title || !title.trim()) {
        // 直接抛错，让调用方 catch 也行，或者你想返回空数组都行
        return []
        // 或者 throw new Error('宝贝，标题不能为空哦～')
    }

    const res = await searchPublicBooksApi(title)

    // 现在直接把最里层的数据扒出来给你！超级清爽！
    return res.data?.data || []
}

/**
 * 【业务封装】添加公有书籍到当前登录用户的图书馆
 * @param {Object} params - 入参对象
 * @param {string} params.publicBookId - 公有书籍ID（必填）
 * @param {string} params.fileHash - 书籍文件哈希值（必填，与书籍哈希一致）
 * @returns {Promise} 请求Promise对象
 */
export function addPublicBookToLibrary({ publicBookId, fileHash }) {
    // 1. 严格参数校验
    if (!publicBookId) {
        return Promise.reject(new Error("公有书籍ID不能为空"));
    }
    if (!fileHash) {
        return Promise.reject(new Error("书籍文件哈希值不能为空"));
    }

    // 2. 构造入参（仅包含公有书籍相关字段）
    const userLibrary = {
        publicBookId: publicBookId,
        fileHash: fileHash
    };

    // 3. 调用原API函数
    return addBookToLibraryApi(userLibrary);
}

/**
 * 获取当前用户图书馆中的所有公共书籍详情（组件直接调用版）
 * 无入参，自动处理认证和错误，失败返回null
 * @returns {Promise<Array|null>} 公共书籍DTO列表（EpubBookDTO[]），失败返回null
 */
export const getUserLibraryPublicBooks = async () => {
    try {
        // 调用底层API接口
        const response = await getUserLibraryPublicBooksApi()
        // 直接返回AppResponse中的data数组（后端返回的EpubBookDTO列表），无数据返回空数组
        return response.data?.data || []
    } catch (error) {
        console.error('获取当前用户图书馆公共书籍详情失败：', error.message)
        // 失败时返回null，组件可基于null做错误提示
        return null
    }
};

/**
 * 获取公共书籍二进制流（二进制流接口没有code/message，单独处理）
 * @param {Number} id - 公共书籍ID
 */
export async function getPublicBookBinaryStreamService(id) {
    const response = await getPublicBookBinaryStreamApi(id)
    console.log('公共书籍流获取成功：', response.status) // 二进制流用状态码判断

    // 关键：把arraybuffer转成Blob（指定EPUB的MIME类型）
    return new Blob([response.data], {type: 'application/epub+zip'}) // 返回Blob对象，方便后续处理
}