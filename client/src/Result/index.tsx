 import React from 'react'
import ws, { WSMessage } from '../ws-service/ws'
import {  MotionInfo } from '../Motion'

export class ResultState {

  rotateList: MotionInfo[] = []

  rotateAccList:MotionInfo[] = []

  motionAccList: MotionInfo[] = []

}



export default class Result extends React.Component{


  // state = new ResultState()

  realState = new ResultState()

  MAX = 1000

  HEIGHT = 100

  rotateCanvas: HTMLCanvasElement|null = null

  rotateCxt:CanvasRenderingContext2D|null = null

  rotateAccCanvas: HTMLCanvasElement|null = null

  rotateAccCxt:CanvasRenderingContext2D|null = null

  motionAccCanvas: HTMLCanvasElement|null = null

  motionAccCxt:CanvasRenderingContext2D|null = null


  // tempCanvas = window.document.createElement('canvas')

  // tempContext = this.tempCanvas.getContext('2d')

  
  componentDidMount(){
    this.initContext()
    const roomId = new URLSearchParams(window.location.search).get('roomId') || ''
    ws.send(new WSMessage('login', {roomId, roleType: 'result'}))
    ws.addEventListener('sensor', this.handleSensor)
    this.renderData()
  }

  componentWillUnmount(){
    ws.removeEventListener('sensor', this.handleSensor)
    this.renderData = () => {}
  }

  initContext = () => {
    if(this.rotateCanvas&&this.motionAccCanvas&&this.rotateAccCanvas){
      this.rotateCxt = this.rotateCanvas.getContext('2d')
      this.rotateAccCxt = this.rotateAccCanvas.getContext('2d')
      this.motionAccCxt = this.motionAccCanvas.getContext('2d')
    }
    // this.tempCanvas.width = this.MAX
    // this.tempCanvas.height = this.HEIGHT
  }

  handleSensor = (info: WSMessage<'sensor'>) => {
    const data = info.data
    if(data){
      if(data.type === 'rotation'){
        const { rotateList } = this.realState
        rotateList.push(data)
        if(rotateList.length> this.MAX){
          rotateList.shift()
        }
      }
      if(data.type === 'rotationAcc'){
        const { rotateAccList: rotateAcc } = this.realState
        rotateAcc.push(data)
        if(rotateAcc.length> this.MAX){
          rotateAcc.shift()
        }
      }
      if(data.type === 'motionAcc'){
        const { motionAccList: motionAcc } = this.realState
        motionAcc.push(data)
        if(motionAcc.length> this.MAX){
          motionAcc.shift()
        }
      }
    }
  }


  renderData = () => {
    const {rotateList, rotateAccList, motionAccList} = this.realState
    if(this.rotateCxt&& this.rotateAccCxt && this.motionAccCxt){
      console.time('render')
      this.renderCanvas(this.rotateCxt, rotateList, 720)
      this.renderCanvas(this.rotateAccCxt, rotateAccList, 1440)
      this.renderCanvas(this.motionAccCxt, motionAccList, 120)
      console.timeEnd('render')
    }
    requestAnimationFrame(this.renderData)
  }

  // renderData = tt(this._renderData,16)

  renderCanvas = (ctx: CanvasRenderingContext2D, dataList:MotionInfo[], maxValue: number ) =>{
    ctx.clearRect(0,0,this.MAX, this.HEIGHT)
    const rate = this.HEIGHT/maxValue
    ctx.fillStyle="rgba(255,0,0,0.5)"
    ctx.beginPath()
    for( let index = 0; index< dataList.length; index++){
      const { data:{x} } = dataList[index]
      const h = x* rate
      ctx.rect(index+1, 0.5*this.HEIGHT -h , 1, h)
    }
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle="rgba(0,255,0,0.5)"
    ctx.beginPath()
    for( let index = 0; index< dataList.length; index++){
      const { data:{y} } = dataList[index]
      const h = y* rate
      ctx.rect(index+1, 0.5*this.HEIGHT -h , 1, h)
    }
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle="rgba(0,0,255,0.5)"
    ctx.beginPath()
    for( let index = 0; index< dataList.length; index++){
      const { data:{z} } = dataList[index]
      const h = z* rate
      ctx.rect(index+1, 0.5*this.HEIGHT -h , 1, h)
    }
    ctx.closePath()
    ctx.fill()
  }

  getStartIndex = () => {

  }

  renderPre = () => {

  }


  render(){
    return (<section style={{width: '100%'}}>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.rotateCanvas = can}></canvas>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.rotateAccCanvas = can}></canvas>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.motionAccCanvas = can}></canvas>
      </section>
    )
   
   
  }
}