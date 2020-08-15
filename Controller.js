class Controller{
    constructor(){
        this.keyState = { direction:[0,0], mousePos:[0,0], mouseButton:false };
    }

/*
    left = 37
    up = 38
    right = 39
    down = 40
*/

    keyStateSet(event) {
        if(event.repeat) { return; }
        if(event.key == 'ArrowDown') {
            this.keyState.direction[1] +=1;
        }
        else if(event.key == 'ArrowUp') {
            this.keyState.direction[1] -=1;
        }
        else if(event.key == 'ArrowLeft') {
        this.keyState.direction[0] -=1;
        }
        else if(event.key == 'ArrowRight') {
            this.keyState.direction[0] +=1;
        }
    }

    keyStateUnset(event) {
        if(event.key == 'ArrowDown') {
            this.keyState.direction[1] -=1;
        }
        else if(event.key == 'ArrowUp') {
            this.keyState.direction[1] +=1;
        }
        else if(event.key == 'ArrowLeft') {
            this.keyState.direction[0] +=1;
        }
        else if(event.key == 'ArrowRight') {
            this.keyState.direction[0] -=1;
        }
    }

}
