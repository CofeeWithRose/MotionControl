import { MotionInfo } from "./Motion";

const ws = new WebSocket(`ws://${window.location.hostname}:4000`)
let isOppening = true;
let cache: string[] = []
ws.addEventListener('open', () => {
    isOppening = false;
    cache.forEach( msg => ws.send(msg) )
    cache = []
})
ws.addEventListener('message', ({data}) => {
    let msg
   try{
    msg = JSON.parse(data)
   }catch(e){
       console.error(e)
   }
   if(msg){
    msg = msg as WSMessage<any>
    if(msg.type === 'login'){
        msg = msg as WSMessage<'login'>
        logindSessionId = msg.data||''
    }
   }
})

let logindSessionId = ''
export class WSMessageMap {
    constructor(
       public msg: MotionInfo,
       public login: string,
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
            logindSessionId = roomId
        }else{
            this.roomId = logindSessionId
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

export default {
    ...ws,
    send,
}