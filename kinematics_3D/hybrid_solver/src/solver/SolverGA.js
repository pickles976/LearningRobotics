import { Population } from "../util/Genetics.js"
import { IDENTITY, mat4, transformLoss } from "../util/Geometry.js"
import { Solver } from "./Solver.js"

const PENALTY = 100000.0

export class IKSolverGA extends Solver {

    ROT_CORRECTION = Math.PI

    constructor(axes, radii, thetas, origin, minAngles, maxAngles, collisionProvider) {

        super(axes, radii, thetas, origin, minAngles, maxAngles, collisionProvider)

        this._population = null

    }

    generateMats() {
        super.generateMats()
        this.loss = this._calculateLoss(this._endEffector)
    }

    updateThetas() {
        this._population.newGeneration()
        this._thetas = this._population.alpha.thetas
    }

    updateParams() {
        super.updateParams()
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

        console.log(`Running Genetic Algorithm...`)

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

    // calculate loss for actual arm
    _calculateLoss(actual) {

        let totalLoss = super._calculateLoss(actual)

        // if (isSelfIntersecting(this._collisionProvider.getColliders(), this.getJoints())) { return PENALTY }
        if (this._collisionProvider.isSelfIntersecting(this.getJoints())) { return PENALTY }

        return totalLoss

    } 

    resetParams() {
        this.loss = 100.0
        this._iterations = 0
        this.initialize()
    }

    // Function passed to population
    fitness(thetas){

        // turn thetas into matrices
        let matrices = []
        matrices.push(origin)

        for (let i = 0; i < thetas.length; i++){
            matrices.push(mat4(thetas[i], this._axes[i], this._radii[i]))
        }
        
        // forward multiply
        let forwardMats = []
        forwardMats.push(this._origin)

        // generate all the forward partial matrix products
        // [ O, O x A, O x A x B, O x A x B x C]
        for (let i = 1; i < matrices.length; i++){
            forwardMats.push(math.multiply(forwardMats[i - 1], matrices[i]))
        }

        // calculate error between end effector
        let endEffector = forwardMats[forwardMats.length - 1]

        // check self-intersection
        // if (isSelfIntersecting(this._collisionProvider.getColliders(), forwardMats.filter((mat, i) => i > 0))) { return 1 / PENALTY }
        if (this._collisionProvider.isSelfIntersecting(forwardMats.filter((mat, i) => i > 0))) { return 1 / PENALTY }

        return 1 / transformLoss(endEffector, this.target, this._armLength, this.ROT_CORRECTION)
        
    }

    createPopulation(){
        
        let controls = {
            "minAngles": this._minAngles,
            "maxAngles": this._maxAngles,
            "mutationRate": 0.4
        }

        this._population = new Population(this, controls, 100, this._thetas)
    }

    initialize() {
        this.createPopulation()
    }
}