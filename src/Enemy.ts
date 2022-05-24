import ICollisionRect from "./ICollisionRect"

export default class Enemy{
    collisionRect : ICollisionRect = {x: 0, y: 0, width: 16, height: 8}
    moveInterval : number = null
    color : string = "red"
    speed : number = 3

    constructor(color: string){
        this.color = color
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