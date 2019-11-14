 import React from 'react'
import ws, { WSMessage } from '../ws'
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


  
  componentDidMount(){
    this.initContext()
    const roomId = new URLSearchParams(window.location.search).get('roomId') || ''
    ws.send(new WSMessage('login', {roomId, roleType: 'result'}))
    ws.addEventListener('sensor', this.handleSensor)
  }

  initContext = () => {
    if(this.rotateCanvas&&this.motionAccCanvas&&this.rotateAccCanvas){
      this.rotateCxt = this.rotateCanvas.getContext('2d')
      this.rotateAccCxt = this.rotateAccCanvas.getContext('2d')
      this.motionAccCxt = this.motionAccCanvas.getContext('2d')
    }
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
        this.renderData({rotateList})
      }
      if(data.type === 'rotationAcc'){
        const { rotateAccList: rotateAcc } = this.realState
        rotateAcc.push(data)
        if(rotateAcc.length> this.MAX){
          rotateAcc.shift()
        }
        this.renderData({rotateAcc})
      }
      if(data.type === 'motionAcc'){
        const { motionAccList: motionAcc } = this.realState
        motionAcc.push(data)
        if(motionAcc.length> this.MAX){
          motionAcc.shift()
        }
        this.renderData({motionAcc})
      }
    }
  }

  tt = (fun: (...params:any[]) => void, limit: number) => {
    let lasteTime = 0
    return (...params: any[]) => {
      const now = Date.now()
      if(now - lasteTime > limit){
        fun(...params)
        lasteTime = now
      }
    }
  }

  renderData = this.tt(() => {
    const {rotateList, rotateAccList, motionAccList} = this.realState
    if(this.rotateCxt&& this.rotateAccCxt && this.motionAccCxt){
      console.time('13')
      this.renderCanvas(this.rotateCxt, rotateList, 720)
      this.renderCanvas(this.rotateAccCxt, rotateAccList, 1440)
      this.renderCanvas(this.motionAccCxt, motionAccList, 120)
      console.timeEnd('13')
    }

  },16)

  renderCanvas = (ctx: CanvasRenderingContext2D, dataList:MotionInfo[], maxValue: number ) =>{
    ctx.clearRect(0,0,this.MAX, this.HEIGHT)
    dataList.forEach( ({data:{x,y,z}}, index) => {
      // ctx.scale(-1, -1);
      ctx.fillStyle="rgba(255,0,0,0.5)"
      let h = x* this.HEIGHT/maxValue
      ctx.fillRect(index+1, 0.5*this.HEIGHT -h , 1, h)

      ctx.fillStyle="rgba(0,255,0,0.5)"
      h = y* this.HEIGHT/maxValue
      ctx.fillRect(index+2,0.5*this.HEIGHT - h, 1,  h)

      ctx.fillStyle="rgba(0,0,255,0.5)"
      h = z* this.HEIGHT/maxValue
      ctx.fillRect(index+3,0.5*this.HEIGHT - h, 1, h)
     
    })
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