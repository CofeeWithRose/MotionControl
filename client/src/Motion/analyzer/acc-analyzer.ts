export class AccAnalyzerOptoins {
    constructor(
        /**
         * 触发动作的阈值.
         */
        public readonly max = 10,

        /**
         * 触发的加速度方向 0 表示都会触发.
         */
        public readonly triggerDirect: 1 | -1 | 0 = 1,
    ) { }
}

/**
 * 速度分析结果枚举.
 */
export class AccAnalyzeResult {
    X?: 0 | 1 | -1 = 0
    Y?: 0 | 1 | -1 = 0
    Z?: 0 | 1 | -1 = 0
}

/**
 * 加速度结果分析.
 */
export class AccAnalyzer {

    constructor(
        private options = new AccAnalyzerOptoins()
    ) { }

    private accState: 0 | 1 | 2 = 2

    private lastAcc = 0

    /**
     * 先达到阈值，再回到原来的相反数，一次动作结束.
     */
    isTrigger(acc: number): boolean {

        const abs = Math.abs(acc)
        if (this.accState === 0 && this.lastAcc * acc < 0) {
            this.accState = 1
            this.lastAcc = acc
        } else if (this.accState === 1 && this.lastAcc * acc < 0) {
            this.accState = 2
            this.lastAcc = acc
        }

        if (this.accState === 2 && abs >= this.options.max && acc * this.options.triggerDirect >= 0) {
            this.accState = 0;
            this.lastAcc = acc
            return true
        }
        return false
    }

    setHand(direct: 1 | -1) {
        const { max } = this.options
        this.options = new AccAnalyzerOptoins(max, direct)
    }
}
