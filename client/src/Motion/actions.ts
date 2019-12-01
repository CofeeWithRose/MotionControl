/**
 * 动作的枚举.
 * 只能为整数.
 */
export enum ACTIONS {
    /**
     * 进入防御状态.
     */
    DEFEND_START = 1,
    /**
     * 结束防御状态.
     */
    DEFEND_END = 2,
    /**
     * 攻击.
     */
    ATTACK = 3,
    /**
     * 空闲状态.
     */
    IDLE = 4,
    /**
     * 前进.
     */
    FORWARD = 5,
    /**
     * 后退.
     */
    BACK = 6,
    /**
     * 左移动.
     */
    LEFT = 7,
    /**
     * 右移动.
     */
    RIGHT = 8,
}
