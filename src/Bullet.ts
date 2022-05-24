import ICollisionRect from "./ICollisionRect";

export default class Bullet{
    id : number
    type : string
    collisionRect : ICollisionRect
    speed : number = 9
    speedX : number
    speedY : number
    width : number
    height : number

    constructor(id: number, movementForces : number[]){
        this.id = id
        if(movementForces[0] == 0){
            this.type = "vertical"
        }
        else if(movementForces[1] == 0){
            this.type = "horizontal"
        }
        else if(movementForces[0] == movementForces[1]){
            this.type = "diagonal"
        }
        else{
            this.type = "diagonalInverted"
        }
        this.speedX = movementForces[0] * this.speed
        this.speedY = movementForces[1] * this.speed
        if(this.type == "horizontal"){
            this.width = 8
            this.height = 3
        }
        else if(this.type == "vertical"){
            this.width = 4
            this.height = 6
        }
        else if(this.type == "diagonal" || this.type == "diagonalInverted"){
            this.width = 4
            this.height = 4
        }
    }
    setCoords(x : number, y: number){
        this.collisionRect = {x: x - this.speedX, y: y - this.speedY, width: this.width, height: this.height}
    }
    move(){
        this.collisionRect.x += this.speedX
        this.collisionRect.y += this.speedY
    }
}