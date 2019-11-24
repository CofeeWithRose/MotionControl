 import React from 'react'
import ws, { WSMessage } from '../ws-service/ws'
import {  MotionInfo } from '../Motion'
import { ActionNames } from '../Motion/analyzer'

export class ResultInfo {

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

export class ResultState{

  boxCount = 0

  defendCount = 0

}

export default class Result extends React.Component<{}, ResultState>{


  state = new ResultState()

  protected MAX = 1000

  protected HEIGHT = 100

  protected rotateCanvas: HTMLCanvasElement|null = null

  protected rotateCxt:CanvasRenderingContext2D|null = null

  protected rotateAccCanvas: HTMLCanvasElement|null = null

  protected rotateAccCxt:CanvasRenderingContext2D|null = null

  protected motionAccCanvas: HTMLCanvasElement|null = null

  protected motionAccCxt:CanvasRenderingContext2D|null = null

  protected resultInfo = new ResultInfo(this.MAX)

  protected tempCanvas = window.document.createElement('canvas')

  protected tempContext = this.tempCanvas.getContext('2d')


  
  componentDidMount(){
    this.initContext()
    const roomId = new URLSearchParams(window.location.search).get('roomId') || ''
    ws.send(new WSMessage('login', {roomId, roleType: 'result'}))
    ws.addEventListener('sensor', this.handleSensor)
    ws.addEventListener('action', this.handleAction)
    this.renderData()
  }

  componentWillUnmount(){
    ws.removeEventListener('sensor', this.handleSensor)
    ws.removeEventListener('action', this.handleAction)
    this.renderData = () => {}
  }

  protected initContext = () => {
    if(this.rotateCanvas&&this.motionAccCanvas&&this.rotateAccCanvas){
      this.rotateCxt = this.rotateCanvas.getContext('2d')
      this.rotateAccCxt = this.rotateAccCanvas.getContext('2d')
      this.motionAccCxt = this.motionAccCanvas.getContext('2d')
    }
    this.tempCanvas.width = this.MAX
    this.tempCanvas.height = this.HEIGHT
  }

  protected handleAction = (info:WSMessage<'action'>) => {
    const { boxCount, defendCount } = this.state
    if(info.data === ActionNames.HIT){
      this.setState({
         boxCount: 1 +boxCount
       })
    }
    if(info.data === ActionNames.DEFEND){
      this.setState({
        defendCount: defendCount + 1
      })
    }
  }

  protected handleSensor = (info: WSMessage<'sensor'>) => {
    const dataList = info.data
    if(dataList&& dataList.length){
      for(let i = 0; i< dataList.length; i++){
        const data = dataList[i]
        if(data.type === 'rotation'){
          this.resultInfo.pushRotate(data)
        }
        if(data.type === 'rotationAcc'){
          this.resultInfo.pushRotateAcc(data)
        }
        if(data.type === 'motionAcc'){
          this.resultInfo.pushMotionAcc(data)
        }
      }
     
    }
  }


  protected renderData = () => {
    const { RotateList: RotateListToRender, RotateAccList: RotateAccListToRender, MotionAccList: MotionAccListToRender } = this.resultInfo
    if(this.rotateCxt&& this.rotateAccCxt && this.motionAccCxt && this.rotateCanvas && this.rotateAccCanvas && this.motionAccCanvas){
     
      console.time('render')
      this.renderCanvas(this.rotateCxt, RotateListToRender, 720, this.rotateCanvas,this.resultInfo.RotateListStartIndex)
      this.resultInfo.resetRotate()
      
      this.renderCanvas(this.rotateAccCxt, RotateAccListToRender, 1440, this.rotateAccCanvas,this.resultInfo.RotateAccListStartIndex)
      this.resultInfo.resetRotateAcc()

      this.renderCanvas(this.motionAccCxt, MotionAccListToRender, 120, this.motionAccCanvas ,this.resultInfo.MotionAccListStartIndex)
      this.resultInfo.resetMotionAcc()
      console.timeEnd('render')

    }
    requestAnimationFrame(this.renderData)
  }

  protected renderCanvas = (ctx: CanvasRenderingContext2D, dataList:MotionInfo[], maxValue: number, canvas: HTMLCanvasElement ,stratIndex: number ) =>{
    if(this.tempContext){
      this.tempContext.clearRect(0,0, this.MAX, this.HEIGHT)
      const sourceX = dataList.length === this.MAX? this.MAX - stratIndex : 0;
      this.tempContext.drawImage(canvas,  sourceX, 0, this.MAX, this.HEIGHT, 0, 0, this.MAX, this.HEIGHT)
    }
    ctx.clearRect(0,0,this.MAX, this.HEIGHT)
    ctx.drawImage(this.tempCanvas, 0, 0)
    const rate = this.HEIGHT/maxValue
    ctx.fillStyle="rgba(255,0,0,0.5)"
    ctx.beginPath()
    for( let index = stratIndex; index< dataList.length; index++){
      const { data:{x} } = dataList[index]
      const h = x* rate
      ctx.rect(index, 0.5*this.HEIGHT -h , 1, h)
    }
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle="rgba(0,255,0,0.5)"
    ctx.beginPath()
    for( let index =stratIndex; index< dataList.length; index++){
      const { data:{y} } = dataList[index]
      const h = y* rate
      ctx.rect(index, 0.5*this.HEIGHT -h , 1, h)
    }
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle="rgba(0,0,255,0.5)"
    ctx.beginPath()
    for( let index = stratIndex; index< dataList.length; index++){
      const { data:{z} } = dataList[index]
      const h = z* rate
      ctx.rect(index, 0.5*this.HEIGHT -h , 1, h)
    }
    ctx.closePath()
    ctx.fill()
  }

  render(){
    const { defendCount, boxCount } = this.state
    return (<section style={{width: '100%', padding: '20px'}}>
       
        <div>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.rotateCanvas = can}></canvas>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.rotateAccCanvas = can}></canvas>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.motionAccCanvas = can}></canvas>
        </div>
        <div>
          hit=>{boxCount}
          defend=>{defendCount}
        </div>
      </section>
    )
   
   
  }
}