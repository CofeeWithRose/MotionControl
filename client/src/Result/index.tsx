 import React from 'react'
import { useLogin, useAction, useRender, MAX, HEIGHT } from './result-hooks'


export  default function Result(){

  useLogin()
  const { boxCount, defendCount } = useAction()
  const {canvasRef} = useRender()

  return (<section style={{width: '100%', padding: '20px'}}>
     
      <div>
      <canvas width={MAX} height={HEIGHT} ref={canvasRef.current.rotation }></canvas>
      <canvas width={MAX} height={HEIGHT} ref={canvasRef.current.rotationAcc}></canvas>
      <canvas width={MAX} height={HEIGHT} ref={canvasRef.current.motionAcc }></canvas>
      <canvas width={MAX} height={HEIGHT} ref={canvasRef.current.gravity }></canvas>
      </div>
      <div>
        hit=>{boxCount}
        defend=>{defendCount}
      </div>
    </section>
  )
}