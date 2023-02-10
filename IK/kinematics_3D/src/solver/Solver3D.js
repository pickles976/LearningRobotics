import { IDENTITY, generateForwardMats, generateMats, mat4, transformLoss } from "../util/Geometry.js"
import { Solver } from "./Solver.js"

export class IKSolver3D extends Solver {

    PENALTY = 0.00025
    ROT_CORRECTION = Math.PI
    MAX_DLOSS = 0.5

    constructor(axes, radii, thetas, origin, minAngles, maxAngles, collisionProvider) {

        super(axes, radii, thetas, origin, minAngles, maxAngles, collisionProvider)

        // SGD vars
        this._learnRate = 0.70
        this._currentLearnRate = this._learnRate
        this._decay = 0.000005

        this._momentums = []
        this._momentumRetain = 0.25

    }

    generateMats() {

        super.generateMats()
        this.loss = this._calculateLoss(this._endEffector)

    }

    updateThetas() {

        const d = 0.00001

        for (let i = 0; i < this._thetas.length; i++) {
            const dTheta = this._thetas[i] + d
            const radius = this._radii[i]
            const axis = this._axes[i]
            const dMat = mat4(dTheta, axis, radius)

            const deltaEndEffector = math.multiply(math.multiply(this._forwardMats[i], dMat), this._backwardMats[i+2])

            // Delta loss
            let dLoss = (this._calculateLoss(deltaEndEffector) - this.loss) / d

            // console.log(`dLoss/dθ: ${dLoss}`)

            // Clamp dLoss
            dLoss = Math.max(-this.MAX_DLOSS, Math.min(this.MAX_DLOSS, dLoss))

            const nudge = (this._momentums[i] * this._momentumRetain) + (dLoss * this._learnRate)
            let newTheta = this._thetas[i] - nudge
            
            if (this._angleConstraints && newTheta > this._minAngles[i] && newTheta < this._maxAngles[i]) 
            {

                let newThetas = JSON.parse(JSON.stringify(this._thetas))
                newThetas[i] = newTheta

                let mats = generateMats(this._origin, newThetas, this._axes, this._radii)
                let forwardMats = generateForwardMats(mats)

                if (!this._collisionProvider.isSelfIntersecting(forwardMats) && !this._collisionProvider.isIntersectingObstacles(forwardMats))
                {
                    this._thetas[i] -= nudge
                    this._momentums[i] = dLoss
                } else {
                    this._thetas[i] += nudge
                    this._momentums[i] = -dLoss
                }
            }

        }

    }

    updateParams() {
        super.updateParams()
        this._currentLearnRate = this._learnRate * (1/ (1+this._decay*this._iterations))
    }

    update() {
        this.generateMats()
        this.updateThetas()
        this.updateParams()
    }

    solve(target, thresh) {

        const startTime = Date.now()

        this.resetParams()
        this.target = target

        console.log(`Running Gradient Algorithm...`)

        while (this._iterations < this.MAX_STEPS){
            if (this.loss > thresh){
                this.update()
            }else{
                console.log(`Optimal solution found after ${this._iterations} iterations!`)
                console.log(`Elapsed Time: ${Date.now() - startTime}ms`)
                return
            }
        }

        console.log(`Could not converge in ${this.MAX_STEPS} iterations`)

    }

    getJoints() {
        return super.getJoints()
    }

    // calculate loss
    _calculateLoss(actual) {

        return super._calculateLoss(actual)

    } 

    resetParams() {
        super.resetParams()
        this._currentLearnRate = this._learnRate
        this.initialize()
    }

    initialize() {
        this._momentums = []

        this._thetas.forEach(theta => {
            this._momentums.push(0.0)
        })
    }

}