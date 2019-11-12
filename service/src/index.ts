import WebSocket,  { Server, ServerOptions } from 'ws'
import chalk from 'chalk'
import { remove, add, getRoom } from './room'
type Roles = 'sensor'|'result';

const serverOpt: ServerOptions = {
    port: 4000,
}

class Vector3 {
    x = 0
    y = 0
    z = 0
}

let gsId =  0



export class MotionInfo {
    constructor(
        public ts: number,
        public type: 'rotation' | 'rotationAcc' | 'motionAcc',
        public data: Vector3
    ) { }
}

export class LoginInfo {
    constructor(public roleType: Roles,public roomId?: string){}
}

export class WSMessageMap {
    constructor(
        public sensor: MotionInfo,
        public login: LoginInfo,
        public ping: null,
    ) { }

}

export class WSMessage<T extends keyof WSMessageMap> {
    constructor(
        public type: T,
        public data?: WSMessageMap[T],
        public roomId?: string
    ) { }
}

const wsServer = new Server(serverOpt)
wsServer.addListener('connection', (client) => {
    client.addEventListener('close', () => {
       remove(client)
    })

    client.addListener('message', (data) => {
        // console.log('onmessage: ', JSON.stringify(data))
        const msg: WSMessage<keyof WSMessageMap> = JSON.parse(data as string) as WSMessage<any>
        if(msg.type === 'login'){
            let {roomId, roleType} = (msg as WSMessage<'login'>).data || {}
            if(roleType){
                if(!roomId){
                    roomId = `${++gsId}`
                }
                add(roomId, client, roleType)
                const dataStr = JSON.stringify(new WSMessage('login', { roomId, roleType}))
                client.send(dataStr)
                console.log('send message: ', dataStr)
            }else{
                console.error(chalk.red('login need roleType'))
            }
           
        }
        if (msg.type === 'sensor') {
            const room = getRoom(client)
            if(room){
               const resultClients = room.get('result')
                resultClients.forEach(client => client.send(data))
            }
        }

       
    })
})

