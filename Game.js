class Movable{
    constructor(game, x, y){
        this.size_x = 15;
        this.size_y = 15;
        this.loc = [x,y]; //Position (x). Persstent. Updated every frame.
        this.velocity = [0,0]; //Speed (x/dt). Persistent. Updated every frame.
        this.accel = [0,0]; //Acceleration (x/dt^2). Reset every frame Updated every frame.
        this.jerk = [0,0]; //Jerk (x/dt^3). Up to 10 is removed and applied to acceleration every frame. Updated on special-occasion single frames.
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
    cleanup(){
        var index = this.game.movables.findIndex(e => e == this);
        if (index != -1) { delete this.game.movables[index]; }
    }

    //TODO: Add world collision
    checkWorldCollision(){
        //Wall collision - Rebound in the case of most objects
        //Top or bottom collision, flip Y speed
        var top, bottom, left, right, tileSize;
        top = this.getTop();
        bottom = this.getBottom();
        left = this.getLeft();
        right = this.getRight();
        tileSize = this.game.tileSize;

        var tl, tr, bl, br, wallDistance;
        tl = this.game.getTile(left, top);
        tr = this.game.getTile(right, top);
        bl = this.game.getTile(left,bottom);
        br = this.game.getTile(right, bottom);

        //If all four corners are in a wall we've glitched ourselves by going too fast, try again with less speed
        //Also, if we're impacting the opposite side of a wall then we've also glitched ourselves
        //Assuming that speed never reaches double the tile size or more (It shouldn't), and 1.5x in most cases
        if( (tl == 1 && tr == 1 && bl == 1 && br == 1)
            ||
            ((tl == 1 && tr == 1 && Math.sign(this.velocity[1]) > 0) ||
            (bl == 1 && br == 1 && Math.sign(this.velocity[1]) < 0))
            ||
            ((tl == 1 && bl == 1 && Math.sign(this.velocity[0]) > 0) ||
            (tr == 1 && br == 1 && Math.sign(this.velocity[0]) < 0))

            )
        {
                //Move it back and and slow it down a little
                this.loc[0] = this.loc[0] - (this.velocity[0]/2)
                this.loc[1] = this.loc[1] - (this.velocity[1]/2)
                this.velocity[0] *= 0.66
                this.velocity[1] *= 0.66
                this.checkWorldCollision()
                return;
        }

        //If the top or bottom two corners are in a wall, we've hit it from above/below
        if( (tl == 1 && tr == 1) || (bl == 1 && br == 1) ) {
            //Move out of the tile, we can tell which way to go based on our current velocity
            wallDistance = (this.velocity[1] > 0) ? this.loc[1]%tileSize : (tileSize-this.loc[1])%tileSize; // checks whether the lower or higher tile boundry is the
            this.loc[1] = this.loc[1] - ( (wallDistance + 0.1) * Math.sign(this.velocity[1]) ); // moves us to the nearest tile boundry
            this.velocity[1] = -this.velocity[1]/2; // flip Y velocity for the rebound
        }

        //Same for the X axis
        if( (tl == 1 && bl == 1) || (tr == 1 && br == 1) ) {
        wallDistance = (this.velocity[0] > 0) ? this.loc[0]%tileSize : (tileSize-this.loc[0])%tileSize;
            this.loc[0] = this.loc[0] - ( (wallDistance + 0.1) * Math.sign(this.velocity[0]) );
            this.velocity[0] = -this.velocity[0]/2;
        }
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
        super(game, 32, 32)
        this.weapon = new Weapon(this);
    }

    update(keyState){
        this.updateShot(keyState.mousePos, keyState.mouseButton);
        this.updateMovement(keyState.direction);
        this.checkWorldCollision();
    }

    updateShot(position, button) {
        if(button == true && this.weapon.onCooldown() == false){
            var vector_x = this.loc[0] - position[0]*this.game.size_x;
            var vector_y = this.loc[1] - position[1]*this.game.size_y;
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

        //Add jerk, up to 10 per frame
        this.accel[0] += Math.min(this.jerk[0],10);
        this.accel[1] += Math.min(this.jerk[1],10);

        //Reduce jerk by however much was added
        if(this.jerk[0] != 0) {
            this.jerk[0] = Math.max(0, Math.abs(this.jerk[0])-10) * Math.sign(this.jerk[0]); //multiplying by math.sign to ensure negative jerk works
        }
        if(this.jerk[1] != 0) {
            this.jerk[1] = Math.max(0, Math.abs(this.jerk[1])-10) * Math.sign(this.jerk[1]);
        }

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
        setTimeout(this.markForCleanup, 3000, this);
    }

    markForCleanup(self){
        self.markForDeletion = true;
    }
}

class Game{
    constructor(size_x, size_y){
        this.size_y = size_y;
        this.size_x = size_x;
        this.tileSize = 16;
        this.movables = [];
        this.player = new Player(this);
        this.stage = new Arena();
    }

    getTile(x,y){
        return this.stage.collisionMap[Math.floor(y/this.tileSize)*Math.round(this.size_x/this.tileSize) + Math.floor(x/this.tileSize)] //y*size_x + x, collision map is 16 units per tile
    }

    update(keyState){
        this.player.update(keyState);
        this.movables.forEach(e => ((e instanceof Player) ? Function.prototype /*noop*/ : e.update([0,0]) ));

        //Collision loop
        for(var i = 0; i < this.movables.length; i++) {
			for(var j = i+1; j < this.movables.length; j++) {
				if(typeof this.movables[i] == 'undefined' || typeof this.movables[j] == 'undefined') continue;
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

//Level class w/ geometry
class Arena{
    constructor(game){
        this.game = game;

        //Maps are 512*288 pixels by default, or 32*18 16x16 tiles
        //Tile map reference (incomplete)
        /*
            0 = Transparent
            48 = Tree
        */
        this.tileMap = [48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,
                        48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48,48];
        //Collision map reference (so far)
        /*
            0 = Floor
            1 = Wall
            2 = (TODO: Gap)
            3 = (TODO: timed hazard?)
        */
        this.collisionMap =  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
        this.portals = []; //TODO: add level transition
        this.movables; //TODO: set the initial of an arena bar the player, to be loaded/saved on arena entrance/exit
    }
}
