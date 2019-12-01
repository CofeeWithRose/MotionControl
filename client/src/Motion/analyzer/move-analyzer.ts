import { ACTIONS } from "../actions";
import { MotionInfo } from "..";

export type MoveResult = ACTIONS.IDLE | ACTIONS.FORWARD | ACTIONS.BACK | ACTIONS.LEFT | ACTIONS.RIGHT | ACTIONS.BACK | null

export class MoveOption {

    constructor(
        /**
         * 1右手，-1左手.
         */
       public hand: 1 | -1= 1,

        /**
         * 触发的阈值.
         */
        public triggerRate: number = 0.4,

        /**
         * 用户习惯，正常状态下，手握不正.
         */
        public forwordFix: number = 0.1,

        /**
         * 右偏.
         */
        public leftFix:number = 0.1,
    ) { }

}

export default class MoveAnalyzer {


    protected state: MoveResult = ACTIONS.IDLE


    constructor(
        protected moveOptions: MoveOption,
    ) { }


    isTrigger(motionInfo: MotionInfo): MoveResult {
        const state = this.getActionState(motionInfo)
        const reslt = state === this.state ? null : state
        this.state = state
        return reslt
    }

    protected getActionState(motionInfo: MotionInfo) {
        const { x, y, z } = motionInfo.data
        const forwordRate = x / y + this.moveOptions.forwordFix
        const leftRate = z / y + this.moveOptions.leftFix
        const forwordRateAbs = Math.abs(forwordRate)
        const leftRateAbs = Math.abs(leftRate)
        let state: MoveResult
        if (leftRateAbs > this.moveOptions.triggerRate || forwordRateAbs > this.moveOptions.triggerRate) {
            if (forwordRateAbs > leftRateAbs) {
                if (forwordRate * this.moveOptions.hand > 0) {
                    state = ACTIONS.FORWARD
                } else {
                    state = ACTIONS.BACK
                }
            } else {
                if (leftRate * this.moveOptions.hand > 0) {
                    state = ACTIONS.LEFT
                } else {
                    state = ACTIONS.RIGHT
                }
            }
        } else {
            state = ACTIONS.IDLE
        }

        return state
    }

    setHand(direction: 1 | -1): void {
        this.moveOptions.hand = direction
    }
}