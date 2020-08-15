window.addEventListener("load", function(event) {

    // Main functions

    var render = function() {
        display.fill("rgb(" + Math.random()*128 + "," + Math.random()*128 + "," + Math.random()*128 + ")" );
        game.movables.forEach(e => display.drawRectangle(e.loc[0], e.loc[1], e.size_x, e.size_y));
        display.render();
    };
    var update = function() {
        game.update(controller.keyState);
    };

    var resize = function(event) {
        display.resize(document.documentElement.clientHeight -32, document.documentElement.clientWidth -32, 9/16);
        display.render();
    }

    // Main variables
    var size_x = 256*2;
    var size_y = 144*2;

    var controller = new Controller();
    var display = new Display(document.getElementById("myCanvas"), size_x, size_y);
    var game = new Game(size_x, size_y);

    // Event Listeners
    window.addEventListener ("keydown", function(event) { controller.keyStateSet(event); } );
    window.addEventListener ("keyup", function(event) { controller.keyStateUnset(event); } );
    window.addEventListener ("resize", resize);
    display.context.canvas.addEventListener ('mousemove', function(event) { controller.mouseEvent(event,
                                                                                                    display.context.canvas.width,
                                                                                                    display.context.canvas.height); } );
    display.context.canvas.addEventListener ('mousedown', function(event) { controller.mouseDownEvent(event); } );
    display.context.canvas.addEventListener ('mouseup', function(event) { controller.mouseUpEvent(event); } );

    // Game engine code

    var step = 1000/30; //30 FPS
    var currentTime = Date.now()
    var lastTime = Date.now();
    var delta = 0;

    function run() {
        currentTime = Date.now();
        delta += currentTime - lastTime;
        while(delta > step) {
            delta = delta - step;
            update();
        }
        render();
        lastTime = Date.now();
        requestAnimationFrame(run);
    }

    resize();
    requestAnimationFrame(run);


});
