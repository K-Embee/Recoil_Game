class Player{
    constructor(){
        this.loc = [0,0];
        this.velocity = [0,0]
        this.accel = [0,0];
        this.jerk = [0,0];
    }

    update(direction){
        this.loc[0] += direction[0];
        this.loc[1] += direction[1]
    }
}

class Game{
    constructor(){
        this.player = new Player();
    }

    update(keyState){
        this.player.update(keyState.direction);
    }

}
