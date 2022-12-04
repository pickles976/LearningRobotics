class Arm {

    constructor(length, centerAngle, rotationRange, _parent){
        this.x = 0
        this.y = 0
        this.angle = 0
        this.parent = null

        this.length = length
        this.centerAngle = centerAngle
        this.rotationRange = rotationRange
    }

    setPhase(phase){
        this.angle = this.centerAngle + Math.sin(phase) * this.rotationRange // oscillator
    }

    getEndX() {
        let angle = this.angle
        let parent = this.parent
        while(parent){
            angle += parent.angle
            parent = parent.parent
        }
        return this.x + Math.cos(angle) * this.length
    }

    getEndY(){
        let angle = this.angle
        let parent = this.parent
        while(parent){
            angle += parent.angle
            parent = parent.parent
        }
        return this.y + Math.sin(angle) * this.length
    }

    render(context) {
        context.strokeStyle = "#000000"
        context.lineWidth = 5
        context.beginPath()
        context.moveTo(this.x, this.y)
        context.lineTo(this.getEndX(), this.getEndY())
        context.stroke()
    }
}