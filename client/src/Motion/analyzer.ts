import { MotionInfo } from "."
import ws, { WSMessage } from "../ws-service/ws"
import { tt } from "../ws-service/util"

/**
 * 存储一段数据用于分析.
 */
// export class MotionsInfo {

//     constructor(
//         /**
//          * 每种数据的存储数量.
//          */
//         private maxSize: number
//     ) { }


//     /**
//      * 旋转状态数据.
//      */
//     private rotation: MotionInfo[] = []


//     /**
//      * 旋转加速度传感器.
//      */
//     private rotationAcc: MotionInfo[] = []

//     /**
//      * 直线加速度传感器.
//      */
//     private motionAcc: MotionInfo[] = []

//     /**
//      * 
//      * @param motionInfo 添加数据
//      */
//     push(motionInfo: MotionInfo) {
//         const arr = this[motionInfo.type]
//         arr.push(motionInfo)
//         if(arr.length >this.maxSize){
//             arr.shift()
//         }
//     }



// }

/**
 * 速度分析结果枚举.
 */
export class MotionResult {
    X? = false
    Y?=  false
    Z? = false
} 

/**
 * 动作的枚举.
 */
export enum ActionNames {
 DEFEND = '0',
 HIT = '1'
}

export class AccAnalyzerOptoins {
    constructor(
        /**
         * 触发动作的阈值.
         */
        public readonly max= 10, 

        /**
         * 触发的加速度方向 0 表示都会触发.
         */
        public readonly triggerDirect: 1 | -1 | 0 = 1, 
    ){}
}

export class AccAnalyzer {

    constructor(
       private options= new AccAnalyzerOptoins()
    ){}

    private accState: 0| 1 | 2 = 2

    private lastAcc = 0

    /**
     * 先达到阈值，再回到原来的相反数，一次动作结束.
     */
    isTrigger(acc:number): boolean{

        const abs = Math.abs(acc)
        if(this.accState === 0 && this.lastAcc * acc < 0){
            this.accState =1
            this.lastAcc = acc
        }else if(this.accState === 1 && this.lastAcc * acc < 0){
            this.accState = 2
            this.lastAcc = acc
        }

        if(this.accState === 2 && abs >= this.options.max && acc * this.options.triggerDirect >=0){
            this.accState = 0;
            this.lastAcc = acc
            return true
        }
        return false
    }

    setHand(direct: 1|-1){
        const {max} = this.options
        this.options = new AccAnalyzerOptoins(max, direct)
    }
}

export default class Analyzer {

    // private info = new MotionsInfo(20)
    private accXAnalyzer = new AccAnalyzer({max: 40, triggerDirect: 1})

    private roAccYAnanlyzer = new AccAnalyzer({max: 400, triggerDirect: 1})

    analyzeData(motionInfo: MotionInfo) {
       let moAcc: MotionResult ={}
       let roAcc: MotionResult ={}
        if(motionInfo.type === 'motionAcc'){
            moAcc = this.analyzeMotionAcc(motionInfo)
        }
        if(motionInfo.type === 'rotationAcc'){
            roAcc = this.analizeRotateAcc(motionInfo)
        }
        const res = this.analyzeResult(moAcc, roAcc)
        if(res){
            this.sendResult(res)
        }
        
    }

    /**
     * 右手1， 左手 -1.
     */
    setHand(direct: 1|-1){
        this.accXAnalyzer.setHand(direct)
        this.roAccYAnanlyzer.setHand(direct)
    }

    protected analyzeResult(moAcc: MotionResult, roAcc: MotionResult): ActionNames|null  {
       
        if(roAcc.Y){
            // ws.send(new WSMessage('log', JSON.stringify({moAcc, roAcc})))
            // ws.send(new WSMessage('action', 'defend'))
            return ActionNames.DEFEND
        }
        if(moAcc.X){
            // ws.send(new WSMessage('log', JSON.stringify({moAcc, roAcc})))
            // ws.send(new WSMessage('action', 'hit'))
            return ActionNames.HIT
        }
        return null
    }

    protected sendResult = tt((accName: ActionNames) => {
        ws.send(new WSMessage('action', accName))
    }, 0)

    
    protected analyzeMotionAcc(motionInfo: MotionInfo): MotionResult {
        const res = new  MotionResult()
       const isTriggerX =  this.accXAnalyzer.isTrigger(motionInfo.data.x)
        // if (motionInfo.data.x > this.mmx) {
        //     this.mmx = motionInfo.data.x
        //     ws.send(new WSMessage('log', `'mmxy: '${this.mmx}`))
        // }
        if(isTriggerX){
            res.X = true
        }
        return res
    }

    // private mmx = 0;
    protected analizeRotateAcc(motionInfo: MotionInfo): MotionResult {
        const res = new  MotionResult()
        const isTriggerY =  this.roAccYAnanlyzer.isTrigger(motionInfo.data.y)
       
        if(isTriggerY){
            res.Y = true
        }
        return res
    }


}
