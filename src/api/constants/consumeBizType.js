// 消费业务类型常量（对应后端 ConsumeBizTypeEnum 枚举）
export const CONSUME_BIZ_TYPE = {
    // 购买书籍：对应后端 BOOK 枚举项
    BOOK: {
        bizCode: 'book',    // 前端传递的字符串Code
        desc: '购买书籍'    // 业务描述（可选，用于页面展示）
    },
    // 购买会员：对应后端 MEMBER 枚举项
    MEMBER: {
        bizCode: 'member',  // 前端传递的字符串Code
        desc: '购买会员'    // 业务描述（可选，用于页面展示）
    }
};