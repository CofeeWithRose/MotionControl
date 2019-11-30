import  { Server, ServerOptions } from 'ws'
import chalk from 'chalk'
import { remove, add, getRoom, Roles } from '../room'
import  https from 'https'
import  fs from 'fs'
import { sslKeyPath, sslCrtPath } from '../config/paths'

// const options = {
//   key: fs.readFileSync(sslKeyPath),
//   cert: fs.readFileSync(sslCrtPath)
// };

// const  server=https.createServer(options, function (req, res) {
//  res.writeHead(403);
//  res.end("This is a WebSockets server!\n");
// }).listen(4000);



// type Roles = 'sensor'|'result'|'game';

const serverOpt: ServerOptions = {
    // server,
    port: 4000
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
    constructor(public roleType: Roles,public roomId?: string, public playerId?: number){}
}

export class WSMessageMap {
    constructor(
        public sensor: MotionInfo[],
        public login: LoginInfo,
        public ping: null,
        public action: string,
        public log: string,
    ) { }

}

export class WSMessage<T extends keyof WSMessageMap> {
    public timestamp = 0;
    constructor(
        public type: T,
        public data?: WSMessageMap[T],
        public roomId?: string,
        public playerId?: number,
    ) { }
}

export function start(){
    const wsServer = new Server(serverOpt)
    wsServer.addListener('connection', (client) => {

        client.addEventListener('close', () => {
           remove(client)
        })
    
        client.addListener('message', (data) => {
            // console.log('onmessage: ', JSON.stringify(data))
            const msg: WSMessage<keyof WSMessageMap> = JSON.parse(data as string) as WSMessage<keyof WSMessageMap>

                if(msg.type === 'login'){
                    let {roomId, roleType, playerId} = (msg as WSMessage<'login'>).data || {}
                    if(roleType){
                        if(!roomId){
                            roomId = `${++gsId}`
                        }
                        add(roomId, client, roleType)
                        if(roleType === 'game'&& !playerId){
                            playerId = ++gsId
                        }
                        const dataStr = JSON.stringify(new WSMessage('login', { roomId, roleType, playerId}))
                        client.send(dataStr)
                    }
                
                }
                if (msg.type === 'sensor' || msg.type === 'action') {
                    const room = getRoom(client)
                    if(room){
                        /**
                         * 转发给图表端.
                         */
                        const resultClients = room.get('result')
                        resultClients.forEach(client => client.send(data))

                        // 转发指令给游戏端.
                        if(msg.type === 'action'){
                            const games = room.get('game')
                            games.forEach( client => client.send(data))
                        }
                    }
                }

                if(msg.type === 'log'){
                    const msgC = msg as WSMessage<'log'>
                    console.log(chalk.grey(msgC.data||'', `ts: ${msg.timestamp}`))
                }


        })
    })

    wsServer.on('error', (socket, error) => {
        console.log('socket error: ',error)
    });
}


