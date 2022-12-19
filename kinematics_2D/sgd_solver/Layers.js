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

        // Get the output for the current matrix
        const prod = math.multiply(this.prevMat, this.matrix)
        const output = math.multiply(prod, nextMat)

        // Get the delta'd output
        const step = 0.00001
        const deltaMatrix = this.generateMatrix(this.theta + step) // get a matrix with a nudged theta
        const prodDelta = math.multiply(this.prevMat, deltaMatrix) // get the product of all previous matrices + this matrix
        const outputDelta = math.multiply(prodDelta, nextMat) // get the output of the delta'd matrix

        // Get dErr(END)/dθ for this joint in the arm
        // f(x + h) - f(x) / h
        const dTheta = (errFn(outputDelta) - errFn(output)) / step

        // console.log(`dθ ${dTheta}`)

        // nudge theta based on slope
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

    IDENTITY = math.matrix([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ])
     
    constructor(radii, thetas, constraints, errFn) {
        
        this.layers = []
        this.errFn = errFn

        this.endEffector = null

        this.learnRate = 0.5
        this.currentLearnRate = this.learnRate
        this.decay = 0.000005
        this.iterations = 0

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
    backward() {

        let nextMat = this.IDENTITY
        
        for (let i = this.layers.length - 1; i >= 0; i--) {
            this.layers[i].backward(nextMat, this.errFn, this.currentLearnRate)
            nextMat = math.multiply(this.layers[i].matrix, nextMat)
        }

        // for (let i = 0; i < dThetas; i++) {
        //     this.layers[i].theta -= dThetas[i] * this.currentLearnRate
        // }

    }

    /**
     * 
     * @param {math.matrix} origin root transform of the arm.
     */
    update(origin) {
        this.endEffector = this.forward(origin)
        console.log(`Loss: ${this.errFn(this.endEffector)}`)
        this.backward()
        this.updateParams()
    }

    updateParams() {
        this.iterations += 1
        this.currentLearnRate = this.learnRate * (1/ (1+this.decay*this.iterations))
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