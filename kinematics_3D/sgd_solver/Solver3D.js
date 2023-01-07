import { findSelfIntersections, isSelfIntersecting } from "./CollisionProvider.js"
import { IDENTITY, mat4, transformLoss } from "./Geometry.js"

export class IKSolver3D {

    PENALTY = 0.00025
    ROT_CORRECTION = Math.PI
    MAX_DLOSS = 0.5

    constructor(axes, radii, thetas, origin, minAngles, maxAngles, colliders) {

        // physical traits
        this._axes = axes
        this._radii = radii
        this._thetas = thetas
        this._origin = origin

        // constraints
        this._minAngles = minAngles
        this._maxAngles = maxAngles
        this._armLength = this._radii.reduce((acc, curr) => acc + curr, 0)
        this._colliders = colliders

        // _matrices
        this._matrices = []
        this._forwardMats = []
        this._backwardMats = []

        // output
        this._endEffector = null
        this.target = null

        // SGD vars
        this.loss = 100.0
        this._iterations = 0

        this._learnRate = 0.5
        this._currentLearnRate = this._learnRate
        this._decay = 0.000005

        this._momentums = []
        this._momentumRetain = 0.25

        // constraints
        this._angleConstraints = true
        this._collisionConstraints = false

    }

    initialize() {
        this._momentums = []

        this._thetas.forEach(theta => {
            this._momentums.push(0.0)
        })
    }

    generateMats() {

        this._matrices = []
        this._matrices.push(this._origin)

        for (let i = 0; i < this._axes.length; i++){
            this._matrices.push(mat4(this._thetas[i], this._axes[i], this._radii[i]))
        }

        this._forwardMats = []
        this._forwardMats.push(this._origin)

        // generate all the forward partial matrix products
        // [ O, O x A, O x A x B, O x A x B x C]
        for (let i = 1; i < this._matrices.length; i++){
            this._forwardMats.push(math.multiply(this._forwardMats[i - 1], this._matrices[i]))
        }

        this._backwardMats = []
        this._backwardMats.push(this._matrices[this._matrices.length - 1])

        // generate all the backwards partial matrix products
        // [E, D x E, C x D x E] -> [C x D x E, D x E, E] + [ I ]
        for (let i = 1; i < this._matrices.length; i++){
            this._backwardMats.push(math.multiply(this._matrices[this._matrices.length - i - 1], this._backwardMats[i - 1]))
        }

        this._backwardMats = this._backwardMats.reverse()
        this._backwardMats.push(IDENTITY)

        // this is really the forward pass error calculation
        this._endEffector = this._forwardMats[this._forwardMats.length - 1]
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

            let dLoss = (this._calculateLoss(deltaEndEffector, i, dTheta, dMat) - this.loss) / d
            // console.log(`dLoss/dθ: ${dLoss}`)

            // Clamp dLoss
            dLoss = Math.max(-this.MAX_DLOSS, Math.min(this.MAX_DLOSS, dLoss))

            const nudge = (this._momentums[i] * this._momentumRetain) + (dLoss * this._learnRate)
            let newTheta = this._thetas[i] - nudge

            this._thetas[i] -= nudge
            this._momentums[i] = dLoss
            
            // //!this._checkCollisions(i, mat4(newTheta, axis, radius)
            if (this._angleConstraints && newTheta > this._minAngles[i] && newTheta < this._maxAngles[i]) {
                this._thetas[i] -= nudge
                this._momentums[i] = dLoss
            }

        }

    }

    // calculate loss
    _calculateLoss(actual, i, dTheta, dMat) {

        let totalLoss = 0

        totalLoss += transformLoss(actual, this.target, this._armLength, this.ROT_CORRECTION)
        
        if (this._collisionConstraints) { 
            let numCollisions = this._checkCollisions(i, dMat)
            totalLoss *= (1 + numCollisions)
        }

        return totalLoss

    } 

    updateParams() {
        this._iterations += 1
        this._currentLearnRate = this._learnRate * (1/ (1+this._decay*this._iterations))
    }

    resetParams() {
        this._iterations = 0
        this._currentLearnRate = this._learnRate
        this.initializeMomentums()
    }

    update() {
        this.generateMats()
        this.updateThetas()
        this.updateParams()

        // console.log(`Loss: ${this.loss}`)
    }

    getJoints() {
        return this._forwardMats.filter((mat, i) => i > 0)
    }

    /**
     * 
     * @param {number} i index of the matrix we are modifying
     * @param {matrix} dMat the changed matrix 
     * @returns whether or not there is a collision
     */
    _checkCollisions(i, dMat) {

        let matrices = [...this._matrices]
        matrices[i] = dMat

        let selfIntersections = findSelfIntersections(this._colliders, this._getForwardMats(matrices))
        // console.log(selfIntersections)
        // console.log(selfIntersections.filter((intersecting) => intersecting === true).length)

        return selfIntersections.filter((intersecting) => intersecting === true).length
    }


    /**
     * Use this to get forward mats for checking collisions for a given arm configuration
     * @param {Array[matrix]} matrices 
     * @returns 
     */
    _getForwardMats(matrices) {

        let forwardMats = []
        forwardMats.push(this._origin)

        // generate all the forward partial matrix products
        // [ O, O x A, O x A x B, O x A x B x C]
        for (let i = 1; i < matrices.length; i++){
            forwardMats.push(math.multiply(forwardMats[i - 1], matrices[i]))
        }

        return forwardMats.filter((mat, i) => i > 0)
    }

    collisionConstraints(bool) {
        this._collisionConstraints = bool
    }


}