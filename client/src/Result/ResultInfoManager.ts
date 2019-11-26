import { MotionInfo } from "../Motion"

/**
 * 管理需要渲染的数据.
 */
export default class ResultInfoManager {

  constructor(public MAX: number){}

  protected rotateList: MotionInfo[] = []

  protected unRenederedRotateNum = 0


  protected rotateAccList:MotionInfo[] = []

  protected unRenederedRotateAccNum = 0

  protected motionAccList: MotionInfo[] = []

  protected unRenederedMotionAccNum = 0

  /**
   * 取值默认用于渲染.
   */
  get RotateList(){
    return  this.rotateList
  }

  get RotateAccList(){
    return  this.rotateAccList
  }

  get MotionAccList(){
    return  this.motionAccList
  }
  

  get RotateListStartIndex(){
    return this.rotateList.length - this.unRenederedRotateNum
  }

  get RotateAccListStartIndex(){
    return this.rotateAccList.length - this.unRenederedRotateAccNum
  }

  get MotionAccListStartIndex(){
    return this.motionAccList.length - this.unRenederedMotionAccNum
  }
 

  pushRotate(motionInfo: MotionInfo){
    this.rotateList.push(motionInfo)
    this.unRenederedRotateNum++
    if(this.rotateList.length > this.MAX){
      this.rotateList.shift()
    }
  }

  pushRotateAcc(motionInfo: MotionInfo){
    this.rotateAccList.push(motionInfo)
    if(this.rotateAccList.length > this.MAX){
      this.rotateAccList.shift()
    }
    this.unRenederedRotateAccNum++
  }

  pushMotionAcc(motionInfo: MotionInfo){
    this.motionAccList.push(motionInfo)
    this.unRenederedMotionAccNum++
    if(this.motionAccList.length > this.MAX){
      this.motionAccList.shift()
    }
  }

  resetRotate(){
    this.unRenederedRotateNum = 0
  }

  resetRotateAcc(){
    this.unRenederedRotateAccNum = 0
  }

  resetMotionAcc(){
    this.unRenederedMotionAccNum = 0
  }

}