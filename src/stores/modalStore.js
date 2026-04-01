import {defineStore} from 'pinia'

// 定义模态框仓库，key 为 modalStore
export const useModalStore = defineStore('modalStore', {
    state: () => ({
        // 四个主页面的模态框配置（按需扩展）

        pageModals: {
            ChatListPage: { // 对应 AI 会话列表/详情页
                // 👇 已移除：attachSelectModal 迁移到 componentModals 下
            },
            CreatePage: { // 创作中心页面
                // 可扩展创作页的模态框，如：发布确认框
                publishConfirmModal: {
                    visible: false
                },
                // 新增：属性详情气泡
                statusDetailPopup: {
                    visible: false, // 显示/隐藏
                    propName: '',   // 属性名（如“体力”）
                    propDesc: '',   // 属性详情
                    position: {x: 0, y: 0} // 气泡定位坐标
                }
            },
            MessagePage: { // 消息中心页面
                // 可扩展消息页的模态框，如：删除确认框
                deleteConfirmModal: {visible: false}
            },
            MyPage: {
                MyVerificationModal: {
                    Visible: false, // 真人验证弹窗显隐
                    // 可扩展其他参数：比如标题、内容等
                    title: '真人验证'
                },
                // 新增退出登录弹窗状态
                QuitLogin: {
                    Visible: false // 控制QuitLogin.vue的显隐
                },
                // 后续MyPage新增弹窗，都加在这里
                OtherModal: {
                    Visible: false
                },
                // 新增：充值挡位弹窗（仅保留Visible参数）
                RechargeAmountModal: {
                    Visible: false
                },
                // 新增：创建订单弹窗配置（两个参数：显隐 + 选中金额）
                CreateOrderModal: {
                    Visible: false,
                    amount: 0 // 存储选中的充值金额
                }
            },
        },
        // 👇 新增（修正拼写）：组件级弹窗，和 pageModals 平齐
        componentModals: {
            attachSelectModal: { // 附加物选择框（专属 AiChat 路由）
                visible: false, // 弹窗显隐状态
                // 可扩展弹窗其他配置：标题、数据等
                title: '附加物选择',
                options: ['选项1', '选项2', '选项3'] // 示例选项，可自定义
            },
            // ConfirmModal 确认弹窗
            ConfirmModal: {
                visible: false,
                overlayVisible: true,
                title: '请确认',
                confirmFn: () => {},
                cancelFn: () => {},
                // 👇 新增：控制输入框显示 + 存储输入内容（响应式）
                showInput: false,    // 是否显示输入框
                inputValue: ''       // 输入框内容（双向绑定）
            },
            // 👇 核心修改：重构contextMenu的position结构，支持左上+左下两个坐标
            // modalStore 中的 contextMenu 结构修改
            // modalStore 中 contextMenu 的初始化代码（核心修复）
            contextMenu: {
                visible: false,
                element: null,
                originalStyles: { // 必须显式初始化，避免undefined
                    zIndex: '',     // 默认空字符串
                    position: ''    // 默认空字符串
                },
                position: {
                    topLeft: { left: 0, top: 0 },
                    bottomLeft: { left: 0, top: 0 }
                },
                currentItem: null // 如有其他字段也保留
            },
            // 👇 新增：消息长按菜单（完全同结构）
            messageOptionMenu: {
                visible: false,
                element: null,
                originalStyles: {
                    zIndex: '',
                    position: ''
                },
                // 👇 重命名为：上中 / 下中
                position: {
                    topMiddle: { left: 0, top: 0 },     // 元素顶部中心点
                    bottomMiddle: { left: 0, top: 0 }   // 元素底部中心点
                },
                currentItem: null
            }
        }
    }),

    actions: {
        // ========== 附加物选择框 专属方法 ==========
        showAttachSelectModal() {
            // 🔥 关键修改：路径从 pageModals.ChatListPage 改为 componentModals
            this.componentModals.attachSelectModal.visible = true
        },
        hideAttachSelectModal() {
            // 🔥 关键修改：路径从 pageModals.ChatListPage 改为 componentModals
            this.componentModals.attachSelectModal.visible = false
        },

        // ========== 弹出菜单 专属方法（对外调用） ==========
        // 显示菜单：（只存数据，不改 DOM 样式）
        showContextMenu(element, item) {
            if (!element || !item) return; // 双重防御，杜绝null

            // 存储DOM元素 + 当前会话项（内部统一处理）
            this.componentModals.contextMenu.element = element;
            this.componentModals.contextMenu.currentItem = item;

            // 计算坐标（原有逻辑不动）
            const rect = element.getBoundingClientRect();
            this.componentModals.contextMenu.position.topLeft = {
                left: rect.left,
                top: rect.top
            };
            this.componentModals.contextMenu.position.bottomLeft = {
                left: rect.left,
                top: rect.top + rect.height
            };

            // 显示菜单
            this.componentModals.contextMenu.visible = true;
        },

        // 隐藏菜单（只重置状态，不恢复样式）
        hideContextMenu() {
            // 只重置菜单状态，CSS类会自动消失
            this.componentModals.contextMenu.visible = false;
            this.componentModals.contextMenu.element = null;
            this.componentModals.contextMenu.currentItem = null;
            console.log('弹出菜单已隐藏，样式自动恢复');
        },

        // ========== 消息长按菜单 专属方法（对外调用） ==========
        // 显示消息菜单：计算 上中 / 下中 坐标
        showMessageOptionMenu(element, item) {
            if (!element || !item) return;

            this.componentModals.messageOptionMenu.element = element;
            this.componentModals.messageOptionMenu.currentItem = item;

            const rect = element.getBoundingClientRect();
            // 👇 计算【水平居中】坐标（关键修改）
            const centerX = rect.left + rect.width / 2;

            // 赋值：上中、下中
            this.componentModals.messageOptionMenu.position.topMiddle = {
                left: centerX,
                top: rect.top
            };
            this.componentModals.messageOptionMenu.position.bottomMiddle = {
                left: centerX,
                top: rect.top + rect.height
            };

            this.componentModals.messageOptionMenu.visible = true;
        },

        // 隐藏消息菜单（只重置状态，不恢复样式）
        hideMessageOptionMenu() {
            // 只重置菜单状态，CSS类会自动消失
            this.componentModals.messageOptionMenu.visible = false;
            this.componentModals.messageOptionMenu.element = null;
            this.componentModals.messageOptionMenu.currentItem = null;
            console.log('消息长按菜单已隐藏，样式自动恢复');
        },

        // 显示气泡：你给的方法逻辑，先关旧的再开新的，参数匹配
        showStatusDetailPopup(propName, propDesc, position) {
            // 核心：新点旧关，保证单实例
            this.hideStatusDetailPopup()
            // 赋值新状态
            this.pageModals.CreatePage.statusDetailPopup = {
                visible: true,
                propName,
                propDesc,
                position // 头部传入的鼠标点击坐标
            }
        },
        // 隐藏气泡：清空所有参数，恢复初始状态
        hideStatusDetailPopup() {
            this.pageModals.CreatePage.statusDetailPopup = {
                visible: false,
                propName: '',
                propDesc: '',
                position: {x: 0, y: 0}
            }
        },

        // ConfirmModal 专用：显示弹窗（可传标题+回调）
        // 新增参数 showInput = false（默认隐藏输入框）
        showConfirmModal(
            title = '请确认',
            confirmFn = () => {},
            cancelFn = () => {},
            showInput = false  // 👈 新增
        ) {
            const modal = this.componentModals.ConfirmModal;
            modal.title = title;
            modal.confirmFn = confirmFn;
            modal.cancelFn = cancelFn;
            modal.visible = true;
            // 👇 新增：赋值是否显示输入框 + 清空上次输入内容
            modal.showInput = showInput;
            modal.inputValue = '';
        },

        // ConfirmModal 专用：隐藏弹窗
        hideConfirmModal() {
            const modal = this.componentModals.ConfirmModal;
            modal.visible = false;
            // 重置回调
            modal.confirmFn = () => {};
            modal.cancelFn = () => {};
            // 👇 新增：重置输入框状态（和显示状态）
            modal.showInput = false;
            modal.inputValue = '';
        },

        // ========== 通用方法（适配Visible大写规范） ==========
        // 显示指定页面的指定模态框（修正：对齐modal里的Visible首字母大写）
        showModal(pageKey, modalKey) {
            if (this.pageModals[pageKey]?.[modalKey]) {
                this.pageModals[pageKey][modalKey].Visible = true // 改为Visible（和modal定义一致）
            }
        },
        // 隐藏指定页面的指定模态框（修正：对齐Visible大写）
        hideModal(pageKey, modalKey) {
            if (this.pageModals[pageKey]?.[modalKey]) {
                this.pageModals[pageKey][modalKey].Visible = false // 改为Visible
            }
        },

        // ========== MyPage 弹窗专属方法（全量适配新增弹窗） ==========
        // 1. 真人验证弹窗
        openMyPageVerificationModal() {
            this.pageModals.MyPage.MyVerificationModal.Visible = true
        },
        closeMyPageVerificationModal() {
            this.pageModals.MyPage.MyVerificationModal.Visible = false
        },

        // 2. 退出登录弹窗（修正：归属页从SettingsPage改为MyPage）
        openQuitLoginModal() {
            this.pageModals.MyPage.QuitLogin.Visible = true
        },
        hideQuitLoginModal() {
            this.pageModals.MyPage.QuitLogin.Visible = false
        },

        // 3. 其他通用弹窗
        openMyPageOtherModal() {
            this.pageModals.MyPage.OtherModal.Visible = true
        },
        closeMyPageOtherModal() {
            this.pageModals.MyPage.OtherModal.Visible = false
        },

        // 4. 充值挡位弹窗
        openMyPageRechargeAmountModal() {
            this.pageModals.MyPage.RechargeAmountModal.Visible = true
        },
        closeMyPageRechargeAmountModal() {
            this.pageModals.MyPage.RechargeAmountModal.Visible = false
        },

        // 5. 创建订单弹窗（含金额赋值 + 联动关闭充值弹窗）
        openMyPageCreateOrderModal(amount) {
            // 打开订单弹窗时，先关闭充值挡位弹窗（两者不共存）
            this.closeMyPageRechargeAmountModal();
            this.pageModals.MyPage.CreateOrderModal.Visible = true;
            this.pageModals.MyPage.CreateOrderModal.amount = amount; // 存储选中的充值金额
        },
        closeMyPageCreateOrderModal() {
            this.pageModals.MyPage.CreateOrderModal.Visible = false;
            // 关闭订单弹窗时，重新打开充值挡位弹窗（可选：根据业务需求决定是否保留）
            this.openMyPageRechargeAmountModal();
        },
    }
})