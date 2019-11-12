import WebSocket = require("ws");

 type Roles = 'sensor'|'result';

class Room {
    private sensor = new  Set<WebSocket>()

    private result =  new  Set<WebSocket>()

    private map = new Map<WebSocket, Roles>()

   add(client: WebSocket, roleType:Roles ){
       if(roleType === 'sensor'){
           this.sensor.add(client)
           this.map.set(client, 'sensor')
       }
       if(roleType === 'result'){
           this.result.add(client)
           this.map.set(client, 'result')
       }
   }

   remove(client: WebSocket){
    const role = this.map.get(client)
    if(role === 'sensor'){
        this.sensor.delete(client)
    }
    if(role === 'result'){
        this.result.delete(client)
    }
    this.map.delete(client)
   }

}

const roomId2ClientMap = new Map<string, Room >()
const client2IdMap = new WeakMap<WebSocket, string>()


export function add(roomId: string, client: WebSocket, roleType: ){
    const room = roomId2ClientMap.get(roomId)
    if(room){
    }
}

export function get(roomId: string): WebSocket|null{
    return null
}

export function remove(client: WebSocket){

}