// @/stores/localStorageStore.js
import { defineStore } from 'pinia';

/**
 * 本地书籍进度管理 Store（内存存储，后续可扩展持久化）
 * 核心：管理多本书的阅读进度数组，支持单本/批量操作
 */
export const useLocalStorageStore = defineStore('localStorageStore', {
    // ========== 第一步：定义状态（核心数据） ==========
    state: () => ({
        /**
         * 用户书籍进度数组（每一项对应一本书的进度）
         * 数据结构示例：
         * [
         *   {
         *     fileHash: 'xxx123', // 书籍唯一标识（必填，用于区分不同书）
         *     progress: {         // 进度详情（自定义结构，适配epub阅读）
         *       cfi: 'epubcfi(/6/2[chapter1]!/4/2/12)',
         *       page: 15,
         *       chapterIndex: 0
         *     }
         *   },
         *   { fileHash: 'yyy456', progress: { cfi: '', page: 1 } }
         * ]
         */
        bookProgressList: []
    }),

    // ========== 第二步：定义 Getters（获取数据） ==========
    getters: {
        /**
         * 获取全部书籍进度数组
         * @returns {Array} 所有书籍的进度列表
         */
        getBookProgressList: (state) => state.bookProgressList,

        /**
         * 按书籍 fileHash 获取单本书的进度（常用！）
         * @returns {Function} 接收 fileHash，返回对应进度（无则返回null）
         */
        getBookProgressByHash: (state) => (fileHash) => {
            // 精准匹配书籍唯一标识
            return state.bookProgressList.find(item => item.fileHash === fileHash) || null;
        }
    },

    // ========== 第三步：定义 Actions（修改数据） ==========
    actions: {
        /**
         * 1. 批量设置书籍进度数组（覆盖式，适用于初始化/全量替换）
         * @param {Array} progressList - 完整的书籍进度数组（结构同 state.bookProgressList）
         */
        setBookProgressList(progressList) {
            // 严格校验数组类型，避免脏数据
            this.bookProgressList = Array.isArray(progressList) ? progressList : [];
        },

        /**
         * 2. 添加/更新单本书的进度（核心方法：幂等，存在则更新，不存在则新增）
         * @param {Object} progressItem - 单本书进度项
         * @param {string} progressItem.fileHash - 书籍唯一标识（必填）
         * @param {Object} progressItem.progress - 进度详情（必填）
         */
        addBookProgress(progressItem) {
            // 校验必填字段，避免无效数据
            if (!progressItem?.fileHash || !progressItem?.progress) {
                console.warn('添加进度失败：缺少fileHash或progress字段');
                return;
            }

            // 查找当前书是否已有进度
            const index = this.bookProgressList.findIndex(
                item => item.fileHash === progressItem.fileHash
            );

            if (index > -1) {
                // 存在：更新进度
                this.bookProgressList[index].progress = progressItem.progress;
            } else {
                // 不存在：新增进度
                this.bookProgressList.push({
                    fileHash: progressItem.fileHash,
                    progress: progressItem.progress
                });
            }
        },

        /**
         * 3. 清空所有书籍进度数组
         */
        clearBookProgressList() {
            this.bookProgressList = [];
        }
    }
});

/**
 * ====================== 基础使用示例（一步一步来） ======================
 * 核心流程：导包 → 实例化 → 调用方法（add/get/set/clear）
 */
// 1. 导入Store（在组件/文件中）
// import { useLocalStorageStore } from '@/stores/localStorageStore';

// 2. 实例化Store（组件内 setup/script setup 中执行）
// const localStore = useLocalStorageStore();

// 3. 新增/更新单本书进度（最常用，翻页时调用）
// localStore.addBookProgress({
//   fileHash: 'book123_hash', // 你的书籍唯一标识
//   progress: {
//     cfi: 'epubcfi(/6/2[chapter1]!/4/2/12)',
//     page: 15,
//     chapterIndex: 0
//   }
// });

// 4. 获取单本书进度（初始化书籍时调用）
// const bookProgress = localStore.getBookProgressByHash('book123_hash');
// if (bookProgress) {
//   console.log('当前书进度：', bookProgress.progress);
//   // 跳转到对应进度：rendition.display(bookProgress.progress.cfi)
// } else {
//   console.log('暂无该书籍进度，显示第一页');
// }

// 5. 批量设置进度（适用于初始化导入）
// localStore.setBookProgressList([
//   { fileHash: 'book123_hash', progress: { cfi: '', page: 1 } },
//   { fileHash: 'book456_hash', progress: { cfi: 'epubcfi(/6/2[chapter2]!/4/2)', page: 30 } }
// ]);

// 6. 清空所有进度（退出阅读/登出时调用）
// localStore.clearBookProgressList();

/**
 * 关键注意点：
 * 1. 目前仅内存存储，刷新/重启软件后进度丢失（后续可加Pinia持久化插件）；
 * 2. addBookProgress 是幂等的，重复调用不会新增重复项，只会更新进度；
 * 3. fileHash 是核心标识，必须保证每本书的 fileHash 唯一；
 */