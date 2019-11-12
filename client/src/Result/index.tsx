 import React from 'react'
import ws, { WSMessage } from '../ws'
export default class Result extends React.Component{
  
  componentDidMount(){
    const roomId = new URLSearchParams(window.location.search).get('roomId') || ''
    ws.send(new WSMessage('login', {roomId, roleType: 'result'}))
    ws.addEventListener('sensor', this.handleSensor)
  }

  handleSensor = (info: WSMessage<'sensor'>) => {
    console.log(info)
  }

  render(){
    return null
  }
}