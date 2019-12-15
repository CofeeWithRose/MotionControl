import { useRef, useEffect, useState } from "react"
import ResultRender from "./ResultRender"
import ws, { WSMessage } from "../ws-service/ws"
import { ACTIONS } from "../Motion/actions"

export const MAX = 1000

export const HEIGHT = 100

export const useRender =  () => {
  
  const canvasRef = useRef({
    rotation: useRef(null),
    rotationAcc: useRef(null),
    motionAcc: useRef(null),
    gravity: useRef(null),
  })
  
  useEffect(() => {
    const resultRender = new ResultRender(MAX)
    resultRender.setRender('rotation', canvasRef.current.rotation.current, 720, HEIGHT)
    resultRender.setRender('rotationAcc', canvasRef.current.rotationAcc.current, 1440, HEIGHT)
    resultRender.setRender('motionAcc', canvasRef.current.motionAcc.current, 120, HEIGHT)
    resultRender.setRender('gravity', canvasRef.current.gravity.current, 20, HEIGHT)
    let renderData = () => {
      resultRender.render('rotation')
      resultRender.render('rotationAcc')
      resultRender.render('motionAcc')
      resultRender.render('gravity')
      requestAnimationFrame(renderData)
    }
    renderData()


    const handleSensor = (info: WSMessage<'sensor'>) => {
      const dataList = info.data
      if(dataList&& dataList.length){
        for(let i = 0; i< dataList.length; i++){
          const data = dataList[i]
          resultRender.push(data)
        }
      }
    }

    ws.addEventListener('sensor',  handleSensor)
    return () =>  {
      renderData = () => 0
      ws.removeEventListener('sensor', handleSensor)
    }
  },[])
 return {canvasRef}
}

export const useLogin = () => {
  useEffect(() => {
    const roomId = new URLSearchParams(window.location.search).get('roomId') || ''
    ws.send(new WSMessage('login', {roomId, roleType: 'result'}))
  },[])
}

export const useAction = () => {
  const [defendCount, setDefendCount] = useState(0)
  const [boxCount, setBoxCount] = useState(0)

  useEffect(() => {
    const handleAction = (info:WSMessage<'action'>) => {
      if(info.data === ACTIONS.ATTACK){
        setBoxCount(pre => ++pre)
      }
      if(info.data === ACTIONS.DEFEND_START){
        setDefendCount(pre => ++pre)
    
      }
    }
    ws.addEventListener('action', handleAction)
    return () =>  ws.removeEventListener('action', handleAction)
  },[])
  return {defendCount, boxCount}
}
