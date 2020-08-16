class Display{
    constructor(canvas, size_x, size_y, tile_size, tiles_x, tiles_y){
        this.buffer = document.createElement("canvas").getContext("2d");
        this.context = canvas.getContext("2d")
        this.buffer.canvas.height = this.buffer.height = this.size_y = size_y;
        this.buffer.canvas.width = this.buffer.width = this.size_x = size_x;
        this.tileSheet = new TileSheet(tile_size, tiles_x, tiles_y)
    }

    fill(color){
        this.buffer.beginPath()
        this.buffer.fillStyle = color;
        this.buffer.rect(0,0,this.size_x,this.size_y);
        this.buffer.fill();
    }

    drawTileMap(map){
        for(let i = map.length-1; i >= 0; i--) {
            var x, y, tileSize, destX, destY;
            tileSize = this.tileSheet.tileSize;
            x = this.tileSheet.getX(map[i]) * tileSize;
            y = this.tileSheet.getY(map[i]) * tileSize;
            destX = (i*tileSize)%(this.size_x);
            destY = Math.floor((i*tileSize)/this.size_x)*tileSize;
            this.buffer.drawImage(this.tileSheet.image, x, y, tileSize, tileSize, destX, destY, tileSize, tileSize);
        }
    }

    drawRectangle(x,y, x_size, y_size){
        this.buffer.beginPath()
        this.buffer.fillStyle = "#ffffff";
        this.buffer.fillRect(Math.round(x),Math.round(y),x_size,y_size);
    }

    render(){
        this.context.drawImage(this.buffer.canvas, 0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    resize(height, width, hwRatio){
        if(height/width > hwRatio){
            this.context.canvas.height = width * hwRatio;
            this.context.canvas.width = width;
        }
        else {
            this.context.canvas.height = height;
            this.context.canvas.width = height / hwRatio;
        }

        this.context.imageSmoothingEnabled = false;
    }

}

class TileSheet{
    constructor(tile_size, x_size, y_size){
        this.image = new Image();
        this.tileSize = tile_size;
        this.size_x = x_size; //row length (tiles) / nº of columns
        this.size_y = y_size; //column length (tiles) / nº of rows
    }

    getX(id){ return id%(this.size_x); }
    getY(id){ return Math.floor(id/this.size_x); }
}