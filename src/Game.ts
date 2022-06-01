import Bullet from "./Bullet"
import Enemy from "./Enemy"
import ICollisionRect from "./ICollisionRect"
import Room from "./Room"

export default class Game{
    gameScreen : HTMLCanvasElement
    ctx : CanvasRenderingContext2D
    frame : number = 0
    animationFrame : number = 0
    frameLength : number = 100
    rooms : Room[] = []
    currentRoom : Room
    playerCollisionRect : ICollisionRect = {x: 0, y: 0, width: 14, height: 17}
    shadowCollisionRect : ICollisionRect = {x : 0, y: 0, width: 18, height: 15}
    basicSpeed : number = 1
    playerSpeed : number = this.basicSpeed
    shadowSpeed : number = 7
    shadowFreezeTime : number = 0
    playerMovementsObject : any = {}
    enemies : Enemy[] = []
    lastStartPosition : number[] = [16, Math.floor(176/2 - this.playerCollisionRect.height/2)]
    roomBackground : ICollisionRect[] = [{x: 0, y: 176, width: 320, height: 32}]
    startTime : number
    isFireModeOn : boolean = false
    isGunLoaded : boolean = true
    playerBullets : Bullet[] = []
    playerLives : number = 4
    score : number = 0
    highScore : number = 0
    bulletsFired : number = 0
    roomsTraveledSinceInjured : number = 0
    timeOfEnteringRoom : number
    keys : string[] = []
    keyCollisionRect : ICollisionRect
    keyHoleCollisionRect : ICollisionRect
    openingWallInterval : any
    roomsOfFoundKeys : number[] = []
    bulletsAnimations : any[] = []

    constructor(){
        this.startTime = Date.now()
        this.gameScreen = <HTMLCanvasElement> document.getElementById("gameScreen")
        // this.gameScreen.style.width = document.body.style.width;
        // this.gameScreen.style.height = document.body.style.height;
        this.ctx = this.gameScreen.getContext('2d')
        this.ctx.imageSmoothingEnabled = false

        this.rooms.push(new Room(10, "black", "yellow", [
                {x: 0, y: 64, width: 8, height: 48},
                {x: 0, y: 56, width: 56, height: 8}, 
                {x: 48, y: 8, width: 8, height: 48},
                {x: 48, y: 0, width: 224, height: 8},
                {x: 264, y: 8, width: 8, height: 48},
                {x: 264, y: 56, width: 56, height: 8},
                {x: 264, y: 112, width: 56, height: 8},
                {x: 264, y: 120, width: 8, height: 48},
                {x: 48, y: 168, width: 224, height: 8},
                {x: 48, y: 120, width: 8, height: 48},
                {x: 0, y: 112, width: 128, height: 8},
                {x: 120, y: 56, width: 8, height: 56},
                {x: 128, y: 56, width: 64, height: 8},
                {x: 192, y: 56, width: 8, height: 56}
            ],[null, 1, null, null], "blue", ""))
        this.rooms.push(new Room(21, "black", "yellow", [
                {x: 320 - 8, y: 56 + 8, width: 8, height: 112 - 56 - 8},
                {x: 0, y: 112, width: 320, height: 8},
                {x: 0, y: 56, width: 320, height: 8}
            ], [null, null, null, 0], "", "blue"))

        this.playerCollisionRect.x = this.lastStartPosition[0]
        this.playerCollisionRect.y = this.lastStartPosition[1]

        this.setNewRoom(0)
        
        document.addEventListener("keydown", (event) => {this.playerDetectAction(event)})
        document.addEventListener("keyup", (event)=> {this.playerStopAction(event)})
        // setInterval(() => {this.refreshScreen()}, this.frameLength)
        window.requestAnimationFrame(()=>this.refreshScreen())
    }

    async refreshScreen(){
        console.log(this.playerCollisionRect.x)
        this.ctx = this.gameScreen.getContext('2d')
        this.ctx.clearRect(0, 0, 320, 208)
        // this.ctx.fillStyle = "black"
        // this.ctx.fillRect(0, 0, 320, 208)

        //Detect room change
        if(this.playerCollisionRect.y < 0){
            this.setNewRoom(this.currentRoom.neighbourRoomsIds[0])
        }
        else if(this.playerCollisionRect.x + this.playerCollisionRect.width > 320){
            this.playerCollisionRect.x = 16
            this.setNewRoom(this.currentRoom.neighbourRoomsIds[1])
        }
        else if(this.playerCollisionRect.y + this.playerCollisionRect.height > 176){
            this.setNewRoom(this.currentRoom.neighbourRoomsIds[2])
        }
        else if(this.playerCollisionRect.x < 0){
            this.playerCollisionRect.x = 320 - 16 - this.playerCollisionRect.width
            this.setNewRoom(this.currentRoom.neighbourRoomsIds[3])
        }

        // Draw shadow and detect collision with player
        if(Date.now() - this.timeOfEnteringRoom >= 15000){
            let isShadowFrozen : boolean = (Date.now() - this.shadowFreezeTime <= 2500)
            let isShadowInMmove = Date.now() - this.timeOfEnteringRoom >= 17500
            if(isShadowInMmove && !isShadowFrozen && this.canReallyAnimate()){
                let newX, newY : number
                if(this.frame%2 == 1){
                    newX = this.shadowCollisionRect.x - 2
                    newY = this.shadowCollisionRect.y + 2
                    this.shadowCollisionRect = {x: newX, y: newY, width: 22, height: 11}
                }
                else{
                    newX = this.shadowCollisionRect.x + 2
                    newY = this.shadowCollisionRect.y - 2
                    this.shadowCollisionRect = {x: newX, y: newY, width: 18, height: 15}
                }
                this.moveShadow()
            }
            
            let shadowImg : HTMLImageElement = document.createElement('img')
            if(isShadowFrozen){
                shadowImg.src = './assets/enemies/shadow/frozen' + this.shadowFreezeTime%2 + '.png'
            }
            else if(isShadowInMmove){
                shadowImg.src = './assets/enemies/shadow/' + this.frame%2 + '.png'
            }
            else{
                shadowImg.src = './assets/enemies/shadow/0.png'
            }
            this.ctx.drawImage(shadowImg, this.shadowCollisionRect.x, this.shadowCollisionRect.y)
            if(this.isCollisionDetected(this.shadowCollisionRect, this.playerCollisionRect)){
                this.takeDamage()
                return
            }
        }


        // Draw background
        let wallImg = document.createElement('img')
        wallImg.src = './assets/background/' + this.currentRoom.bgColor + '.png'
        for(let backgroundLine of this.roomBackground){
            for(let i = 0; i < backgroundLine.width; i += 8){
                this.ctx.drawImage(wallImg, backgroundLine.x + i, backgroundLine.y)
            }
        }

        // Draw walls and detect their collisions with player
        for(let wall of this.currentRoom.wallCollisionRects){
            if(this.currentRoom.levelColor == "black"){
                this.ctx.fillStyle = "white"
            }
            else{
                this.ctx.fillStyle = this.currentRoom.levelColor
            }
            if(this.isCollisionDetected(wall, this.playerCollisionRect)){
                this.takeDamage()
                return
            }
            this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height)
            this.ctx.fillStyle = "blue"
            if(wall == this.currentRoom.wallCollisionRects[0]){
                let realFrame : number = this.frame - (wall.y - (this.currentRoom.wallCollisionRects[this.currentRoom.wallCollisionRects.length - 1].y + this.currentRoom.wallCollisionRects[this.currentRoom.wallCollisionRects.length - 1].height))/2
                for(let i = 0; i < wall.height; i += 8){
                    this.ctx.fillRect(wall.x, wall.y + i + realFrame%4*2, wall.width, 2)
                }
            }
            else if(wall.width >= wall.height){
                for(let i = 0; i < wall.width; i += 8){
                    this.ctx.fillRect(wall.x + i + this.frame%4*2, wall.y, 2, wall.height)
                }
            }
            else{
                for(let i = 0; i < wall.height; i += 8){
                    this.ctx.fillRect(wall.x, wall.y + i + this.frame%4*2, wall.width, 2)
                }
            }
        }

        // Draw interface
        // Highscore
        this.ctx.clearRect(0, 2*8, 6*8, 8)
        let highScoreString : string = this.highScore.toString()
        for(let i = 0; i < highScoreString.length; i++){
            let digitString : string = highScoreString[i]
            let digitImg : HTMLImageElement = document.createElement('img')
            digitImg.src = './assets/highscoreDigits/' + digitString + '.png'
            let digitX : number = 6*8 - (highScoreString.length - i)*8
            this.ctx.drawImage(digitImg, digitX, 2*8)
        }
        // Score
        this.ctx.clearRect(0, 4*8, 6*8, 8)
        let scoreString : string = this.score.toString()
        for(let i = 0; i < scoreString.length; i++){
            let digitString : string = scoreString[i]
            let digitImg : HTMLImageElement = document.createElement('img')
            digitImg.src = './assets/digits/' + digitString + '.png'
            let digitX : number = 6*8 - (scoreString.length - i)*8
            this.ctx.drawImage(digitImg, digitX, 4*8)
        }
        // Lives
        this.ctx.clearRect(320 - 6*8, 8, 6*8, 6*8)
        let lifeImg = document.createElement('img')
        lifeImg.src = './assets/playerLife.png'
        for(let i = 1; i <= this.playerLives; i++){
            this.ctx.drawImage(lifeImg, 320 - 6*8 + (i - 1)%3*16, 8 + Math.floor((i - 1)/3)*16)
        }
        // Room info and inventory
        this.ctx.clearRect(0, 208 - 4*8, 320, 4*8)
        // - Keys
        if(this.keys.includes("blue")){
            let blueKeyImage : HTMLImageElement = document.createElement('img')
            blueKeyImage.src = './assets/keys/blue.png'
            this.ctx.drawImage(blueKeyImage, 7*16 + 1, 176 + 1)
        }
        // - Room info
        let interfaceImage : HTMLImageElement = document.createElement('img')
        interfaceImage.src = './assets/interface.png'
        this.ctx.drawImage(interfaceImage, 8 + 1, 176 + 8)
        // - Room number
        let roomString : string = this.currentRoom.id.toString()
        for(let i = 0; i < roomString.length; i++){
            let digitString : string = roomString[i]
            let digitImg : HTMLImageElement = document.createElement('img')
            digitImg.src = './assets/digits/' + digitString + '.png'
            let digitX : number = (7+i)*8
            this.ctx.drawImage(digitImg, digitX, 176 + 8)
        }


        // Draw player
        let playerImg : HTMLImageElement = document.createElement('img')
        if(this.playerMovementsObject.goRight){
            playerImg.src = './assets/player/right/' + (this.frame % 2) + '.png'
        }
        else if(this.playerMovementsObject.goLeft){
            playerImg.src = './assets/player/left/' + (this.frame % 2) + '.png'
        }
        else if(this.playerMovementsObject.goUp || this.playerMovementsObject.goDown){
            playerImg.src = './assets/player/vert/' + (this.frame % 2) + '.png'
        }
        else{
            playerImg.src = './assets/player/still.png'
        }
        this.ctx.drawImage(playerImg, this.playerCollisionRect.x, this.playerCollisionRect.y)
        
        // Move enemies
        if(this.canReallyAnimate())
            this.moveEnemies()

        
        console.log('bb')

        // Draw enemies and detect their collisions with player
        for(let enemy of this.enemies){
            if(this.isCollisionDetected(this.playerCollisionRect, enemy.collisionRect)){
                this.takeDamage()
                return
            }
            else{
                // this.ctx.fillStyle = enemy.color
                // this.ctx.fillRect(enemy.collisionRect.x, enemy.collisionRect.y, enemy.collisionRect.width, enemy.collisionRect.height)
                let enemyPhase : number = this.frame % 4
                let enemyImg = document.createElement('img')
                switch(enemy.type){
                    case 0:
                        enemyImg.src = './assets/enemies/drone/' +  enemy.color + '/' + enemyPhase + '.png'
                        break
                    case 1:
                        let droidMovementPhase : number
                        if(enemy.movementObject.forceX != 0)
                            droidMovementPhase = enemyPhase%2
                        else if(enemy.movementObject.forceY != 0)
                            droidMovementPhase = enemyPhase%2 + 1
                        else
                            droidMovementPhase = enemyPhase%2*2
                        enemyImg.src = './assets/enemies/droid/' + enemy.color + '/' + enemyPhase + '_' + droidMovementPhase + '.png'
                        break
                    default:
                        enemyImg.src = './assets/enemies/jumper/' + enemyPhase + '.png'
                        break
                }
                this.ctx.drawImage(enemyImg, enemy.collisionRect.x, enemy.collisionRect.y)   
            }
        }

        // Move and draw bullets
        for(let bullet of this.playerBullets){
            if(this.canReallyAnimate())
                bullet.move()
            let bulletImg = document.createElement('img')
            bulletImg.src = './assets/bullets/' + bullet.type + '.png'
            if(bullet.type == "diagonal" || bullet.type == "diagonalInverted"){
                this.ctx.drawImage(bulletImg, bullet.collisionRect.x - 1, bullet.collisionRect.y - 1)
            }
            else{
                this.ctx.drawImage(bulletImg, bullet.collisionRect.x, bullet.collisionRect.y)
            }
        }

        // Draw key and detect its collision with player
        if(this.currentRoom.keyColor != "" && !this.roomsOfFoundKeys.includes(this.currentRoom.id)){
            let keyImage : HTMLImageElement= document.createElement('img')
            keyImage.src = './assets/keys/' + this.currentRoom.keyColor + '.png'
            this.ctx.drawImage(keyImage, this.keyCollisionRect.x, this.keyCollisionRect.y)
            if(this.isCollisionDetected(this.playerCollisionRect, this.keyCollisionRect)){
                this.keys.push(this.currentRoom.keyColor)
                this.roomsOfFoundKeys.push(this.currentRoom.id)
            }
        }

        // Draw keyhole and detect its collision with player
        if(this.currentRoom.keyHoleColor != "" && this.currentRoom.wallCollisionRects[0].y == this.currentRoom.wallCollisionRects[this.currentRoom.wallCollisionRects.length - 1].y + this.currentRoom.wallCollisionRects[this.currentRoom.wallCollisionRects.length - 1].height){
            let keyHoleImg : HTMLImageElement = document.createElement('img')
            keyHoleImg.src = './assets/keyholes/' + this.currentRoom.keyHoleColor + '.png'
            this.ctx.drawImage(keyHoleImg, this.keyHoleCollisionRect.x, this.keyHoleCollisionRect.y)
            if(this.isCollisionDetected(this.playerCollisionRect, this.keyHoleCollisionRect) && this.keys.includes(this.currentRoom.keyHoleColor)){
                let newKeys : string[] = []
                for(let keyColor of this.keys){
                    if(keyColor != this.currentRoom.keyHoleColor){
                        newKeys.push(keyColor)
                    }
                }
                this.keys = newKeys
                this.openingWallInterval = setInterval(()=>{
                    if(this.currentRoom.keyHoleColor != ""){
                        this.currentRoom.wallCollisionRects[0].y += 1
                        this.currentRoom.wallCollisionRects[0].height -= 1
                        if(this.currentRoom.wallCollisionRects[0].height == 0){
                            clearInterval(this.openingWallInterval)
                            this.openingWallInterval = null
                        }
                    }
                }, this.frameLength/2)
            }
        }

        // Draw bullets explosion animations
        let newBulletsAnimations : any[] = []
        for(let bulletAnimation of this.bulletsAnimations){
            if(this.frame - bulletAnimation.startFrame < 4){
                let bulletAnimationImage : HTMLImageElement = document.createElement('img')
                bulletAnimationImage.src = './assets/bulletExplosions/' + (this.frame - bulletAnimation.startFrame) + '.png'
                this.ctx.drawImage(bulletAnimationImage, bulletAnimation.x, bulletAnimation.y)
                newBulletsAnimations.push(bulletAnimation)
            }
        }
        this.bulletsAnimations = newBulletsAnimations

        // Detect bullets' collisions with shadow, walls and enemies
        let bulletsToDelete : Bullet[] = []
        let enemiesToDelete : Enemy[] = []
        for(let bullet of this.playerBullets){
            if(bullet.collisionRect.x + bullet.collisionRect.width < 0 || bullet.collisionRect.x > 320 || bullet.collisionRect.y + bullet.collisionRect.height < 0 || bullet.collisionRect.y > 176){
                bulletsToDelete.push(bullet)
            }
            else{
                if(this.isCollisionDetected(bullet.collisionRect, this.shadowCollisionRect)){
                    let bulletBlastX : number = bullet.collisionRect.x + bullet.width/2 - 24/2
                    let bulletBlastY : number = bullet.collisionRect.y + bullet.height/2 - 24/2
                    let bulletBlast : ICollisionRect = {x: bulletBlastX, y: bulletBlastY, width: 24, height: 24}
                    for(let neighbourEnemy of this.enemies){
                        if(this.isCollisionDetected(bulletBlast, neighbourEnemy.collisionRect) && !this.enemyArrayIncludes(enemiesToDelete, neighbourEnemy)){
                            enemiesToDelete.push(neighbourEnemy)
                        }
                    }
                    this.shadowFreezeTime = Math.floor(Date.now()/2)*2
                    bulletsToDelete.push(bullet)
                    this.bulletsAnimations.push({startFrame: this.frame + 1, x: bulletBlastX, y: bulletBlastY})
                }
                else{
                    for(let wall of this.currentRoom.wallCollisionRects){
                        if(this.isCollisionDetected(bullet.collisionRect, wall)){
                            let bulletBlastX : number = bullet.collisionRect.x + bullet.width/2 - 24/2
                            let bulletBlastY : number = bullet.collisionRect.y + bullet.height/2 - 24/2
                            
                            bulletsToDelete.push(bullet)
                            this.bulletsAnimations.push({startFrame: this.frame + 1, x: bulletBlastX, y: bulletBlastY})
                            break
                        }
                    }
                    for(let enemy of this.enemies){
                        if(this.isCollisionDetected(bullet.collisionRect, enemy.collisionRect)){
                            let bulletBlastX : number = bullet.collisionRect.x + bullet.width/2 - 24/2
                            let bulletBlastY : number = bullet.collisionRect.y + bullet.height/2 - 24/2
                            let bulletBlast : ICollisionRect = {x: bulletBlastX, y: bulletBlastY, width: 24, height: 24}
                            for(let neighbourEnemy of this.enemies){
                                if(this.isCollisionDetected(bulletBlast, neighbourEnemy.collisionRect) && !this.enemyArrayIncludes(enemiesToDelete, neighbourEnemy)){
                                    enemiesToDelete.push(neighbourEnemy)
                                }
                            }
                            if(!this.bulletArrayIncludes(bulletsToDelete, bullet)){
                                bulletsToDelete.push(bullet)
                                this.bulletsAnimations.push({startFrame: this.frame + 1, x: bulletBlastX, y: bulletBlastY})
                            }
                            break
                        }
                    }
                }
            }
        }
        this.score += 5*enemiesToDelete.length
        if(enemiesToDelete.length == this.enemies.length && enemiesToDelete.length > 0){
            this.score += 200
            this.playerSpeed *= 2
        }
        if(this.score > this.highScore){
            this.highScore = this.score
        }
        let newEnemies : Enemy[] = []
        for(let enemy of this.enemies){
            if(!this.enemyArrayIncludes(enemiesToDelete, enemy)){
                newEnemies.push(enemy)
            }
        }
        this.enemies = newEnemies
        let newBullets : Bullet[] = []
        for(let bullet of this.playerBullets){
            if(!this.bulletArrayIncludes(bulletsToDelete, bullet)){
                newBullets.push(bullet)
            }
        }
        this.playerBullets = newBullets

        
        if(this.canReallyAnimate())
            this.frame += 1
        this.animationFrame += 1
        console.log('aa')
        window.requestAnimationFrame(()=>this.refreshScreen())
    }

    setNewRoom(roomId: number){
        this.currentRoom = this.rooms[roomId]
        this.playerSpeed = this.basicSpeed
        this.lastStartPosition = [this.playerCollisionRect.x, this.playerCollisionRect.y]
        this.placeShadow()

        this.createRoomBackground()
        this.enemies = []
        this.playerBullets = []
        this.createEnemies(3)
        this.placeKey()
        this.placeKeyHole()
        this.timeOfEnteringRoom = Date.now()
        this.roomsTraveledSinceInjured += 1
    }

    takeDamage(){
        this.playerSpeed = this.basicSpeed
        this.placeShadow()
        if(this.playerLives ==  0){
            this.die()
        }
        else{
            this.playerLives--
            this.playerCollisionRect.x = this.lastStartPosition[0]
            this.playerCollisionRect.y = this.lastStartPosition[1]
            this.enemies = []
            this.playerBullets = []
            this.createEnemies(3)
            this.placeKey()
            this.placeKeyHole()
            this.timeOfEnteringRoom = Date.now()
            this.roomsTraveledSinceInjured = 1
        }
        window.requestAnimationFrame(()=>this.refreshScreen())
    }

    die(){
        // Reset score
        this.score = 0
        // Reset keys
        this.keys = []
        this.roomsOfFoundKeys = []
        // Reset keyholes
        for(let room of this.rooms){
            if(room.keyHoleColor != "" && room.wallCollisionRects[0].y != room.wallCollisionRects[room.wallCollisionRects.length - 1].y + room.wallCollisionRects[room.wallCollisionRects.length - 1].height){
                let oldY = room.wallCollisionRects[0].y
                room.wallCollisionRects[0].y = room.wallCollisionRects[room.wallCollisionRects.length - 1].y + room.wallCollisionRects[room.wallCollisionRects.length - 1].height
                room.wallCollisionRects[0].height = oldY - room.wallCollisionRects[0].y
            }
        }
        this.playerCollisionRect.x = 16
        this.playerCollisionRect.y = 176/2 - this.playerCollisionRect.height/2
        this.setNewRoom(0)
        this.playerLives = 4
    }

    createRoomBackground(){
        this.roomBackground = [{x: 0, y: 176, width: 320, height: 32}]
        
        //Top left
        for(let heightBonus = 0; heightBonus < 176/2; heightBonus += 16){
            let canCreateBackground = true
            for(let wall of this.currentRoom.wallCollisionRects){
                if(this.isCollisionDetected({x: 0, y: heightBonus, width: 8, height: 8}, wall)){
                    canCreateBackground = false
                    break
                }
            }
            if(!canCreateBackground){
                break
            }
            for(let widthBonus = 0; widthBonus <= 320/2 - 8; widthBonus += 8){
                let canExtendBackground = true
                for(let wall of this.currentRoom.wallCollisionRects){
                    if(this.isCollisionDetected({x: 0, y: heightBonus, width: 8 + widthBonus, height: 8}, wall)){
                        canExtendBackground = false
                        this.roomBackground.push({x: 0, y: heightBonus, width: 8 + widthBonus - 8, height: 16})
                        break
                    }
                }
                if(!canExtendBackground){
                    break
                }
                else if(widthBonus == 320/2 - 8){
                    this.roomBackground.push({x: 0, y: heightBonus, width: 8 + widthBonus, height: 16})
                }
            }
            for(let wall of this.currentRoom.wallCollisionRects){
                if(this.isCollisionDetected({x: 0, y: heightBonus, width: 8, height: 16}, wall)){
                    canCreateBackground = false
                    break
                }
            }
            if(!canCreateBackground){
                break
            }
        }

        // Bottom left
        for(let heightBonus = 0; heightBonus < 176/2 - 16; heightBonus += 16){
            let canCreateBackground = true
            for(let wall of this.currentRoom.wallCollisionRects){
                if(this.isCollisionDetected({x: 0, y: 176 - 16 - heightBonus + 8, width: 8, height: 8}, wall)){
                    canCreateBackground = false
                    break
                }
            }
            if(!canCreateBackground){
                break
            }
            for(let widthBonus = 0; widthBonus <= 320/2 - 8; widthBonus += 8){
                let canExtendBackground = true
                for(let wall of this.currentRoom.wallCollisionRects){
                    if(this.isCollisionDetected({x: 0, y: 176 - 16 - heightBonus + 8, width: 8 + widthBonus, height: 8}, wall)){
                        canExtendBackground = false
                        this.roomBackground.push({x: 0, y: 176 - 16 - heightBonus, width: 8 + widthBonus - 8, height: 16})
                        break
                    }
                }
                if(!canExtendBackground){
                    break
                }
                else if(widthBonus == 320/2 - 8){
                    this.roomBackground.push({x: 0, y: 176 - 16 - heightBonus, width: 8 + widthBonus, height: 16})
                }
            }
            for(let wall of this.currentRoom.wallCollisionRects){
                if(this.isCollisionDetected({x: 0, y: 176 - 16 - heightBonus, width: 8, height: 16}, wall)){
                    canCreateBackground = false
                    break
                }
            }
            if(!canCreateBackground){
                break
            }
        }

        // Top right
        for(let heightBonus = 0; heightBonus < 176/2; heightBonus += 16){
            let canCreateBackground = true
            for(let wall of this.currentRoom.wallCollisionRects){
                if(this.isCollisionDetected({x: 320 - 8, y: heightBonus, width: 8, height: 8}, wall)){
                    canCreateBackground = false
                    break
                }
            }
            if(!canCreateBackground){
                break
            }
            for(let widthBonus = 0; widthBonus <= 320/2 - 8; widthBonus += 8){
                let canExtendBackground = true
                for(let wall of this.currentRoom.wallCollisionRects){
                    if(this.isCollisionDetected({x: 320 - 8 - widthBonus, y: heightBonus, width: 8 + widthBonus, height: 8}, wall)){
                        canExtendBackground = false
                        this.roomBackground.push({x: 320 - 8 - widthBonus, y: heightBonus, width: 8 + widthBonus, height: 16})
                        break
                    }
                }
                if(!canExtendBackground){
                    break
                }
                else if(widthBonus == 320/2 - 8){
                    this.roomBackground.push({x: 320 - 8 - widthBonus, y: heightBonus, width: 8 + widthBonus, height: 16})
                }
            }
            for(let wall of this.currentRoom.wallCollisionRects){
                if(this.isCollisionDetected({x: 320 - 8, y: heightBonus, width: 8, height: 16}, wall)){
                    canCreateBackground = false
                    break
                }
            }
            if(!canCreateBackground){
                break
            }
        }

        // Bottom right
        for(let heightBonus = 0; heightBonus < 176/2 - 16; heightBonus += 16){
            let canCreateBackground = true
            for(let wall of this.currentRoom.wallCollisionRects){
                if(this.isCollisionDetected({x: 320 - 8, y: 176 - 16 - heightBonus + 8, width: 8, height: 8}, wall)){
                    canCreateBackground = false
                    break
                }
            }
            if(!canCreateBackground){
                break
            }
            for(let widthBonus = 0; widthBonus <= 320/2 - 8; widthBonus += 8){
                let canExtendBackground = true
                for(let wall of this.currentRoom.wallCollisionRects){
                    if(this.isCollisionDetected({x: 320 - 8 - widthBonus, y: 176 - 16 - heightBonus + 8, width: 8 + widthBonus, height: 8}, wall)){
                        canExtendBackground = false
                        this.roomBackground.push({x: 320 - 8 - widthBonus, y: 176 - 16 - heightBonus, width: 8 + widthBonus, height: 16})
                        break
                    }
                }
                if(!canExtendBackground){
                    break
                }
                else if(widthBonus == 320/2 - 8){
                    this.roomBackground.push({x: 320 - 8 - widthBonus, y: 176 - 16 - heightBonus, width: 8 + widthBonus, height: 16})
                }
            }
            for(let wall of this.currentRoom.wallCollisionRects){
                if(this.isCollisionDetected({x: 320 - 8, y: 176 - 16 - heightBonus, width: 8, height: 16}, wall)){
                    canCreateBackground = false
                    break
                }
            }
            if(!canCreateBackground){
                break
            }
        }
    }

    placeShadow(){
        let shadowMargin : number = 15
        let shadowPlacements : number[][] = [
            [shadowMargin, shadowMargin], 
            [320 - shadowMargin - this.shadowCollisionRect.width, shadowMargin], 
            [320 - shadowMargin - this.shadowCollisionRect.width, 176 - shadowMargin - this.shadowCollisionRect.height],
            [shadowMargin, 176 - shadowMargin - this.shadowCollisionRect.height]]
        let newShadowPlacement : number[] = shadowPlacements[Math.floor(Math.random() * shadowPlacements.length)]
        this.shadowCollisionRect.x = newShadowPlacement[0]
        this.shadowCollisionRect.y = newShadowPlacement[1]
    }

    moveShadow(){
        let playerCenterX : number = this.playerCollisionRect.x + this.playerCollisionRect.width/2
        let playerCenterY : number = this.playerCollisionRect.y + this.playerCollisionRect.height/2

        let shadowCenterX : number = this.shadowCollisionRect.x + this.shadowCollisionRect.width/2
        let shadowCenterY : number = this.shadowCollisionRect.y + this.shadowCollisionRect.height/2

        if(this.shadowSpeed <= Math.abs(playerCenterX - shadowCenterX)){
            this.shadowCollisionRect.x += (playerCenterX - shadowCenterX)/Math.abs(playerCenterX - shadowCenterX)*this.shadowSpeed
        }
        else{
            this.shadowCollisionRect.x += playerCenterX - shadowCenterX
        }
        
        if(this.shadowSpeed <= Math.abs(playerCenterY - shadowCenterY)){
            this.shadowCollisionRect.y += (playerCenterY - shadowCenterY)/Math.abs(playerCenterY - shadowCenterY)*this.shadowSpeed
        }
        else{
            this.shadowCollisionRect.y += playerCenterY - shadowCenterY
        }
    }

    createEnemies(n : number){
        let maxEnemyType : number = Math.floor(this.currentRoom.id/10)
        if(maxEnemyType > 2)
            maxEnemyType = 2
        let i : number = 0
        while(i < n){
            let newEnemy : Enemy = new Enemy(Math.floor(Math.random()*(maxEnemyType + 1)))
            newEnemy.setPosition(Math.floor(Math.random() * (320 - newEnemy.collisionRect.width)), Math.floor(Math.random() * (176 - newEnemy.collisionRect.height)))
            let isAbleToAddEnemy : boolean = true
            
            for(let backgroundLine of this.roomBackground){
                if(this.isCollisionDetected(newEnemy.collisionRect, backgroundLine)){
                    isAbleToAddEnemy = false
                    break
                }
            }
            if(isAbleToAddEnemy){
                for(let wall of this.currentRoom.wallCollisionRects){
                    if(this.isCollisionDetected(newEnemy.collisionRect, wall)){
                        isAbleToAddEnemy = false
                        break
                    }
                }
            }
            if(isAbleToAddEnemy){
                for(let enemy of this.enemies){
                    if(this.isCollisionDetected(newEnemy.collisionRect, enemy.collisionRect)){
                        isAbleToAddEnemy = false
                        break
                    }
                }
            }
            
            if(isAbleToAddEnemy){
                this.enemies.push(newEnemy)
                i++
            }
        }
    }

    placeKey(){
        if(this.currentRoom.keyColor != ""){
            let isAbleToPlaceKey : boolean
            do{
                isAbleToPlaceKey = true
                this.keyCollisionRect = {x: Math.floor(Math.random() * (320 - 14)), y: Math.floor(Math.random() * (176 - 6)), width: 14, height: 6}
                for(let backgroundLine of this.roomBackground){
                    if(this.isCollisionDetected(this.keyCollisionRect, backgroundLine)){
                        isAbleToPlaceKey = false
                        break
                    }
                }
                if(isAbleToPlaceKey){
                    for(let wall of this.currentRoom.wallCollisionRects){
                        if(this.isCollisionDetected(this.keyCollisionRect, wall)){
                            isAbleToPlaceKey = false
                            break
                        }
                    }
                }
            }while(!isAbleToPlaceKey)
        }
    }

    placeKeyHole(){
        if(this.currentRoom.keyHoleColor != ""){
            let isAbleToPlaceKeyHole : boolean
            do{
                isAbleToPlaceKeyHole = true
                let keyHoleX = Math.floor(320*Math.floor(Math.random()*5)/5 + 320/10 - 16/2)
                let keyHoleY = Math.floor(176*Math.floor(Math.random()*3)/3 + 176/6 - 13/2)
                this.keyHoleCollisionRect = {x: keyHoleX, y: keyHoleY, width: 16, height: 13}
                for(let backgroundLine of this.roomBackground){
                    if(this.isCollisionDetected(this.keyHoleCollisionRect, backgroundLine)){
                        isAbleToPlaceKeyHole = false
                        break
                    }
                }
            }while(!isAbleToPlaceKeyHole)
        }
    }

    playerDetectAction(e : KeyboardEvent){
        let key : String = e.key

        if(key == "Control"){
            let movementforceX : number = 0
            let movementforceY : number = 0

            if(this.playerMovementsObject.goRight){
                movementforceX = 1
            }
            else if(this.playerMovementsObject.goLeft){
                movementforceX = -1
            }
            clearInterval(this.playerMovementsObject.goLeft)
            this.playerMovementsObject.goLeft = null
            clearInterval(this.playerMovementsObject.goRight)
            this.playerMovementsObject.goRight = null

            if(this.playerMovementsObject.goUp){
                movementforceY = -1
            }
            else if(this.playerMovementsObject.goDown){
                movementforceY = 1
            }
            clearInterval(this.playerMovementsObject.goDown)
            this.playerMovementsObject.goDown = null
            clearInterval(this.playerMovementsObject.goUp)
            this.playerMovementsObject.goUp = null

            this.isFireModeOn = true
            
            if((movementforceX != 0 || movementforceY != 0) && this.isGunLoaded && this.playerBullets.length < 2){
                this.firePlayerBullet([movementforceX, movementforceY])
            }
        }
        else if(this.isFireModeOn && this.isGunLoaded){
            if(this.playerBullets.length < 2){
                switch (key){
                    case "ArrowRight":
                        this.firePlayerBullet([1, 0])
                        break
                    case "ArrowLeft":
                        this.firePlayerBullet([-1, 0])
                        break
                    case "ArrowUp":
                        this.firePlayerBullet([0, -1])
                        break
                    case "ArrowDown":
                        this.firePlayerBullet([0, 1])
                        break
                    default:
                        break
                }
            }
        }
        else if(key == "ArrowDown" && !this.playerMovementsObject.goDown){
            this.playerMovementsObject.goDown = setInterval(()=>{
                if(this.playerCollisionRect.y <= 1080 - this.playerCollisionRect.height - this.playerSpeed){
                    this.playerCollisionRect.y += this.playerSpeed
                }
            }, Math.floor(1000/60))
        }
        else if(key == "ArrowUp" && !this.playerMovementsObject.goUp){
            this.playerMovementsObject.goUp = setInterval(()=>{
                if(this.playerCollisionRect.y > 0){
                    this.playerCollisionRect.y -= this.playerSpeed
                }
            }, Math.floor(1000/60))
        }
        else if(key == "ArrowRight" && !this.playerMovementsObject.goRight){
            this.playerMovementsObject.goRight = setInterval(()=>{
                if(this.playerCollisionRect.x <= 1920 - this.playerCollisionRect.width - this.playerSpeed){
                    this.playerCollisionRect.x += this.playerSpeed
                }
            }, Math.floor(1000/60))
        }
        else if(key == "ArrowLeft" && !this.playerMovementsObject.goLeft){
            this.playerMovementsObject.goLeft = setInterval(()=>{
                if(this.playerCollisionRect.x > 0){
                    this.playerCollisionRect.x -= this.playerSpeed
                }
            }, Math.floor(1000/60))
        }
    }

    playerStopAction(e : KeyboardEvent){
        let key : String = e.key
        if(key == "Control"){
            this.isFireModeOn = false
        }
        else if(key == "ArrowDown"){
            this.isGunLoaded = true
            clearInterval(this.playerMovementsObject.goDown)
            this.playerMovementsObject.goDown = null
        }
        else if(key == "ArrowUp"){
            this.isGunLoaded = true
            clearInterval(this.playerMovementsObject.goUp)
            this.playerMovementsObject.goUp = null
        }
        else if(key == "ArrowRight"){
            this.isGunLoaded = true
            clearInterval(this.playerMovementsObject.goRight)
            this.playerMovementsObject.goRight = null
        }
        else if(key == "ArrowLeft"){
            this.isGunLoaded = true
            clearInterval(this.playerMovementsObject.goLeft)
            this.playerMovementsObject.goLeft = null
        }
    }

    firePlayerBullet(movementForces : number[]){
        this.isGunLoaded = false
        let newBullet : Bullet = new Bullet(this.bulletsFired, movementForces)
        let horizontalCenterDistance : number = (this.playerCollisionRect.width/2 + newBullet.width/2) 
        let verticalCenterDistance : number = (this.playerCollisionRect.height/2 + newBullet.height/2)
        let newBulletX = Math.floor(this.playerCollisionRect.x + this.playerCollisionRect.width/2 + horizontalCenterDistance*movementForces[0] - newBullet.width/2)
        let newBulletY = Math.floor(this.playerCollisionRect.y + this.playerCollisionRect.height/2 + verticalCenterDistance*movementForces[1] - newBullet.height/2)
        newBullet.setCoords(newBulletX, newBulletY)
        this.playerBullets.push(newBullet)
        this.bulletsFired += 1
    }

    moveEnemies(){
        for(let enemy of this.enemies){
            if(enemy.type == 2){
                if(this.frame%2 == 0){
                    let distanceX : number = (this.playerCollisionRect.x + this.playerCollisionRect.width/2) - (enemy.collisionRect.x + enemy.collisionRect.width/2)
                    let distanceY : number = (this.playerCollisionRect.y + this.playerCollisionRect.height/2) - (enemy.collisionRect.y + enemy.collisionRect.height/2)
                    if(Math.abs(distanceX) > enemy.speed){
                        distanceX = distanceX/Math.abs(distanceX)*enemy.speed
                    }
                    if(Math.abs(distanceY) > enemy.speed){
                        distanceY = distanceY/Math.abs(distanceY)*enemy.speed
                    }
                    let newCollisionRect : ICollisionRect = {x: enemy.collisionRect.x + distanceX, y: enemy.collisionRect.y + distanceY, width: enemy.collisionRect.width, height: enemy.collisionRect.height}
                    while(!this.canEnemyMove(enemy, newCollisionRect)){
                        if(Math.abs(distanceX) >= Math.abs(distanceY)){
                            distanceY = 0
                        }
                        else{
                            distanceX = 0
                        }
                        newCollisionRect= {x: enemy.collisionRect.x + distanceX, y: enemy.collisionRect.y + distanceY, width: enemy.collisionRect.width, height: enemy.collisionRect.height}
                    }

                    enemy.collisionRect = newCollisionRect
                }
            }
            else if(enemy.type == 1){
                if(this.frame - enemy.movementObject.endFrame >= 8){
                    // Start new movement
                    if(this.canEnemySeePlayer(enemy.collisionRect)){
                        // Choose direction
                        console.log('real move')
                        let distanceX : number = (this.playerCollisionRect.x + this.playerCollisionRect.width/2) - (enemy.collisionRect.x + enemy.collisionRect.width/2)
                        let distanceY : number = (this.playerCollisionRect.y + this.playerCollisionRect.height/2) - (enemy.collisionRect.y + enemy.collisionRect.height/2)
                        if(Math.abs(distanceX) > Math.abs(distanceY)){
                            enemy.movementObject.forceX = distanceX/Math.abs(distanceX)
                        }
                        else{
                            enemy.movementObject.forceY = distanceY/Math.abs(distanceY)
                        }
                    }
                    else{
                        // Random direction
                        console.log('random move')
                        let randOfFour : number = Math.floor(Math.random() * 4)
                        if(randOfFour%2 == 0){
                            enemy.movementObject.forceX = randOfFour-1
                        }
                        else{
                            enemy.movementObject.forceY = randOfFour - 2
                        }
                    }
                    enemy.movementObject.endFrame = this.frame + 48/enemy.speed
                }
                else if(this.frame == enemy.movementObject.endFrame){
                    // Reset movement forces
                    enemy.movementObject.forceX = 0
                    enemy.movementObject.forceY = 0
                }
                else if(this.frame < enemy.movementObject.endFrame){
                    // Move if possible
                    let newCollisionRect : ICollisionRect = {x: enemy.collisionRect.x + enemy.movementObject.forceX*enemy.speed, y: enemy.collisionRect.y + enemy.movementObject.forceY*enemy.speed, width: enemy.collisionRect.width, height: enemy.collisionRect.height}
                    
                    if(this.canEnemyMove(enemy, newCollisionRect)){
                        enemy.collisionRect = newCollisionRect
                    }
                    else{
                        // Stop movement
                        enemy.movementObject.forceX = 0
                        enemy.movementObject.forceY = 0
                        enemy.movementObject.endFrame = this.frame
                    }
                }
            }
            else{
                // Horizontal
                let horizontalDistance : number = this.playerCollisionRect.x - enemy.collisionRect.x
                for(let i = 0; Math.abs(i) <= Math.abs(this.playerCollisionRect.x - enemy.collisionRect.x); i += (this.playerCollisionRect.x - enemy.collisionRect.x)/Math.abs(this.playerCollisionRect.x - enemy.collisionRect.x)*enemy.speed){
                    let didHitWall = false
                    for(let wall of this.currentRoom.wallCollisionRects){
                        if(this.isCollisionDetected({x: enemy.collisionRect.x + i, y: enemy.collisionRect.y, width: enemy.collisionRect.width, height: enemy.collisionRect.height}, wall)){
                            didHitWall = true
                            horizontalDistance = i - (this.playerCollisionRect.x - enemy.collisionRect.x)/Math.abs(this.playerCollisionRect.x - enemy.collisionRect.x)*enemy.speed
                            break
                        }
                    }
                    if(!didHitWall){
                        for(let encounteredEnemmy of this.enemies){
                            if(!enemy.equals(encounteredEnemmy) && this.isCollisionDetected({x: enemy.collisionRect.x + i, y: enemy.collisionRect.y, width: enemy.collisionRect.width, height: enemy.collisionRect.height}, encounteredEnemmy.collisionRect)){
                                didHitWall = true
                                horizontalDistance = i - (this.playerCollisionRect.x - enemy.collisionRect.x)/Math.abs(this.playerCollisionRect.x - enemy.collisionRect.x)*enemy.speed
                                break
                            }
                        }
                    }
                    if(didHitWall){
                        break
                    }
                }
                
                // Vertical
                let verticalDistance : number = this.playerCollisionRect.y - enemy.collisionRect.y
                for(let i = 0; Math.abs(i) <= Math.abs(this.playerCollisionRect.y - enemy.collisionRect.y); i += (this.playerCollisionRect.y - enemy.collisionRect.y)/Math.abs(this.playerCollisionRect.y - enemy.collisionRect.y)*enemy.speed){
                    let didHitWall = false
                    for(let wall of this.currentRoom.wallCollisionRects){
                        if(this.isCollisionDetected({x: enemy.collisionRect.x, y: enemy.collisionRect.y + i, width: enemy.collisionRect.width, height: enemy.collisionRect.height}, wall)){
                            didHitWall = true
                            verticalDistance = i - (this.playerCollisionRect.y - enemy.collisionRect.y)/Math.abs(this.playerCollisionRect.y - enemy.collisionRect.y)*enemy.speed
                            break
                        }
                    }
                    if(!didHitWall){
                        for(let encounteredEnemmy of this.enemies){
                            if(!enemy.equals(encounteredEnemmy) && this.isCollisionDetected({x: enemy.collisionRect.x, y: enemy.collisionRect.y + i, width: enemy.collisionRect.width, height: enemy.collisionRect.height}, encounteredEnemmy.collisionRect)){
                                didHitWall = true
                                verticalDistance = i - (this.playerCollisionRect.y - enemy.collisionRect.y)/Math.abs(this.playerCollisionRect.y - enemy.collisionRect.y)*enemy.speed
                                break
                            }
                        }
                    }
                    if(didHitWall){
                        break
                    }
                }
                
                if(Math.abs(horizontalDistance) > Math.abs(verticalDistance) && Math.abs(horizontalDistance) >= this.playerSpeed){
                    // if(Math.abs(horizontalDistance) >= enemy.speed)
                        enemy.collisionRect.x += (this.playerCollisionRect.x - enemy.collisionRect.x)/Math.abs(this.playerCollisionRect.x - enemy.collisionRect.x) * enemy.speed
                    // else
                    //     enemy.collisionRect.x += Math.floor(horizontalDistance)
                }
                else if(Math.abs(verticalDistance) >= this.playerSpeed){
                    // if(Math.abs(verticalDistance) >= enemy.speed)
                        enemy.collisionRect.y += (this.playerCollisionRect.y - enemy.collisionRect.y)/Math.abs(this.playerCollisionRect.y - enemy.collisionRect.y) * enemy.speed
                    // else
                    //     enemy.collisionRect.y += Math.floor(verticalDistance)
                }    
            }
        }
    }

    isNumberBetween(n : number, min: number, max: number) : boolean{
        return n >=min && n <= max
    }

    isCollisionDetected(cr1 : ICollisionRect, cr2 : ICollisionRect) : boolean{
        if(cr1.x + cr1.width > cr2.x 
            && cr1.x < cr2.x + cr2.width 
            && cr1.y + cr1.height > cr2.y 
            && cr1.y < cr2.y + cr2.height){
            return true
        }
        else{
            return false
        }
    }

    canEnemyMove(enemy : Enemy, newCollisionRect : ICollisionRect) : boolean{
        if(newCollisionRect.x < 0 || newCollisionRect.y < 0 || newCollisionRect.x + newCollisionRect.width > 320 || newCollisionRect.y + newCollisionRect.height > 176){
            return false
        }
        for(let otherEnemy of this.enemies){
            if(!otherEnemy.equals(enemy) && this.isCollisionDetected(otherEnemy.collisionRect, newCollisionRect)){
                return false
            }
        }
        for(let wall of this.currentRoom.wallCollisionRects){
            if(this.isCollisionDetected(newCollisionRect, wall)){
                return false
            }
        }

        return true
    }

    canEnemySeePlayer(enemyCollisionRect : ICollisionRect) : boolean{
        let enemyPoint : number[] = [enemyCollisionRect.x + enemyCollisionRect.width/2, enemyCollisionRect.y + enemyCollisionRect.height/2]
        let playerPoint : number[] = [this.playerCollisionRect.x + this.playerCollisionRect.width/2, this.playerCollisionRect.y + this.playerCollisionRect.height/2]
        let wallPoint1, wallPoint2 : number[]
        for(let wall of this.currentRoom.wallCollisionRects){
            wallPoint1 = [wall.x, wall.y]
            wallPoint2 = [wall.x + wall.width, wall.y + wall.height]
            if(this.isIntersectionDetected(enemyPoint, playerPoint, wallPoint1, wallPoint2))
                return false
        }

        return true
    }

    isIntersectionDetected(A : number[], B : number[], C : number[], D : number[]) : boolean{
        let v1 : number = this.vectorProduct(C, D, A)
        let v2 : number = this.vectorProduct(C, D, B)
        let v3 : number = this.vectorProduct(A, B, C)
        let v4 : number = this.vectorProduct(A, B, D)

        if((v1>0&&v2<0||v1<0&&v2>0)&&(v3>0&&v4<0||v3<0&&v4>0)) 
            return true

        return false
    }

    vectorProduct(X: number[], Y: number[], Z: number[]) : number{
        let x1 : number = Z[0] - X[0]
        let y1 : number = Z[1] - X[1]
        let x2 : number =  Y[0] - X[0]
        let y2 : number = Y[1] - X[1]

        return x1*y2 - x2*y1
    }

    enemyArrayIncludes(enemyArray : Enemy[], enemyToCheck : Enemy) : boolean{
        for(let enemy of enemyArray){
            if(enemyToCheck.equals(enemy))
                return true
        }
        return false
    }

    bulletArrayIncludes(bulletArray : Bullet[], bulletToCheck : Bullet) : boolean{
        for(let bullet of bulletArray){
            if(bulletToCheck.id == bullet.id)
                return true
        }
        return false
    }

    canReallyAnimate(){
        return this.animationFrame%6 == 0
    }
}