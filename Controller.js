class Controller{
    constructor(){
        this.keyState = {
            direction:[0,0], //Non-normalized movement vector based on keypresses
            mousePos:[0,0], //Mouse location vector, bound between 0 and 1 (both axes, regardless of aspet ratio)
            mouseButton:false //Whether the left mouse is being held or not
        };
    }

/*
    left = 37
    up = 38
    right = 39
    down = 40
*/

    //Sets the movement vector based on WSAD keys currently held
    keyStateSet(event) {
        if(event.repeat) { return; }
        if(event.key == 'ArrowDown' || event.key.toLowerCase() == 's') {
            this.keyState.direction[1] +=1;
        }
        else if(event.key == 'ArrowUp' || event.key.toLowerCase() == 'w') {
            this.keyState.direction[1] -=1;
        }
        else if(event.key == 'ArrowLeft' || event.key.toLowerCase() == 'a') {
        this.keyState.direction[0] -=1;
        }
        else if(event.key == 'ArrowRight' || event.key.toLowerCase() == 'd') {
            this.keyState.direction[0] +=1;
        }
    }

    keyStateUnset(event) {
        if(event.key == 'ArrowDown' || event.key.toLowerCase() == 's') {
            this.keyState.direction[1] -=1;
        }
        else if(event.key == 'ArrowUp' || event.key.toLowerCase() == 'w') {
            this.keyState.direction[1] +=1;
        }
        else if(event.key == 'ArrowLeft' || event.key.toLowerCase() == 'a') {
            this.keyState.direction[0] +=1;
        }
        else if(event.key == 'ArrowRight' || event.key.toLowerCase() == 'd') {
            this.keyState.direction[0] -=1;
        }
    }

    //Obtanins the canvas mouse coordinates, range normalized to [0..1]
    mouseEvent(event, x_size, y_size) {
        this.keyState.mousePos[0] = event.offsetX / x_size;
        this.keyState.mousePos[1] = event.offsetY / y_size;
    }

    mouseDownEvent(event) {
        this.keyState.mouseButton = true;
    }

    mouseUpEvent(event) {
        this.keyState.mouseButton = false;
    }

}
