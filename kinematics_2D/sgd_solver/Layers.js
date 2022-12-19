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
    // A x B = C
    forward(prevMat) {

        this.matrix = this.generateMatrix(this.theta)

        this.prevMat = prevMat // save this matrix for the backprop step

        return math.multiply(prevMat, this.matrix)

    }

    // Propagate the matrices backwards
    // if A x B x C x D x E x F = G, we want to know dErr(G)/dθ, 
    // change in Err(G) with respect to change in θ for matrix D
    // 1. First we nudge our θ by some small d, then calculate the transform matrix for that theta (D')
    // 2. Next we take A x B x C and transform it by D'
    // 3. Next we take the product of A x B x C x D' and multiply it by E x F
    // The difference in errors divided by d gives us our dErr(G)/dθ, the change in Err(G)
    // Using this difference we can adjust the theta to descend the gradient
    backward(nextMat) {

        const step = 0.001
        const deltaMatrix = this.generateMatrix(this.theta + step) // get a matrix with a nudged theta
        const totalMatrix = math.multiply(this.prevMat, deltaMatrix) // get the product of all previous matrices + this matrix
        const output = math.multiply(totalMatrix, nextMat) // get the output

        // get derivative from output vs target
        // TODO: target needs to come from somewhere
        const dTheta = getErr(output, target) / step

        // nudge theta based on slope
        // TODO: better nudge
        this.theta -= dTheta

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

        // initialize layers
        for (let i = 0; i < radii.length; i++) {
            this.layers.push(new Layer(radii, constraints))
        }

    }

    // calculate the forward pass
    // For A x B x C x D = E we calculate
    // S = A x B
    // S' = S x C
    // E = S' x D
    forward(origin) {

        let currMat = origin

        for (let i = 0; i < this.layers.length; i++) {
            currMat = this.layers[i].forward(currMat)
        }

        return currMat

    }

    // Perform backprop to adjust the thetas 
    // 
    backward(endMat) {

        let nextMat = endMat
        
        for (let i = this.layers.length - 1; i > 0; i--) {
            this.layers[i].backward(nextMat)
            nextMat = math.multiply(this.layers[i].matrix, nextMat)
        }

    }
}