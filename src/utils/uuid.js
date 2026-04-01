// src/utils/uuid.js

/**
 * 生成标准 UUIDv4（现代浏览器原生方式）
 */
export function generateUUID() {
    // 优先使用浏览器原生的高强度加密随机数接口
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // 兼容性兜底（如果是在极旧的浏览器或特殊环境）
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 可选：导出默认函数，简化导入
export default generateUUID;