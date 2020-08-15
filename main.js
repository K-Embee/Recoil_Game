window.addEventListener("load", function(event) {

    // Global functions

    var render = function() {
        display.fill("rgb(" + Math.random()*256 + "," + Math.random()*256 + "," + Math.random()*256 + ")" );
        display.drawRectangle(game.player.loc[0], game.player.loc[1], 16, 16)
        display.render();
    };
    var update = function() {
        game.update(controller.keyState);
    };

    var resize = function(event) {
        display.resize(document.documentElement.clientHeight -32, document.documentElement.clientWidth -32, 9/16);
        display.render();
    }

    // Global variables

    var controller = new Controller();
    var display = new Display(document.getElementById("myCanvas"));
    var game = new Game();

    // Event Listeners
    window.addEventListener ("keydown", function(event) { controller.keyStateSet(event); } );
    window.addEventListener ("keyup", function(event) { controller.keyStateUnset(event); } );
    window.addEventListener ("resize", resize);

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
