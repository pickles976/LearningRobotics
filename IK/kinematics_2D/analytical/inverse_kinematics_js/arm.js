class Arm {

    constructor(x,y,length,angle, parent){
        this.x = x
        this.y = y
        this.length = length
        this.angle = angle
        this.parent = parent
    }

    getEndX(){
        return this.x + Math.cos(this.angle) * this.length
    }

    getEndY(){
        return this.y + Math.sin(this.angle) * this.length
    }

    render(context) {
        context.strokeStyle = "#000000"
        context.lineWidth = 5
        context.beginPath()
        context.moveTo(this.x, this.y)
        context.lineTo(this.getEndX(), this.getEndY())
        context.stroke()
    }

    pointAt(x,y){
        let dx = x - this.x
        let dy = y - this.y
        this.angle = Math.atan2(dy, dx)
    }

    drag(x, y){
        this.pointAt(x, y)
        this.x = x - Math.cos(this.angle) * this.length
        this.y = y - Math.sin(this.angle) * this.length
        if(this.parent){
            this.parent.drag(this.x, this.y)
        }
    }
}