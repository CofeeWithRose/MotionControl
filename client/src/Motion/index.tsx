import React, { Fragment } from 'react'
import ws, { WSMessage } from '../ws'

class MotionState {

    rotationRate = new Vector3()

    rotation = new Vector3()

}

class Vector3 {
    x = 0
    y = 0
    z = 0
}

function toFixed2(number: number) {
    return 0.01 * Math.floor(number * 100)
}

export class MotionInfo {
    constructor(
        public ts: number,
        public type: 'rotation'|'rotationAcc'|'motionAcc',
        public data: Vector3
    ){}
}

export default class Motion extends React.Component<{}, MotionState>{

    state = new MotionState()

    lastMotionData={
        'rotation': new Array<Vector3>(),
        'rotationAcc': new Array<Vector3>(),
        'motionAcc': new Array<Vector3>(),
    }

    v = new Vector3()
    // DeviceOrientation
    componentDidMount() {
        window.addEventListener('devicemotion', this.motionListener)
        window.addEventListener('deviceorientation', this.rotateListener)
    }


    componentWillUnmount() {
        window.removeEventListener('devicemotion', this.motionListener)
        window.removeEventListener('deviceorientation', this.rotateListener)
    }

    rotateListener = (e: DeviceOrientationEvent) => {
        const rotation = {
            x: e.alpha || 0,
            y: e.beta || 0,
            z: e.gamma || 0,
        }
        this.setState({
            rotation
        })
        const state = new MotionInfo(Date.now(),'rotation', rotation)
        this.handleMotion(state)
    }

    motionListener = (e: DeviceMotionEvent) => {
        const { alpha: x, beta: y, gamma: z } = e.rotationRate || {}
        const { x: ax, y: ay, z: az } = e.acceleration || {}
        const aR = {
            x: toFixed2(x || 0),
            y: toFixed2(y || 0),
            z: toFixed2(z || 0),
        }
        const aL = {
            x: toFixed2(ax || 0),
            y: toFixed2(ay || 0),
            z: toFixed2(az || 0),
        }

        this.setState({
            rotationRate: aR
        })
        const ts = Date.now()
        const accR = new MotionInfo(ts,'rotationAcc', aR)
        const accL = new MotionInfo(ts, 'motionAcc', aL)
        this.handleMotion(accR)
        this.handleMotion(accL)
        // ws.send(JSON.stringify(info))
    }

    handleMotion = (motionInfo:MotionInfo) => {
        
        const array = this.lastMotionData[motionInfo.type]
        // const lastInfo = array.pop()
        // if(lastInfo){
        //     const info = {
        //         x: motionInfo.data.x - lastInfo.x,
        //         y: motionInfo.data.y - lastInfo.y,
        //         z: motionInfo.data.z - lastInfo.z
        //     }
           
        // }
        ws.send(new WSMessage('msg', motionInfo))
        array.push(motionInfo.data)
        
       
    }

    render() {
        const { x: ax, y: ay, z: az } = this.state.rotation
        return <Fragment>
            <p>ax: {ax.toFixed(2)}</p>

            <p>ay: {ay.toFixed(2)}</p>

            <p>az: {az.toFixed(2)}</p>
        </Fragment>
    }
}