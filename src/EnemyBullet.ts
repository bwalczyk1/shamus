export default class EnemyBullet{
    x : number
    y : number
    speed : number = 9
    speedX : number
    speedY : number

    constructor(x : number, y : number, movementForceX : number, movementForceY : number){
        this.x = x
        this.y = y
        this.speedX = movementForceX * this.speed
        this.speedY = movementForceY * this.speed
    }
    move(){
        this.x += this.speedX
        this.y += this.speedY
    }
}