import { MotionInfo } from ".."
import ws, { WSMessage } from "../../ws-service/ws"
import { tt } from "../../ws-service/util"
import { ACTIONS } from "../actions"
import { AccAnalyzer, AccAnalyzeResult } from "./acc-analyzer"
import MoveAnalyzer, { MoveResult, MoveOption } from "./move-analyzer"



export default class Analyzer {

    // private info = new MotionsInfo(20)
    private accXAnalyzer = new AccAnalyzer({ max: 20, triggerDirect: 1 })

    private roAccY1Ananlyzer = new AccAnalyzer({ max: 400, triggerDirect: 1 })

    private roAccY_1Ananlyzer = new AccAnalyzer({ max: 200, triggerDirect: -1 })

    private moveAnalyzer =new MoveAnalyzer(new MoveOption())

    analyzeData(motionInfo: MotionInfo) {
        let moAcc: AccAnalyzeResult = {}
        let roAcc: AccAnalyzeResult = {}
        let move: MoveResult = null
        if (motionInfo.type === 'motionAcc') {
            moAcc = this.analyzeMotionAcc(motionInfo)
        }
        if (motionInfo.type === 'rotationAcc') {
            roAcc = this.analizeRotateAcc(motionInfo)
        }
        if(motionInfo.type === 'gravity'){
            move = this.moveAnalyzer.isTrigger(motionInfo)
        }

        const res = this.analyzeResult(moAcc, roAcc, move)
        if (res) {
            this.sendResult(res)
        }
    }

    /**
     * 右手1， 左手 -1.
     */
    setHand(direct: 1 | -1) {
        this.accXAnalyzer.setHand(direct)
        this.roAccY1Ananlyzer.setHand(direct)
        this.roAccY_1Ananlyzer.setHand(-1 * direct as 1 | -1)
    }

    protected analyzeResult(moAcc: AccAnalyzeResult, roAcc: AccAnalyzeResult, move: MoveResult): ACTIONS | null {

        if (1 === roAcc.Y) {
            return ACTIONS.DEFEND_START
        }
        if (-1 === roAcc.Y) {
            return ACTIONS.DEFEND_END
        }
        if (moAcc.X) {
            return ACTIONS.ATTACK
        }
        if(move){
            return move
        }
        return null
    }

    protected sendResult = tt((accName: ACTIONS) => {
        ws.send(new WSMessage('action', accName))
    }, 0)


    protected analyzeMotionAcc(motionInfo: MotionInfo): AccAnalyzeResult {
        const res = new AccAnalyzeResult()
        const isTriggerX = this.accXAnalyzer.isTrigger(motionInfo.data.x)

        if (isTriggerX) {
            res.X = 1
        }
        return res
    }

    // private mmx = 0;
    protected analizeRotateAcc(motionInfo: MotionInfo): AccAnalyzeResult {
        const res = new AccAnalyzeResult()
        const isTriggerY = this.roAccY1Ananlyzer.isTrigger(motionInfo.data.y)
        const isTrigger_Y = this.roAccY_1Ananlyzer.isTrigger(motionInfo.data.y)
        if (isTriggerY) {
            res.Y = 1
        }
        if (isTrigger_Y) {
            res.Y = -1
        }
        return res
    }


}
