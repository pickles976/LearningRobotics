class IKSolver {

    constructor(radii, thetas, constraints, origin) {

        this.radii = radii
        this.thetas = thetas
        this.constraints = constraints
        this.origin = origin

        this.matrices = []
        this.forwardMats = []
        this.backwardMats = []

        this.endEffector = null
        this.loss = 100.0
        this.iterations = 0

    }

    // TODO: TEST THIS METHOD
    generateMats() {

        this.matrices = []
        this.matrices.push(this.origin)

        // generate all the matrices for given thetas
        for (let i = 0; i < this.thetas.length; i++){
            this.matrices.push(generateMatrix2D(this.thetas[i], this.radii[i]))
        }

        // this.forwardMats = []
        // this.forwardMats.push(this.origin)

        // // generate all the forward partial matrix products
        // // [ O, O x A, O x A x B, O x A x B x C]
        // for (let i = 1; i < this.matrices.length; i++){
        //     this.forwardMats.push(math.multiply(this.forwardMats[i - 1], this.matrices[i]))
        // }

        // this.backwardMats = []
        // this.backwardMats.push(this.matrices[this.matrices.length - 1])

        // // generate all the backwards partial matrix products
        // // [E, D x E, C x D x E] -> [C x D x E, D x E, E] 
        // for (let i = 1; i < this.matrices.length; i++){
        //     this.forwardMats.push(math.multiply(this.backwardMats[i - 1], this.matrices[this.matrices.length - i - 1]))
        // }

        // this.backwardMats = this.backwardMats.reverse()

        // // this is really the forward pass error calculation
        // this.endEffector = this.forwardMats[this.forwardMats.length - 1]
        // this.loss = this.calculateLoss()

    }

    // TODO: TEST THIS
    updateThetas() {

        // let newThetas = []

        const d = 0.00001

        for (let i = 0; i < this.thetas.length; i++) {
            const dTheta = this.thetas[i] + d
            const radius = this.radii[i]
            const dMat = generateMatrix2D(dTheta, radius)
            const deltaOut = math.multiply(math.multiply(this.forwardMats[i], dMat), this.backwardMats[i+1])

            const dErr = err(deltaOut) - this.loss / d
            this.thetas[i] -= (this.momentums[i] * this.momentumRetain) + (dErr * learnRate)
            // newThetas.push(this.thetas[i] - ((this.momentum * this.momentumRetain) + (dTheta * learnRate)))
        }

    }

    update() {
        this.generateMats()
        this.updateThetas()
    }

    solve(target, thresh) {
        this.iterations = 0

        while (this.iterations < 250){
            if (this.loss > thresh){
                this.update()
            }else{
                console.log(`Optimal solution found after ${this.iterations} iterations!`)
                return
            }
        }

        console.log("Could not converge in 250 iterations")

    }

    // calculate error
    calculateLoss() {

    } 

}

function generateMatrix2D(theta, radius) {

    return math.matrix([
        [Math.cos(theta), -Math.sin(theta), radius * Math.cos(theta)],
        [Math.sin(theta), Math.cos(theta), radius * Math.sin(theta)],
        [0, 0, 1]
    ])

}