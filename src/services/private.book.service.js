// src/services/private.book.service.js
import {getPrivateBookBinaryStream, listCurrentUserPrivateBooks, uploadPrivateBook} from "@/api/book/private.api.js";
import {getBookByFileHash} from "@/api/book/private.api.js";

/**
 * 上传私有书籍
 * @param {File} file - EPUB文件对象
 */
export async function uploadPrivateBookService(file) {
    const response = await uploadPrivateBook(file)
    console.log('书籍上传结果：', response.data.code, response.data.message)
    return response.data
}

/**
 * 获取书籍二进制流（二进制流接口没有code/message，单独处理）
 * @param {Number} id - 书籍ID
 */
export async function getBookBinaryStreamService(id) {
    const response = await getPrivateBookBinaryStream(id)
    console.log('书籍流获取成功：', response.status) // 二进制流用状态码判断

    // 关键：把arraybuffer转成Blob（指定EPUB的MIME类型）
    return new Blob([response.data], {type: 'application/epub+zip'}) // 返回Blob对象，方便后续处理
}

/**
 * 获取当前用户私有书籍列表
 */
export async function listCurrentUserPrivateBooksService() {
    const response = await listCurrentUserPrivateBooks()
    console.log('私有书籍列表结果：', response.data.code, response.data.message)
    return response.data.data
}

/**
 * 根据文件哈希获取【私有】书籍详情（直接返回书籍详情对象，封装私有书籍接口）
 * @param {string} fileHash - 私有书籍文件哈希值（必传，非空/非空白）
 * @returns {Promise<Object|null>} 私有书籍详情对象（接口失败/无数据时返回null）
 */
export const getPrivateBookDetailByFileHash = async (fileHash) => {
    try {
        // 调用私有书籍的基础请求接口
        const response = await getBookByFileHash(fileHash)
        // 直接返回AppResponse中的data层数据（剥离响应壳，仅返回书籍详情）
        console.log(response.data.data)
        return response.data?.data || null
    } catch (error) {
        console.error('根据哈希获取私有书籍详情失败：', error.message)
        // 失败时返回null，避免上游组件因异常崩溃
        return null
    }
}