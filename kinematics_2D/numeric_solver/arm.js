
const IDENTITY = math.matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
])

class Arm {

    constructor(r, θ, parent){

        this._r = r
        this.θ = θ
        this.hrm = this.createMatrix(this._r, θ)
        this.parent = parent

        // this.update(θ)
    }

    update(θ) {

        // update origin based on parent
        console.log(this.parent)
        if (this.parent) { this.updateOrigin(this.parent.getEndMatrix()) } 
        this.updateRotation(θ)
    }

    // update our origin matrix
    updateOrigin(matrix) {
        this.origin = matrix
    }

    getX(){
        return this.origin.get([0, 2])
    }

    getY(){
        return this.origin.get([1, 2])
    }

    // update with new rotation
    updateRotation(θn) {
        this.θ = θn
        this.hrm = this.createMatrix(this._r, this.θ)
    }

    // Homogeneous rotation matrix based on arm length and angle
    createMatrix(r, θ) {
        const array = [
            [Math.cos(θ), -Math.sin(θ), r * Math.cos(θ)],
            [Math.sin(θ), Math.cos(θ), r * Math.sin(θ)],
            [0, 0, 1]
        ]

        return math.matrix(array)
    }

    getEndMatrix() {
        console.log(this.origin)
        const result = math.multiply(this.origin, this.hrm)
        return result
    }


    // Rotation matrix
    // cos  -sin  p1
    // sin   cos  p2
    //  0     0   1

    render(context) {
        context.strokeStyle = "#000000"
        context.lineWidth = 5
        context.beginPath()
        context.moveTo(this.getX(), this.getY())
        context.lineTo(this.getEndMatrix().get([0, 2]), this.getEndMatrix().get([1, 2]))
        context.stroke()
    }
}