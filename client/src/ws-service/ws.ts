import { MotionInfo } from "../Motion";
import { ActionNames } from "../Motion/analyzer";


const ws = new WebSocket(`wss://${window.location.host}/ws`)

ws.onerror = (e) => {
    alert(`ws error: ${JSON.stringify(e)}`)
}

let isOppening = true;
let cache: WSMessage<keyof WSMessageMap>[] = []

/**
 * 登陆后返回.
 */
let playerId = ''

const eventMap =new Map< keyof WSMessageMap, ((msg: WSMessage<keyof WSMessageMap>) => void)[] >()


ws.addEventListener('open', () => {
    cache.forEach(item => {
        ws.send(JSON.stringify(item))
        cache = []
    })
    isOppening = false;
})

ws.addEventListener('message', ({data}) => {
    let msg: WSMessage<any>|null = null
   try{
    msg = JSON.parse(data)
   }catch(e){
       console.error(e)
   }
   if(msg){
       
    if(msg.type === 'login'){
        msg = msg as WSMessage<'login'>
        checkedRoomId = (msg.data && msg.data.roomId)||''
        playerId = (msg.data&&msg.data.playerId)||''
    }
    const listeners = eventMap.get(msg.type)
    if(listeners){
        const newListeners = [...listeners]
        newListeners.forEach(listener => listener(msg as WSMessage<any>))
    }
    
   }
})

let checkedRoomId = ''

type Roles = 'sensor'|'result';

export class LoginInfo {
    constructor(
        public readonly roleType: Roles,
        public readonly roomId?: string, 
        public readonly playerId?: string
    ){}
}

export class WSMessageMap {
    constructor(
       public sensor: MotionInfo[],
       public login: LoginInfo,
       public ping: null,
       public action: ActionNames,
       public log: string,
    ){}
    
}

export class WSMessage<T extends keyof WSMessageMap> {
    public readonly timestamp = Date.now()

    protected  playerId = ''

    constructor(
        public type: T,
        public data?: WSMessageMap[T],
        public roomId?: string
    ){
        if(roomId){
            checkedRoomId = roomId
        }else{
            this.roomId = checkedRoomId
        }
        this.playerId = playerId
    }
}

function send<T extends keyof WSMessageMap>(message: WSMessage<T>){
    if(!isOppening){
        ws.send(JSON.stringify(message))
    }else{
        cache.push(message)
    }
}



function addEventListener<T extends keyof WSMessageMap >( eventName: T, fun: (msg: WSMessage<T>) => void){
    let listeners = eventMap.get(eventName)
    if(!listeners){
        listeners = []
        eventMap.set(eventName, listeners)
    }
    listeners.push(fun as any)
}
function removeEventListener<T extends keyof WSMessageMap>( eventName: T, fun: (msg: WSMessage<T>) => void){
    let listeners = eventMap.get(eventName)
    if(listeners){
       const index = listeners.indexOf(fun as any)
       if(index > -1){
        listeners.splice(index, 1)
       }
    }
}

export default {
    send,
    addEventListener,
    removeEventListener
}
