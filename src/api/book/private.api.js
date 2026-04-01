import {bookRequest, withAuth} from "@/utils/request.js";

export function uploadPrivateBook(file) {
    // 创建FormData对象（适配multipart/form-data格式）
    const formData = new FormData();
    formData.append('file', file); // 对应后端@RequestPart("file")参数

    return withAuth(bookRequest, {
        method: 'POST',
        url: '/private-api/books/private-books/upload',
        data: formData,
        // 上传文件时需设置Content-Type为multipart/form-data（axios会自动处理，无需手动设置）
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export function getPrivateBookBinaryStream(id) {
    return withAuth(bookRequest, {
        method: 'GET',
        url: `/private-api/books/private-books/${id}/binary`,
        responseType: 'arraybuffer' // 关键：指定响应类型为二进制流
    })
}


export function listCurrentUserPrivateBooks() {
    return withAuth(bookRequest, {
        method: 'GET',
        url: '/private-api/books/private-books/list'
    })
}

/**
 * 根据文件哈希查询当前用户私有书籍详情
 * @param {string} fileHash - 书籍文件哈希值（必传，非空/非空白）
 */
export function getBookByFileHash(fileHash) {
    return withAuth(bookRequest, {
        method: 'GET',
        // 拼接完整路径：前缀(private-api/books) + 资源路径(private-books/{fileHash})
        url: `/private-api/books/${fileHash}`
    })
}