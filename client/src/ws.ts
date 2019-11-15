import { MotionInfo } from "./Motion";



const ws = new WebSocket(`wss://${window.location.host}/ws`)



let isOppening = true;
let cache: string[] = []

const eventMap =new Map< keyof WSMessageMap, ((msg: WSMessage<any>) => void)[] >()


ws.addEventListener('open', () => {
    isOppening = false;
    cache.forEach( msg => ws.send(msg) )
    cache = []
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
    const msg = JSON.stringify(message)
    if(isOppening){
        cache.push(msg)
    }else{
        ws.send(msg)
    }
}



function addEventListener<T extends keyof WSMessageMap>( eventName: T, fun: (msg: WSMessage<T>) => void){
    let listeners = eventMap.get(eventName)
    if(!listeners){
        listeners = []
        eventMap.set(eventName, listeners)
    }
    listeners.push(fun)
}
function removeEventListener<T extends keyof WSMessageMap>( eventName: T, fun: (msg: WSMessage<T>) => void){
    let listeners = eventMap.get(eventName)
    if(listeners){
       const index = listeners.indexOf(fun)
       if(index > -1){
        listeners.splice(index, 1)
       }
    }
}

export default {
    ...ws,
    send,
    addEventListener,
    removeEventListener
}
