 import React from 'react'
import ws, { WSMessage } from '../ws-service/ws'
import { ActionNames } from '../Motion/analyzer'
import ResultRender from './ResultRender'


export class ResultState{

  boxCount = 0

  defendCount = 0

}

export default class Result extends React.Component<{}, ResultState>{


  state = new ResultState()

  protected MAX = 1000

  protected HEIGHT = 100

  protected resultRender = new ResultRender(this.MAX)
  
  componentDidMount(){
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

  protected handleAction = (info:WSMessage<'action'>) => {
    const { boxCount, defendCount } = this.state
    if(info.data === ActionNames.ATTACK){
      this.setState({
         boxCount: 1 +boxCount
       })
    }
    if(info.data === ActionNames.DEFEND_START){
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
        this.resultRender.push(data)
      }
     
    }
  }


  protected renderData = () => {
    this.resultRender.render('rotation')
    this.resultRender.render('rotationAcc')
    this.resultRender.render('motionAcc')
    this.resultRender.render('gravity')
    requestAnimationFrame(this.renderData)
  }

 

  render(){
    const { defendCount, boxCount } = this.state
    return (<section style={{width: '100%', padding: '20px'}}>
       
        <div>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.resultRender.setRender('rotation', can, 720, this.HEIGHT) }></canvas>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.resultRender.setRender('rotationAcc', can, 1440, this.HEIGHT)}></canvas>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.resultRender.setRender('motionAcc', can, 120, this.HEIGHT)}></canvas>
        <canvas width={this.MAX} height={this.HEIGHT} ref={can => this.resultRender.setRender('gravity', can, 10, this.HEIGHT)}></canvas>
        </div>
        <div>
          hit=>{boxCount}
          defend=>{defendCount}
        </div>
      </section>
    )
  }
}