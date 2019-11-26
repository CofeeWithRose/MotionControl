import WebSocket = require("ws");

class ClientMap {

   public sensor = new  Set<WebSocket>()

   public result =  new  Set<WebSocket>()

   public game = new  Set<WebSocket>()

}

 type Roles = keyof ClientMap;


class Room {

    private  clientMap = new ClientMap()
    

    private clientToRoleMap = new Map<WebSocket, Roles>()

    isEmpty(){
        return !Object.values(this.clientMap).reduce( (re, item) => re + item.size  )
    }

   add(client: WebSocket, roleType:Roles ){
       this.clientMap[roleType].add(client)
       this.clientToRoleMap.set(client, roleType)
   }

   get(roleType: Roles): WebSocket[]{
    return Array.from(this.clientMap[roleType])
   }

   getRoleType(client:WebSocket){
       return this.clientToRoleMap.get(client)
   }

   remove(client: WebSocket){
    const role = this.clientToRoleMap.get(client)
    if(role){
        this.clientMap[role]
        this.clientToRoleMap.delete(client)
    }
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