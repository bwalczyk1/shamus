export default class EnemyBullet{
    id : number
    x : number
    y : number
    speed : number = 7
    speedX : number
    speedY : number

    constructor(id: number, x : number, y : number, movementForceX : number, movementForceY : number){
        this.id = id
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