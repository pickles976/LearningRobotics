

class Segment {

    constructor(x, y, len_, angle_){
        this.a = new p5.Vector(x,y)
        this.b = this.calculateB(this.a, len_, angle_)
        this.len = len_
        this.angle = angle_
    }

    calculateB(a, len, angle) {
        let dx = len * Math.cos(angle)
        let dy = len * Math.sin(angle)
        return new p5.Vector(a.x + dx, a.y + dy)
    }

    show(){
        stroke(255)
        strokeWeight(4)
        line(this.a.x, this.a.y, this.b.x, this.b.y)
    }

}