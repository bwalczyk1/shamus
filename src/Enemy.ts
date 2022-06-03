import ICollisionRect from "./ICollisionRect"

export default class Enemy{
    collisionRect : ICollisionRect = {x: 0, y: 0, width: 16, height: 8}
    moveInterval : number
    color : string
    speed : number
    type: number
    movementObject : any = {endFrame: 0, forceX: 0, forceY: 0}

    constructor(type: number){
        this.type = type
        let availableColors : string[]
        switch(type){
            case 0:
                availableColors = ["red", 'green', 'blue', 'white']
                this.speed = 3
                break
            case 1:
                availableColors = ["yellow", "cyan", "white"]
                //availableColors = ["yellow", "cyan", 'white']
                this.speed = 2
                break
            default:
                availableColors =["green"]
                this.collisionRect = {x: 0, y: 0, width: 12, height: 8}
                this.speed = 16
                break
        }
        this.color = availableColors[Math.floor(Math.random()*availableColors.length)]
    }
    setPosition(x : number, y : number) : void{
        this.collisionRect.x = x
        this.collisionRect.y = y
    }
    equals(enemy : Enemy) : boolean{
        if(this.collisionRect.x == enemy.collisionRect.x && this.collisionRect.y == enemy.collisionRect.y){
            return true
        }
        else{
            return false
        }
    }
}