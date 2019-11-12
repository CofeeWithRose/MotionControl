import WebSocket,  { Server, ServerOptions } from 'ws'
import chalk from 'chalk'

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

export class WSMessageMap {
    constructor(
        public msg: MotionInfo,
        public login: string,
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
        const roomId = client2IdMap.get(client)
        roomId2ClientMap.delete(roomId)
        client2IdMap.delete(client)
    })

    client.addListener('message', (data) => {
        console.log('onmessage: ', JSON.stringify(data))
        const msg: WSMessage<any> = JSON.parse(data as string) as WSMessage<any>
        if(msg.type === 'login'){
            let sessionId = (msg as WSMessage<'login'>).data
            if(!sessionId){
                sessionId = `${++gsId}`
            }
            client2IdMap.set(client, sessionId)
            id2ClientMap.set(sessionId, client)
            const dataStr = JSON.stringify(new WSMessage('login', sessionId))
            client.send(dataStr)
            console.log('send message: ', dataStr)
        }
        if (msg.type === 'msg') {
            const motionInfo = (msg as WSMessage<'msg'>).data
            // if (motionInfo.type === 'motionAcc') {
            //     console.log(chalk.green(motionInfo.type, JSON.stringify(motionInfo.data)))
            // }
            // if (motionInfo.type === 'rotationAcc') {
            //     console.log(chalk.blue(motionInfo.type, JSON.stringify(motionInfo.data)))
            // }
            // if (motionInfo.type === 'rotation') {
            //     console.log(chalk.red(motionInfo.type, JSON.stringify(motionInfo.data)))
            // }
        }

       
    })
})

