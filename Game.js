class Movable{
    constructor(game, x, y){
        //Add to the games movables list first and foremost
        this.game = game;
        this.game.movables.push(this);

        this.size_x = 15;
        this.size_y = 15;
        this.loc = [x,y]; //Position (x). Persstent. Updated every frame.
        this.velocity = [0,0]; //Speed (x/dt). Persistent. Updated every frame.
        this.accel = [0,0]; //Acceleration (x/dt^2). Reset every frame Updated every frame.
        this.jerk = [0,0]; //Jerk (x/dt^3). Up to 10 is removed and applied to acceleration every frame. Updated on special-occasion single frames.
        this.friction = false;
        this.maxSpeed = 3; //Speed after which friction starts applying
        this.tileIndex = -1; //Tilesheet index. Set to -1 to render as a square
        this.life = 2; //Hitpoints. Reduced with hurt, dies when it hits 0
        this.noCollide = 0; //Frames for which the object does not collide with others and cannot be hurt
        this.markForDeletion = false; //To avoid deleting movables in the middle of the game loop we'll mark for cleanup to delete next frame
        this.animation = undefined;
    }

    //Movable helper functions
    getTop(){ return this.loc[1]; }
    getBottom(){ return this.loc[1]+this.size_y; }
    getLeft(){ return this.loc[0]; }
    getRight(){ return this.loc[0]+this.size_x; }
    getCenterX(){ return this.loc[0]+this.size_x/2; }
    getCenterY(){ return this.loc[1]+this.size_y/2; }

    //Damaage functions, for living mobs
    hurt(){
        if(this.noCollide > 0) { return; }
        this.life -= 1;
        this.noCollide = 10;
        this.animation = new Animation('hurt');
        if(this.life <= 0){
            this.die();
        }
    }
    die(){
        this.markForDeletion = true;
    }

    //Cleanup/Delete methods
    cleanup(){
        var index = this.game.movables.findIndex(e => e == this);
        if (index != -1) { delete this.game.movables[index]; }
    }

    //Returns the block type it collided with/should act upon
    //Block 0 is by default
    //Block 1 if it hit a wall and rebounded
    checkWorldCollision(){
        var tileType = new Array;

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
                this.velocity[0] *= 0.66;
                this.velocity[1] *= 0.66;
                return this.checkWorldCollision();
        }

        //If the top or bottom two corners are in a wall, we've hit it from above/below
        if( (tl == 1 && tr == 1) || (bl == 1 && br == 1) ) {
            //Move out of the tile, we can tell which way to go based on our current velocity
            wallDistance = (this.velocity[1] > 0) ? this.loc[1]%tileSize : (tileSize-this.loc[1])%tileSize; // checks whether the lower or higher tile boundry is the
            this.loc[1] = this.loc[1] - ( (wallDistance + 0.1) * Math.sign(this.velocity[1]) ); // moves us to the nearest tile boundry
            this.velocity[1] = -this.velocity[1]/2; // flip Y velocity for the rebound
            tileType.push(1); // set tile type to 1 so we know we hit a wall
        }

        //Same for the X axis
        if( (tl == 1 && bl == 1) || (tr == 1 && br == 1) ) {
        wallDistance = (this.velocity[0] > 0) ? this.loc[0]%tileSize : (tileSize-this.loc[0])%tileSize;
            this.loc[0] = this.loc[0] - ( (wallDistance + 0.1) * Math.sign(this.velocity[0]) );
            this.velocity[0] = -this.velocity[0]/2;
            tileType.push(1);
        }

        //Check if we're over a gap
        if(this.game.getTile(this.getCenterX(),this.getCenterY()) == 3) {
            tileType.push(3);
        }

        return tileType;
    }

    collide(object){
        //To be filled by individual subclasses with collision types
    }

    updateMovement(){
        //Add jerk, up to 10 per frame
        var added_jerk = Math.min(10, VectorLen(this.jerk))
        this.accel = VectorSum(this.accel, VectorSetLen(this.jerk, added_jerk));

        //Reduce jerk by however much was added to accel
        this.jerk = VectorSub(this.jerk, VectorSetLen(this.jerk, added_jerk));

        if(this.friction){
            //Apply friction if not accelerating
            if(VectorLen(this.accel) == 0) { this.accel = VectorSub(this.accel, VectorMult(this.velocity, 0.1)); }
            //Apply friction if over the speed limit
            if(VectorLen(this.velocity) > this.maxSpeed) { this.accel = VectorSub(this.accel, VectorMult(this.velocity, 0.3)); }
        }

        //Turn accel into speed
        this.velocity = VectorSum(this.velocity, this.accel);

        //Turn speed into position updates
        this.loc = VectorSum(this.loc, this.velocity);
    }

    update(){
        this.updateMovement();
        this.checkWorldCollision();
        this.updateNoCollide();
        this.updateAnimation();
    }

    updateNoCollide(){
        this.noCollide = Math.max(0, this.noCollide -= 1);
        if(this.animation && this.animation.name == 'hurt' && this.noCollide == 0) { this.animation = undefined; }
    }

    updateAnimation(){
        if(this.animation){
            this.animation.update();
        }
    }

}

class Player extends Movable{
    constructor(game){
        super(game, 128, 128)
        this.spawn = this.loc;
        this.weapon = new Weapon(this);
        this.tileIndex = 218;
        this.friction = true;
    }

    reset(){
        this.life = 2;
        this.loc = this.spawn;
        this.velocity = [0,0];
        this.accel = [0,0]
        this.jerk = [0,0];
    }

    die(){
        this.reset();
    }

    update(keyState){
        this.updateShot(keyState.mousePos, keyState.mouseButton);
        this.accel = (VectorLen(keyState.direction) < 1) ? keyState.direction : VectorNormalize(keyState.direction);
        super.update();
    }

    checkWorldCollision(){
        var old_speed = this.velocity;
        var hitType = super.checkWorldCollision();
        if( VectorLen(old_speed) > this.maxSpeed+1 && hitType.includes(1) ){
            this.hurt();
        }
        if( VectorLen(old_speed) < this.maxSpeed+1 && hitType.includes(3) ){
            this.die();
        }
    }

    updateShot(position, button) {
        if(button == true && this.weapon.onCooldown() == false){
            var vector_x = this.loc[0] - position[0]*this.game.size_x;
            var vector_y = this.loc[1] - position[1]*this.game.size_y;
            var vector_len = Math.sqrt(vector_x*vector_x+vector_y*vector_y) //Obtain vector length, this is needed for normalizing later

            //Shoot the player's weapon
            this.weapon.fire(-(vector_x/vector_len)*20, -(vector_y/vector_len)*20);

            //Set the player's jerk,
            this.jerk = VectorSetLen([vector_x, vector_y], 25);
        }
    }

    collide(object){
        if(object instanceof Bullet && object.owner != this && this.noCollide == 0) {
            this.jerk = VectorSum(this.jerk, VectorSetLen(object.velocity, object.force))
            this.hurt();
        }
        if(object instanceof Enemy && this.noCollide == 0) {
            this.jerk = VectorSetLen(object.velocity, 16);
            this.hurt();
        }
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
            new Bullet(this.user.game, this.user.loc[0], this.user.loc[1], x, y, this.user)
        }
    }
}

class Bullet extends Movable{
    constructor(game, x, y, x_dir, y_dir, owner){
        super(game, x, y);
        this.velocity[0] = x_dir;
        this.velocity[1] = y_dir;
        this.tileIndex = 214;
        this.frameTimer = 0;
        this.force = 45;
        this.owner = owner;
    }

    update(){
        super.update();
        this.frameTimer += 1;
        this.updateForce();
        if(this.frameTimer >= 10) {
            this.markForDeletion = true;
        }
    }

    updateForce(){
        this.force -=4;
    }

    collide(object){
        if(this.owner != object) {
            this.markForDeletion = true;
        }
    }
}

class Enemy extends Movable{
    constructor(game, x, y){
        super(game, x, y)
        this.tileIndex = 28;
        this.maxSpeed = 2;
        this.friction = true;

    }
    update(){
        var player = this.game.player;
        if(player){
            this.accel = VectorSetLen(VectorSub(player.loc, this.loc), 0.3)
        }
        super.update();
    }

    collide(object){
        if(object instanceof Bullet && object.owner != this && this.noCollide == 0) {
            this.jerk = VectorSum(this.jerk, VectorSetLen(object.velocity, object.force))
        }

        if(object instanceof Player && this.noCollide == 0) {
            this.jerk = VectorSum(this.jerk, VectorSetLen(this.velocity, -8)) //An enemy that hits the player bounces back in the direction he came from
        }
        if(object instanceof Enemy) {
            this.jerk = VectorSum(this.jerk, VectorSetLen(VectorSub(this.loc, object.loc), 8)) //Enemies bounce away from eachother

        }
    }

    checkWorldCollision(){
        var old_speed = this.velocity;
        var hitType = super.checkWorldCollision();
        if( VectorLen(old_speed) > this.maxSpeed+1 && hitType.includes(1) ){
            this.hurt();
        }
        if( VectorLen(old_speed) < this.maxSpeed+1 && hitType.includes(3) ){
            this.die();
        }
    }

    die(){
        var animation = new Animation('rotate')
        animation.setUpdate(function(){this.frame += 90});
        animation.frame = 45;
        var ragdoll = new Dummy(this.game, this.loc[0], this.loc[1], animation);
        ragdoll.tileIndex = this.tileIndex;

        //Call parent to handle death logic
        super.die();
    }
}

//Dummy object for animations, etc
class Dummy extends Movable{
    constructor(game, x, y, animation){
        super(game, x, y);
        this.animation = animation;
        this.velocity = [Math.random()*2-4, -15]; //Random X velocity and a vertical Y velocity
        this.frameTimer = 0;
    }

    //Dummies don't collide with the world
    checkWorldCollision(){}

    update(){
        this.accel = [0,1];
        this.frameTimer += 1;
        if(this.frameTimer >= 45) {
            this.markForDeletion = true;
        }
        super.update();
    }
}

class Animation{
    constructor(name){
        this.name = name;
        this.frame = 0;
        this.update = function(){ this.frame++; };
    }

    setUpdate(func){
        this.update = func;
    }
}

class Game{
    constructor(size_x, size_y){
        this.size_y = size_y;
        this.size_x = size_x;
        this.tileSize = 16;
        this.prepLoad = undefined; //Whether or not to change stage at the end of the update loop

        //Load stage
        this.movables = new Array();
        this.stages = [new Arena(this, 0), new Arena(this,1)];
        this.loadStage(0);

        //Load player after stage to prevent the whole movable hastle
        this.player = new Player(this); // The first stage will load the player afterwards
    }

    //Load all movables previously stored in a stage
    loadStage(id){
        console.log(id);
        this.stage = this.stages[id]; //Set current stage
        if(this.stage.loaded == false){
            this.movables = new Array(); //Define movables if we're loaing a new stage as the stage will load into it
            this.stage.load(id); //Load its data for the first time if it hasn't been done yet
        }
        else{
            this.movables = this.stage.movables; //Reference movables as stage movables if they've already been loaded into memory once
        }
        if(this.player){
            this.movables.push(this.player); //Add the player to movables if he exsts
        }
    }

    //Store all movables in the stage and stop running them
    unloadStage(){
        var playerIndex = this.movables.indexOf(this.player);
        if(playerIndex != -1){ this.movables.splice(playerIndex,1); } //Removes the player from movables
        this.stage.movables = this.movables; //Moves current movables to stage movables
        this.movables = new Array(); //Delete current reference to movables
        this.stage = undefined;
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

        //Portal activation
        if(this.prepLoad){
            this.unloadStage();
            this.loadStage(this.prepLoad.destination);
            this.player.loc[0] = (this.prepLoad.destLoc[0] < 0) ? this.player.loc[0] : this.prepLoad.destLoc[0];
            this.player.loc[1] = (this.prepLoad.destLoc[1] < 0) ? this.player.loc[1] : this.prepLoad.destLoc[1];
            this.prepLoad = undefined;
        }
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

class Portal extends Movable{
    constructor(game, x, y, destination, x_size, y_size, destLoc){
        super(game, x*game.tileSize, y*game.tileSize);
        this.destination = destination;
        this.size_x = x_size*this.game.tileSize;
        this.size_y = y_size*this.game.tileSize;
        this.destLoc = VectorMult(destLoc, game.tileSize);
    }

    collide(object) {
        if(object instanceof Player) {
            this.game.prepLoad = this;
        }
    }

    updateMovement(){ } //Prevent movement even if it were to somehow accientally collide
}

//Level class w/ geometry
class Arena{
    constructor(game, id){
        this.game = game;
        this.loaded = false;
    }

    load(id){
        if(this.loaded == true) { return; } //Don't load the stage again if we did it once already
        switch(id){
        case 0:
            //Maps are 512*288 pixels by default, or 32*18 16x16 tiles
            //Tile map reference (incomplete)
            /*
                0 = Transparent
                48 = Tree
                248 = Water
            */
            this.tileMap = [248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,
                            248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248];
            //Collision map reference (so far)
            /*
                0 = Floor
                1 = Wall
                2 = (TODO: Hazard)
                3 = Gap
            */
            this.collisionMap =  [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,
                                    3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];

            this.movables = [new Portal(this.game, 13, 18, 1, 4, 1,[-1,0])]; //TODO: set the initial of an arena bar the player, to be loaded/saved on arena entrance/exit
            break;

        case 1:
        //Maps are 512*288 pixels by default, or 32*18 16x16 tiles
        //Tile map reference (incomplete)
        /*
            0 = Transparent
            48 = Tree
            248 = Water
        */
        this.tileMap = [248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,0,0,0,0,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248
                        ,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248];
        //Collision map reference (so far)
        /*
            0 = Floor
            1 = Wall
            2 = (TODO: Hazard)
            3 = Gap
        */
        this.collisionMap =  [3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3
                                ,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3];

        this.movables = [new Portal(this.game,13,-1, 0, 4, 1,[-1,17])]; //TODO: set the initial of an arena bar the player, to be loaded/saved on arena entrance/exit
        break;

        }
        this.loaded = true;
    }
}
