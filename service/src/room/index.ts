import WebSocket = require("ws");

 type Roles = 'sensor'|'result';

class Room {
    private sensor = new  Set<WebSocket>()

    private result =  new  Set<WebSocket>()

    private clientToRolemap = new Map<WebSocket, Roles>()

    isEmpty(){
        return !(this.sensor.size || this.result.size)
    }

   add(client: WebSocket, roleType:Roles ){
       if(roleType === 'sensor'){
           this.sensor.add(client)
           this.clientToRolemap.set(client, 'sensor')
       }
       if(roleType === 'result'){
           this.result.add(client)
           this.clientToRolemap.set(client, 'result')
       }
   }

   get(roleType: Roles): WebSocket[]{
    if(roleType === 'sensor'){
        return Array.from(this.sensor)
    } 
    if(roleType === 'result'){
        return Array.from(this.result)
    }
    return []
   }

   getRoleType(client:WebSocket){
       return this.clientToRolemap.get(client)
   }

   remove(client: WebSocket){
    const role = this.clientToRolemap.get(client)
    if(role === 'sensor'){
        this.sensor.delete(client)
    }
    if(role === 'result'){
        this.result.delete(client)
    }
    this.clientToRolemap.delete(client)
   }

}

const roomId2RoomMap = new Map<string, Room|null >()
const client2RoomIdMap = new WeakMap<WebSocket, string|null>()


export function add(roomId: string, client: WebSocket, roleType: Roles ){
    let room = roomId2RoomMap.get(roomId)
    if(!room){
        room = new Room()
        roomId2RoomMap.set(roomId, room)
    }
    room.add(client, roleType)
    client2RoomIdMap.set(client, roomId)
}

export function get(roomId: string, roleType: Roles): WebSocket[]{
    const room = roomId2RoomMap.get(roomId)
    if(room){
        return room.get(roleType)
    }
    return []
}

export function getRoom(client: WebSocket){
    const roomId = client2RoomIdMap.get(client)
    if(roomId){
        return  roomId2RoomMap.get(roomId)
    }
}

export function remove(client: WebSocket){
    const roomId = client2RoomIdMap.get(client)
    if(roomId){
        const room = roomId2RoomMap.get(roomId)
        if(room){
            room.remove(client)
            if(room.isEmpty()){
                roomId2RoomMap.delete(roomId)
                client2RoomIdMap.delete(client)
            }
        }
    }
}