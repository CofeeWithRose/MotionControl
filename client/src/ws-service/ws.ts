import { MotionInfo } from "../Motion";
import { tt } from "./util";



const ws = new WebSocket(`wss://${window.location.host}/ws`)



let isOppening = true;
let cache: WSMessage<keyof WSMessageMap>[] = []

const eventMap =new Map< keyof WSMessageMap, ((msg: WSMessage<keyof WSMessageMap>) => void)[] >()

const _sendCache = tt(()=>{
    if(!isOppening && cache.length){
        ws.send(JSON.stringify(cache))
        cache=[]
    }
},15)


ws.addEventListener('open', () => {
    
    ws.send(JSON.stringify(cache))
    cache = []
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
    constructor(public roleType: Roles,public roomId?: string){}
}

export class WSMessageMap {
    constructor(
       public sensor: MotionInfo,
       public login: LoginInfo,
       public ping: null,
    ){}
    
}

export class WSMessage<T extends keyof WSMessageMap> {
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
        
    }
}

function send<T extends keyof WSMessageMap>(message: WSMessage<T>){
    cache.push(message)
    _sendCache()
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
