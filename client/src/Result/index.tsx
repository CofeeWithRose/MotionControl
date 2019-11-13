 import React, { Fragment } from 'react'
import ws, { WSMessage } from '../ws'
import {  MotionInfo } from '../Motion'

export class ResultState {

  rotateList: MotionInfo[] = []

  rotateAcc:MotionInfo[] = []

  motionAcc: MotionInfo[] = []

}



export default class Result extends React.Component{


  state = new ResultState()

  realState = new ResultState()

  MAX = 500
  
  componentDidMount(){
    const roomId = new URLSearchParams(window.location.search).get('roomId') || ''
    ws.send(new WSMessage('login', {roomId, roleType: 'result'}))
    ws.addEventListener('sensor', this.handleSensor)
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
        this.ttSetState({rotateList})
      }
      if(data.type === 'rotationAcc'){
        const { rotateAcc } = this.realState
        rotateAcc.push(data)
        if(rotateAcc.length> this.MAX){
          rotateAcc.shift()
        }
        this.ttSetState({rotateAcc})
      }
      if(data.type === 'motionAcc'){
        const { motionAcc } = this.realState
        motionAcc.push(data)
        if(motionAcc.length> this.MAX){
          motionAcc.shift()
        }
        this.ttSetState({motionAcc})
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

  ttSetState = this.tt((state: ResultState) => this.setState(state), 60)

  renderMotionList = (motionInfoList:MotionInfo[]) => {
    const width = 1;
    return motionInfoList.map( (item,index) => {
      return <div key={`${item.ts}-${index}`} style={{display:'flex'}}>
        <div style={{height: item.data.x,width, backgroundColor:'blue'}}></div>
        <div style={{height: item.data.y, width, backgroundColor:'red'}}></div>
        <div style={{height: item.data.z, width, backgroundColor:'green'}}></div>
      </div>
    })
  }

  render(){
    const { rotateList, rotateAcc, motionAcc } = this.state
    return <Fragment>
    <section style={{display: 'flex', border: 'darkblue solid 1px'}}>
      {this.renderMotionList(rotateList)}
    </section>
    <section style={{display: 'flex', border: 'gray solid 1px'}}>
      {this.renderMotionList(rotateAcc)}
    </section>
    <section style={{display: 'flex', border: 'black solid 1px'}}>
      {this.renderMotionList(motionAcc)}
    </section>
    </Fragment>
   
  }
}