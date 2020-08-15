class Display{
    constructor(canvas, size_x, size_y){
        this.buffer = document.createElement("canvas").getContext("2d");
        this.context = canvas.getContext("2d")
        this.buffer.canvas.height = this.buffer.height = this.size_y = size_y;
        this.buffer.canvas.width = this.buffer.width = this.size_x = size_x;
    }

    fill(color){
        this.buffer.beginPath()
        this.buffer.fillStyle = color;
        this.buffer.rect(0,0,this.size_x,this.size_y);
        this.buffer.fill();
    }

    drawRectangle(x,y, x_size, y_size){
        this.buffer.beginPath()
        this.buffer.fillStyle = "#000000";
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
