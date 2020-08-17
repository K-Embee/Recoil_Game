window.addEventListener("load", function(event) {

    // Main functions

    var render = function() {
        display.fill("#000000" );
        display.drawTileMap(game.stage.tileMap);
        game.movables.forEach(e => (e.tileIndex == -1) ?
            display.drawRectangle(e.loc[0], e.loc[1], e.size_x, e.size_y) :
            display.drawTileObject(e.loc[0], e.loc[1], e.tileIndex, e.animations)
        );
        display.render();
    };
    var update = function() {
        game.update(controller.keyState);
    };

    var resize = function(event) {
        display.resize(document.documentElement.clientHeight-16, document.documentElement.clientWidth-16, 9/16);
        display.render();
    }

    // Main variables
    var size_x = 256*2;
    var size_y = 144*2;
    var tile_size = 16;
    var tileMap_x = 48; //Based on the tilemap image
    var tileMap_y = 22; //Based on tilemap image

    var controller = new Controller();
    var display = new Display(document.getElementById("myCanvas"), size_x, size_y, tile_size, tileMap_x, tileMap_y);
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

    //Initialization (Load tilemap and start running the engine)
    display.tileSheet.image.addEventListener ('load', function(event) {
        resize();
        requestAnimationFrame(run);
    }, {once:true});

    display.tileSheet.image.src = "colored_transparent_packed.png";

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

});
