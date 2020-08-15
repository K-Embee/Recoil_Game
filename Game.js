class Movable{
    constructor(game, x, y){
        this.size_x = 16;
        this.size_y = 16;
        this.loc = [x,y];
        this.velocity = [0,0]
        this.accel = [0,0];
        this.jerk = [0,0];
        this.game = game;
        this.game.movables.push(this);
        this.markForDeletion = false; //To avoid deleting movables in the middle of the game loop we'll mark for cleanup to delete next frame
    }

    //Movable helper functions
    getTop(){ return this.loc[1]; }
    getBottom(){ return this.loc[1]+this.size_y; }
    getLeft(){ return this.loc[0]; }
    getRight(){ return this.loc[0]+this.size_x; }
    getCenterX(){ return loc[0]+this.size_x/2; }
    getCenterY(){ return loc[1]+this.size_y+2; }

    //Cleanup/Delete methods
    markForCleanup(){ this.markForDeletion = true; }
    cleanup(){
        var index = this.game.movables.findIndex(e => e == this);
        if (index != -1) { delete this.game.movables[index]; }
    }

    //TODO: Add world collision
    checkWorldCollision(){

    }

    collide(){

    }

    //TODO: Rewrite with proper vector math
    updateMovement(direction){
        //Get acceleration from input, divided by itself to clamp at 1
        this.accel[0] = direction[0]/((direction[0] == 0) ? 1 : Math.abs(direction[0]));
        this.accel[1] = direction[1]/((direction[1] == 0) ? 1 : Math.abs(direction[1]));

        //Add jerk
        this.accel[0] += this.jerk[0];
        this.accel[1] += this.jerk[1];
        this.jerk[0] = 0;
        this.jerk[1] = 0;

        //Turn accel into speed
        this.velocity[0] += this.accel[0];
        this.velocity[1] += this.accel[1];

        //Turn speed into position updates
        this.loc[0] += this.velocity[0];
        this.loc[1] += this.velocity[1];
    }

    update(){
        this.updateMovement([0,0]);
        this.checkWorldCollision();
    }

}

class Player extends Movable{
    constructor(game){
        super(game, 0, 0)
        this.weapon = new Weapon(this);
    }

    update(keyState){
        this.updateShot(keyState.mousePos, keyState.mouseButton);
        this.updateMovement(keyState.direction);
    }

    updateShot(position, button) {
        if(button == true && this.weapon.onCooldown() == false){
            var vector_x = this.loc[0] - position[0]*this.game.screenSize_x;
            var vector_y = this.loc[1] - position[1]*this.game.screenSize_y;
            var vector_len = Math.sqrt(vector_x*vector_x+vector_y*vector_y) //Obtain vector length, this is needed for normalizing later

            //Shoot the player's weapon
            this.weapon.fire(-(vector_x/vector_len)*20, -(vector_y/vector_len)*20);

            //Set the player's jerk,
            this.jerk[0] = (vector_x/vector_len)*20; //Divide by vector length to normalize, multiply by 20
            this.jerk[1] = (vector_y/vector_len)*20;
        }
    }

    //TODO: Rewrite with proper vector math, clean up
    updateMovement(direction){
        //Get acceleration from input, divided by itself to clamp at 1
        this.accel[0] = direction[0]/((direction[0] == 0) ? 1 : Math.abs(direction[0]));
        this.accel[1] = direction[1]/((direction[1] == 0) ? 1 : Math.abs(direction[1]));

        //Add jerk
        this.accel[0] += this.jerk[0];
        this.accel[1] += this.jerk[1];
        this.jerk[0] = 0;
        this.jerk[1] = 0;

        //Apply friction if not accelerating
        if (this.accel[0] == 0) { this.accel[0] -= this.velocity[0]*0.1; }
        if (this.accel[1] == 0) { this.accel[1] -= this.velocity[1]*0.1; }
        //Apply friction if over the speed limit
        if(Math.abs(this.velocity[0]) > 3) { this.accel[0] -= this.velocity[0]*0.3; }
        if(Math.abs(this.velocity[1]) > 3) { this.accel[1] -= this.velocity[1]*0.3; }

        //Turn accel into speed
        this.velocity[0] += this.accel[0];
        this.velocity[1] += this.accel[1];
        //Clamp accel based on the speedlimit
//        if(Math.abs(this.velocity[0]) > 3) { this.velocity[0] = (this.velocity[0]<0) ? -3 : 3; }
//        if(Math.abs(this.velocity[1]) > 3) { this.velocity[1] = (this.velocity[1]<0) ? -3 : 3; }

        //Turn speed into position updates
        this.loc[0] += this.velocity[0];
        this.loc[1] += this.velocity[1];
    }
}

class Weapon{
    constructor(user){
        this.user = user
        this.lastShot = 0;
        this.cooldown = 750;
    }

    onCooldown(){
        return (Date.now() - this.lastShot < this.cooldown);
    }

    fire(x, y){
        if(!this.onCooldown()) {
            this.lastShot = Date.now();
            new Bullet(this.user.game, this.user.loc[0], this.user.loc[1], x, y)
        }
    }
}

class Bullet extends Movable{
    constructor(game, x, y, x_dir, y_dir){
        super(game, x, y);
        this.velocity[0] = x_dir;
        this.velocity[1] = y_dir;
        setTimeout(this.markForCleanup, 3000);
    }
}

class Game{
    constructor(size_x, size_y){
        this.screenSize_y = size_y;
        this.screenSize_x = size_x;
        this.movables = [];
        this.player = new Player(this);
    }

    update(keyState){
        this.player.update(keyState);
        this.movables.forEach(e => ((e instanceof Player) ? Function.prototype /*noop*/ : e.update([0,0]) ));

        //Collision loop
        for(var i = 0; i < this.movables.length; i++) {
			for(var j = i+1; j < this.movables.length; j++) {
				if(i == null || j == null) continue;
				if(this.checkCollision(this.movables[i], this.movables[j])) {
                    this.movables[i].collide(this.movables[j]);
                    this.movables[j].collide(this.movables[i]);
                }
			}
		}

        //Cleanup loop
        this.movables.forEach(e => ((e.markForDeletion) ? e.cleanup() : Function.prototype));
    }

    //AABB collision check
    checkCollision(obj_a, obj_b){
        if(obj_a.getTop() > obj_b.getBottom() || obj_a.getBottom() < obj_b.getTop()) { //return if no overlap on Y axis (if a's min > b's max or a's max < b's min)
            return false;
        }
        if(obj_a.getLeft() > obj_b.getRight() || obj_a.getRight() < obj_b.getLeft()) { //return if no overlap on X axis (if a's min > b's max or a's max < b's min)
            return false;
        }
        return true; //if overlap on both axes then true
    }

}
