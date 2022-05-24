import ICollisionRect from "./ICollisionRect";

export default class Room{
    id : number
    levelColor : string
    bgColor : string
    wallCollisionRects : ICollisionRect[]
    neighbourRoomsIds : number[]
    keyColor : string
    keyHoleColor : string

    constructor(id: number,levelColor : string, bgColor : string, wallCollisionRects : ICollisionRect[], neighbourRoomsIds : number[], keyColor : string, keyHoleColor : string){
        this.id = id
        this.levelColor = levelColor
        this.bgColor = bgColor
        this.wallCollisionRects = wallCollisionRects
        this.neighbourRoomsIds = neighbourRoomsIds
        this.keyColor = keyColor
        this.keyHoleColor = keyHoleColor
    }
}