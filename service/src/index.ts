import { Server, ServerOptions} from 'ws'

const serverOpt: ServerOptions = {
    port: 4000,
}

const wsServer = new Server(serverOpt)
wsServer.addListener('connection', (client) => {
    client.addListener('message', (data) => {
        console.log(data)
    })
})

