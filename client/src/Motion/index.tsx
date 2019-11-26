import React from 'react'
import ws, { WSMessage, LoginInfo } from '../ws-service/ws'
import Analyzer from './analyzer'

type LoginForm =  Pick<LoginInfo, 'playerId'|'roomId'>

class MotionState {

    rotationRate = new Vector3()

    rotation = new Vector3()

    roomId = ''

    hasPermission = false

    form:LoginForm = {
        playerId: '',
        roomId: '',
    }

    /**
     * 0 未登陆
     * 1 正在登陆
     * 2 已登陆
     */
    isLogined: 0|1|2 = 0

}

export class Vector3 {
    
    constructor(
        readonly x = 0,
        readonly y = 0,
        readonly z = 0,
    ){}
   
}

function toFixed2(number: number) {
    return 0.01 * Math.floor(number * 100)
}

export class MotionInfo {
    constructor(
        public ts: number,
        public type: 'rotation' | 'rotationAcc' | 'motionAcc',
        public data: Vector3
    ) { }
}

export default class Motion extends React.Component<{}, MotionState>{

    state = new MotionState()

    analyzer = new Analyzer()

    /**
     * 用于缓存批量发送的传感器信息，间隔 sendInterval ms.
     */
    motionCach:MotionInfo[] = []

    /**
     * 上次发送的时间 ms .
     */
    lastSendMiles = 0;

    /**
     * 发送的是按间隔 ms.
     */
    sendInterval = 30;

    /**
     * 最后一次发送的timer.
     * 在最后一次发送时，若cache还有值，则延时interval毫秒发送的timer,若不是最后一次发送，则用于取消timeout.
     */
    timer: NodeJS.Timeout|null = null

    // DeviceOrientation
    componentDidMount() {
        ws.addEventListener('login', this.onLogined)
        // const roomId = new URLSearchParams(window.location.search).get('roomId') || ''
        window.addEventListener('devicemotion', this.motionListener)
        window.addEventListener('deviceorientation', this.rotateListener)
    }


    componentWillUnmount() {
        window.removeEventListener('devicemotion', this.motionListener)
        window.removeEventListener('deviceorientation', this.rotateListener)
    }

    onLogined = (msg: WSMessage<'login'>) => {
        ws.removeEventListener('login',this.onLogined)
        this.setState({roomId: (msg.data && msg.data.roomId)||'', isLogined: 2})
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
        const state = new MotionInfo(Date.now(), 'rotation', rotation)
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
            rotationRate: aR,
           
        })
        const ts = Date.now()
        const accR = new MotionInfo(ts, 'rotationAcc', aR)
        const accL = new MotionInfo(ts, 'motionAcc', aL)
        this.handleMotion(accR)
        this.handleMotion(accL)
        // ws.send(JSON.stringify(info))
    }

    handleMotion = (motionInfo: MotionInfo) => {
        this.motionCach.push(motionInfo)
        this.analyzer.analyzeData(motionInfo)
        this.sendCache()
        this.setState({hasPermission: true})
    }

    /**
     * sendInterval ms间隔发送.
     */
    sendCache = () => {
        if(this.motionCach.length){
             // 取消上次的延迟发送.
            if(this.timer){
                window.clearTimeout()
            }
            const now = Date.now()
            if(now - this.lastSendMiles >= this.sendInterval){
                this.lastSendMiles= now;
                ws.send(new WSMessage('sensor', this.motionCach))
                this.motionCach=[]
            }else{
                // 若是最后一次发送，则 sendInterval ms后发送，若不是，下次发送是将取消.
               this.timer = setTimeout(this.sendCache, this.sendInterval)
            }
           
        }
    }

    requestPermission = async  () => {
        if(window.DeviceMotionEvent){
            if((DeviceMotionEvent as any ).requestPermission){
               const granted = await (DeviceMotionEvent as any ).requestPermission()
               if(granted === 'granted'){
                    window.addEventListener('devicemotion', this.motionListener)
                    window.addEventListener('deviceorientation', this.rotateListener)
               }else{
                   alert('清允许传感器权限')
               }
            }else{
                alert('不支持权限申请')
            }
        }else{
            alert('不支持传感器')
        }
    }

    setForm = (k:keyof LoginForm,v: string) => {
        const { form } = this.state
        const f = { ...form, [k]: v}
        this.setState({form: f})
    }

    login = () => {
        const { form } = this.state;
        const { roomId, playerId } = form
        ws.send(new WSMessage('login', { roomId, roleType: 'sensor', playerId: playerId }))
        this.setState({isLogined: 1})
    }

    render() {
        const { roomId, hasPermission, isLogined } = this.state
        // const { x: ax, y: ay, z: az } = this.state.rotation
        return <section style={{display: 'flex', flexDirection: 'column', padding: 40, alignItems:'center' }}>
            {!hasPermission&&<p><button onClick={this.requestPermission}> 请求权限</button></p>}
            
            
            {
                0 === isLogined && <h3>Login</h3>
            }
            {
                1 === isLogined && <h3>connecting...</h3>
            }
            {
                2 === isLogined && <h3>logoined</h3>
            }
            { roomId&&`${window.location.origin}?roomId=${roomId}#/result` }
            {
                0 === isLogined&& <div>
                    <p>playerId: <input onChange={({target:{value}}) => this.setForm('playerId', value)}/> </p>

                    <p>roomId: <input onChange={({target:{value}}) => this.setForm('roomId', value)} /></p>

                    <h4>
                        <p>
                            <button onClick={this.login}>connect</button>
                        </p>
                    </h4>
                </div>
            }
            
           
        </section>
    }
}