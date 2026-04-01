import { bookRequest, withAuth } from "@/utils/request.js";

/**
 * 将书籍加入当前登录用户的图书馆
 * @param {Object} userLibrary - 加入图书馆的书籍信息
 * @param {string} [userLibrary.publicBookId] - 公有书籍ID（与privateBookId二选一）
 * @param {string} [userLibrary.privateBookId] - 私有书籍ID（与publicBookId二选一）
 * @param {string} userLibrary.fileHash - 书籍文件哈希值（必填）
 * @param {number} [userLibrary.userId] - 用户ID（前端无需传，后端会覆盖为当前登录用户）
 * @param {string} [userLibrary.userRole] - 用户角色（前端无需传，后端会覆盖为当前登录用户）
 * @returns {Promise} 请求Promise对象
 */
export function addBookToLibraryApi(userLibrary) {
    return withAuth(bookRequest, {
        method: 'POST',
        url: '/library-api/books/add-to-library', // 后端接口完整路径：@RequestMapping("/library") + @PostMapping("/add-to-library")
        data: userLibrary, // JSON格式传参（适配后端@RequestBody）
        // JSON请求无需手动设置Content-Type，axios会自动设置为application/json
        headers: {
            'Content-Type': 'application/json'
        }
    })
}