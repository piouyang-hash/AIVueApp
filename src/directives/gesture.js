import Hammer from 'hammerjs';

// 通用手势指令创建函数（新增pan支持）
const createGestureDirective = (gestureType, options = {}) => {
    const bindGesture = (el, binding) => {
        let mc = el._hammerManager;
        if (!mc) {
            mc = new Hammer.Manager(el, {
                inputClass: Hammer.TouchMouseInput,
                touchAction: 'pan-y', // 允许上下滚动，不冲突
                recognizers: [
                    [Hammer.Press, { time: 500, threshold: 5, ...options }],
                    [Hammer.Swipe, {
                        direction: Hammer.DIRECTION_ALL,
                        threshold: 30,
                        velocity: 0.5,
                        ...options
                    }],
                    // 👇 新增：Pan 拖拽识别器（核心！）
                    [Hammer.Pan, {
                        direction: Hammer.DIRECTION_HORIZONTAL, // 仅水平拖拽
                        threshold: 1, // 轻微滑动就触发
                        ...options
                    }]
                ]
            });
            el._hammerManager = mc;
        }

        // 先解绑旧事件
        mc.off('press swipe pan');

        // 绑定事件（原有 + 新增 pan）
        switch (gestureType) {
            case 'longpress':
                mc.on('press', (e) => {
                    e.preventDefault();
                    binding.value?.(e);
                });
                break;
            case 'swipeleft':
                mc.on('swipe', (e) => {
                    e.direction === Hammer.DIRECTION_LEFT && binding.value?.(e);
                });
                break;
            case 'swiperight':
                mc.on('swipe', (e) => {
                    e.direction === Hammer.DIRECTION_RIGHT && binding.value?.(e);
                });
                break;
            case 'swipeup':
                mc.on('swipe', (e) => {
                    e.direction === Hammer.DIRECTION_UP && binding.value?.(e);
                });
                break;
            case 'swipedown':
                mc.on('swipe', (e) => {
                    e.direction === Hammer.DIRECTION_DOWN && binding.value?.(e);
                });
                break;
            // 👇 新增：水平拖拽 pan 事件
            case 'pan':
                mc.on('panstart panmove panend', (e) => {
                    binding.value?.(e); // 把完整拖拽事件传给方法
                });
                break;
        }
    };

    return {
        mounted(el, binding) {
            bindGesture(el, binding);
        },
        updated(el, binding) {
            if (binding.value !== binding.oldValue) {
                bindGesture(el, binding);
            }
        },
        unmounted(el) {
            if (el._hammerManager) {
                el._hammerManager.off();
                el._hammerManager.destroy();
                delete el._hammerManager;
            }
        }
    };
};

// 👇 导出指令：新增 pan
export default {
    longpress: createGestureDirective('longpress'),
    swipeleft: createGestureDirective('swipeleft'),
    swiperight: createGestureDirective('swiperight'),
    swipeup: createGestureDirective('swipeup'),
    swipedown: createGestureDirective('swipedown'),
    pan: createGestureDirective('pan'), // 🔥 关键新增
};