// 导入第一层封装的请求函数

import {getUserBookReadingProgress, persistBookProgress, uploadBookProgress} from "@/api/book/progress.api.js";

/**
 * 第二层封装：保存书籍阅读进度（组件/函数直接调用）
 * @param {Object} params - 简化后的参数（只传关键信息）
 * @param {number} [params.publicBookId] - 公共书籍ID（二选一）
 * @param {number} [params.privateBookId] - 私有书籍ID（二选一）
 * @param {string} params.fileHash - 书籍哈希值（必填）
 * @param {Object} params.location - 阅读位置（必填，支持 epub 原生 location 或自定义结构）
 * @returns {Promise<Object>} - 上传结果（成功返回进度数据，失败返回错误信息）
 */
export async function saveBookProgress(params) {
    try {
        // 1. 参数校验：避免必填项缺失导致接口报错（提前拦截，更友好）
        const { publicBookId, privateBookId, fileHash, location } = params;

        // 校验必填项
        if (!fileHash) {
            throw new Error('保存阅读进度失败：书籍 fileHash 不能为空！');
        }
        if (!location) {
            throw new Error('保存阅读进度失败：阅读位置信息不能为空！');
        }
        // 校验 ID 二选一（如果接口要求必须传一个，可根据实际调整）
        if (!publicBookId && !privateBookId) {
            console.warn('警告：publicBookId 和 privateBookId 都未传入，可能影响进度关联！');
            // 若接口必须二选一，可打开下面的 throw：
            // throw new Error('保存阅读进度失败：publicBookId 和 privateBookId 必须传入一个！');
        }

        // 2. 构造接口需要的完整参数（适配第一层封装的格式）
        const progressData = {
            publicBookId: publicBookId || undefined, // 无则传 undefined（避免传 null 给接口）
            privateBookId: privateBookId || undefined,
            fileHash,
            // 适配 epub 原生 location 结构（如果你的 location 字段和接口要求不一致，这里统一转换）
            location: {
                locationIndex: location.locationIndex || location.index || 0, // 兼容不同字段名
                displayed: location.displayed || [],
                href: location.href || '',
                // 其他接口需要的 location 字段，按需补充（比如 chapter、offset 等）
                ...location // 保留传入的所有 location 字段，避免丢失信息
            }
        };

        // 3. 调用第一层封装的请求函数，发起上传
        const result = await uploadBookProgress(progressData);

        // 4. 统一成功处理（可选：比如打印日志、全局提示等）
        console.log(`书籍 ${fileHash} 阅读进度上传成功：`, result);
        // 若需要全局提示（比如 Element Plus 的 ElMessage），可导入使用：
        // ElMessage.success('阅读进度已自动保存～');

        return result; // 返回结果给调用方，方便后续处理

    } catch (error) {
        // 5. 统一错误处理（避免每个调用方都写 try/catch）
        const errorMsg = error.message || '阅读进度上传失败，请稍后重试！';
        console.error('阅读进度上传异常：', error);
        // 全局错误提示（可选，根据项目组件库调整）
        // ElMessage.error(errorMsg);

        // 返回 rejected Promise，让调用方也能捕获错误（灵活处理）
        return Promise.reject(new Error(errorMsg));
    }
}


/**
 * 第二层封装：持久化书籍进度到数据库（组件/函数直接调用）
 * @param {Object} params - 简化后的参数（只传关键信息）
 * @param {number} [params.publicBookId] - 公共书籍ID（二选一，必须是正整数）
 * @param {number} [params.privateBookId] - 私有书籍ID（二选一，必须是正整数）
 * @param {string} params.fileHash - 书籍哈希值（必填，需与书籍实际哈希一致）
 * @returns {Promise<Object>} - 持久化结果（成功返回数据，失败返回错误信息）
 */
export async function persistProgressToDB(params) {
    try {
        // 1. 解构参数，方便校验和处理
        let { publicBookId, privateBookId, fileHash } = params;

        // 2. 严格参数校验（适配后端 @ModelAttribute 接收要求，提前拦截无效参数）
        // 校验 fileHash 必填
        if (!fileHash || typeof fileHash !== 'string') {
            throw new Error('持久化进度失败：书籍 fileHash 不能为空，且必须是字符串！');
        }

        // 校验 publicBookId/privateBookId 二选一，且必须是正整数
        const hasPublicId = publicBookId !== undefined && publicBookId !== null;
        const hasPrivateId = privateBookId !== undefined && privateBookId !== null;

        if (!hasPublicId && !hasPrivateId) {
            throw new Error('持久化进度失败：publicBookId 和 privateBookId 必须传入一个！');
        }

        // 转换并校验 ID 为正整数（避免传字符串/负数/0，后端可能校验失败）
        if (hasPublicId) {
            publicBookId = Number(publicBookId);
            if (isNaN(publicBookId) || publicBookId <= 0 || !Number.isInteger(publicBookId)) {
                throw new Error('持久化进度失败：publicBookId 必须是正整数！');
            }
        }
        if (hasPrivateId) {
            privateBookId = Number(privateBookId);
            if (isNaN(privateBookId) || privateBookId <= 0 || !Number.isInteger(privateBookId)) {
                throw new Error('持久化进度失败：privateBookId 必须是正整数！');
            }
        }

        // 3. 构造接口要求的参数（适配 @ModelAttribute 接收格式，只传有效参数）
        const requestParams = {
            ...(hasPublicId && { publicBookId }), // 有则传，无则不包含该字段
            ...(hasPrivateId && { privateBookId }),
            fileHash // 必传字段
        };

        // 4. 调用第一层封装的请求函数（注意：这里是 params 传参，第一层已处理 Content-Type）
        const result = await persistBookProgress(requestParams);

        // 5. 统一成功处理（和之前的 saveBookProgress 保持风格一致）
        console.log(`书籍 ${fileHash} 进度已持久化到数据库：`, result);
        // 全局提示（可选，根据项目组件库调整，比如 Element Plus）
        // ElMessage.success('阅读进度已同步到数据库～');

        return result; // 返回结果给调用方

    } catch (error) {
        // 6. 统一错误处理（避免重复写 try/catch）
        const errorMsg = error.message || '进度持久化失败，请稍后重试！';
        console.error('进度持久化异常：', error);
        // 全局错误提示（可选）
        // ElMessage.error(errorMsg);

        // 返回 rejected Promise，支持调用方自定义处理
        return Promise.reject(new Error(errorMsg));
    }
}

/**
 * 第二层封装：获取用户书籍阅读进度（组件/函数直接调用）
 * @param {Object} params - 简化后的查询参数
 * @param {number} [params.publicBookId] - 公共书籍ID（二选一，必须是正整数）
 * @param {number} [params.privateBookId] - 私有书籍ID（二选一，必须是正整数）
 * @param {string} params.fileHash - 书籍哈希值（必填，需与书籍实际哈希一致）
 * @returns {Promise<Object>} - 进度数据（成功返回{location, ...}，失败返回错误信息）
 */
export async function getBookReadingProgress(params) {
    try {
        // 1. 解构参数，方便校验和处理
        let { publicBookId, privateBookId, fileHash } = params;

        // 2. 严格参数校验（GET请求参数错误会导致URL拼接异常，提前拦截）
        // 校验 fileHash 必填且为字符串
        if (!fileHash || typeof fileHash !== 'string') {
            throw new Error('获取阅读进度失败：书籍 fileHash 不能为空，且必须是字符串！');
        }

        // 校验 publicBookId/privateBookId 二选一，且为正整数
        const hasPublicId = publicBookId !== undefined && publicBookId !== null;
        const hasPrivateId = privateBookId !== undefined && privateBookId !== null;

        if (!hasPublicId && !hasPrivateId) {
            throw new Error('获取阅读进度失败：publicBookId 和 privateBookId 必须传入一个！');
        }

        // 转换并校验 ID 为正整数（兼容用户传入字符串类型的数字，如 "123" → 123）
        if (hasPublicId) {
            publicBookId = Number(publicBookId);
            if (isNaN(publicBookId) || publicBookId <= 0 || !Number.isInteger(publicBookId)) {
                throw new Error('获取阅读进度失败：publicBookId 必须是正整数！');
            }
        }
        if (hasPrivateId) {
            privateBookId = Number(privateBookId);
            if (isNaN(privateBookId) || privateBookId <= 0 || !Number.isInteger(privateBookId)) {
                throw new Error('获取阅读进度失败：privateBookId 必须是正整数！');
            }
        }

        // 3. 构造查询参数（只保留有效字段，避免多余参数拼接在URL上）
        const requestParams = {
            ...(hasPublicId && { publicBookId }),
            ...(hasPrivateId && { privateBookId }),
            fileHash
        };

        // 4. 调用第一层接口（GET请求，axios自动将params拼为URL查询参数）
        const progressData = await getUserBookReadingProgress(requestParams);

        // 5. 统一成功处理（格式化返回数据，方便组件直接使用）
        console.log(`成功获取书籍 ${fileHash} 的阅读进度：`, progressData);
        // 可选：格式化进度数据（比如补全默认值，避免组件使用时判空）
        const formattedProgress = {
            location: progressData.location || {}, // 阅读位置信息
            updateTime: progressData.updateTime || new Date().toISOString(), // 最后更新时间
            ...progressData // 保留所有返回字段
        };

        return formattedProgress; // 返回格式化后的进度数据

    } catch (error) {
        // 6. 统一错误处理（区分「无进度」和「请求失败」，更友好）
        const errorMsg = error.message || '获取阅读进度失败，请稍后重试！';
        console.error('获取阅读进度异常：', error);

        // 特殊处理：如果是接口返回「无进度」（假设后端返回404或特定提示）
        if (error.response?.status === 404 || error.message.includes('无进度')) {
            console.log(`书籍 ${params.fileHash} 暂无历史阅读进度`);
            return Promise.resolve(null); // 无进度时返回null，组件可识别并加载默认位置
        }

        // 其他错误返回rejected Promise
        return Promise.reject(new Error(errorMsg));
    }
}