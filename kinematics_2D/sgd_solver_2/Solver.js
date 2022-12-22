const IDENTITY = math.matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
])

class IKSolver {

    constructor(radii, thetas, constraints, origin) {

        this.radii = radii
        this.thetas = thetas
        this.constraints = constraints
        this.origin = origin
        this.armLength = radii.reduce((acc, curr) => acc + curr, 0)

        this.matrices = []
        this.forwardMats = []
        this.backwardMats = []
        this.lines = []

        this.endEffector = null
        this.target = null
        
        this.loss = 100.0
        this.iterations = 0

        this.learnRate = 0.5
        this.currentLearnRate = this.learnRate
        this.decay = 0.0000005

        this.momentums = []
        this.momentumRetain = 0.25

    }

    initializeMomentums() {
        this.momentums = []

        this.thetas.forEach(theta => {
            this.momentums.push(0.0)
        })
    }

    generateMats() {

        this.matrices = []
        this.matrices.push(this.origin)

        // generate all the matrices for given thetas
        for (let i = 0; i < this.thetas.length; i++){
            this.matrices.push(generateMatrix2D(this.thetas[i], this.radii[i]))
        }

        this.lines = getLines(this.matrices) // used to check for self-intersection

        this.forwardMats = []
        this.forwardMats.push(this.origin)

        // generate all the forward partial matrix products
        // [ O, O x A, O x A x B, O x A x B x C]
        for (let i = 1; i < this.matrices.length; i++){
            this.forwardMats.push(math.multiply(this.forwardMats[i - 1], this.matrices[i]))
        }

        this.backwardMats = []
        this.backwardMats.push(this.matrices[this.matrices.length - 1])

        // generate all the backwards partial matrix products
        // [E, D x E, C x D x E] -> [C x D x E, D x E, E] + [ I ]
        for (let i = 1; i < this.matrices.length; i++){
            this.backwardMats.push(math.multiply(this.matrices[this.matrices.length - i - 1], this.backwardMats[i - 1]))
        }

        this.backwardMats = this.backwardMats.reverse()
        this.backwardMats.push(IDENTITY)

        // this is really the forward pass error calculation
        this.endEffector = this.forwardMats[this.forwardMats.length - 1]
        this.loss = this.calculateLoss(this.endEffector)

    }

    updateThetas() {

        const d = 0.00001

        for (let i = 0; i < this.thetas.length; i++) {
            const dTheta = this.thetas[i] + d
            const radius = this.radii[i]
            const dMat = generateMatrix2D(dTheta, radius)
            const deltaEndEffector = math.multiply(math.multiply(this.forwardMats[i], dMat), this.backwardMats[i+2])

            const dLoss = (this.calculateLoss(deltaEndEffector) - this.loss) / d
            // console.log(`dLoss/dθ: ${dLoss}`)

            // TODO: clamp dLoss

            this.thetas[i] -= (this.momentums[i] * this.momentumRetain) + (dLoss * this.learnRate)
            this.momentums[i] = dLoss
        }

    }

    updateParams() {
        this.iterations += 1
        this.currentLearnRate = this.learnRate * (1/ (1+this.decay*this.iterations))
    }

    update() {
        this.generateMats()
        this.updateThetas()
        this.updateParams()
    }

    solve(target, thresh) {

        this.iterations = 0
        this.target = target

        this.initializeMomentums()

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

    // calculate loss
    calculateLoss(actual) {

        let totalLoss = 0

        totalLoss += transformLoss(actual, this.target, this.armLength, Math.PI)

        return totalLoss

    } 

    render(ctx) {

        let prevMat = this.matrices[0]

        for (let i = 1; i < this.matrices.length; i++){
    
            let currentMat = math.multiply(prevMat, this.matrices[i])
    
            let [startX, startY] = getXYfromMatrix(prevMat)
            let [endX, endY] = getXYfromMatrix(currentMat)
    
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