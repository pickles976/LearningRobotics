class Layer {
    
    constructor(radius, constraints, theta) {

        this.radius = radius
        this.constraints = constraints

        this.theta = (theta === undefined) ? Math.random() : theta
        this.matrix = this.generateMatrix(this.theta)

        this.prevMat = null

    }

    setNext(nextLayer) {
        this.next = nextLayer
    }

    /**
     * Propagate the matrices to get a final transform representing the end-effector
     * @param {math.matrix} prevMat The previous matrix in the product. Used for backprop.
     * @returns The product of the previous matrix and this matrix
     */
    forward(prevMat) {
        this.matrix = this.generateMatrix(this.theta)
        this.prevMat = prevMat
        return math.multiply(prevMat, this.matrix)
    }

    /**
     * Propagate the matrices backwards
     * if A x B x C x D x E x F = G, we want to know dErr(G)/dθ, 
     * change in Err(G) with respect to change in θ for matrix D
     * 1. First we nudge our θ by some small d, then calculate the transform matrix for that theta (D')
     * 2. Next we take A x B x C and transform it by D'
     * 3. Next we take the product of A x B x C x D' and multiply it by E x F
     * The difference in errors divided by d gives us our dErr(G)/dθ, the change in Err(G)
     * Using this difference we can adjust the theta to descend the gradient
     * 
     * @param {math.matrix} nextMat the E x F matrix from our example
     * @param {function} errFn Error function
     */
    backward(nextMat, errFn, learnRate) {

        const step = 0.001
        const deltaMatrix = this.generateMatrix(this.theta + step) // get a matrix with a nudged theta
        const totalMatrix = math.multiply(this.prevMat, deltaMatrix) // get the product of all previous matrices + this matrix
        const output = math.multiply(totalMatrix, nextMat) // get the output

        // Get dErr(END)/dθ for this joint in the arm
        const dTheta = errFn(output) / step

        // nudge theta based on slope
        // TODO: better nudge
        this.theta -= dTheta * learnRate

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

    ORIGIN = math.matrix([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ])
     
    constructor(radii, thetas, constraints, errFn) {
        
        this.layers = []
        this.errFn = errFn

        this.endEffector = null

        this.learnRate = 0.01

        // initialize layers
        for (let i = 0; i < radii.length; i++) {
            this.layers.push(new Layer(radii[i], constraints[i], thetas[i]))
        }

    }

    /**
     * Calculate the forward pass
     * For A x B x C x D = E we calculate
     * S = A x B
     * S' = S x C
     * E = S' x D
     * @param {math.matrix} origin The root transform of our arm
     * @returns The output matrix of all the transforms
     */
    forward(origin) {

        let currMat = origin

        for (let i = 0; i < this.layers.length; i++) {
            currMat = this.layers[i].forward(currMat)
        }

        return currMat

    }

    /**
     * Performs the backward pass on all of the transform layers of our arm.
     * @param {math.matrix} endMat output of the forward pass (our arms simulated position)
     */
    backward(endMat) {

        let nextMat = endMat
        
        for (let i = this.layers.length - 1; i >= 0; i--) {
            this.layers[i].backward(nextMat, this.errFn, this.learnRate)
            nextMat = math.multiply(this.layers[i].matrix, nextMat)
        }

    }

    /**
     * 
     * @param {math.matrix} origin root transform of the arm.
     */
    update(origin) {
        this.endEffector = this.forward(origin)
        console.log(`Error: ${this.errFn(this.endEffector)}`)
        this.backward(this.endEffector)
    }

    render(ctx, origin) {

        let prevMat = origin

        for (let i = 0; i < this.layers.length; i++){
    
            let currentMat = math.multiply(prevMat, this.layers[i].matrix)
    
            let startX = prevMat.get([0, 2])
            let startY = prevMat.get([1, 2])
    
            let endX = currentMat.get([0, 2])
            let endY = currentMat.get([1, 2])
    
            ctx.strokeStyle = "#000000"
            ctx.lineWidth = 5
            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.stroke()
    
            prevMat = currentMat
    
        }
    }
}