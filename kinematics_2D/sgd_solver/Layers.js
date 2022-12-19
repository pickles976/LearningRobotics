class Layer {
    
    constructor(radius, constraints, prev) {

        this.radius = radius
        this.constraints = constraints

        this.prev = prev // next layers
        this.next = null

        this.theta = Math.random()

        this.prevMat = null
        this.nextMat = null

    }

    setNext(nextLayer) {
        this.next = nextLayer
    }

    // Propagate the matrices forward
    forward(prevMat) {

        this.matrix = this.generateMatrix(this.theta)

        this.prevMat = prevMat

        const newMatrix = math.multiply(prevMat, this.matrix)

        this.next.forward(newMatrix)

    }

    // Propagate the matrices backwards
    backward(nextMat) {

        // try nudge
        const step = 0.001
        const deltaMatrix = this.generateMatrix(this.theta + step)
        const output = math.multiply(nextMat, deltaMatrix)

        // get derivative from output vs target
        // TODO: target needs to come from somewhere
        const dTheta = getErr(output, target) / step

        // nudge theta based on slope
        this.theta -= dTheta

        this.prev.backward(math.multiply(this.matrix, this.nextMat)
    }

    // Get a matrix for the given theta
    generateMatrix(theta) {

        return math.matrix([
            [Math.cos(theta), -Math.sin(theta), this.radius * Math.cos(theta)],
            [Math.sin(theta), Math.cos(theta), this.radius * Math.sin(theta)],
            [0, 0, 1]
        ])

    }
}

class IKSystem {

    ORIGIN = math.matrices([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ])
     
    constructor(radii, thetas, constraints, errFn) {
        
        this.layers = []
        let prevLayer = null

        // initialize layers
        for (let i = 0; i < radii.length; i++) {
            this.layers.push(new Layer(radii, constraints, prevLayer))
            prevLayer = this.layers[i]
        }

    }

    forward() {

        // might want to make forward pass controlled by the IK system?
        this.layers[0].forward(ORIGIN)


        // for (let i = 0; i < this.layers.length; i++) {
        //     this.layers[i].forward()
        // }
    }

    // TODO: add control to the IKSystem class
    // Should try to remove as much state from the Layer class as possible
    backward() {
        let matrices = []
        
        this.layers.forEach(layer => {
            matrices.push(layer.generateMatrix(layer.theta))
        })

        const outMat = applyMatrices(this.ORIGIN, matrices)

        this.layers[this.layers.length - 1].backward(outMat)

    }
}

// apply an array of matrices to an origin matrix
function applyMatrices(origin, matrices) {
    
    let curr = origin

    for(let i = 0; i < matrices.length; i++){
        curr = math.multiply(curr, matrices[i])
    }

    return curr

}