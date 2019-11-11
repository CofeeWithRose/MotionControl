import { MotionInfo } from "./Motion";

const ws = new WebSocket(`ws://${window.location.hostname}:4000`)
let isOppening = true;
let cache: string[] = []
ws.addEventListener('open', () => {
    ws.send(JSON.stringify({type: 'login'}))
    isOppening = false;

    cache.forEach( msg => ws.send(msg) )
    cache = []
})

export class WSMessageMap {
    constructor(
       public msg: MotionInfo,
       public login: Number,
       public ping: null,
    ){}
    
}

export class WSMessage<T extends keyof WSMessageMap> {
    constructor(
        public type: T,
        public data?: WSMessageMap[T]
    ){}
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